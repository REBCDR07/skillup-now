import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Notification {
  id: string;
  type: "badge" | "certification" | "info";
  message: string;
  emoji: string;
  timestamp: Date;
  read: boolean;
}

const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Load stored notifications from localStorage
    const stored = localStorage.getItem(`notifications_${user.id}`);
    if (stored) {
      try {
        setNotifications(JSON.parse(stored));
      } catch {}
    }

    // Listen for badge/cert changes on profiles
    const channel = supabase
      .channel(`profile_changes_${user.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const oldBadges: string[] = (payload.old as any)?.badges || [];
          const newBadges: string[] = (payload.new as any)?.badges || [];
          const added = newBadges.filter((b) => !oldBadges.includes(b));
          if (added.length > 0) {
            const newNotifs = added.map((badge) => ({
              id: crypto.randomUUID(),
              type: "badge" as const,
              message: `Badge débloqué : ${badge}`,
              emoji: "🏅",
              timestamp: new Date(),
              read: false,
            }));
            setNotifications((prev) => {
              const updated = [...newNotifs, ...prev].slice(0, 50);
              localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updated));
              return updated;
            });
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "certificates", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const notif: Notification = {
            id: crypto.randomUUID(),
            type: "certification",
            message: `Certification obtenue ! Score: ${(payload.new as any)?.score}%`,
            emoji: "🏆",
            timestamp: new Date(),
            read: false,
          };
          setNotifications((prev) => {
            const updated = [notif, ...prev].slice(0, 50);
            localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updated));
            return updated;
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      if (user) localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updated));
      return updated;
    });
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen(!open); if (!open) markAllRead(); }}
        className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-border bg-card shadow-lg">
            <div className="border-b border-border p-3">
              <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="p-4 text-center text-sm text-muted-foreground">Aucune notification</p>
              ) : (
                notifications.slice(0, 20).map((n) => (
                  <div key={n.id} className={`border-b border-border p-3 last:border-0 ${!n.read ? "bg-primary/5" : ""}`}>
                    <p className="text-sm text-foreground">
                      <span className="mr-1">{n.emoji}</span> {n.message}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {new Date(n.timestamp).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
