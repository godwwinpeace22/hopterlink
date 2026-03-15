import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useSupabaseQuery } from "@/lib/useSupabaseQuery";

export function useUnreadCounts(userId: string | undefined) {
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const { data: unreadMessagesResult } = useSupabaseQuery(
    ["client_unread_messages", userId],
    () =>
      supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("recipient_id", userId ?? "")
        .eq("is_read", false),
    { enabled: Boolean(userId) },
  );

  const { data: unreadNotificationsResult } = useSupabaseQuery(
    ["client_unread_notifications", userId],
    () =>
      supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId ?? "")
        .eq("is_read", false),
    { enabled: Boolean(userId) },
  );

  useEffect(() => {
    if (typeof unreadMessagesResult?.count === "number") {
      setUnreadMessages(unreadMessagesResult.count);
    }
  }, [unreadMessagesResult]);

  useEffect(() => {
    if (typeof unreadNotificationsResult?.count === "number") {
      setUnreadNotifications(unreadNotificationsResult.count);
    }
  }, [unreadNotificationsResult]);

  useEffect(() => {
    if (!userId) return;

    const refresh = async () => {
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("recipient_id", userId)
        .eq("is_read", false);
      setUnreadMessages(count ?? 0);
    };

    const channel = supabase
      .channel(`client-dashboard-unread-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `recipient_id=eq.${userId}`,
        },
        () => {
          void refresh();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const refresh = async () => {
      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_read", false);
      setUnreadNotifications(count ?? 0);
    };

    const channel = supabase
      .channel(`client-dashboard-notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          void refresh();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId]);

  return { unreadMessages, unreadNotifications };
}
