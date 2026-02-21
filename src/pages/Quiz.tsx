import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

const Quiz = () => {
  const { courseId, moduleId } = useParams();
  const moduleNum = parseInt(moduleId || "1");
  const { user } = useAuth();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<{ qcm: Record<number, number>; open: Record<number, string> }>({ qcm: {}, open: {} });
  const [submitted, setSubmitted] = useState(false);
  const [currentSubmitted, setCurrentSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadQuiz();
  }, [courseId, moduleNum]);

  const loadQuiz = async () => {
    setLoading(true);
    // First ensure module is generated
    const { data } = await supabase.functions.invoke("generate-course", {
      body: { courseSlug: courseId, moduleNumber: moduleNum },
    });
    if (data?.quiz) {
      setQuiz(data.quiz);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const questions = quiz?.questions as any;
  const allQuestions = [
    ...(questions?.qcm || []).map((q: any, i: number) => ({ ...q, type: "qcm", index: i })),
    ...(questions?.open || []).map((q: any, i: number) => ({ ...q, type: "open", index: i })),
  ];

  const q = allQuestions[current];
  if (!q) return null;

  const handleSelectQCM = (optionIndex: number) => {
    if (currentSubmitted) return;
    setAnswers(prev => ({ ...prev, qcm: { ...prev.qcm, [q.index]: optionIndex } }));
  };

  const handleValidate = () => setCurrentSubmitted(true);

  const handleNext = () => {
    if (current < allQuestions.length - 1) {
      setCurrent(current + 1);
      setCurrentSubmitted(false);
    }
  };

  const handleFinish = async () => {
    if (!user) { toast.error("Connectez-vous pour soumettre"); return; }
    setSubmitting(true);
    try {
      // Get course ID from DB
      const { data: courseData } = await supabase.from("courses").select("id").eq("slug", courseId).single();
      const { data: moduleData } = await supabase.from("modules").select("id").eq("course_id", courseData!.id).eq("module_number", moduleNum).single();

      const { data, error } = await supabase.functions.invoke("evaluate-answers", {
        body: {
          answers,
          quizId: quiz.id,
          moduleId: moduleData?.id,
          courseId: courseData!.id,
          userId: user.id,
          quizType: "module",
        },
      });
      if (error) throw error;
      setResult(data);
      setSubmitted(true);
      if (data.passed) toast.success("Module validé ! 🎉");
      else toast.error("Score insuffisant. Réessayez !");
    } catch (e: any) {
      toast.error(e.message || "Erreur d'évaluation");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted && result) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto max-w-lg px-4 pt-24 pb-20">
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            {result.passed ? (
              <CheckCircle2 className="mx-auto h-16 w-16 text-primary" />
            ) : (
              <XCircle className="mx-auto h-16 w-16 text-destructive" />
            )}
            <h1 className="mt-4 font-display text-2xl font-bold text-foreground">
              {result.passed ? "Module validé ! 🎉" : "Pas encore..."}
            </h1>
            <p className="mt-2 text-4xl font-bold text-gradient-primary">{Math.round(result.score)}%</p>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <p>QCM : {result.qcmScore}/{result.qcmTotal}</p>
              <p>Questions ouvertes : {result.openScore}/{result.openTotal} points</p>
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <Link to={`/courses/${courseId}`} className="rounded-lg bg-primary py-3 font-display text-sm font-semibold text-primary-foreground">
                Retour au cours
              </Link>
              {result.passed && moduleNum < 10 && (
                <Link to={`/courses/${courseId}/module/${moduleNum + 1}`} className="rounded-lg border border-border py-3 text-sm text-muted-foreground hover:text-foreground">
                  Module suivant →
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-2xl px-4 pb-20 pt-24">
        <Link to={`/courses/${courseId}/module/${moduleId}`} className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Retour au module
        </Link>

        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-display text-xl font-bold text-foreground">Quiz — Module {moduleNum}</h1>
          <span className="text-sm text-muted-foreground">{current + 1}/{allQuestions.length}</span>
        </div>
        <div className="mb-8 h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${((current + 1) / allQuestions.length) * 100}%` }} />
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">{q.type === "qcm" ? "QCM" : "Question ouverte"}</p>
          <h2 className="font-display text-lg font-semibold text-foreground">{q.question}</h2>

          {q.type === "qcm" && q.options && (
            <div className="mt-6 space-y-3">
              {q.options.map((option: string, i: number) => {
                const isSelected = answers.qcm[q.index] === i;
                const isCorrect = currentSubmitted && i === q.correct;
                const isWrong = currentSubmitted && isSelected && i !== q.correct;
                return (
                  <button key={i} onClick={() => handleSelectQCM(i)}
                    className={`flex w-full items-center gap-3 rounded-lg border p-4 text-left text-sm transition-colors ${
                      isCorrect ? "border-primary bg-primary/10 text-primary"
                        : isWrong ? "border-destructive bg-destructive/10 text-destructive"
                        : isSelected ? "border-primary/40 bg-primary/5 text-foreground"
                        : "border-border bg-background text-muted-foreground hover:text-foreground"
                    }`}>
                    {currentSubmitted && isCorrect && <CheckCircle2 className="h-4 w-4 shrink-0" />}
                    {currentSubmitted && isWrong && <XCircle className="h-4 w-4 shrink-0" />}
                    {!currentSubmitted && <div className={`h-4 w-4 shrink-0 rounded-full border ${isSelected ? "border-primary bg-primary" : "border-muted-foreground"}`} />}
                    {option}
                  </button>
                );
              })}
            </div>
          )}

          {q.type === "open" && (
            <textarea
              placeholder="Votre réponse..."
              value={answers.open[q.index] || ""}
              onChange={(e) => setAnswers(prev => ({ ...prev, open: { ...prev.open, [q.index]: e.target.value } }))}
              className="mt-6 w-full rounded-lg border border-border bg-background p-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              rows={5}
            />
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          {!currentSubmitted && q.type === "qcm" ? (
            <button onClick={handleValidate} disabled={answers.qcm[q.index] === undefined}
              className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-40">
              Valider
            </button>
          ) : current < allQuestions.length - 1 ? (
            <button onClick={handleNext}
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
              Suivant <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button onClick={handleFinish} disabled={submitting}
              className="flex items-center gap-2 rounded-lg bg-secondary px-6 py-2.5 text-sm font-semibold text-secondary-foreground hover:bg-secondary/90 disabled:opacity-50">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Terminer le quiz
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;
