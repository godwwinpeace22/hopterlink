import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@/lib/router";
import { Button } from "../ui/button";
import {
  CheckCircle,
  Info,
  AlertTriangle,
  CheckCheck,
  ExternalLink,
} from "lucide-react";
import { PageHeader } from "../ui/page-header";
import { supabase } from "@/lib/supabase";
import {
  fetchNotifications as fetchNotificationsQuery,
  markAllNotificationsRead,
  markNotificationRead,
  resolveNotificationRoute,
} from "@/lib/notifications";
import { useAuth } from "@/contexts/AuthContext";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: string;
  link_url?: string | null;
  related_id?: string | null;
  is_read: boolean | null;
  created_at: string | null;
};

const formatTimestamp = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
};

const typeIcon = (type: string) => {
  if (type.includes("warning") || type.includes("alert")) return AlertTriangle;
  if (type.includes("success")) return CheckCircle;
  return Info;
};

const truncateMessage = (message: string, limit = 90) => {
  if (message.length <= limit) {
    return message;
  }

  return `${message.slice(0, limit).trimEnd()}…`;
};

export function Notifications() {
  const { user, activeRole } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const isProvider = activeRole === "provider";

  const fetchNotifications = useCallback(
    async (silent = false) => {
      if (!user?.id) {
        setNotifications([]);
        return;
      }

      if (!silent) {
        setIsLoading(true);
      }
      setErrorMessage(null);

      try {
        const data = await fetchNotificationsQuery(user.id);
        setNotifications(data as NotificationItem[]);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : t("notifications.failedToLoad"),
        );
      } finally {
        if (!silent) {
          setIsLoading(false);
        }
      }
    },
    [user?.id],
  );

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchNotifications(true);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const updated = payload.new as {
            id: string;
            is_read: boolean | null;
          };
          setNotifications((prev) =>
            prev.map((item) =>
              item.id === updated.id
                ? { ...item, is_read: updated.is_read }
                : item,
            ),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNotifications, user?.id]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.is_read).length,
    [notifications],
  );

  const markAllRead = async () => {
    if (!user?.id) return;
    await markAllNotificationsRead(user.id);
    setNotifications((prev) =>
      prev.map((item) => ({ ...item, is_read: true })),
    );
  };

  const markRead = async (id: string) => {
    await markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, is_read: true } : item)),
    );
  };

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getNotificationTarget = (notification: NotificationItem) => {
    if (notification.link_url) {
      return notification.link_url;
    }

    return (
      resolveNotificationRoute(
        notification.type,
        notification.related_id ?? null,
        isProvider,
      )?.path ?? null
    );
  };

  const handleOpenNotification = async (notification: NotificationItem) => {
    const target = getNotificationTarget(notification);
    if (!target) {
      return;
    }

    if (!notification.is_read) {
      await markRead(notification.id);
    }

    if (target.startsWith("/")) {
      navigate(target);
      return;
    }

    window.open(target, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-4 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeader title={t("notifications.title")} hideBack />
        <p className="text-sm text-gray-500">
          {unreadCount > 0
            ? t("notifications.unread", { count: unreadCount })
            : t("notifications.allCaughtUp")}
        </p>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <CheckCheck className="mr-1.5 h-4 w-4" />
            {t("notifications.markAllRead")}
          </Button>
        )}
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {isLoading && (
        <p className="py-12 text-center text-sm text-gray-500">
          {t("notifications.loading")}
        </p>
      )}

      {!isLoading && notifications.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <Info className="h-10 w-10 text-gray-300" />
          <p className="text-sm text-gray-500">{t("notifications.empty")}</p>
        </div>
      )}

      {!isLoading && notifications.length > 0 && (
        <div className="divide-y rounded-lg border bg-white">
          {notifications.map((notification) => {
            const Icon = typeIcon(notification.type ?? "info");
            const isExpanded = expandedIds.has(notification.id);
            const message = notification.message ?? "";
            const isLong = message.length > 90;
            const target = getNotificationTarget(notification);

            return (
              <div
                key={notification.id}
                className={`flex gap-3 px-4 py-3 transition-colors ${
                  notification.is_read ? "bg-white" : "bg-blue-50/40"
                }`}
              >
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    notification.is_read
                      ? "bg-gray-100 text-gray-500"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={`text-sm leading-snug ${
                        notification.is_read
                          ? "text-gray-900"
                          : "font-medium text-gray-900"
                      }`}
                    >
                      {notification.title}
                    </p>
                    <span className="shrink-0 text-xs text-gray-400">
                      {formatTimestamp(notification.created_at)}
                    </span>
                  </div>

                  <p className="mt-0.5 text-sm text-gray-600">
                    {isExpanded ? message : truncateMessage(message)}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {!notification.is_read && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs"
                        onClick={() => markRead(notification.id)}
                      >
                        <CheckCircle className="mr-1 h-3.5 w-3.5" />
                        {t("notifications.markRead")}
                      </Button>
                    )}

                    {isLong && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs"
                        onClick={() => toggleExpanded(notification.id)}
                      >
                        {isExpanded
                          ? t("notifications.showLess")
                          : t("notifications.showMore")}
                      </Button>
                    )}

                    {notification.link_url && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs"
                        onClick={() => handleOpenNotification(notification)}
                      >
                        <ExternalLink className="mr-1 h-3.5 w-3.5" />
                        {t("notifications.viewDetails")}
                      </Button>
                    )}

                    {!notification.link_url && target && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs"
                        onClick={() => handleOpenNotification(notification)}
                      >
                        <ExternalLink className="mr-1 h-3.5 w-3.5" />
                        {t("notifications.viewDetails")}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
