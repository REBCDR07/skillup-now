import { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Award, Loader2, CheckCircle2, XCircle, ArrowRight, Send, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

type Phase = "intro" | "qcm" | "open" | "result";

const CertificationExam = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState<any>(null);
  const [phase, setPhase] = useState<Phase>("intro");
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(3600);
  const [timerActive, setTimerActive] = useState(false);

  const [qcmQuestions, setQcmQuestions] = useState<any[]>([]);
  const [qcmCurrent, setQcmCurrent] = useState(0);
  const [qcmAnswers, setQcmAnswers] = useState<Record<number, number>>({});

  const [openQuestions, setOpenQuestions] = useState<any[]>([]);
  const [openCurrent, setOpenCurrent] = useState(0);
  const [openAnswers, setOpenAnswers] = useState<Record<number, string>>({});

  const [result, setResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    loadCourse();
  }, [courseId, user]);

  useEffect(() => {
    if (!timerActive) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive]);

  const loadCourse = async () => {
    const { data } = await supabase.from("courses").select("*").eq("slug", courseId).single();
    if (data) setCourse(data);
    setLoading(false);
  };

  const resetExam = () => {
    setPhase("intro");
    setTimeLeft(3600);
    setTimerActive(false);
    setQcmCurrent(0);
    setQcmAnswers({});
    setOpenCurrent(0);
    setOpenAnswers({});
    setResult(null);
  };

  const startExam = async () => {
    setLoading(true);
    try {
      const { data: quizzes } = await supabase.from("quizzes")
        .select("questions")
        .eq("course_id", course.id)
        .eq("quiz_type", "module")
        .limit(10);

      let allQcm: any[] = [];
      let allOpen: any[] = [];

      if (quizzes) {
        for (const quiz of quizzes) {
          const q = quiz.questions as any;
          if (q.qcm) allQcm = [...allQcm, ...q.qcm.slice(0, 5)]; // 5 per module
          if (q.open) allOpen = [...allOpen, ...q.open.slice(0, 1)]; // 1 per module
        }
      }

      setQcmQuestions(allQcm.slice(0, 50));
      setOpenQuestions(allOpen.slice(0, 10));

      setTimerActive(true);
      setPhase("qcm");
    } catch (e: any) {
      toast.error("Erreur au démarrage de l'examen");
    } finally {
      setLoading(false);
    }
  };

  const handleTimeout = useCallback(() => {
    setTimerActive(false);
    toast.error("⏰ Temps écoulé ! L'examen doit être repris depuis le début.");
    resetExam();
  }, []);

  const handleFinish = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      let qcmCorrect = 0;
      qcmQuestions.forEach((q, i) => {
        if (qcmAnswers[i] === q.correct) qcmCorrect++;
      });
      const qcmScore = qcmQuestions.length > 0 ? (qcmCorrect / qcmQuestions.length) * 100 : 0;

      // Evaluate open questions via AI
      const { data: evalData } = await supabase.functions.invoke("evaluate-answers", {
        body: {
          answers: { qcm: qcmAnswers, open: openAnswers },
          courseId: course.id,
          userId: user.id,
          quizType: "certification",
          qcmQuestions,
          openQuestions,
        },
      });

      const openScore = evalData?.openScore ?? 0;
      const openTotal = evalData?.openTotal ?? (openQuestions.length * 5);
      const openPercent = openTotal > 0 ? (openScore / openTotal) * 100 : 0;

      // 70% QCM + 30% open
      const totalScore = (qcmScore * 0.7) + (openPercent * 0.3);
      const passed = totalScore >= 80;

      if (passed) {
        const { data: certData } = await supabase.functions.invoke("generate-certificate", {
          body: { userId: user.id, courseId: course.id, score: totalScore },
        });
        setResult({ passed: true, score: totalScore, qcmScore, openPercent, certificate: certData?.certificate, verificationCode: certData?.verificationCode });
        toast.success("Certification obtenue ! 🎉🏆");

        supabase.functions.invoke("send-certificate-email", {
          body: { userId: user.id, courseId: course.id, verificationCode: certData?.verificationCode, type: "certificate" },
        }).catch(console.error);
      } else {
        setResult({ passed: false, score: totalScore, qcmScore, openPercent });
        toast.error(`Score insuffisant (${Math.round(totalScore)}%). Il faut ≥ 80%.`);
      }
      setTimerActive(false);
      setPhase("result");
    } catch (e: any) {
      toast.error(e.message || "Erreur");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background"><Navbar />
        <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </div>
    );
  }

  if (phase === "intro") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto max-w-lg px-4 pt-24 pb-20">
          <Link to={`/courses/${courseId}`} className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Retour
          </Link>
          <div className="rounded-xl border border-secondary/30 bg-card p-8 text-center">
            <Award className="mx-auto h-16 w-16 text-secondary" />
            <h1 className="mt-4 font-display text-2xl font-bold text-foreground">Certification : {course?.title}</h1>
            <p className="mt-3 text-muted-foreground">Examen final pour obtenir votre certificat vérifiable.</p>
            <div className="mt-6 space-y-2 text-left text-sm text-muted-foreground">
              <p>📝 50 QCM — 5 par module (70% du score)</p>
              <p>✍️ 10 Questions ouvertes — 1 par module (30% du score)</p>
              <p>⏱️ Durée : 1 heure maximum</p>
              <p>🏆 Score requis : ≥ 80%</p>
              <p className="text-destructive">⚠️ Si le temps expire, l'examen est annulé et doit être repris.</p>
            </div>
            <button onClick={startExam}
              className="mt-8 w-full rounded-lg bg-secondary py-3 font-display text-sm font-semibold text-secondary-foreground hover:bg-secondary/90">
              Commencer l'examen
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "result") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto max-w-lg px-4 pt-24 pb-20">
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            {result?.passed ? (
              <CheckCircle2 className="mx-auto h-16 w-16 text-primary" />
            ) : (
              <XCircle className="mx-auto h-16 w-16 text-destructive" />
            )}
            <h1 className="mt-4 font-display text-2xl font-bold text-foreground">
              {result?.passed ? "Certification obtenue ! 🏆" : "Pas encore..."}
            </h1>
            {result?.score > 0 && <p className="mt-2 text-4xl font-bold text-gradient-primary">{Math.round(result.score)}%</p>}
            <div className="mt-4 space-y-1 text-sm text-muted-foreground">
              <p>QCM : {Math.round(result?.qcmScore || 0)}%</p>
              <p>Questions ouvertes : {Math.round(result?.openPercent || 0)}%</p>
            </div>
            {result?.verificationCode && (
              <div className="mt-4 space-y-2">
                <p className="text-sm text-muted-foreground">Code de vérification :</p>
                <p className="font-mono text-primary">{result.verificationCode}</p>
                <Link to={`/verify/${result.verificationCode}`}
                  className="inline-flex items-center gap-2 text-sm text-secondary hover:underline">
                  Voir le certificat →
                </Link>
              </div>
            )}
            <div className="mt-6 space-y-3">
              <Link to={`/courses/${courseId}`}
                className="block rounded-lg bg-primary py-3 font-display text-sm font-semibold text-primary-foreground">
                Retour au cours
              </Link>
              {!result?.passed && (
                <button onClick={resetExam}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-border py-3 text-sm text-muted-foreground hover:text-foreground">
                  <RotateCcw className="h-4 w-4" /> Réessayer
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const timerBar = (
    <div className="fixed top-16 left-0 right-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="container mx-auto flex items-center justify-between px-4 py-2">
        <span className="text-sm text-muted-foreground">
          {phase === "qcm" ? `QCM ${qcmCurrent + 1}/${qcmQuestions.length}` : `Question ouverte ${openCurrent + 1}/${openQuestions.length}`}
        </span>
        <div className="flex items-center gap-2">
          <Clock className={`h-4 w-4 ${timeLeft < 300 ? "text-destructive" : "text-secondary"}`} />
          <span className={`font-mono text-sm font-bold ${timeLeft < 300 ? "text-destructive" : "text-foreground"}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>
    </div>
  );

  if (phase === "qcm") {
    const q = qcmQuestions[qcmCurrent];
    if (!q) { setPhase("open"); return null; }
    return (
      <div className="min-h-screen bg-background"><Navbar />{timerBar}
        <div className="container mx-auto max-w-2xl px-4 pt-32 pb-20">
          <div className="mb-4 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${((qcmCurrent + 1) / qcmQuestions.length) * 100}%` }} />
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">QCM</p>
            <p className="font-display text-base font-semibold text-foreground">{q.question}</p>
            <div className="mt-4 space-y-2">
              {q.options?.map((opt: string, i: number) => (
                <button key={i} onClick={() => setQcmAnswers(prev => ({ ...prev, [qcmCurrent]: i }))}
                  className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left text-sm transition-colors ${
                    qcmAnswers[qcmCurrent] === i ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:text-foreground"
                  }`}>
                  <div className={`h-4 w-4 shrink-0 rounded-full border ${qcmAnswers[qcmCurrent] === i ? "border-primary bg-primary" : "border-muted-foreground"}`} />
                  {opt}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            {qcmCurrent < qcmQuestions.length - 1 ? (
              <button onClick={() => setQcmCurrent(qcmCurrent + 1)}
                className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground">
                Suivant <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button onClick={() => { setPhase("open"); setOpenCurrent(0); }}
                className="flex items-center gap-2 rounded-lg bg-secondary px-6 py-2 text-sm font-semibold text-secondary-foreground">
                Questions ouvertes <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // OPEN PHASE
  const oq = openQuestions[openCurrent];
  if (!oq) { handleFinish(); return null; }
  return (
    <div className="min-h-screen bg-background"><Navbar />{timerBar}
      <div className="container mx-auto max-w-2xl px-4 pt-32 pb-20">
        <div className="mb-4 h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-secondary transition-all" style={{ width: `${((openCurrent + 1) / openQuestions.length) * 100}%` }} />
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">Question ouverte</p>
          <p className="font-display text-base font-semibold text-foreground">{oq.question}</p>
          <textarea value={openAnswers[openCurrent] || ""} onChange={e => setOpenAnswers(prev => ({ ...prev, [openCurrent]: e.target.value }))}
            placeholder="Votre réponse..." rows={5}
            className="mt-4 w-full rounded-lg border border-border bg-background p-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
        </div>
        <div className="mt-4 flex justify-end">
          {openCurrent < openQuestions.length - 1 ? (
            <button onClick={() => setOpenCurrent(openCurrent + 1)}
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground">
              Suivant <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button onClick={handleFinish} disabled={submitting}
              className="flex items-center gap-2 rounded-lg bg-secondary px-8 py-3 font-display text-sm font-semibold text-secondary-foreground hover:bg-secondary/90 disabled:opacity-50">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Soumettre la certification
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CertificationExam;
