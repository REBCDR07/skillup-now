import { Link } from "react-router-dom";
import { BookOpen, Award, Star, TrendingUp, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Dashboard = () => {
  const user = {
    name: "Kofi Adjovi",
    email: "kofi@example.com",
    points: 1250,
    badges: 3,
    coursesCompleted: 2,
    coursesInProgress: 1,
  };

  const recentActivity = [
    { course: "HTML & CSS", module: "Module 4", progress: 40, status: "En cours" },
    { course: "Python", module: "Module 10", progress: 100, status: "Terminé" },
    { course: "React.js", module: "Module 1", progress: 10, status: "En cours" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pb-20 pt-24">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 font-display text-2xl font-bold text-primary">
            KA
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">{user.name}</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { icon: Star, label: "Points", value: user.points, color: "text-secondary" },
            { icon: Award, label: "Badges", value: user.badges, color: "text-primary" },
            { icon: BookOpen, label: "Terminés", value: user.coursesCompleted, color: "text-primary" },
            { icon: TrendingUp, label: "En cours", value: user.coursesInProgress, color: "text-secondary" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
              <stat.icon className={`mb-2 h-5 w-5 ${stat.color}`} />
              <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <h2 className="mb-4 font-display text-xl font-bold text-foreground">Activité récente</h2>
        <div className="space-y-3">
          {recentActivity.map((item, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
              <div className="flex-1">
                <p className="font-medium text-foreground">{item.course}</p>
                <p className="text-sm text-muted-foreground">{item.module}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-24">
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
                <span className={`text-xs font-medium ${item.status === "Terminé" ? "text-primary" : "text-secondary"}`}>
                  {item.status}
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>

        {/* Certificates */}
        <h2 className="mb-4 mt-8 font-display text-xl font-bold text-foreground">Mes certificats</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-primary/20 bg-card p-6 glow-emerald">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-display text-lg font-bold text-foreground">Python</p>
                <p className="text-sm text-muted-foreground">Obtenu le 15 Jan 2026</p>
              </div>
              <Award className="h-8 w-8 text-primary" />
            </div>
            <p className="mt-2 text-sm text-primary">Score : 92%</p>
            <div className="mt-4 flex gap-3">
              <Link to="/verify/CERT-PY-2026-001" className="text-xs text-muted-foreground hover:text-primary">
                Vérifier →
              </Link>
              <button className="text-xs text-muted-foreground hover:text-primary">
                Télécharger PDF
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
