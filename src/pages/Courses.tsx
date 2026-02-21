import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import { courses } from "@/lib/mock-data";
import { Search } from "lucide-react";
import { useState } from "react";

const Courses = () => {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("Tous");

  const levels = ["Tous", "Débutant", "Intermédiaire", "Avancé"];

  const filtered = courses.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchLevel = levelFilter === "Tous" || c.level === levelFilter;
    return matchSearch && matchLevel;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pb-20 pt-24">
        <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
          Catalogue des <span className="text-primary">cours</span>
        </h1>
        <p className="mt-2 text-muted-foreground">Choisissez un cours et commencez à apprendre dès maintenant.</p>

        {/* Filters */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher un cours..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex gap-2">
            {levels.map((level) => (
              <button
                key={level}
                onClick={() => setLevelFilter(level)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  levelFilter === level
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => (
            <CourseCard key={course.id} {...course} />
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="mt-12 text-center text-muted-foreground">Aucun cours trouvé.</p>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Courses;
