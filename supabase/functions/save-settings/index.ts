import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { groq_api_key, groq_model, openai_api_key, gemini_api_key } = await req.json();

    // Store settings in Deno.env (runtime only) - these will be available to other edge functions
    // In production, these should be set as Supabase secrets
    if (groq_api_key) Deno.env.set("GROQ_API_KEY", groq_api_key);
    if (groq_model) Deno.env.set("GROQ_MODEL", groq_model);
    if (openai_api_key) Deno.env.set("OPENAI_API_KEY", openai_api_key);
    if (gemini_api_key) Deno.env.set("GEMINI_API_KEY", gemini_api_key);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
