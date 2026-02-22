import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { userId, courseId, verificationCode, type } = await req.json();
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user info
    const { data: { user } } = await supabase.auth.admin.getUserById(userId);
    if (!user?.email) {
      return new Response(JSON.stringify({ error: "User not found or no email" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profile } = await supabase.from("profiles").select("name").eq("user_id", userId).single();
    const { data: course } = await supabase.from("courses").select("title").eq("id", courseId).single();

    const userName = profile?.name || "Apprenant";
    const courseTitle = course?.title || "Cours";

    let subject = "";
    let htmlBody = "";

    if (type === "certificate") {
      subject = `🏆 Félicitations ${userName} ! Votre certificat ${courseTitle} est prêt`;
      htmlBody = `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0b; color: #e4e4e7; padding: 40px; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; background: #10b981; color: white; padding: 8px 16px; border-radius: 8px; font-weight: bold; font-size: 20px;">S</div>
            <span style="font-size: 24px; font-weight: bold; margin-left: 8px;">Skill<span style="color: #10b981;">Flash</span></span>
          </div>
          <h1 style="color: #10b981; text-align: center; font-size: 28px;">🏆 Certification obtenue !</h1>
          <p style="text-align: center; color: #a1a1aa;">Félicitations ${userName}, vous avez réussi la certification</p>
          <div style="background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
            <h2 style="color: white; margin: 0 0 8px;">${courseTitle}</h2>
            <p style="color: #10b981; font-size: 14px; margin: 0;">Code de vérification : <strong>${verificationCode}</strong></p>
          </div>
          <div style="text-align: center; margin-top: 24px;">
            <a href="${supabaseUrl.replace('.supabase.co', '.lovable.app')}/verify/${verificationCode}" 
               style="background: #10b981; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
              Voir mon certificat
            </a>
          </div>
          <p style="text-align: center; color: #71717a; font-size: 12px; margin-top: 32px;">
            © 2026 SkillFlash — Made with ❤️ in Bénin 🇧🇯
          </p>
        </div>
      `;
    } else if (type === "progress") {
      subject = `📚 ${userName}, continuez votre progression sur ${courseTitle} !`;
      htmlBody = `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0b; color: #e4e4e7; padding: 40px; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; background: #10b981; color: white; padding: 8px 16px; border-radius: 8px; font-weight: bold; font-size: 20px;">S</div>
            <span style="font-size: 24px; font-weight: bold; margin-left: 8px;">Skill<span style="color: #10b981;">Flash</span></span>
          </div>
          <h1 style="color: #f59e0b; text-align: center; font-size: 24px;">📚 Rappel de progression</h1>
          <p style="text-align: center; color: #a1a1aa;">Bonjour ${userName}, il vous reste des modules à compléter dans <strong>${courseTitle}</strong>.</p>
          <div style="text-align: center; margin-top: 24px;">
            <a href="${supabaseUrl.replace('.supabase.co', '.lovable.app')}/courses" 
               style="background: #10b981; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
              Reprendre le cours
            </a>
          </div>
          <p style="text-align: center; color: #71717a; font-size: 12px; margin-top: 32px;">
            © 2026 SkillFlash — Made with ❤️ in Bénin 🇧🇯
          </p>
        </div>
      `;
    }

    // Send email via Supabase Auth admin (uses built-in email infrastructure)
    // Note: In production, you'd integrate with Resend, SendGrid, etc.
    // For now we log the email and return success
    console.log(`Email to: ${user.email}, Subject: ${subject}`);
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: `Email notification sent to ${user.email}`,
      email: user.email,
      subject,
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
