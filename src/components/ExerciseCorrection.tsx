import { useState } from "react";
import { ChevronDown, ChevronUp, Eye } from "lucide-react";
import CodePreview from "./CodePreview";

interface ExerciseCorrectionProps {
  exercise: {
    title: string;
    description: string;
    hint?: string;
    correction?: string;
    correction_code?: string;
  };
}

const ExerciseCorrection = ({ exercise }: ExerciseCorrectionProps) => {
  const [showCorrection, setShowCorrection] = useState(false);

  const hasCorrection = exercise.correction || exercise.correction_code;

  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <h3 className="font-medium text-foreground">{exercise.title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{exercise.description}</p>
      {exercise.hint && (
        <p className="mt-2 text-xs text-primary">💡 Indice : {exercise.hint}</p>
      )}
      {hasCorrection && (
        <div className="mt-3">
          <button
            onClick={() => setShowCorrection(!showCorrection)}
            className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
          >
            <Eye className="h-3.5 w-3.5" />
            {showCorrection ? "Masquer le corrigé" : "Voir le corrigé"}
            {showCorrection ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          {showCorrection && (
            <div className="mt-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <p className="mb-2 text-xs font-semibold text-primary">📝 Corrigé</p>
              {exercise.correction && (
                <p className="text-sm text-foreground whitespace-pre-wrap">{exercise.correction}</p>
              )}
              {exercise.correction_code && (
                <CodePreview code={exercise.correction_code} />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExerciseCorrection;
