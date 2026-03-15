import { supabase } from "@/lib/supabase";

// Re-export pure helpers so consumers can import everything from one place
export {
  formatNotificationTime,
  NOTIFICATION_ICONS,
  resolveNotificationRoute,
} from "./notificationHelpers";
export type {
  NotificationRoute,
  NotificationType,
} from "./notificationHelpers";

// ── Queries ────────────────────────────────────────────────────────────
export async function fetchNotifications(userId: string) {
  const { data, error } = await supabase
    .from("notifications")
    .select(
      "id, title, message, type, link_url, related_id, is_read, created_at",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchUnreadCount(userId: string) {
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);
  if (error) return 0;
  return count ?? 0;
}

export async function markNotificationRead(id: string) {
  await supabase
    .from("notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("id", id);
}

export async function markAllNotificationsRead(userId: string) {
  await supabase
    .from("notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("is_read", false);
}
