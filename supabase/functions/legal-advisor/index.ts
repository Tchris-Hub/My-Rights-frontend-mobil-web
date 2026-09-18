import { createClient } from 'jsr:@supabase/supabase-js@2';

const MAX_BODY_BYTES = 64 * 1024;
const MAX_MESSAGES = 12;
const MAX_MESSAGE_CHARS = 12_000;
const MAX_TOTAL_CHARS = 48_000;
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;
const MAX_OUTPUT_CHARS = 20_000;
const MAX_STREAM_BYTES = 128 * 1024;
const MAX_JURISDICTION_CHARS = 120;
const SUPPORTED_JURISDICTIONS = new Set(['Nigeria']);

function auditLog(event: string, requestId: string, details: Record<string, unknown> = {}): void {
  // Never include legal text, prompts, tokens, provider responses, or request bodies.
  console.info(JSON.stringify({
    service: 'legal-advisor',
    event,
    request_id: requestId,
    ...details,
  }));
}

type RateState = { windowStart: number; count: number };
const rateState = new Map<string, RateState>();

const jsonHeaders = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
};

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin');
  const configured = (Deno.env.get('ALLOWED_ORIGINS') ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  if (!origin) return {};
  if (!configured.includes(origin)) {
    throw new Error('Origin is not allowed.');
  }

  return {
    'Access-Control-Allow-Origin': origin,
    'Vary': 'Origin',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

function response(
  body: unknown,
  status: number,
  cors: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...jsonHeaders, ...cors },
  });
}

function consumeRateLimit(key: string): void {
  const now = Date.now();
  const existing = rateState.get(key);

  if (!existing || now - existing.windowStart >= RATE_WINDOW_MS) {
    rateState.set(key, { windowStart: now, count: 1 });
    return;
  }

  if (existing.count >= RATE_LIMIT) {
    throw new Error('Rate limit exceeded. Please try again shortly.');
  }

  existing.count += 1;
}

function capProviderOutput(content: unknown): string {
  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('AI provider returned an invalid response.');
  }
  const normalized = content.trim();
  if (normalized.length > MAX_OUTPUT_CHARS) {
    throw new Error('AI provider response is too large.');
  }
  return normalized;
}

function limitStream(body: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const reader = body.getReader();
  let bytes = 0;

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) {
        controller.close();
        return;
      }

      bytes += value.byteLength;
      if (bytes > MAX_STREAM_BYTES) {
        await reader.cancel('stream size limit exceeded');
        controller.error(new Error('AI response exceeded the allowed size.'));
        return;
      }

      controller.enqueue(value);
    },
    async cancel(reason) {
      await reader.cancel(reason);
    },
  });
}

function parseAndValidateMessages(payload: unknown): Array<{ role: 'user'; content: string }> {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid request body.');
  }

  const value = payload as Record<string, unknown>;
  if (!Array.isArray(value.messages)) {
    throw new Error('messages must be an array.');
  }

  if (value.messages.length === 0 || value.messages.length > MAX_MESSAGES) {
    throw new Error('Invalid message count.');
  }

  let totalChars = 0;

  const messages = value.messages.map((message) => {
    if (!message || typeof message !== 'object') {
      throw new Error('Invalid message.');
    }

    const item = message as Record<string, unknown>;
    if (item.role !== 'user') {
      throw new Error('Only user messages are accepted from the client.');
    }

    if (typeof item.content !== 'string') {
      throw new Error('Message content must be text.');
    }

    const content = item.content.trim();
    if (!content || content.length > MAX_MESSAGE_CHARS) {
      throw new Error('Message content is empty or too large.');
    }

    totalChars += content.length;
    if (totalChars > MAX_TOTAL_CHARS) {
      throw new Error('Request content is too large.');
    }

    return { role: 'user' as const, content };
  });

  return messages;
}

const systemPrompt = {
  role: 'system' as const,
  content:
    'You are the Digital Jurist, an AI legal information assistant for the My Rights app. ' +
    'Provide general legal information for educational purposes only, not legal advice or representation. ' +
    'Do not claim to be a human lawyer. Do not invent statutes, cases, regulations, citations, ' +
    'licenses, deadlines, outcomes, or facts. Never present an unverified citation as authoritative. ' +
    'If no verified legal source is supplied, explicitly say that source verification is unavailable ' +
    'and give general information only. State uncertainty when authoritative verification is unavailable. ' +
    'The jurisdiction must be explicitly supplied by the server/request context; never silently assume one. ' +
    'Do not make decisions for the user, predict case outcomes, assign a numerical legal risk or confidence score, or imply that using this service creates a lawyer-client relationship. ' +
    'For urgent, high-stakes, deadline-sensitive, criminal, immigration, family, or court matters, recommend review by a qualified Nigerian legal practitioner or appropriate official service. For document analysis, describe concerns and uncertainty qualitatively rather than assigning numerical risk/confidence scores. For document generation, produce a draft/template only; never fabricate signatures, stamps, notarization, official approval, filing status, parties, facts, citations, or legal validity. Use explicit placeholders where required information is missing.',
};

