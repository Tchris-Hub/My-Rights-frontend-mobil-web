import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const openRouterKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openRouterKey) throw new Error('OPENROUTER_API_KEY is not set in Supabase Secrets');

    const { messages, document_text, stream = false } = await req.json();

    const systemPrompt = {
      role: 'system',
      content: 'You are the Digital Jurist, an AI legal advisor for the "My Rights" app. You specialize in the Nigerian 1999 Constitution (as amended). Provide clear, cited legal information in a professional, empathetic tone. Always mention you are not a human lawyer and this is not legal advice.'
    };

    let apiMessages = messages || [{ role: 'user', content: 'Say hello' }];
    if (!apiMessages.some((m: any) => m.role === 'system')) {
        apiMessages.unshift(systemPrompt);
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://myrights.app',
        'X-Title': 'My Rights Digital Jurist',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        messages: apiMessages,
        stream: stream,
      }),
    });

    const headers = { 
      ...corsHeaders, 
      'Content-Type': response.headers.get('Content-Type') || 'application/json' 
    };

    return new Response(response.body, {
      status: response.status,
      headers: headers,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
