import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, BarChart3, CheckCircle2, Circle, Lock, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const CourseDetail = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourse();
  }, [courseId, user]);

  const fetchCourse = async () => {
    const { data: courseData } = await supabase.from("courses").select("*").eq("slug", courseId).single();
    if (!courseData) { setLoading(false); return; }
    setCourse(courseData);

    const { data: modulesData } = await supabase.from("modules").select("*").eq("course_id", courseData.id).order("module_number");
    setModules(modulesData || []);

    if (user) {
      const { data: progressData } = await supabase.from("user_module_progress")
        .select("*").eq("user_id", user.id).eq("course_id", courseData.id);
      setProgress(progressData || []);
    }
    setLoading(false);
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-background"><p className="text-muted-foreground">Chargement...</p></div>;
  if (!course) return <div className="flex min-h-screen items-center justify-center bg-background"><p className="text-muted-foreground">Cours non trouvé.</p></div>;

  const completedModuleIds = new Set(progress.filter(p => p.completed).map(p => p.module_id));
  const completedCount = completedModuleIds.size;
  const allCompleted = completedCount >= 10;

  // Generate module list (1-10, whether or not AI has generated them)
  const moduleNumbers = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pb-20 pt-24">
        <Link to="/courses" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Retour au catalogue
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
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
                  {(course.skills || []).map((skill: string) => (
                    <span key={skill} className="rounded-lg bg-muted px-3 py-1 text-xs text-muted-foreground">{skill}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h2 className="mb-4 font-display text-xl font-bold text-foreground">Modules</h2>
              <div className="space-y-2">
                {moduleNumbers.map((num) => {
                  const mod = modules.find(m => m.module_number === num);
                  const isCompleted = mod && completedModuleIds.has(mod.id);
                  const previousCompleted = num === 1 || modules.find(m => m.module_number === num - 1 && completedModuleIds.has(m.id));
                  const isUnlocked = num <= completedCount + 1 || !user;

                  return (
                    <Link
                      key={num}
                      to={`/courses/${courseId}/module/${num}`}
                      className={`flex items-center gap-4 rounded-xl border p-4 transition-colors ${
                        isCompleted
                          ? "border-primary/20 bg-primary/5 hover:border-primary/40"
                          : isUnlocked
                          ? "border-border bg-card hover:border-primary/20"
                          : "border-border bg-card/50 opacity-50"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : isUnlocked ? (
                        <Circle className="h-5 w-5 text-secondary" />
                      ) : (
                        <Lock className="h-5 w-5 text-muted-foreground/40" />
                      )}
                      <p className="text-sm font-medium text-foreground">
                        Module {num} {mod ? `: ${mod.title}` : ""}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <div className="sticky top-24 rounded-xl border border-border bg-card p-6">
              <h3 className="font-display text-lg font-bold text-foreground">Progression</h3>
              <div className="mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Complété</span>
                  <span className="font-medium text-primary">{completedCount * 10}%</span>
                </div>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${completedCount * 10}%` }} />
                </div>
              </div>
              <div className="mt-6 space-y-3 text-sm text-muted-foreground">
                <p>✅ {completedCount} modules complétés</p>
                <p>📝 {10 - completedCount} modules restants</p>
                <p>🏆 Certification après 10 modules</p>
              </div>
              {allCompleted && (
                <Link
                  to={`/courses/${courseId}/certification`}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-secondary py-3 font-display text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary/90"
                >
                  <Award className="h-4 w-4" /> Passer la certification
                </Link>
              )}
              {!allCompleted && (
                <Link
                  to={`/courses/${courseId}/module/${completedCount + 1}`}
                  className="mt-6 block w-full rounded-lg bg-primary py-3 text-center font-display text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {completedCount === 0 ? "Commencer" : "Continuer"}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CourseDetail;
