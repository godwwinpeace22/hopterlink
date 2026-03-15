/**
 * Pure notification helpers — no React or Supabase imports.
 * Safe to use from tests and from the main notifications module.
 */
import type { Database } from "@/lib/database.types";

export type NotificationType = Database["public"]["Enums"]["notification_type"];

// ── Icons ──────────────────────────────────────────────────────────────
export const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  job_posted: "📋",
  quote_received: "💬",
  quote_accepted: "✅",
  message_received: "📩",
  booking_confirmed: "📅",
  payment_released: "💰",
  review_received: "⭐",
  verification_approved: "🛡️",
  reward_earned: "🎉",
};

// ── Routing ────────────────────────────────────────────────────────────
export interface NotificationRoute {
  path: string;
  state?: Record<string, string>;
}

export function resolveNotificationRoute(
  type: string,
  relatedId: string | null,
  isProvider: boolean,
): NotificationRoute | null {
  if (!relatedId) return null;

  const base = isProvider ? "/dashboard/provider" : "/dashboard/client";

  switch (type) {
    case "booking_confirmed":
      return { path: `${base}/bookings` };

    case "quote_received":
      return {
        path: isProvider ? `${base}/jobs` : `${base}/my-jobs/${relatedId}`,
      };

    case "quote_accepted":
    case "job_posted":
      return {
        path: isProvider ? `${base}/jobs` : `${base}/my-jobs/${relatedId}`,
      };

    case "message_received":
      return { path: `${base}/messages` };

    case "payment_released":
      return { path: `${base}/wallet` };

    case "review_received":
      return { path: `${base}/reviews` };

    case "verification_approved":
      return { path: `${base}/settings` };

    case "reward_earned":
      return { path: `${base}/wallet` };

    default:
      return null;
  }
}

// ── Formatting ─────────────────────────────────────────────────────────
export function formatNotificationTime(timestamp: string | null): string {
  if (!timestamp) return "";
  const d = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
