import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Award, Zap, Users, Brain, Shield, Globe, Sparkles, CheckCircle2, Star } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import { courses } from "@/lib/mock-data";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative flex min-h-screen items-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-grid-pattern" />
        <div className="absolute inset-0 opacity-15" style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />

        <div className="container relative z-10 mx-auto px-4 py-20">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-primary">
              <Sparkles className="h-4 w-4" />
              Innovation béninoise 🇧🇯 — Formation propulsée par l'IA
            </div>
            <h1 className="font-display text-5xl font-bold leading-tight tracking-tight text-foreground md:text-7xl">
              Apprenez.{" "}
              <span className="text-gradient-primary">Certifiez.</span>{" "}
              <span className="text-secondary">Brillez.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Micro-formations générées par IA, évaluations interactives et certifications vérifiables compatibles LinkedIn. Développez vos compétences tech en un éclair ⚡
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/courses"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 font-display text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 glow-emerald">
                Explorer les cours <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/auth"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-8 py-4 font-display text-sm font-semibold text-foreground transition-all hover:border-primary/40">
                Créer un compte gratuit
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-8 flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-primary" /> 100% gratuit</span>
              <span className="flex items-center gap-1"><Shield className="h-3 w-3 text-primary" /> Certifications vérifiables</span>
              <span className="flex items-center gap-1"><Globe className="h-3 w-3 text-primary" /> Compatible LinkedIn</span>
            </div>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { icon: BookOpen, label: "Cours disponibles", value: "16+" },
              { icon: Users, label: "Apprenants actifs", value: "2K+" },
              { icon: Award, label: "Certificats délivrés", value: "800+" },
              { icon: Brain, label: "Modules IA générés", value: "500+" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center rounded-xl border border-border bg-card/50 p-5 backdrop-blur-sm transition-all hover:border-primary/30">
                <stat.icon className="mb-2 h-5 w-5 text-primary" />
                <span className="font-display text-2xl font-bold text-foreground">{stat.value}</span>
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              Pourquoi <span className="text-primary">SkillFlash</span> ?
            </h2>
            <p className="mt-3 text-muted-foreground">Une plateforme pensée pour l'apprenant africain moderne</p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
            {[
              { icon: Brain, title: "Cours générés par IA", desc: "Chaque cours est généré dynamiquement par intelligence artificielle avec des exemples concrets et des exercices pratiques adaptés.", color: "text-primary" },
              { icon: Award, title: "Certificats vérifiables", desc: "Obtenez un certificat PDF avec QR code, ID unique et lien public vérifiable. Partagez-le directement sur LinkedIn.", color: "text-secondary" },
              { icon: Zap, title: "Apprentissage rapide", desc: "Des micro-modules de 10 à 30 minutes pour apprendre à votre rythme, n'importe où, n'importe quand.", color: "text-primary" },
              { icon: Shield, title: "Évaluation rigoureuse", desc: "QCM, questions ouvertes et mini-projets chronométrés pour valider vos compétences de manière fiable.", color: "text-secondary" },
              { icon: Star, title: "Gamification", desc: "Gagnez des points, débloquez des badges et montez dans le classement. L'apprentissage devient un défi motivant.", color: "text-primary" },
              { icon: Globe, title: "Made in Bénin 🇧🇯", desc: "Une innovation béninoise pour l'Afrique et le monde. Accès gratuit, contenu de qualité, impact réel.", color: "text-secondary" },
            ].map((f) => (
              <div key={f.title} className="rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30">
                <f.icon className={`h-8 w-8 ${f.color}`} />
                <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="border-t border-border bg-card/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              Cours <span className="text-primary">populaires</span>
            </h2>
            <p className="mt-3 text-muted-foreground">Commencez par un cours, obtenez votre certificat en quelques heures.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {courses.slice(0, 8).map((course) => (
              <CourseCard key={course.id} {...course} />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link to="/courses" className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-6 py-3 text-sm font-medium text-primary transition-all hover:bg-primary/10">
              Voir les {courses.length} cours <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center font-display text-3xl font-bold text-foreground">
            Comment ça <span className="text-secondary">marche</span> ?
          </h2>
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-4">
            {[
              { step: "01", title: "Inscrivez-vous", desc: "Créez votre compte gratuit en 30 secondes avec email ou Google." },
              { step: "02", title: "Choisissez un cours", desc: "Explorez le catalogue et choisissez un sujet qui vous passionne." },
              { step: "03", title: "Apprenez par modules", desc: "10 modules IA avec explications, exemples et exercices pratiques." },
              { step: "04", title: "Certifiez-vous", desc: "Passez l'examen final et obtenez un certificat PDF vérifiable." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 font-display text-xl font-bold text-primary">
                  {item.step}
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-primary/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            Prêt à booster vos <span className="text-primary">compétences</span> ?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Rejoignez des milliers d'apprenants et obtenez vos certifications dès aujourd'hui. C'est gratuit.
          </p>
          <Link to="/auth"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-10 py-4 font-display text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 glow-emerald">
            Commencer maintenant <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
