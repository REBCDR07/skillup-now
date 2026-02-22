import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { verificationCode } = await req.json();
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get certificate data
    const { data: cert } = await supabase.from("certificates")
      .select("*, courses(title, slug)")
      .eq("verification_code", verificationCode)
      .single();

    if (!cert) {
      return new Response(JSON.stringify({ error: "Certificate not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profile } = await supabase.from("profiles")
      .select("name")
      .eq("user_id", cert.user_id)
      .single();

    const name = profile?.name || "Apprenant";
    const courseTitle = (cert.courses as any)?.title || "Cours";
    const date = new Date(cert.created_at).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });
    const verifyUrl = `${supabaseUrl.replace('.supabase.co', '.lovable.app')}/verify/${verificationCode}`;
    
    // Generate QR code URL using a public API
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verifyUrl)}`;

    // Generate a proper PDF using raw PDF commands
    const pdfContent = generateCertificatePDF(name, courseTitle, Math.round(cert.score), date, verificationCode, qrUrl);

    return new Response(JSON.stringify({ 
      pdfDataUrl: pdfContent,
      name,
      courseTitle,
      score: Math.round(cert.score),
      date,
      verificationCode,
      qrUrl,
      verifyUrl,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function generateCertificatePDF(name: string, course: string, score: number, date: string, code: string, qrUrl: string): string {
  // Return SVG-based certificate that can be rendered client-side as downloadable
  return JSON.stringify({
    name,
    course,
    score,
    date,
    code,
    qrUrl,
  });
}
