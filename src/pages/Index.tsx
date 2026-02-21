import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Award, Zap, Users } from "lucide-react";
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
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />

        <div className="container relative z-10 mx-auto px-4 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-primary">
              <Zap className="h-4 w-4" />
              Innovation béninoise 🇧🇯 — Formation IA
            </div>
            <h1 className="font-display text-5xl font-bold leading-tight tracking-tight text-foreground md:text-7xl">
              Apprenez.{" "}
              <span className="text-gradient-primary">Certifiez.</span>{" "}
              Brillez.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              Micro-formations générées par IA, évaluations interactives et certifications vérifiables. Développez vos compétences en un éclair ⚡
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 font-display text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 glow-emerald"
              >
                Explorer les cours
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-8 py-4 font-display text-sm font-semibold text-foreground transition-all hover:border-primary/40"
              >
                Créer un compte
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-20 grid max-w-2xl grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { icon: BookOpen, label: "Cours", value: "50+" },
              { icon: Users, label: "Apprenants", value: "2K+" },
              { icon: Award, label: "Certificats", value: "800+" },
              { icon: Zap, label: "Modules IA", value: "500+" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center rounded-xl border border-border bg-card/50 p-4 backdrop-blur-sm">
                <stat.icon className="mb-2 h-5 w-5 text-primary" />
                <span className="font-display text-2xl font-bold text-foreground">{stat.value}</span>
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="border-t border-border py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              Cours <span className="text-primary">populaires</span>
            </h2>
            <p className="mt-3 text-muted-foreground">
              Commencez par un cours, obtenez votre certificat en quelques heures.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.slice(0, 6).map((course) => (
              <CourseCard key={course.id} {...course} />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              Voir tous les cours <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border bg-card py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center font-display text-3xl font-bold text-foreground">
            Comment ça <span className="text-secondary">marche</span> ?
          </h2>
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Choisissez un cours",
                desc: "Explorez le catalogue et choisissez un sujet qui vous passionne.",
              },
              {
                step: "02",
                title: "Apprenez par modules",
                desc: "10 modules générés par IA avec explications, exemples et exercices.",
              },
              {
                step: "03",
                title: "Certifiez-vous",
                desc: "Passez l'examen final et obtenez un certificat vérifiable.",
              },
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

      <Footer />
    </div>
  );
};

export default Index;
