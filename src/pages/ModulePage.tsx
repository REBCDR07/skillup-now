import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import Navbar from "@/components/Navbar";

const ModulePage = () => {
  const { courseId, moduleId } = useParams();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-3xl px-4 pb-20 pt-24">
        <Link to={`/courses/${courseId}`} className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Retour au cours
        </Link>

        <div className="rounded-xl border border-border bg-card p-8">
          <div className="mb-6 flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">Module {moduleId}</span>
          </div>

          <h1 className="font-display text-2xl font-bold text-foreground">
            Introduction et fondamentaux
          </h1>

          <div className="mt-8 space-y-6 text-muted-foreground">
            <div>
              <h2 className="mb-3 font-display text-lg font-semibold text-foreground">📖 Explication</h2>
              <p className="leading-relaxed">
                Ce module vous introduit aux concepts fondamentaux. Vous allez découvrir les bases 
                essentielles qui vous permettront de progresser dans les modules suivants. Chaque concept 
                est expliqué de manière claire avec des exemples pratiques.
              </p>
            </div>

            <div>
              <h2 className="mb-3 font-display text-lg font-semibold text-foreground">💡 Exemples concrets</h2>
              <div className="rounded-lg bg-muted p-4">
                <pre className="text-sm text-foreground overflow-x-auto">
{`// Exemple de code
function greet(name) {
  return \`Bonjour, \${name} !\`;
}

console.log(greet("SkillFlash"));
// Output: Bonjour, SkillFlash !`}
                </pre>
              </div>
            </div>

            <div>
              <h2 className="mb-3 font-display text-lg font-semibold text-foreground">🏋️ Exercice pratique</h2>
              <div className="rounded-lg border border-border bg-background p-4">
                <p className="text-sm">
                  Créez une fonction qui prend un tableau de nombres et retourne la somme de tous les éléments pairs.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-between">
          <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Module précédent
          </button>
          <Link
            to={`/courses/${courseId}/module/${moduleId}/quiz`}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Passer le quiz <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ModulePage;