Deno.serve(async (req: Request) => {
  const requestId = crypto.randomUUID();
  let cors: Record<string, string> = {};

  try {
    cors = getCorsHeaders(req);

    if (req.method === 'OPTIONS') {
      return new Response('ok', { status: 204, headers: cors });
    }

    if (req.method !== 'POST') {
      return response({ error: 'Method not allowed.' }, 405, cors);
    }

    const authorization = req.headers.get('authorization') ?? '';
    if (!authorization.startsWith('Bearer ')) {
      auditLog('auth_rejected', requestId, { reason: 'missing_bearer' });
      return response({ error: 'Authentication required.' }, 401, cors);
    }

    const token = authorization.slice('Bearer '.length).trim();
    if (!token || token.startsWith('sb_')) {
      auditLog('auth_rejected', requestId, { reason: 'invalid_token_shape' });
      return response({ error: 'A valid user session is required.' }, 401, cors);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey =
      Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ??
      Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase server configuration is missing.');
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authorization },
      },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      auditLog('auth_rejected', requestId, { reason: 'session_validation_failed' });
      return response({ error: 'Authentication required.' }, 401, cors);
    }

    const body = await req.text();
    if (new TextEncoder().encode(body).byteLength > MAX_BODY_BYTES) {
      return response({ error: 'Request body is too large.' }, 413, cors);
    }

    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(body) as Record<string, unknown>;
    } catch {
      return response({ error: 'Invalid JSON request body.' }, 400, cors);
    }

    const messages = parseAndValidateMessages(payload);
    const stream = payload.stream === true;
    const jurisdiction = typeof payload.jurisdiction === 'string' ? payload.jurisdiction.trim() : '';

    if (!jurisdiction) {
      return response({ error: 'Legal jurisdiction is required.' }, 400, cors);
    }
    if (jurisdiction.length > MAX_JURISDICTION_CHARS) {
      return response({ error: 'Jurisdiction value is too long.' }, 400, cors);
    }
    if (!SUPPORTED_JURISDICTIONS.has(jurisdiction)) {
      return response({ error: 'This legal jurisdiction is not currently supported.' }, 400, cors);
    }

    const clientAddress =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      req.headers.get('x-real-ip') ??
      'unknown';
    try {
      consumeRateLimit(`user:${user.id}:ip:${clientAddress}`);
    } catch (error) {
      auditLog('rate_limited', requestId);
      throw error;
    }

    const openRouterKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openRouterKey) {
      throw new Error('AI provider is not configured.');
    }

    const jurisdictionPrompt = {
      role: 'system' as const,
      content: `Explicit supported legal jurisdiction: ${jurisdiction}. Apply only this jurisdiction and do not infer or substitute another.`,
    };

    const apiMessages = [systemPrompt, jurisdictionPrompt, ...messages];

    const providerResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openRouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://myrights.app',
        'X-Title': 'My Rights Digital Jurist',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        messages: apiMessages,
        stream,
      }),
    });

    if (stream && !providerResponse.ok) {
      auditLog('provider_rejected', requestId, { status: providerResponse.status, stream: true });
      return response({ error: 'AI provider request failed.' }, 502, cors);
    }

    if (stream && providerResponse.body) {
      auditLog('provider_stream_started', requestId);
      return new Response(limitStream(providerResponse.body), {
        status: 200,
        headers: {
          ...cors,
          'Content-Type': providerResponse.headers.get('Content-Type') ?? 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
      });
    }

    const providerBody = await providerResponse.json().catch(() => null);

    if (!providerResponse.ok) {
      auditLog('provider_rejected', requestId, { status: providerResponse.status, stream: false });
      return response(
        { error: 'AI provider request failed.' },
        providerResponse.status >= 500 ? 502 : 400,
        cors,
      );
    }

    let content: string;
    try {
      content = capProviderOutput(providerBody?.choices?.[0]?.message?.content);
    } catch {
      auditLog('provider_invalid_response', requestId);
      return response({ error: 'AI provider returned an invalid response.' }, 502, cors);
    }

    auditLog('request_completed', requestId, { stream });
    return response({
      choices: [{ message: { role: 'assistant', content: content.trim() } }],
      citation_status: 'unverified',
      jurisdiction,
    }, 200, cors);
  } catch (error) {
    auditLog('request_failed', requestId);
    const message = error instanceof Error ? error.message : '';
    const status =
      message.includes('Rate limit') ? 429 :
      message.includes('Origin') ? 403 :
      message.includes('too large') || message.includes('too many') ? 413 :
      400;

    const safeClientMessage =
      status === 429 ? 'Rate limit exceeded. Please try again shortly.' :
      status === 403 ? 'Origin is not allowed.' :
      status === 413 ? 'Request is too large.' :
      message === 'Invalid request body.' ||
      message === 'Invalid JSON request body.' ||
      message === 'messages must be an array.' ||
      message === 'Invalid message count.' ||
      message === 'Invalid message.' ||
      message === 'Only user messages are accepted from the client.' ||
      message === 'Message content must be text.' ||
      message === 'Message content is empty or too large.' ||
      message === 'Request content is too large.' ||
      message === 'Legal jurisdiction is required.' ||
      message === 'Jurisdiction value is too long.' ||
      message === 'This legal jurisdiction is not currently supported.' ?
        message :
        'Request could not be completed safely.';

    return response({ error: safeClientMessage }, status, cors);
  }
});
