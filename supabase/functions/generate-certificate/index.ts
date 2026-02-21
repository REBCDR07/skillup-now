import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { userId, courseId, score } = await req.json();
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user and course info
    const [{ data: profile }, { data: course }] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", userId).single(),
      supabase.from("courses").select("*").eq("id", courseId).single(),
    ]);

    if (!profile || !course) {
      return new Response(JSON.stringify({ error: "User or course not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate verification code
    const verificationCode = `SF-${course.slug.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

    // Create certificate
    const { data: cert, error: certError } = await supabase
      .from("certificates")
      .insert({
        user_id: userId,
        course_id: courseId,
        verification_code: verificationCode,
        score,
      })
      .select()
      .single();

    if (certError) throw certError;

    // Award points and badges
    const newPoints = (profile.points || 0) + 100;
    const newBadges = [...(profile.badges || [])];
    if (!newBadges.includes('Certifié')) newBadges.push('Certifié');
    if (newPoints >= 1000 && !newBadges.includes('Expert')) newBadges.push('Expert');

    await supabase
      .from("profiles")
      .update({ points: newPoints, badges: newBadges })
      .eq("user_id", userId);

    return new Response(JSON.stringify({
      certificate: cert,
      verificationCode,
      verificationUrl: `/verify/${verificationCode}`,
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
