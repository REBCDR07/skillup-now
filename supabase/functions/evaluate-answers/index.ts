import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { answers, quizId, moduleId, courseId, userId, quizType, qcmQuestions: clientQcm, openQuestions: clientOpen } = body;
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let qcmQuestions: any[] = [];
    let openQuestions: any[] = [];

    if (quizType === "certification") {
      // For certification, questions are sent directly from client
      qcmQuestions = clientQcm || [];
      openQuestions = clientOpen || [];
    } else {
      // For module quizzes, load from DB
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
      qcmQuestions = questions.qcm || [];
      openQuestions = questions.open || [];
    }

    // Grade QCM
    let qcmScore = 0;
    for (let i = 0; i < qcmQuestions.length; i++) {
      if (answers.qcm && answers.qcm[i] === qcmQuestions[i].correct) {
        qcmScore++;
      }
    }

    // Grade open questions via AI
    let openScore = 0;
    if (openQuestions.length > 0 && answers.open && LOVABLE_API_KEY) {
      const openAnswersArr = Object.values(answers.open) as string[];
      const gradingPrompt = openQuestions.map((q: any, i: number) =>
        `Question ${i + 1}: ${q.question}\nRéponse attendue: ${q.expected_answer}\nRéponse de l'apprenant: ${openAnswersArr[i] || "(pas de réponse)"}`
      ).join("\n\n");

      console.log("Grading prompt:", gradingPrompt);

      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GEMINI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: `Tu es un correcteur bienveillant. Tu dois noter ${openQuestions.length} réponses, chacune sur 5 points. Sois juste : si la réponse est globalement correcte, donne au moins 3/5. Réponds UNIQUEMENT en JSON valide, sans markdown ni backticks : {"scores": [5, 3, 4, 2]}` },
            { role: "user", content: gradingPrompt },
          ],
        }),
      });

      console.log("AI response status:", aiResponse.status);

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        try {
          const raw = aiData.choices[0].message.content;
          console.log("AI raw response:", raw);
          const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          const parsed = JSON.parse(cleaned);
          const scores = parsed.scores || [];
          openScore = scores.reduce((a: number, b: number) => a + b, 0);
          console.log("Parsed open scores:", scores, "Total:", openScore);
        } catch (e) {
          console.error("Failed to parse AI grading:", e);
          // Fallback: give partial credit (3/5 per question) if AI fails
          openScore = openQuestions.length * 3;
        }
      } else {
        console.error("AI grading failed:", aiResponse.status);
        // Fallback
        openScore = openQuestions.length * 3;
      }
    }

    const qcmPercent = qcmQuestions.length > 0 ? (qcmScore / qcmQuestions.length) * 100 : 0;
    const openTotal = openQuestions.length * 5;
    const openPercent = openTotal > 0 ? (openScore / openTotal) * 100 : 0;

    let totalScore: number;
    if (quizType === "certification") {
      // 70% QCM + 30% open
      totalScore = (qcmPercent * 0.7) + (openPercent * 0.3);
    } else {
      totalScore = qcmPercent;
    }

    // Save result
    const insertData: any = {
      user_id: userId,
      course_id: courseId,
      score: totalScore,
      max_score: 100,
      answers,
    };
    if (quizId) insertData.quiz_id = quizId;
    if (moduleId) insertData.module_id = moduleId;

    // For certification without quizId, we need a placeholder
    if (quizType === "certification" && !quizId) {
      // Find or create a certification quiz entry
      const { data: certQuiz } = await supabase
        .from("quizzes")
        .select("id")
        .eq("course_id", courseId)
        .eq("quiz_type", "certification")
        .single();

      if (certQuiz) {
        insertData.quiz_id = certQuiz.id;
      } else {
        const { data: newQuiz } = await supabase
          .from("quizzes")
          .insert({ course_id: courseId, quiz_type: "certification", questions: { qcm: [], open: [] } })
          .select()
          .single();
        if (newQuiz) insertData.quiz_id = newQuiz.id;
      }
    }

    if (insertData.quiz_id) {
      await supabase.from("results").insert(insertData);
    }

    return new Response(JSON.stringify({
      score: totalScore,
      qcmScore,
      qcmTotal: qcmQuestions.length,
      openScore,
      openTotal,
      openPercent,
      qcmPercent,
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
