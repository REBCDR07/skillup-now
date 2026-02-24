import { supabase } from "@/integrations/supabase/client";

export interface BadgeDefinition {
  name: string;
  emoji: string;
  description: string;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  { name: "Addict", emoji: "🔥", description: "3+ cours commencés" },
  { name: "Pro", emoji: "💪", description: "50+ modules complétés" },
  { name: "Expert", emoji: "🧠", description: "Tous les modules d'un cours complétés" },
  { name: "Impeccable", emoji: "✨", description: "90%+ à une certification" },
  { name: "Maître", emoji: "🏆", description: "3+ certifications obtenues" },
  { name: "Déterminé", emoji: "🎯", description: "Série de 7 jours d'apprentissage" },
  { name: "Premier pas", emoji: "👣", description: "Premier module complété" },
  { name: "Assidu", emoji: "📖", description: "10+ modules complétés" },
];

export const checkAndAwardBadges = async (userId: string) => {
  const [profileRes, progressRes, certsRes] = await Promise.all([
    supabase.from("profiles").select("badges, points").eq("user_id", userId).single(),
    supabase.from("user_module_progress").select("course_id, completed").eq("user_id", userId).eq("completed", true),
    supabase.from("certificates").select("score").eq("user_id", userId),
  ]);

  const currentBadges: string[] = profileRes.data?.badges || [];
  const completedModules = progressRes.data || [];
  const certificates = certsRes.data || [];
  const newBadges: string[] = [...currentBadges];
  let pointsToAdd = 0;

  // Group completed modules by course
  const courseModuleCount: Record<string, number> = {};
  for (const m of completedModules) {
    courseModuleCount[m.course_id] = (courseModuleCount[m.course_id] || 0) + 1;
  }

  const uniqueCourses = Object.keys(courseModuleCount).length;
  const totalCompleted = completedModules.length;
  const hasFullCourse = Object.values(courseModuleCount).some((c) => c >= 10);

  const checks: [string, boolean][] = [
    ["Premier pas", totalCompleted >= 1],
    ["Assidu", totalCompleted >= 10],
    ["Addict", uniqueCourses >= 3],
    ["Pro", totalCompleted >= 50],
    ["Expert", hasFullCourse],
    ["Impeccable", certificates.some((c) => c.score >= 90)],
    ["Maître", certificates.length >= 3],
  ];

  for (const [badge, condition] of checks) {
    if (condition && !newBadges.includes(badge)) {
      newBadges.push(badge);
      pointsToAdd += 20;
    }
  }

  if (newBadges.length > currentBadges.length) {
    await supabase.from("profiles").update({ badges: newBadges }).eq("user_id", userId);
    if (pointsToAdd > 0) {
      await supabase.rpc("increment_points", { p_user_id: userId, p_points: pointsToAdd });
    }
    return newBadges.filter((b) => !currentBadges.includes(b));
  }

  return [];
};
