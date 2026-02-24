import { useEffect, useState } from "react";
import { Trophy, Medal, Star, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BADGE_DEFINITIONS } from "@/lib/badges";

const Leaderboard = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("profiles").select("*").order("points", { ascending: false }).limit(50).then(({ data }) => {
      // Filter out users with 0 points and no name
      const filtered = (data || []).filter(u => u.points > 0 || (u.name && u.name.trim()));
      setUsers(filtered);
      setLoading(false);
    });
  }, []);

  const top3 = users.slice(0, 3);
  const rest = users.slice(3);

  const getBadgeEmoji = (badgeName: string) => {
    const def = BADGE_DEFINITIONS.find(b => b.name === badgeName);
    return def?.emoji || "🏅";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pb-20 pt-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            <Trophy className="mb-1 mr-2 inline h-8 w-8 text-secondary" />
            Classement
          </h1>
          <p className="mt-2 text-muted-foreground">Les meilleurs apprenants de la communauté SkillFlash.</p>
        </motion.div>

        {loading ? (
          <div className="mt-12 text-center text-muted-foreground">Chargement...</div>
        ) : users.length === 0 ? (
          <div className="mt-12 text-center text-muted-foreground">
            Aucun apprenant pour le moment. Soyez le premier !
          </div>
        ) : (
          <>
            {/* Podium - works with 1, 2 or 3 users */}
            <div className="mt-10 flex items-end justify-center gap-3 sm:gap-6">
              {top3.length >= 2 && (
                <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <PodiumCard user={top3[1]} rank={2} height="h-36 sm:h-44" getBadgeEmoji={getBadgeEmoji} />
                </motion.div>
              )}
              {top3.length >= 1 && (
                <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <PodiumCard user={top3[0]} rank={1} height="h-44 sm:h-56" getBadgeEmoji={getBadgeEmoji} />
                </motion.div>
              )}
              {top3.length >= 3 && (
                <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <PodiumCard user={top3[2]} rank={3} height="h-28 sm:h-36" getBadgeEmoji={getBadgeEmoji} />
                </motion.div>
              )}
            </div>

            {/* Rest of the list */}
            <div className="mt-10 space-y-2">
              {rest.map((user, i) => {
                const rank = i + 4;
                const initials = (user.name || "??").substring(0, 2).toUpperCase();
                return (
                  <motion.div key={user.id}
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * i }}
                    className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/20">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted font-display text-sm font-bold text-muted-foreground">
                      {rank}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted font-display text-sm font-bold text-foreground">
                      {initials}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{user.name || "Anonyme"}</p>
                      <div className="flex gap-1 mt-0.5">
                        {(user.badges || []).slice(0, 4).map((b: string, j: number) => (
                          <span key={j} className="text-xs" title={b}>{getBadgeEmoji(b)}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-secondary" />
                      <span className="font-display text-sm font-bold text-foreground">{user.points}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

const PodiumCard = ({ user, rank, height, getBadgeEmoji }: { user: any; rank: number; height: string; getBadgeEmoji: (name: string) => string }) => {
  const initials = (user.name || "??").substring(0, 2).toUpperCase();
  const rankConfig: Record<number, { border: string; bg: string; size: string }> = {
    1: {
      border: "border-secondary ring-2 ring-secondary/30",
      bg: "bg-secondary/20",
      size: "h-20 w-20",
    },
    2: {
      border: "border-primary/50",
      bg: "bg-primary/10",
      size: "h-14 w-14",
    },
    3: {
      border: "border-muted-foreground/30",
      bg: "bg-muted",
      size: "h-14 w-14",
    },
  };

  const cfg = rankConfig[rank];

  return (
    <div className="flex flex-col items-center">
      {rank === 1 && <Crown className="mb-1 h-8 w-8 text-secondary animate-pulse-slow" />}
      <div className={`mb-2 flex items-center justify-center rounded-full border-2 ${cfg.border} ${cfg.size} bg-card font-display text-lg font-bold text-foreground`}>
        {user.avatar_url ? (
          <img src={user.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
        ) : initials}
      </div>
      <p className="text-sm font-semibold text-foreground truncate max-w-[80px] sm:max-w-[120px]">
        {(user.name || "Anonyme").split(" ")[0]}
      </p>
      <p className="text-xs font-bold text-secondary">{user.points} pts</p>
      <div className="flex gap-0.5 mt-1">
        {(user.badges || []).slice(0, 3).map((b: string, i: number) => (
          <span key={i} className="text-xs" title={b}>{getBadgeEmoji(b)}</span>
        ))}
      </div>
      <div className={`mt-2 w-20 sm:w-28 rounded-t-xl ${height} flex items-start justify-center pt-4 ${cfg.bg}`}>
        <span className="font-display text-2xl font-bold text-foreground">#{rank}</span>
      </div>
    </div>
  );
};

export default Leaderboard;
