import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, User, ArrowRight, Github } from "lucide-react";
import Navbar from "@/components/Navbar";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex min-h-screen items-center justify-center px-4 pt-16">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="font-display text-3xl font-bold text-foreground">
              {isLogin ? "Bon retour" : "Créer un compte"}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {isLogin ? "Connectez-vous pour continuer" : "Rejoignez SkillFlash gratuitement"}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            {/* OAuth */}
            <div className="flex gap-3">
              <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-muted px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/40">
                <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Google
              </button>
              <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-muted px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/40">
                <Github className="h-4 w-4" />
                GitHub
              </button>
            </div>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">ou</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              {!isLogin && (
                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Nom complet"
                    className="w-full rounded-lg border border-border bg-muted px-10 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full rounded-lg border border-border bg-muted px-10 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="Mot de passe"
                  className="w-full rounded-lg border border-border bg-muted px-10 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-display text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {isLogin ? "Se connecter" : "S'inscrire"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}{" "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="font-medium text-primary hover:underline"
              >
                {isLogin ? "S'inscrire" : "Se connecter"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
