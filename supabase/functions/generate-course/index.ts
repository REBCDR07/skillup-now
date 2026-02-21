import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { courseSlug, moduleNumber } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the course
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("*")
      .eq("slug", courseSlug)
      .single();

    if (courseError || !course) {
      return new Response(JSON.stringify({ error: "Course not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if module already exists
    const { data: existingModule } = await supabase
      .from("modules")
      .select("*, quizzes(*)")
      .eq("course_id", course.id)
      .eq("module_number", moduleNumber)
      .single();

    if (existingModule && existingModule.quizzes && existingModule.quizzes.length > 0) {
      return new Response(JSON.stringify({ module: existingModule, quiz: existingModule.quizzes[0] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate module content via AI
    const prompt = `Tu es un expert pédagogique. Génère le contenu du module ${moduleNumber}/10 pour le cours "${course.title}" (niveau: ${course.level}).

Retourne UNIQUEMENT un JSON valide (pas de markdown, pas de \`\`\`) avec cette structure exacte:
{
  "title": "Titre du module ${moduleNumber}",
  "explanation": "Explication détaillée du concept (minimum 300 mots, avec paragraphes)",
  "examples": [
    {"title": "Exemple 1", "code": "code exemple si applicable", "description": "Description de l'exemple"},
    {"title": "Exemple 2", "code": "code exemple si applicable", "description": "Description de l'exemple"}
  ],
  "exercise": {"title": "Exercice pratique", "description": "Description de l'exercice", "hint": "Indice"},
  "qcm_questions": [
    {"question": "Question ?", "options": ["A", "B", "C", "D"], "correct": 0, "explanation": "Explication"}
  ],
  "open_questions": [
    {"question": "Question ouverte ?", "expected_answer": "Réponse attendue"}
  ]
}

Génère exactement 20 questions QCM et 4 questions ouvertes. Le contenu doit être en français, pédagogique et adapté au niveau ${course.level}.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "Tu es un générateur de contenu pédagogique. Tu réponds UNIQUEMENT en JSON valide, sans markdown." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Trop de requêtes. Réessayez dans un moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Crédits IA insuffisants." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${status}`);
    }

    const aiData = await aiResponse.json();
    let content;
    try {
      const raw = aiData.choices[0].message.content;
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      content = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse AI response:", e);
      throw new Error("Failed to parse AI content");
    }

    // Save module
    const moduleData = {
      course_id: course.id,
      module_number: moduleNumber,
      title: content.title || `Module ${moduleNumber}`,
      content: {
        explanation: content.explanation,
        examples: content.examples,
        exercise: content.exercise,
      },
    };

    let savedModule;
    if (existingModule) {
      const { data, error } = await supabase
        .from("modules")
        .update(moduleData)
        .eq("id", existingModule.id)
        .select()
        .single();
      if (error) throw error;
      savedModule = data;
    } else {
      const { data, error } = await supabase
        .from("modules")
        .insert(moduleData)
        .select()
        .single();
      if (error) throw error;
      savedModule = data;
    }

    // Save quiz
    const quizData = {
      module_id: savedModule.id,
      course_id: course.id,
      quiz_type: "module",
      questions: {
        qcm: content.qcm_questions || [],
        open: content.open_questions || [],
      },
    };

    const { data: savedQuiz, error: quizError } = await supabase
      .from("quizzes")
      .insert(quizData)
      .select()
      .single();

    if (quizError) throw quizError;

    return new Response(JSON.stringify({ module: savedModule, quiz: savedQuiz }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e.message || "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
