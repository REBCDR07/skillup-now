import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

async function callAI(prompt: string, systemPrompt: string): Promise<string> {
  // Try custom API keys first, then fall back to Lovable AI
  const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
  

  // Try OpenAI first
  if (OPENAI_API_KEY && OPENAI_API_KEY.trim()) {
    console.log("Using OpenAI API");
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.choices[0].message.content;
    }
    console.error("OpenAI failed:", response.status);
  }

  // Try Gemini
  if (GEMINI_API_KEY && GEMINI_API_KEY.trim()) {
    console.log("Using Gemini API");
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\n${prompt}` }] }],
          generationConfig: { temperature: 0.7 },
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    }
    console.error("Gemini failed:", response.status);
  }

 

    if (!response.ok) {
      const status = response.status;
      if (status === 429) throw new Error("Trop de requêtes. Réessayez dans un moment.");
      if (status === 402) throw new Error("Crédits IA insuffisants.");
      throw new Error(`AI gateway error: ${status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  throw new Error("Aucune clé API IA configurée");
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { courseSlug, moduleNumber } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: course, error: courseError } = await supabase
      .from("courses").select("*").eq("slug", courseSlug).single();

    if (courseError || !course) {
      return new Response(JSON.stringify({ error: "Course not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if module already exists
    const { data: existingModule } = await supabase
      .from("modules").select("*, quizzes(*)").eq("course_id", course.id).eq("module_number", moduleNumber).single();

    if (existingModule && existingModule.quizzes && existingModule.quizzes.length > 0) {
      return new Response(JSON.stringify({ module: existingModule, quiz: existingModule.quizzes[0] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    const systemPrompt = "Tu es un générateur de contenu pédagogique. Tu réponds UNIQUEMENT en JSON valide, sans markdown.";

    const raw = await callAI(prompt, systemPrompt);
    
    let content;
    try {
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      content = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse AI response:", e);
      throw new Error("Failed to parse AI content");
    }

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
      const { data, error } = await supabase.from("modules").update(moduleData).eq("id", existingModule.id).select().single();
      if (error) throw error;
      savedModule = data;
    } else {
      const { data, error } = await supabase.from("modules").insert(moduleData).select().single();
      if (error) throw error;
      savedModule = data;
    }

    const quizData = {
      module_id: savedModule.id,
      course_id: course.id,
      quiz_type: "module",
      questions: {
        qcm: content.qcm_questions || [],
        open: content.open_questions || [],
      },
    };

    const { data: savedQuiz, error: quizError } = await supabase.from("quizzes").insert(quizData).select().single();
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
