import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, BookOpen, Award, TrendingUp, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import CourseIcon from "@/components/CourseIcon";

const SearchDialog = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [query, setQuery] = useState("");
  const [courses, setCourses] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setQuery("");
      supabase.from("courses").select("*").order("title").then(({ data }) => setCourses(data || []));
    }
  }, [open]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  const filtered = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.description?.toLowerCase().includes(query.toLowerCase()) ||
      (c.skills || []).some((s: string) => s.toLowerCase().includes(query.toLowerCase()))
  );

  const go = (path: string) => {
    onClose();
    navigate(path);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" onClick={onClose}>
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            autoFocus
            type="text"
            placeholder="Rechercher cours, modules, certifications..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {/* Quick links */}
          {!query && (
            <div className="mb-2 space-y-1">
              <p className="px-2 py-1 text-xs font-semibold text-muted-foreground">Navigation rapide</p>
              {[
                { label: "Tableau de bord", path: "/dashboard", icon: TrendingUp },
                { label: "Ma progression", path: "/progress", icon: TrendingUp },
                { label: "Classement", path: "/leaderboard", icon: Award },
                { label: "Tous les cours", path: "/courses", icon: BookOpen },
              ].map((item) => (
                <button
                  key={item.path}
                  onClick={() => go(item.path)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {/* Course results */}
          {filtered.length > 0 && (
            <div className="space-y-1">
              <p className="px-2 py-1 text-xs font-semibold text-muted-foreground">Cours</p>
              {filtered.slice(0, 8).map((c) => (
                <button
                  key={c.id}
                  onClick={() => go(`/courses/${c.slug}`)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-muted transition-colors"
                >
                  <CourseIcon slug={c.slug} fallbackEmoji={c.icon} className="h-6 w-6" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{c.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{c.level} · {c.duration}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {query && filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">Aucun résultat pour "{query}"</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchDialog;
