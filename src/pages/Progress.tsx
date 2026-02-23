import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Clock, Flame, BookOpen, Award, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface CourseProgress {
  slug: string;
  title: string;
  icon: string;
  completedModules: number;
  totalModules: number;
  firstActivity: string;
  lastActivity: string;
  hasCertificate: boolean;
}

const Progress = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseProgress[]>([]);
  const [streak, setStreak] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { navigate("/auth"); return; }
    if (user) fetchProgress();
  }, [user, authLoading]);

  const fetchProgress = async () => {
    const [progressRes, certsRes, allCoursesRes] = await Promise.all([
      supabase.from("user_module_progress").select("*, modules(title, module_number), courses(title, slug, icon, duration)").eq("user_id", user!.id),
      supabase.from("certificates").select("course_id").eq("user_id", user!.id),
      supabase.from("courses").select("id, title, slug, icon, duration"),
    ]);

    const progressData = progressRes.data || [];
    const certCourseIds = new Set((certsRes.data || []).map((c: any) => c.course_id));

    // Group by course
    const courseMap: Record<string, CourseProgress> = {};
    for (const p of progressData) {
      const course = p.courses as any;
      if (!course?.slug) continue;
      if (!courseMap[course.slug]) {
        courseMap[course.slug] = {
          slug: course.slug,
          title: course.title,
          icon: course.icon || "📚",
          completedModules: 0,
          totalModules: 10,
          firstActivity: p.completed_at || "",
          lastActivity: p.completed_at || "",
          hasCertificate: false,
        };
      }
      if (p.completed) courseMap[course.slug].completedModules++;
      if (p.completed_at) {
        if (p.completed_at < courseMap[course.slug].firstActivity) courseMap[course.slug].firstActivity = p.completed_at;
        if (p.completed_at > courseMap[course.slug].lastActivity) courseMap[course.slug].lastActivity = p.completed_at;
      }
    }

    // Check certificates
    for (const c of allCoursesRes.data || []) {
      if (courseMap[c.slug] && certCourseIds.has(c.id)) {
        courseMap[c.slug].hasCertificate = true;
      }
    }

    setCourses(Object.values(courseMap).sort((a, b) => b.lastActivity.localeCompare(a.lastActivity)));

    // Calculate streak (consecutive days with activity)
    const dates = progressData
      .filter((p: any) => p.completed_at)
      .map((p: any) => new Date(p.completed_at).toDateString());
    const uniqueDates = [...new Set(dates)].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let s = 0;
    const today = new Date();
    for (let i = 0; i < uniqueDates.length; i++) {
      const expected = new Date(today);
      expected.setDate(expected.getDate() - i);
      if (new Date(uniqueDates[i]).toDateString() === expected.toDateString()) {
        s++;
      } else break;
    }
    setStreak(s);

    // Estimate total learning time (15min per completed module)
    const totalCompleted = progressData.filter((p: any) => p.completed).length;
    setTotalTime(totalCompleted * 15);

    setLoading(false);
  };

  if (authLoading || loading) return <div className="flex min-h-screen items-center justify-center bg-background"><p className="text-muted-foreground">Chargement...</p></div>;
  if (!user) return null;

  const hours = Math.floor(totalTime / 60);
  const mins = totalTime % 60;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pb-20 pt-24">
        <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
          <TrendingUp className="mb-1 mr-2 inline h-8 w-8 text-primary" />
          Ma Progression
        </h1>
        <p className="mt-2 text-muted-foreground">Suivez votre parcours d'apprentissage en détail.</p>

        {/* Stats cards */}
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <Clock className="mb-2 h-5 w-5 text-primary" />
            <p className="font-display text-2xl font-bold text-foreground">{hours}h{mins > 0 ? `${mins}m` : ""}</p>
            <p className="text-xs text-muted-foreground">Temps d'apprentissage</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <Flame className="mb-2 h-5 w-5 text-destructive" />
            <p className="font-display text-2xl font-bold text-foreground">{streak}</p>
            <p className="text-xs text-muted-foreground">Série de jours</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <BookOpen className="mb-2 h-5 w-5 text-secondary" />
            <p className="font-display text-2xl font-bold text-foreground">{courses.length}</p>
            <p className="text-xs text-muted-foreground">Cours commencés</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <Award className="mb-2 h-5 w-5 text-primary" />
            <p className="font-display text-2xl font-bold text-foreground">{courses.filter(c => c.hasCertificate).length}</p>
            <p className="text-xs text-muted-foreground">Certifications</p>
          </div>
        </div>

        {/* Course progress table */}
        <div className="mt-8">
          <h2 className="mb-4 font-display text-xl font-bold text-foreground">Détail par cours</h2>
          {courses.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
              Aucun cours commencé. Explorez le catalogue !
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Cours</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Progression</th>
                    <th className="hidden px-4 py-3 text-left text-xs font-semibold text-muted-foreground sm:table-cell">Durée estimée</th>
                    <th className="hidden px-4 py-3 text-left text-xs font-semibold text-muted-foreground md:table-cell">Dernière activité</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((c) => {
                    const pct = Math.round((c.completedModules / c.totalModules) * 100);
                    return (
                      <tr key={c.slug} className="border-b border-border bg-card hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{c.icon}</span>
                            <span className="text-sm font-medium text-foreground">{c.title}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs font-medium text-foreground">{c.completedModules}/10</span>
                          </div>
                        </td>
                        <td className="hidden px-4 py-3 text-sm text-muted-foreground sm:table-cell">
                          {c.completedModules * 15}min
                        </td>
                        <td className="hidden px-4 py-3 text-sm text-muted-foreground md:table-cell">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {c.lastActivity ? new Date(c.lastActivity).toLocaleDateString("fr-FR") : "—"}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {c.hasCertificate ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                              <Award className="h-3 w-3" /> Certifié
                            </span>
                          ) : pct === 100 ? (
                            <span className="inline-flex rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-medium text-secondary">
                              Prêt pour l'examen
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                              En cours
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Progress;
