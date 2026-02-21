import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Award, Star, TrendingUp, ChevronRight, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
      return;
    }
    if (user) fetchData();
  }, [user, loading]);

  const fetchData = async () => {
    const [profileRes, resultsRes, certsRes, progressRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user!.id).single(),
      supabase.from("results").select("*, quizzes(*, modules(title)), courses(title)").eq("user_id", user!.id).order("completed_at", { ascending: false }).limit(5),
      supabase.from("certificates").select("*, courses(title, slug)").eq("user_id", user!.id),
      supabase.from("user_module_progress").select("*, modules(title), courses(title, slug)").eq("user_id", user!.id),
    ]);
    if (profileRes.data) setProfile(profileRes.data);
    if (resultsRes.data) setResults(resultsRes.data);
    if (certsRes.data) setCertificates(certsRes.data);
    if (progressRes.data) setProgress(progressRes.data);
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-background"><p className="text-muted-foreground">Chargement...</p></div>;
  if (!user) return null;

  const completedModules = progress.filter(p => p.completed).length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pb-20 pt-24">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 font-display text-2xl font-bold text-primary">
            {(profile?.name || user.email || "?").substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">{profile?.name || "Apprenant"}</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { icon: Star, label: "Points", value: profile?.points || 0, color: "text-secondary" },
            { icon: Award, label: "Badges", value: profile?.badges?.length || 0, color: "text-primary" },
            { icon: BookOpen, label: "Modules", value: completedModules, color: "text-primary" },
            { icon: TrendingUp, label: "Certificats", value: certificates.length, color: "text-secondary" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
              <stat.icon className={`mb-2 h-5 w-5 ${stat.color}`} />
              <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {results.length > 0 && (
          <>
            <h2 className="mb-4 font-display text-xl font-bold text-foreground">Résultats récents</h2>
            <div className="mb-8 space-y-3">
              {results.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
                  <div>
                    <p className="font-medium text-foreground">{(r.courses as any)?.title || "Cours"}</p>
                    <p className="text-sm text-muted-foreground">{(r.quizzes as any)?.modules?.title || "Quiz"}</p>
                  </div>
                  <span className={`font-display text-sm font-bold ${r.score >= 60 ? "text-primary" : "text-destructive"}`}>
                    {Math.round(r.score)}%
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

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

        {certificates.length === 0 && results.length === 0 && (
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
