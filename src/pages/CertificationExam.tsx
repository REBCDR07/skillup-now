import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Award, Loader2, CheckCircle2, XCircle, ArrowRight, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

type Phase = "intro" | "qcm" | "open" | "project" | "result";

const CertificationExam = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState<any>(null);
  const [phase, setPhase] = useState<Phase>("intro");
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour
  const [timerActive, setTimerActive] = useState(false);

  // QCM state
  const [qcmQuestions, setQcmQuestions] = useState<any[]>([]);
  const [qcmCurrent, setQcmCurrent] = useState(0);
  const [qcmAnswers, setQcmAnswers] = useState<Record<number, number>>({});

  // Open questions
  const [openQuestions, setOpenQuestions] = useState<any[]>([]);
  const [openCurrent, setOpenCurrent] = useState(0);
  const [openAnswers, setOpenAnswers] = useState<Record<number, string>>({});

  // Project
  const [projectContent, setProjectContent] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  // Result
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

  const startExam = async () => {
    setLoading(true);
    try {
      // Generate certification questions via AI
      const { data, error } = await supabase.functions.invoke("generate-course", {
        body: { courseSlug: courseId, moduleNumber: 0 }, // 0 = certification mode
      });
      
      // For now, we'll generate questions from existing modules
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
          if (q.qcm) allQcm = [...allQcm, ...q.qcm];
          if (q.open) allOpen = [...allOpen, ...q.open];
        }
      }

      // Take 25 of each (or pad with what we have)
      setQcmQuestions(allQcm.slice(0, 25));
      setOpenQuestions(allOpen.slice(0, 25));
      setProjectDescription(`Projet pratique : Créez un mini-projet démontrant vos compétences en ${course.title}. Décrivez votre approche, le code et les résultats attendus.`);

      setTimerActive(true);
      setPhase("qcm");
    } catch (e: any) {
      toast.error("Erreur au démarrage de l'examen");
    } finally {
      setLoading(false);
    }
  };

  const handleTimeout = () => {
    toast.error("Temps écoulé ! Session invalidée.");
    setPhase("result");
    setResult({ passed: false, score: 0, timeout: true });
  };

  const handleFinish = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      // Calculate QCM score
      let qcmCorrect = 0;
      qcmQuestions.forEach((q, i) => {
        if (qcmAnswers[i] === q.correct) qcmCorrect++;
      });
      const qcmPercent = qcmQuestions.length > 0 ? (qcmCorrect / qcmQuestions.length) * 100 : 0;

      // For open questions and project, we'd evaluate via AI
      // Simplified scoring
      const openCount = Object.values(openAnswers).filter(a => a.trim().length > 20).length;
      const openPercent = openQuestions.length > 0 ? (openCount / openQuestions.length) * 100 : 0;
      const projectScore = projectContent.trim().length > 100 ? 80 : projectContent.trim().length > 20 ? 50 : 0;

      const totalScore = (qcmPercent * 0.4) + (openPercent * 0.3) + (projectScore * 0.3);
      const passed = totalScore >= 80;

      if (passed) {
        // Generate certificate
        const { data: certData } = await supabase.functions.invoke("generate-certificate", {
          body: { userId: user.id, courseId: course.id, score: totalScore },
        });
        setResult({ passed: true, score: totalScore, certificate: certData?.certificate, verificationCode: certData?.verificationCode });
        toast.success("Certification obtenue ! 🎉🏆");
      } else {
        setResult({ passed: false, score: totalScore });
        toast.error(`Score insuffisant (${Math.round(totalScore)}%). Il faut ≥ 80%.`);
      }
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

  // INTRO
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
              <p>📝 25 QCM (40% du score)</p>
              <p>✍️ 25 Questions ouvertes (30% du score)</p>
              <p>🔧 Mini-projet pratique chronométré (30% du score)</p>
              <p>⏱️ Durée : 1 heure maximum</p>
              <p>🏆 Score requis : ≥ 80%</p>
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

  // RESULT
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
              {result?.timeout ? "Temps écoulé ⏰" : result?.passed ? "Certification obtenue ! 🏆" : "Pas encore..."}
            </h1>
            {result?.score > 0 && <p className="mt-2 text-4xl font-bold text-gradient-primary">{Math.round(result.score)}%</p>}
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
            <Link to={`/courses/${courseId}`}
              className="mt-6 block rounded-lg bg-primary py-3 font-display text-sm font-semibold text-primary-foreground">
              Retour au cours
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Timer bar
  const timerBar = (
    <div className="fixed top-16 left-0 right-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="container mx-auto flex items-center justify-between px-4 py-2">
        <span className="text-sm text-muted-foreground">Certification : {course?.title}</span>
        <div className="flex items-center gap-2">
          <Clock className={`h-4 w-4 ${timeLeft < 300 ? "text-destructive" : "text-secondary"}`} />
          <span className={`font-mono text-sm font-bold ${timeLeft < 300 ? "text-destructive" : "text-foreground"}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>
    </div>
  );

  // QCM PHASE
  if (phase === "qcm") {
    const q = qcmQuestions[qcmCurrent];
    if (!q) { setPhase("open"); return null; }
    return (
      <div className="min-h-screen bg-background"><Navbar />{timerBar}
        <div className="container mx-auto max-w-2xl px-4 pt-32 pb-20">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-foreground">QCM ({qcmCurrent + 1}/{qcmQuestions.length})</h2>
            <div className="flex gap-1">
              {["qcm", "open", "project"].map(p => (
                <div key={p} className={`h-2 w-8 rounded-full ${p === phase ? "bg-primary" : "bg-muted"}`} />
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
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
  if (phase === "open") {
    const q = openQuestions[openCurrent];
    if (!q) { setPhase("project"); return null; }
    return (
      <div className="min-h-screen bg-background"><Navbar />{timerBar}
        <div className="container mx-auto max-w-2xl px-4 pt-32 pb-20">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-foreground">Questions ouvertes ({openCurrent + 1}/{openQuestions.length})</h2>
            <div className="flex gap-1">
              {["qcm", "open", "project"].map(p => (
                <div key={p} className={`h-2 w-8 rounded-full ${p === phase ? "bg-primary" : p === "qcm" ? "bg-primary/50" : "bg-muted"}`} />
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <p className="font-display text-base font-semibold text-foreground">{q.question}</p>
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
              <button onClick={() => setPhase("project")}
                className="flex items-center gap-2 rounded-lg bg-secondary px-6 py-2 text-sm font-semibold text-secondary-foreground">
                Mini-projet <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // PROJECT PHASE
  return (
    <div className="min-h-screen bg-background"><Navbar />{timerBar}
      <div className="container mx-auto max-w-2xl px-4 pt-32 pb-20">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-foreground">Mini-projet pratique</h2>
          <div className="flex gap-1">
            {["qcm", "open", "project"].map(p => (
              <div key={p} className={`h-2 w-8 rounded-full ${p === phase ? "bg-primary" : "bg-primary/50"}`} />
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-muted-foreground">{projectDescription}</p>
          <textarea value={projectContent} onChange={e => setProjectContent(e.target.value)}
            placeholder="Décrivez votre projet, votre approche et incluez le code..." rows={15}
            className="mt-4 w-full rounded-lg border border-border bg-background p-4 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={handleFinish} disabled={submitting}
            className="flex items-center gap-2 rounded-lg bg-secondary px-8 py-3 font-display text-sm font-semibold text-secondary-foreground hover:bg-secondary/90 disabled:opacity-50">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Soumettre la certification
          </button>
        </div>
      </div>
    </div>
  );
};

export default CertificationExam;
