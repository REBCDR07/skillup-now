import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen, Loader2, CheckCircle2, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import CodePreview from "@/components/CodePreview";
import ExerciseCorrection from "@/components/ExerciseCorrection";
import { toast } from "sonner";
import { checkAndAwardBadges, BADGE_DEFINITIONS } from "@/lib/badges";

const ModulePage = () => {
  const { courseId, moduleId } = useParams();
  const moduleNum = parseInt(moduleId || "1");
  const { user } = useAuth();
  const navigate = useNavigate();
  const [moduleData, setModuleData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    generateModule();
  }, [courseId, moduleNum]);

  const generateModule = async () => {
    setLoading(true);
    setIsCompleted(false);
    try {
      const { data, error } = await supabase.functions.invoke("generate-course", {
        body: { courseSlug: courseId, moduleNumber: moduleNum },
      });
      if (error) throw error;
      setModuleData(data.module);

      if (user) {
        const { data: courseData } = await supabase.from("courses").select("id").eq("slug", courseId).single();
        if (courseData) {
          const { data: mod } = await supabase.from("modules").select("id").eq("course_id", courseData.id).eq("module_number", moduleNum).single();
          if (mod) {
            const { data: prog } = await supabase.from("user_module_progress")
              .select("completed").eq("user_id", user.id).eq("module_id", mod.id).single();
            if (prog?.completed) setIsCompleted(true);
          }
        }
      }
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la génération du module");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!user) { toast.error("Connectez-vous pour enregistrer votre progression"); return; }
    setCompleting(true);
    try {
      const { data: courseData } = await supabase.from("courses").select("id, title").eq("slug", courseId).single();
      if (!courseData) throw new Error("Cours non trouvé");

      const { data: mod } = await supabase.from("modules").select("id").eq("course_id", courseData.id).eq("module_number", moduleNum).single();
      if (!mod) throw new Error("Module non trouvé");

      await supabase.from("user_module_progress").upsert({
        user_id: user.id,
        module_id: mod.id,
        course_id: courseData.id,
        completed: true,
        completed_at: new Date().toISOString(),
      }, { onConflict: "user_id,module_id" });

      await supabase.rpc("increment_points", { p_user_id: user.id, p_points: 10 });

      const newBadges = await checkAndAwardBadges(user.id);
      if (newBadges.length > 0) {
        for (const badge of newBadges) {
          const def = BADGE_DEFINITIONS.find(b => b.name === badge);
          toast.success(`🏅 Badge débloqué : ${def?.emoji || "🏅"} ${badge} — ${def?.description || ""}`, { duration: 5000 });
        }
      } else {
        toast.success(`Module ${moduleNum} terminé ! (+10 pts) 🎉`);
      }

      setIsCompleted(true);

      if (moduleNum < 10) {
        // Auto-navigate to next module after a short delay
        toast.info(`Passage au module ${moduleNum + 1}...`, { duration: 2000 });
        setTimeout(() => {
          navigate(`/courses/${courseId}/module/${moduleNum + 1}`);
        }, 1500);
      } else {
        toast("🏆 Tous les modules terminés !", {
          description: "Vous pouvez maintenant passer l'examen de certification : 50 QCM + 10 questions ouvertes, chronométré 1h. Score minimum : 80%.",
          duration: 10000,
          action: {
            label: "Passer l'examen",
            onClick: () => navigate(`/courses/${courseId}/certification`),
          },
        });
      }
    } catch (e: any) {
      toast.error(e.message || "Erreur");
    } finally {
      setCompleting(false);
    }
  };

  const content = moduleData?.content as any;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-4xl px-4 pb-20 pt-24">
        <Link to={`/courses/${courseId}`} className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Retour au cours
        </Link>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Génération du module par IA...</p>
            <p className="mt-1 text-xs text-muted-foreground">Cela peut prendre quelques secondes</p>
          </div>
        ) : moduleData ? (
          <>
            <div className="rounded-xl border border-border bg-card p-8">
              <div className="mb-6 flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">Module {moduleNum} / 10</span>
                {isCompleted && <CheckCircle2 className="h-5 w-5 text-primary" />}
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground">{moduleData.title}</h1>

              <div className="mt-8 space-y-8">
                {/* Explanation - more detailed */}
                <div>
                  <h2 className="mb-4 font-display text-lg font-semibold text-foreground">📖 Explication</h2>
                  <div className="prose prose-sm max-w-none text-muted-foreground">
                    {(content?.explanation || "Contenu en cours de génération...").split("\n").map((paragraph: string, i: number) => (
                      paragraph.trim() ? <p key={i} className="mb-3 leading-relaxed">{paragraph}</p> : null
                    ))}
                  </div>
                </div>

                {/* Examples with code preview */}
                {content?.examples && content.examples.length > 0 && (
                  <div>
                    <h2 className="mb-4 font-display text-lg font-semibold text-foreground">💡 Exemples</h2>
                    <div className="space-y-6">
                      {content.examples.map((ex: any, i: number) => (
                        <div key={i} className="rounded-lg border border-border bg-background p-4">
                          <h3 className="font-medium text-foreground">{ex.title}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">{ex.description}</p>
                          {ex.code && <CodePreview code={ex.code} language={ex.language} />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Exercise with correction */}
                {content?.exercise && (
                  <div>
                    <h2 className="mb-4 font-display text-lg font-semibold text-foreground">🏋️ Exercice pratique</h2>
                    <ExerciseCorrection exercise={content.exercise} />
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              {moduleNum > 1 && (
                <Link to={`/courses/${courseId}/module/${moduleNum - 1}`}
                  className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-4 w-4" /> Module précédent
                </Link>
              )}
              <div className="ml-auto flex gap-3">
                {!isCompleted ? (
                  <button
                    onClick={handleComplete}
                    disabled={completing}
                    className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    {completing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Marquer comme terminé
                  </button>
                ) : moduleNum < 10 ? (
                  <Link
                    to={`/courses/${courseId}/module/${moduleNum + 1}`}
                    className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    Module suivant <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <Link
                    to={`/courses/${courseId}/certification`}
                    className="flex items-center gap-2 rounded-lg bg-secondary px-6 py-2 text-sm font-semibold text-secondary-foreground hover:bg-secondary/90"
                  >
                    <Award className="h-4 w-4" /> Passer la certification
                  </Link>
                )}
              </div>
            </div>
          </>
        ) : (
          <p className="text-center text-muted-foreground">Module non disponible.</p>
        )}
      </div>
    </div>
  );
};

export default ModulePage;
