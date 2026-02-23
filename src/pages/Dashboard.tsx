import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Award, Star, TrendingUp, ChevronRight, PlayCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [inProgressCourses, setInProgressCourses] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) { navigate("/auth"); return; }
    if (user) fetchData();
  }, [user, loading]);

  const fetchData = async () => {
    const [profileRes, certsRes, progressRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user!.id).single(),
      supabase.from("certificates").select("*, courses(title, slug)").eq("user_id", user!.id),
      supabase.from("user_module_progress").select("*, modules(title, module_number), courses(title, slug, icon)").eq("user_id", user!.id),
    ]);
    if (profileRes.data) setProfile(profileRes.data);
    if (certsRes.data) setCertificates(certsRes.data);

    // Group progress by course to find in-progress courses
    if (progressRes.data) {
      const courseMap: Record<string, { course: any; completedCount: number }> = {};
      for (const p of progressRes.data) {
        const cid = (p.courses as any)?.slug;
        if (!cid) continue;
        if (!courseMap[cid]) courseMap[cid] = { course: p.courses, completedCount: 0 };
        if (p.completed) courseMap[cid].completedCount++;
      }
      // Only show courses that are started but not all 10 completed
      const certSlugs = new Set((certsRes.data || []).map((c: any) => (c.courses as any)?.slug));
      const ip = Object.entries(courseMap)
        .filter(([slug, v]) => v.completedCount < 10 && !certSlugs.has(slug))
        .map(([slug, v]) => ({ slug, ...v }));
      setInProgressCourses(ip);
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-background"><p className="text-muted-foreground">Chargement...</p></div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pb-20 pt-24">
        <div className="mb-8 flex items-center gap-4">
          <Link to="/profile" className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 font-display text-2xl font-bold text-primary hover:ring-2 hover:ring-primary/30 transition-all">
            {(profile?.name || user.email || "?").substring(0, 2).toUpperCase()}
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">{profile?.name || "Apprenant"}</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { icon: Star, label: "Points", value: profile?.points || 0, color: "text-secondary" },
            { icon: Award, label: "Badges", value: profile?.badges?.length || 0, color: "text-primary" },
            { icon: BookOpen, label: "En cours", value: inProgressCourses.length, color: "text-primary" },
            { icon: TrendingUp, label: "Certificats", value: certificates.length, color: "text-secondary" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
              <stat.icon className={`mb-2 h-5 w-5 ${stat.color}`} />
              <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* In-progress courses */}
        {inProgressCourses.length > 0 && (
          <>
            <h2 className="mb-4 font-display text-xl font-bold text-foreground">
              <PlayCircle className="mr-2 inline h-5 w-5 text-primary" />
              Cours en cours
            </h2>
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {inProgressCourses.map((c) => (
                <Link key={c.slug} to={`/courses/${c.slug}`}
                  className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30">
                  <span className="text-3xl">{c.course?.icon || "📚"}</span>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{c.course?.title}</p>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${c.completedCount * 10}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{c.completedCount}/10 modules</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </>
        )}

        {/* Certificates */}
        {certificates.length > 0 && (
          <>
            <h2 className="mb-4 font-display text-xl font-bold text-foreground">Mes certificats</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {certificates.map((cert) => (
                <div key={cert.id} className="rounded-xl border border-primary/20 bg-card p-6 glow-emerald">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-display text-lg font-bold text-foreground">{(cert.courses as any)?.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(cert.created_at).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <Award className="h-8 w-8 text-primary" />
                  </div>
                  <p className="mt-2 text-sm text-primary">Score : {Math.round(cert.score)}%</p>
                  <div className="mt-4 flex gap-3">
                    <Link to={`/verify/${cert.verification_code}`} className="text-xs text-muted-foreground hover:text-primary">
                      Vérifier →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {certificates.length === 0 && inProgressCourses.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <p className="mt-4 text-muted-foreground">Vous n'avez pas encore commencé de cours.</p>
            <Link to="/courses" className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline">
              Explorer les cours <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
