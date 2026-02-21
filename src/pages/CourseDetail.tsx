import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, BarChart3, CheckCircle2, Circle, Lock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { courses, mockModules } from "@/lib/mock-data";

const CourseDetail = () => {
  const { courseId } = useParams();
  const course = courses.find((c) => c.id === courseId);

  if (!course) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Cours non trouvé.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pb-20 pt-24">
        <Link to="/courses" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Retour au catalogue
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-border bg-card p-8">
              <span className="text-5xl">{course.icon}</span>
              <h1 className="mt-4 font-display text-3xl font-bold text-foreground">{course.title}</h1>
              <p className="mt-3 text-muted-foreground">{course.description}</p>

              <div className="mt-6 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BarChart3 className="h-4 w-4 text-primary" /> {course.level}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 text-secondary" /> ~{course.duration}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-display text-sm font-semibold text-foreground">Compétences visées</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {course.skills.map((skill) => (
                    <span key={skill} className="rounded-lg bg-muted px-3 py-1 text-xs text-muted-foreground">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modules */}
            <div className="mt-6">
              <h2 className="mb-4 font-display text-xl font-bold text-foreground">Modules</h2>
              <div className="space-y-2">
                {mockModules.map((mod, i) => (
                  <Link
                    key={mod.id}
                    to={`/courses/${courseId}/module/${mod.id}`}
                    className={`flex items-center gap-4 rounded-xl border p-4 transition-colors ${
                      mod.completed
                        ? "border-primary/20 bg-primary/5 hover:border-primary/40"
                        : "border-border bg-card hover:border-border"
                    }`}
                  >
                    {mod.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    ) : i === mockModules.filter(m => m.completed).length ? (
                      <Circle className="h-5 w-5 text-secondary" />
                    ) : (
                      <Lock className="h-5 w-5 text-muted-foreground/40" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        Module {mod.id} : {mod.title}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="sticky top-24 rounded-xl border border-border bg-card p-6">
              <h3 className="font-display text-lg font-bold text-foreground">Progression</h3>
              <div className="mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Complété</span>
                  <span className="font-medium text-primary">30%</span>
                </div>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-[30%] rounded-full bg-primary" />
                </div>
              </div>
              <div className="mt-6 space-y-3 text-sm text-muted-foreground">
                <p>✅ 3 modules complétés</p>
                <p>📝 7 modules restants</p>
                <p>🏆 Certification après 10 modules</p>
              </div>
              <button className="mt-6 w-full rounded-lg bg-primary py-3 font-display text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
                Continuer le cours
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CourseDetail;
