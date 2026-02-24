import { Link, useLocation, useNavigate } from "react-router-dom";
import { BookOpen, Trophy, User, LogIn, Menu, X, LogOut, Sun, Moon, TrendingUp, UserCircle, Search } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/ThemeProvider";
import SearchDialog from "@/components/SearchDialog";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const links = [
    { to: "/courses", label: "Cours", icon: BookOpen },
    { to: "/leaderboard", label: "Classement", icon: Trophy },
    ...(user
      ? [
          { to: "/dashboard", label: "Dashboard", icon: User },
          { to: "/progress", label: "Progression", icon: TrendingUp },
        ]
      : []),
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-display text-lg font-bold text-primary-foreground">
              S
            </div>
            <span className="font-display text-xl font-bold text-foreground">
              Skill<span className="text-primary">Flash</span>
            </span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}

            <button
              onClick={() => setSearchOpen(true)}
              className="ml-1 flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">Rechercher</span>
              <kbd className="hidden rounded border border-border bg-background px-1 py-0.5 text-[10px] lg:inline">⌘K</kbd>
            </button>

            <button
              onClick={toggleTheme}
              className="ml-1 rounded-lg p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {user ? (
              <div className="ml-1 flex items-center gap-1">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <UserCircle className="h-4 w-4" />
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="ml-2 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <LogIn className="h-4 w-4" />
                Connexion
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button onClick={() => setSearchOpen(true)} className="rounded-lg p-2 text-foreground">
              <Search className="h-5 w-5" />
            </button>
            <button onClick={toggleTheme} className="rounded-lg p-2 text-foreground">
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button className="text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-border bg-background px-4 py-4 md:hidden">
            {links.map((link) => (
              <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground hover:text-foreground">
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link to="/profile" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground hover:text-foreground">
                  <UserCircle className="h-4 w-4" /> Profil
                </Link>
                <button onClick={() => { handleSignOut(); setMobileOpen(false); }}
                  className="mt-2 flex w-full items-center gap-2 rounded-lg border border-border px-4 py-3 text-sm text-muted-foreground">
                  <LogOut className="h-4 w-4" /> Déconnexion
                </button>
              </>
            ) : (
              <Link to="/auth" onClick={() => setMobileOpen(false)}
                className="mt-2 flex items-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">
                <LogIn className="h-4 w-4" /> Connexion
              </Link>
            )}
          </div>
        )}
      </nav>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Navbar;
