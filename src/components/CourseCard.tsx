import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface CourseCardProps {
  id: string;
  title: string;
  level: string;
  description: string;
  duration: string;
  skills: string[];
  modules: number;
  icon: string;
}

const CourseCard = ({ id, title, level, description, duration, skills, modules, icon }: CourseCardProps) => {
  const levelColor = level === "Débutant" 
    ? "bg-primary/10 text-primary" 
    : level === "Intermédiaire" 
    ? "bg-secondary/10 text-secondary" 
    : "bg-destructive/10 text-destructive";

  return (
    <Link
      to={`/courses/${id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/40 hover:glow-emerald"
    >
      <div className="flex items-start justify-between">
        <span className="text-4xl">{icon}</span>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${levelColor}`}>
          {level}
        </span>
      </div>
      <h3 className="mt-4 font-display text-xl font-bold text-foreground group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="mt-2 flex-1 text-sm text-muted-foreground line-clamp-2">{description}</p>
      <div className="mt-4 flex flex-wrap gap-1">
        {skills.slice(0, 3).map((skill) => (
          <Badge key={skill} variant="secondary" className="text-xs bg-muted text-muted-foreground border-0">
            {skill}
          </Badge>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>{modules} modules</span>
        <span>~{duration}</span>
      </div>
    </Link>
  );
};

export default CourseCard;
