import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";

const ModulePage = () => {
  const { courseId, moduleId } = useParams();
  const moduleNum = parseInt(moduleId || "1");
  const [moduleData, setModuleData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateModule();
  }, [courseId, moduleNum]);

  const generateModule = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-course", {
        body: { courseSlug: courseId, moduleNumber: moduleNum },
      });
      if (error) throw error;
      setModuleData(data.module);
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la génération du module");
    } finally {
      setLoading(false);
    }
  };

  const content = moduleData?.content as any;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-3xl px-4 pb-20 pt-24">
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
                <span className="text-sm text-muted-foreground">Module {moduleNum}</span>
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground">{moduleData.title}</h1>

              <div className="mt-8 space-y-6">
                <div>
                  <h2 className="mb-3 font-display text-lg font-semibold text-foreground">📖 Explication</h2>
                  <div className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
                    {content?.explanation || "Contenu en cours de génération..."}
                  </div>
                </div>

                {content?.examples && content.examples.length > 0 && (
                  <div>
                    <h2 className="mb-3 font-display text-lg font-semibold text-foreground">💡 Exemples</h2>
                    {content.examples.map((ex: any, i: number) => (
                      <div key={i} className="mb-4">
                        <h3 className="font-medium text-foreground">{ex.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{ex.description}</p>
                        {ex.code && (
                          <div className="mt-2 rounded-lg bg-muted p-4">
                            <pre className="overflow-x-auto text-sm text-foreground">{ex.code}</pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {content?.exercise && (
                  <div>
                    <h2 className="mb-3 font-display text-lg font-semibold text-foreground">🏋️ Exercice pratique</h2>
                    <div className="rounded-lg border border-border bg-background p-4">
                      <h3 className="font-medium text-foreground">{content.exercise.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{content.exercise.description}</p>
                      {content.exercise.hint && (
                        <p className="mt-2 text-xs text-primary">💡 Indice : {content.exercise.hint}</p>
                      )}
                    </div>
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
              <Link
                to={`/courses/${courseId}/module/${moduleNum}/quiz`}
                className="ml-auto flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Passer le quiz <ArrowRight className="h-4 w-4" />
              </Link>
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
