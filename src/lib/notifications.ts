import { supabase } from "@/integrations/supabase/client";

type NotificationType = "badge" | "certification" | "quiz" | "module" | "reminder" | "info";

interface NotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  emoji?: string;
  metadata?: Record<string, any>;
}

const EMOJI_MAP: Record<NotificationType, string> = {
  badge: "🏅",
  certification: "🏆",
  quiz: "📝",
  module: "📖",
  reminder: "⏰",
  info: "📢",
};

export async function createNotification({
  userId,
  type,
  title,
  message,
  emoji,
  metadata = {},
}: NotificationPayload) {
  const { error } = await supabase.from("notifications").insert({
    user_id: userId,
    type,
    title,
    message,
    emoji: emoji || EMOJI_MAP[type] || "📢",
    metadata,
  });

  if (error) {
    console.error("Failed to create notification:", error);
  }
}
