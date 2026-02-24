import { getCourseIcon } from "@/lib/course-icons";

interface CourseIconProps {
  slug: string;
  fallbackEmoji?: string;
  className?: string;
}

const CourseIcon = ({ slug, fallbackEmoji = "📚", className = "h-10 w-10" }: CourseIconProps) => {
  const iconUrl = getCourseIcon(slug);

  if (iconUrl) {
    return <img src={iconUrl} alt={slug} className={className} />;
  }

  return <span className="text-4xl">{fallbackEmoji}</span>;
};

export default CourseIcon;
