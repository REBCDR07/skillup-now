import { Trophy, Medal, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { leaderboard } from "@/lib/mock-data";

const Leaderboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pb-20 pt-24">
        <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
          <Trophy className="mb-1 mr-2 inline h-8 w-8 text-secondary" />
          Classement
        </h1>
        <p className="mt-2 text-muted-foreground">Les meilleurs apprenants de la communauté SkillFlash.</p>

        {/* Top 3 podium */}
        <div className="mt-10 flex items-end justify-center gap-4">
          {[1, 0, 2].map((idx) => {
            const user = leaderboard[idx];
            const heights = ["h-40", "h-52", "h-32"];
            const podiumIdx = idx === 0 ? 1 : idx === 1 ? 0 : 2;
            return (
              <div key={user.rank} className="flex flex-col items-center">
                <div className={`mb-2 flex items-center justify-center rounded-full border-2 ${
                  user.rank === 1 ? "border-secondary h-16 w-16" : "border-border h-12 w-12"
                } bg-muted font-display text-lg font-bold text-foreground`}>
                  {user.avatar}
                </div>
                <p className="text-sm font-medium text-foreground">{user.name.split(" ")[0]}</p>
                <p className="text-xs text-secondary font-semibold">{user.points} pts</p>
                <div className={`mt-2 w-20 rounded-t-xl ${heights[podiumIdx]} flex items-start justify-center pt-3 ${
                  user.rank === 1 ? "bg-secondary/20" : user.rank === 2 ? "bg-primary/10" : "bg-muted"
                }`}>
                  {user.rank === 1 ? (
                    <Medal className="h-6 w-6 text-secondary" />
                  ) : (
                    <span className="font-display text-lg font-bold text-muted-foreground">#{user.rank}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Full list */}
        <div className="mt-10 space-y-2">
          {leaderboard.map((user) => (
            <div
              key={user.rank}
              className={`flex items-center gap-4 rounded-xl border p-4 transition-colors ${
                user.rank <= 3 ? "border-primary/20 bg-primary/5" : "border-border bg-card"
              }`}
            >
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg font-display text-sm font-bold ${
                user.rank === 1 ? "bg-secondary/20 text-secondary" : user.rank <= 3 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              }`}>
                {user.rank}
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted font-display text-sm font-bold text-foreground">
                {user.avatar}
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.courses} cours complétés</p>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-secondary" />
                <span className="font-display text-sm font-bold text-foreground">{user.points}</span>
              </div>
              <div className="flex items-center gap-1">
                <Medal className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">{user.badges}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Leaderboard;
