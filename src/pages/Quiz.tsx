import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";

const mockQuestions = [
  {
    id: 1,
    type: "qcm",
    question: "Quelle balise HTML est utilisée pour créer un lien hypertexte ?",
    options: ["<link>", "<a>", "<href>", "<url>"],
    correct: 1,
  },
  {
    id: 2,
    type: "qcm",
    question: "Quel attribut HTML spécifie l'URL de destination d'un lien ?",
    options: ["src", "link", "href", "url"],
    correct: 2,
  },
  {
    id: 3,
    type: "qcm",
    question: "Quelle propriété CSS est utilisée pour changer la couleur du texte ?",
    options: ["font-color", "text-color", "color", "foreground"],
    correct: 2,
  },
  {
    id: 4,
    type: "open",
    question: "Expliquez la différence entre les éléments inline et block en HTML.",
  },
];

const Quiz = () => {
  const { courseId, moduleId } = useParams();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number | string>>({});
  const [submitted, setSubmitted] = useState(false);

  const q = mockQuestions[current];

  const handleSelect = (optionIndex: number) => {
    if (submitted) return;
    setAnswers({ ...answers, [q.id]: optionIndex });
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const handleNext = () => {
    if (current < mockQuestions.length - 1) {
      setCurrent(current + 1);
      setSubmitted(false);
    }
  };

  const score = Object.entries(answers).reduce((acc, [id, answer]) => {
    const question = mockQuestions.find((q) => q.id === Number(id));
    if (question?.type === "qcm" && answer === question.correct) return acc + 1;
    return acc;
  }, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-2xl px-4 pb-20 pt-24">
        <Link to={`/courses/${courseId}/module/${moduleId}`} className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Retour au module
        </Link>

        {/* Progress */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-display text-xl font-bold text-foreground">Quiz — Module {moduleId}</h1>
          <span className="text-sm text-muted-foreground">
            {current + 1}/{mockQuestions.length}
          </span>
        </div>
        <div className="mb-8 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${((current + 1) / mockQuestions.length) * 100}%` }}
          />
        </div>

        {/* Question */}
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">
            {q.type === "qcm" ? "QCM" : "Question ouverte"}
          </p>
          <h2 className="font-display text-lg font-semibold text-foreground">{q.question}</h2>

          {q.type === "qcm" && q.options && (
            <div className="mt-6 space-y-3">
              {q.options.map((option, i) => {
                const isSelected = answers[q.id] === i;
                const isCorrect = submitted && i === q.correct;
                const isWrong = submitted && isSelected && i !== q.correct;
                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(i)}
                    className={`flex w-full items-center gap-3 rounded-lg border p-4 text-left text-sm transition-colors ${
                      isCorrect
                        ? "border-primary bg-primary/10 text-primary"
                        : isWrong
                        ? "border-destructive bg-destructive/10 text-destructive"
                        : isSelected
                        ? "border-primary/40 bg-primary/5 text-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-border hover:text-foreground"
                    }`}
                  >
                    {submitted && isCorrect && <CheckCircle2 className="h-4 w-4 shrink-0" />}
                    {submitted && isWrong && <XCircle className="h-4 w-4 shrink-0" />}
                    {!submitted && (
                      <div className={`h-4 w-4 shrink-0 rounded-full border ${isSelected ? "border-primary bg-primary" : "border-muted-foreground"}`} />
                    )}
                    {option}
                  </button>
                );
              })}
            </div>
          )}

          {q.type === "open" && (
            <textarea
              placeholder="Votre réponse..."
              value={(answers[q.id] as string) || ""}
              onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
              className="mt-6 w-full rounded-lg border border-border bg-background p-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              rows={5}
            />
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-between">
          {!submitted ? (
            <button
              onClick={handleSubmit}
              disabled={answers[q.id] === undefined}
              className="ml-auto rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
            >
              Valider
            </button>
          ) : current < mockQuestions.length - 1 ? (
            <button
              onClick={handleNext}
              className="ml-auto flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Suivant <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <div className="ml-auto rounded-xl border border-primary/20 bg-primary/5 p-4">
              <p className="font-display text-lg font-bold text-primary">
                Score : {score}/{mockQuestions.filter(q => q.type === "qcm").length} QCM corrects
              </p>
              <Link
                to={`/courses/${courseId}`}
                className="mt-2 inline-flex text-sm text-muted-foreground hover:text-primary"
              >
                Retour au cours →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;
