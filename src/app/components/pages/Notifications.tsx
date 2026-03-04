import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { ArrowLeft, CheckCircle, Info, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

interface NotificationsProps {
  embedded?: boolean;
}

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: string;
  link_url?: string | null;
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

export function Notifications({ embedded = false }: NotificationsProps) {
  const { user, activeRole } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

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

      const { data, error } = await supabase
        .from("notifications")
        .select("id, title, message, type, link_url, is_read, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setErrorMessage(error.message);
        if (!silent) {
          setIsLoading(false);
        }
        return;
      }

      setNotifications((data ?? []) as NotificationItem[]);
      if (!silent) {
        setIsLoading(false);
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
    await supabase
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("is_read", false);
    setNotifications((prev) =>
      prev.map((item) => ({ ...item, is_read: true })),
    );
  };

  const markRead = async (id: string) => {
    await supabase
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("id", id);
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

  const handleBack = () => {
    if (activeRole === "provider") {
      navigate("/dashboard/provider");
      return;
    }
    navigate("/dashboard/client");
  };

  const tableContent = (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-xl">Notifications</CardTitle>
            <CardDescription>
              Keep up with booking updates, messages, and account activity.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white">
                {unreadCount} unread
              </Badge>
            )}
            <Button
              variant="outline"
              onClick={markAllRead}
              disabled={unreadCount === 0}
            >
              Mark all as read
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {errorMessage && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Type</TableHead>
                <TableHead className="min-w-[180px]">Title</TableHead>
                <TableHead className="min-w-[280px]">Message</TableHead>
                <TableHead className="w-[180px]">Date</TableHead>
                <TableHead className="w-[110px]">Status</TableHead>
                <TableHead className="w-[220px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-sm text-gray-500"
                  >
                    Loading notifications...
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && notifications.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-sm text-gray-500"
                  >
                    No notifications yet.
                  </TableCell>
                </TableRow>
              )}

              {!isLoading &&
                notifications.map((notification) => {
                  const Icon = typeIcon(notification.type ?? "info");
                  const isExpanded = expandedIds.has(notification.id);
                  const message = notification.message ?? "";
                  const isLong = message.length > 90;

                  return (
                    <TableRow key={notification.id}>
                      <TableCell>
                        <div
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${notification.is_read ? "bg-gray-100 text-gray-500" : "bg-blue-100 text-blue-600"}`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                      </TableCell>

                      <TableCell className="font-medium">
                        {notification.title}
                      </TableCell>

                      <TableCell className="text-sm text-gray-700">
                        {isExpanded ? message : truncateMessage(message)}
                      </TableCell>

                      <TableCell className="text-xs text-gray-500">
                        {formatTimestamp(notification.created_at)}
                      </TableCell>

                      <TableCell>
                        {notification.is_read ? (
                          <Badge variant="secondary">Read</Badge>
                        ) : (
                          <Badge className="bg-blue-100 text-blue-700">
                            Unread
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {isLong && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleExpanded(notification.id)}
                            >
                              {isExpanded ? "Collapse" : "Expand"}
                            </Button>
                          )}

                          {!notification.is_read && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markRead(notification.id)}
                            >
                              Mark as read
                            </Button>
                          )}

                          {notification.link_url && (
                            <Button
                              size="sm"
                              onClick={() =>
                                window.open(
                                  notification.link_url ?? "#",
                                  "_blank",
                                )
                              }
                            >
                              Open
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );

  if (embedded) {
    return <div className="max-w-3xl space-y-6">{tableContent}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <div>
          <button
            onClick={handleBack}
            className="mb-2 flex items-center gap-2 text-gray-600 transition-colors hover:text-blue-600"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </button>
        </div>

        {tableContent}
      </div>
    </div>
  );
}
