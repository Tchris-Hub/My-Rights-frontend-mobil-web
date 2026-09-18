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

  // Native mobile requests normally have no Origin header. Browser callers
  // must explicitly appear in the server allow-list; wildcard CORS is avoided.
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
        controller.enqueue(new TextEncoder().encode('data: [DONE]\\n\\n'));
        controller.close();
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

    // The client is never allowed to provide system/developer/assistant
    // instructions. Server-owned instructions are added below.
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
    'Provide general legal information, not legal advice or representation. ' +
    'Do not claim to be a human lawyer. Do not invent statutes, cases, regulations, citations, ' +
    'licenses, deadlines, outcomes, or facts. Never present an unverified citation as authoritative. ' +
    'If no verified legal source is supplied, explicitly say that source verification is unavailable ' +
    'and give general information only. State uncertainty when authoritative verification is unavailable. ' +
    'The jurisdiction must be explicitly supplied by the server/request context; never silently assume one.' ,
};

Deno.serve(async (req: Request) => {
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
      return response({ error: 'Authentication required.' }, 401, cors);
    }

    const token = authorization.slice('Bearer '.length).trim();
    if (!token || token.startsWith('sb_')) {
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
      return response({ error: 'Authentication required.' }, 401, cors);
    }

    const body = await req.text();
    if (new TextEncoder().encode(body).byteLength > MAX_BODY_BYTES) {
      return response({ error: 'Request body is too large.' }, 413, cors);
    }

    const payload = JSON.parse(body) as Record<string, unknown>;
    const messages = parseAndValidateMessages(payload);
    const stream = payload.stream === true;
    const jurisdiction = typeof payload.jurisdiction === 'string' ? payload.jurisdiction.trim() : '';
    if (jurisdiction.length > MAX_JURISDICTION_CHARS) {
      return response({ error: 'Jurisdiction value is too long.' }, 400, cors);
    }

    const clientAddress =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      req.headers.get('x-real-ip') ??
      'unknown';
    consumeRateLimit(`user:${user.id}:ip:${clientAddress}`);

    const openRouterKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openRouterKey) {
      throw new Error('AI provider is not configured.');
    }

    const jurisdictionPrompt = jurisdiction
      ? { role: 'system' as const, content: `Explicit jurisdiction supplied by the application: ${jurisdiction}. Do not infer a different jurisdiction.` }
      : { role: 'system' as const, content: 'No jurisdiction has been supplied. Do not assume Nigerian or any other law; state that jurisdiction-specific verification is unavailable.' };

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
      return response({ error: 'AI provider request failed.' }, 502, cors);
    }

    if (stream && providerResponse.body) {
      return new Response(limitStream(providerResponse.body), {
        status: providerResponse.ok ? 200 : providerResponse.status,
        headers: {
          ...cors,
          'Content-Type': providerResponse.headers.get('Content-Type') ?? 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
      });
    }

    const providerBody = await providerResponse.json().catch(() => null);

    if (!providerResponse.ok) {
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
      return response({ error: 'AI provider returned an invalid response.' }, 502, cors);
    }

    // Return only the minimum response shape consumed by the client. Provider
    // metadata, request IDs and internal fields are intentionally not exposed.
    return response({
      choices: [{ message: { role: 'assistant', content: content.trim() } }],
      citation_status: 'unverified',
      jurisdiction: jurisdiction || null,
    }, 200, cors);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed.';
    const status =
      message.includes('Rate limit') ? 429 :
      message.includes('Origin') ? 403 :
      message.includes('too large') || message.includes('too many') ? 413 :
      400;

    return response({ error: message }, status, cors);
  }
});
