import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { answers, quizId, moduleId, courseId, userId, quizType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get quiz
    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .select("*")
      .eq("id", quizId)
      .single();

    if (quizError || !quiz) {
      return new Response(JSON.stringify({ error: "Quiz not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const questions = quiz.questions as any;
    let qcmScore = 0;
    let openScore = 0;

    // Grade QCM
    const qcmQuestions = questions.qcm || [];
    for (let i = 0; i < qcmQuestions.length; i++) {
      if (answers.qcm && answers.qcm[i] === qcmQuestions[i].correct) {
        qcmScore++;
      }
    }

    // Grade open questions via AI
    const openQuestions = questions.open || [];
    if (openQuestions.length > 0 && answers.open && LOVABLE_API_KEY) {
      const gradingPrompt = openQuestions.map((q: any, i: number) => 
        `Question ${i+1}: ${q.question}\nRéponse attendue: ${q.expected_answer}\nRéponse de l'apprenant: ${answers.open[i] || "(pas de réponse)"}`
      ).join("\n\n");

      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: "Tu es un correcteur. Note chaque réponse sur 5. Réponds UNIQUEMENT en JSON: {\"scores\": [5, 3, 4, 2]}" },
            { role: "user", content: gradingPrompt },
          ],
        }),
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        try {
          const raw = aiData.choices[0].message.content;
          const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          const parsed = JSON.parse(cleaned);
          openScore = (parsed.scores || []).reduce((a: number, b: number) => a + b, 0);
        } catch { openScore = 0; }
      }
    }

    const qcmPercent = qcmQuestions.length > 0 ? (qcmScore / qcmQuestions.length) * 100 : 0;
    const openPercent = openQuestions.length > 0 ? (openScore / (openQuestions.length * 5)) * 20 : 0;
    const totalScore = quizType === 'module' ? qcmPercent : ((qcmPercent * 0.5) + (openPercent * 2.5));

    // Save result
    const { data: result, error: resultError } = await supabase
      .from("results")
      .insert({
        user_id: userId,
        quiz_id: quizId,
        module_id: moduleId,
        course_id: courseId,
        score: totalScore,
        max_score: 100,
        answers,
      })
      .select()
      .single();

    if (resultError) throw resultError;

    // If module quiz passed, mark progress and award points
    if (quizType === 'module' && totalScore >= 60 && moduleId) {
      await supabase
        .from("user_module_progress")
        .upsert({
          user_id: userId,
          module_id: moduleId,
          course_id: courseId,
          completed: true,
          completed_at: new Date().toISOString(),
        }, { onConflict: 'user_id,module_id' });

      // Add points
      await supabase.rpc('increment_points', { p_user_id: userId, p_points: 10 });
    }

    return new Response(JSON.stringify({
      score: totalScore,
      qcmScore,
      qcmTotal: qcmQuestions.length,
      openScore,
      openTotal: openQuestions.length * 5,
      passed: totalScore >= (quizType === 'module' ? 60 : 80),
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
