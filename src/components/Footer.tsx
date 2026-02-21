import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border bg-card">
    <div className="container mx-auto px-4 py-12">
      <div className="grid gap-8 md:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-display text-sm font-bold text-primary-foreground">
              S
            </div>
            <span className="font-display text-lg font-bold text-foreground">
              Skill<span className="text-primary">Flash</span>
            </span>
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">
            Plateforme de micro-formation intelligente, rapide et certifiante. Innovation béninoise 🇧🇯
          </p>
        </div>
        <div>
          <h4 className="mb-3 font-display text-sm font-semibold text-foreground">Plateforme</h4>
          <div className="flex flex-col gap-2">
            <Link to="/courses" className="text-sm text-muted-foreground hover:text-primary transition-colors">Catalogue</Link>
            <Link to="/leaderboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">Classement</Link>
            <Link to="/auth" className="text-sm text-muted-foreground hover:text-primary transition-colors">Inscription</Link>
          </div>
        </div>
        <div>
          <h4 className="mb-3 font-display text-sm font-semibold text-foreground">Cours populaires</h4>
          <div className="flex flex-col gap-2">
            <Link to="/courses/html" className="text-sm text-muted-foreground hover:text-primary transition-colors">HTML & CSS</Link>
            <Link to="/courses/python" className="text-sm text-muted-foreground hover:text-primary transition-colors">Python</Link>
            <Link to="/courses/react" className="text-sm text-muted-foreground hover:text-primary transition-colors">React.js</Link>
          </div>
        </div>
        <div>
          <h4 className="mb-3 font-display text-sm font-semibold text-foreground">Certification</h4>
          <p className="text-sm text-muted-foreground">
            Obtenez des certificats vérifiables avec QR code et lien LinkedIn.
          </p>
        </div>
      </div>
      <div className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
        © 2026 SkillFlash — Made with ❤️ in Bénin
      </div>
    </div>
  </footer>
);

export default Footer;
