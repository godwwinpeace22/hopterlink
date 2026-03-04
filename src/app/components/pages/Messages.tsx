import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/textarea";
import { ArrowLeft, MessageSquare, Send, ChevronLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface MessagesProps {
  embedded?: boolean;
}

type MessageRecord = {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string | null;
  is_read: boolean | null;
  created_at: string | null;
  job_id: string | null;
  booking_id: string | null;
  senderName?: string | null;
  senderAvatar?: string | null;
  recipientName?: string | null;
  recipientAvatar?: string | null;
  jobTitle?: string | null;
  bookingService?: string | null;
};

type Conversation = {
  id: string;
  otherUserId: string;
  otherName: string;
  otherAvatar?: string | null;
  jobId?: string | null;
  bookingId?: string | null;
  contextLabel?: string | null;
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
  lastTimestamp: number;
};

const formatTimestamp = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  const isSameDay = date.toDateString() === now.toDateString();
  if (isSameDay) {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
};

const formatMessageTime = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

const getFirst = <T,>(value: T | T[] | null | undefined) =>
  Array.isArray(value) ? value[0] : value;

export function Messages({ embedded = false }: MessagesProps) {
  const { user, profile, activeRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const navigationState =
    (location.state as {
      recipientId?: string;
      recipientName?: string;
      recipientAvatar?: string | null;
      bookingId?: string | null;
      jobId?: string | null;
      contextLabel?: string | null;
    }) ?? null;
  const pendingConversationId = navigationState?.recipientId
    ? `${navigationState.recipientId}:${navigationState.bookingId ?? navigationState.jobId ?? "direct"}`
    : null;

  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [draft, setDraft] = useState("");
  const [conversationSearch, setConversationSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showThreadOnMobile, setShowThreadOnMobile] = useState(false);
  const lastFetchRef = useRef<{ userId: string; at: number }>({
    userId: "",
    at: 0,
  });
  const isFetchingRef = useRef(false);
  const threadEndRef = useRef<HTMLDivElement | null>(null);
  const fetchCooldownMs = 10_000;

  const getConversationId = useCallback(
    (message: MessageRecord, userId: string) => {
      const otherUserId =
        message.sender_id === userId ? message.recipient_id : message.sender_id;
      const contextId = message.booking_id ?? message.job_id ?? "direct";
      return `${otherUserId}:${contextId}`;
    },
    [],
  );

  const buildConversations = useCallback(
    (list: MessageRecord[], userId: string) => {
      const map = new Map<string, Conversation>();

      list.forEach((message) => {
        const conversationId = getConversationId(message, userId);
        const otherUserId =
          message.sender_id === userId
            ? message.recipient_id
            : message.sender_id;
        const otherName =
          message.sender_id === userId
            ? message.recipientName
            : message.senderName;
        const otherAvatar =
          message.sender_id === userId
            ? message.recipientAvatar
            : message.senderAvatar;
        const lastTimestamp = message.created_at
          ? new Date(message.created_at).getTime()
          : 0;
        const existing = map.get(conversationId);
        const unreadCount =
          message.recipient_id === userId && !message.is_read ? 1 : 0;
        const contextLabel = message.bookingService
          ? `Booking: ${message.bookingService}`
          : message.jobTitle
            ? `Job: ${message.jobTitle}`
            : null;

        if (!existing) {
          map.set(conversationId, {
            id: conversationId,
            otherUserId,
            otherName: otherName ?? "User",
            otherAvatar,
            jobId: message.job_id,
            bookingId: message.booking_id,
            contextLabel,
            lastMessage: message.content ?? "",
            lastTime: formatTimestamp(message.created_at),
            unreadCount,
            lastTimestamp,
          });
          return;
        }

        existing.unreadCount += unreadCount;
        if (lastTimestamp >= existing.lastTimestamp) {
          existing.lastTimestamp = lastTimestamp;
          existing.lastMessage = message.content ?? "";
          existing.lastTime = formatTimestamp(message.created_at);
          existing.contextLabel = contextLabel ?? existing.contextLabel;
          existing.jobId = message.job_id ?? existing.jobId;
          existing.bookingId = message.booking_id ?? existing.bookingId;
          existing.otherName = otherName ?? existing.otherName;
          existing.otherAvatar = otherAvatar ?? existing.otherAvatar;
        }
      });

      return Array.from(map.values()).sort(
        (a, b) => b.lastTimestamp - a.lastTimestamp,
      );
    },
    [getConversationId],
  );

  const fetchMessages = useCallback(
    async (silent = false, force = false) => {
      if (!user?.id) {
        setMessages([]);
        return;
      }

      if (isFetchingRef.current) {
        return;
      }

      const now = Date.now();
      if (
        !force &&
        lastFetchRef.current.userId === user.id &&
        now - lastFetchRef.current.at < fetchCooldownMs
      ) {
        return;
      }

      isFetchingRef.current = true;
      if (!silent) {
        setIsLoading(true);
      }
      setErrorMessage(null);

      const { data, error } = await supabase
        .from("messages")
        .select(
          `
        id,
        sender_id,
        recipient_id,
        content,
        is_read,
        created_at,
        job_id,
        booking_id,
        message_type,
        attachment_url,
        sender:profiles!messages_sender_id_fkey (
          id,
          full_name,
          avatar_url
        ),
        recipient:profiles!messages_recipient_id_fkey (
          id,
          full_name,
          avatar_url
        ),
        job:jobs (
          id,
          title
        ),
        booking:bookings (
          id,
          service_type
        )
      `,
        )
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order("created_at", { ascending: true });

      if (error) {
        setErrorMessage(error.message);
        lastFetchRef.current = { userId: user.id, at: Date.now() };
        isFetchingRef.current = false;
        if (!silent) {
          setIsLoading(false);
        }
        return;
      }

      const mapped: MessageRecord[] = (data ?? []).map((item) => {
        const sender = getFirst(item.sender);
        const recipient = getFirst(item.recipient);
        const job = getFirst(item.job);
        const booking = getFirst(item.booking);
        return {
          id: item.id,
          sender_id: item.sender_id,
          recipient_id: item.recipient_id,
          content: item.content,
          is_read: item.is_read,
          created_at: item.created_at,
          job_id: item.job_id,
          booking_id: item.booking_id,
          senderName: sender?.full_name ?? null,
          senderAvatar: sender?.avatar_url ?? null,
          recipientName: recipient?.full_name ?? null,
          recipientAvatar: recipient?.avatar_url ?? null,
          jobTitle: job?.title ?? null,
          bookingService: booking?.service_type ?? null,
        };
      });

      setMessages(mapped);
      lastFetchRef.current = { userId: user.id, at: Date.now() };
      isFetchingRef.current = false;
      if (!silent) {
        setIsLoading(false);
      }
    },
    [user?.id],
  );

  useEffect(() => {
    if (!user?.id) return;
    fetchMessages(false, true);
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`messages-page-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `recipient_id=eq.${user.id}`,
        },
        () => {
          fetchMessages(true);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `sender_id=eq.${user.id}`,
        },
        () => {
          fetchMessages(true);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `recipient_id=eq.${user.id}`,
        },
        (payload) => {
          const updated = payload.new as {
            id: string;
            is_read: boolean | null;
          };
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === updated.id
                ? { ...msg, is_read: updated.is_read }
                : msg,
            ),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMessages, user?.id]);

  const conversations = useMemo(() => {
    const base = user?.id ? buildConversations(messages, user.id) : [];
    if (!pendingConversationId || !navigationState?.recipientId) {
      return base;
    }

    const exists = base.some((item) => item.id === pendingConversationId);
    if (exists) {
      return base;
    }

    return [
      {
        id: pendingConversationId,
        otherUserId: navigationState.recipientId,
        otherName: navigationState.recipientName ?? "User",
        otherAvatar: navigationState.recipientAvatar ?? null,
        jobId: navigationState.jobId ?? null,
        bookingId: navigationState.bookingId ?? null,
        contextLabel: navigationState.contextLabel ?? null,
        lastMessage: "",
        lastTime: "",
        unreadCount: 0,
        lastTimestamp: 0,
      },
      ...base,
    ];
  }, [
    buildConversations,
    messages,
    navigationState,
    pendingConversationId,
    user?.id,
  ]);

  useEffect(() => {
    if (pendingConversationId) {
      setSelectedConversationId(pendingConversationId);
      return;
    }
    if (!selectedConversationId && conversations.length > 0) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, pendingConversationId, selectedConversationId]);

  const selectedConversation = useMemo(
    () =>
      conversations.find(
        (conversation) => conversation.id === selectedConversationId,
      ) ?? null,
    [conversations, selectedConversationId],
  );

  const conversationMessages = useMemo(() => {
    if (!user?.id || !selectedConversation) return [];
    return messages
      .filter(
        (message) =>
          getConversationId(message, user.id) === selectedConversation.id,
      )
      .sort((a, b) => (a.created_at ?? "").localeCompare(b.created_at ?? ""));
  }, [getConversationId, messages, selectedConversation, user?.id]);

  const filteredConversations = useMemo(() => {
    const query = conversationSearch.trim().toLowerCase();
    if (!query) {
      return conversations;
    }

    return conversations.filter((conversation) => {
      return (
        conversation.otherName.toLowerCase().includes(query) ||
        conversation.lastMessage.toLowerCase().includes(query) ||
        (conversation.contextLabel ?? "").toLowerCase().includes(query)
      );
    });
  }, [conversations, conversationSearch]);

  const hasUnreadInConversation = useMemo(() => {
    if (!user?.id || !selectedConversation) return false;
    return messages.some(
      (message) =>
        message.recipient_id === user.id &&
        !message.is_read &&
        getConversationId(message, user.id) === selectedConversation.id,
    );
  }, [getConversationId, messages, selectedConversation, user?.id]);

  useEffect(() => {
    const markRead = async () => {
      if (!user?.id || !selectedConversation || !hasUnreadInConversation) {
        return;
      }
      let query = supabase
        .from("messages")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("recipient_id", user.id)
        .eq("sender_id", selectedConversation.otherUserId);

      if (selectedConversation.jobId) {
        query = query.eq("job_id", selectedConversation.jobId);
      } else {
        query = query.is("job_id", null);
      }

      if (selectedConversation.bookingId) {
        query = query.eq("booking_id", selectedConversation.bookingId);
      } else {
        query = query.is("booking_id", null);
      }

      await query;
      setMessages((prev) =>
        prev.map((message) => {
          if (
            message.recipient_id === user.id &&
            message.sender_id === selectedConversation.otherUserId &&
            message.job_id === selectedConversation.jobId &&
            message.booking_id === selectedConversation.bookingId
          ) {
            return { ...message, is_read: true };
          }
          return message;
        }),
      );
    };

    markRead();
  }, [hasUnreadInConversation, selectedConversation, user?.id]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [conversationMessages.length, selectedConversationId]);

  const handleSend = async () => {
    if (!user?.id || !selectedConversation) return;
    const trimmed = draft.trim();
    if (!trimmed) return;

    setErrorMessage(null);

    const { data, error } = await supabase
      .from("messages")
      .insert({
        sender_id: user.id,
        recipient_id: selectedConversation.otherUserId,
        content: trimmed,
        message_type: "text",
        job_id: selectedConversation.jobId ?? null,
        booking_id: selectedConversation.bookingId ?? null,
      })
      .select(
        "id, sender_id, recipient_id, content, is_read, created_at, job_id, booking_id",
      )
      .single();

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: data.id,
        sender_id: data.sender_id,
        recipient_id: data.recipient_id,
        content: data.content,
        is_read: data.is_read,
        created_at: data.created_at,
        job_id: data.job_id,
        booking_id: data.booking_id,
        senderName: profile?.full_name ?? "You",
        senderAvatar: profile?.avatar_url ?? null,
        recipientName: selectedConversation.otherName,
        recipientAvatar: selectedConversation.otherAvatar,
      },
    ]);

    await supabase.from("notifications").insert({
      user_id: selectedConversation.otherUserId,
      type: "message_received",
      title: "New message received",
      message: trimmed.length > 120 ? `${trimmed.slice(0, 120)}...` : trimmed,
      related_id: data.id,
    });

    setDraft("");
  };

  const handleDraftKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (
    event,
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setShowThreadOnMobile(true);
  };

  const handleBack = () => {
    if (activeRole === "provider") {
      navigate("/dashboard/provider");
      return;
    }
    navigate("/dashboard/client");
  };

  const content = (
    <>
      {!embedded && (
        <div className="mb-6 flex items-center justify-between">
          <div>
            <button
              onClick={handleBack}
              className="mb-2 flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-foreground">Messages</h1>
            <p className="text-muted-foreground">
              Manage conversations with your clients and providers
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() =>
              navigate(
                activeRole === "provider"
                  ? "/dashboard/provider/notifications"
                  : "/dashboard/client/notifications",
              )
            }
          >
            Notifications
          </Button>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {errorMessage}
        </div>
      )}

      <Card className="overflow-hidden border-border bg-card shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-3">
          <div
            className={`border-r border-border bg-card ${
              showThreadOnMobile ? "hidden lg:block" : "block"
            }`}
          >
            <CardHeader className="space-y-3 pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5" /> Conversations
              </CardTitle>
              <div className="rounded-md border border-border bg-background px-3 py-2">
                <input
                  value={conversationSearch}
                  onChange={(event) =>
                    setConversationSearch(event.target.value)
                  }
                  placeholder="Search conversations"
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 text-sm text-muted-foreground">
                  Loading conversations...
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-6 text-sm text-muted-foreground">
                  {conversationSearch
                    ? "No matching conversations."
                    : "No conversations yet."}
                </div>
              ) : (
                <div className="max-h-[540px] overflow-y-auto">
                  {filteredConversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => handleSelectConversation(conversation.id)}
                      className={`w-full border-b border-border/50 px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
                        selectedConversationId === conversation.id
                          ? "bg-muted"
                          : "bg-card"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {conversation.otherName
                              .split(" ")
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate font-semibold text-foreground">
                              {conversation.otherName}
                            </p>
                            <span className="shrink-0 text-xs text-muted-foreground">
                              {conversation.lastTime}
                            </span>
                          </div>
                          {conversation.contextLabel && (
                            <p className="mt-0.5 truncate text-xs text-primary">
                              {conversation.contextLabel}
                            </p>
                          )}
                          <p className="mt-1 truncate text-sm text-muted-foreground">
                            {conversation.lastMessage || "No messages yet"}
                          </p>
                        </div>
                        {conversation.unreadCount > 0 && (
                          <Badge className="ml-2 bg-primary text-primary-foreground">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </div>

          <div
            className={`col-span-2 bg-card ${
              showThreadOnMobile ? "block" : "hidden lg:block"
            }`}
          >
            <CardHeader className="border-b border-border">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setShowThreadOnMobile(false)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div>
                  <CardTitle className="text-lg text-foreground">
                    {selectedConversation
                      ? selectedConversation.otherName
                      : "Select a conversation"}
                  </CardTitle>
                  {selectedConversation?.contextLabel && (
                    <p className="text-sm text-muted-foreground">
                      {selectedConversation.contextLabel}
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {selectedConversation ? (
                <div className="flex flex-col h-[520px]">
                  <div className="flex-1 space-y-4 overflow-y-auto bg-muted/20 px-6 py-4">
                    {conversationMessages.length === 0 ? (
                      <div className="text-sm text-muted-foreground">
                        No messages in this thread yet.
                      </div>
                    ) : (
                      conversationMessages.map((message) => {
                        const isMine = message.sender_id === user?.id;
                        const rawName =
                          (isMine
                            ? (message.senderName ?? profile?.full_name)
                            : (message.senderName ??
                              selectedConversation?.otherName)) ??
                          (isMine ? "You" : "User");
                        const displayName = rawName.split(" ")[0] || rawName;
                        const initials = rawName
                          .split(" ")
                          .map((part) => part[0])
                          .slice(0, 2)
                          .join("");
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                          >
                            <div className="flex items-start gap-2">
                              {!isMine && (
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                    {initials}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <div
                                className={`min-w-[11rem] max-w-[88%] rounded-2xl px-4 py-2 shadow-sm sm:max-w-[78%] ${
                                  isMine
                                    ? "bg-primary text-primary-foreground"
                                    : "border border-border bg-card text-card-foreground"
                                }`}
                              >
                                <p
                                  className={`text-xs font-semibold ${
                                    isMine
                                      ? "text-primary-foreground/80"
                                      : "text-muted-foreground"
                                  } break-words`}
                                >
                                  {displayName}
                                </p>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                  {message.content}
                                </p>
                                <p
                                  className={`mt-1 text-[11px] ${
                                    isMine
                                      ? "text-primary-foreground/80"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  {formatMessageTime(message.created_at)}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={threadEndRef} />
                  </div>
                  <div className="border-t border-border bg-card px-6 py-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                      <Textarea
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        onKeyDown={handleDraftKeyDown}
                        placeholder="Type your message..."
                        className="min-h-[44px] max-h-[180px] flex-1 resize-none bg-background"
                      />
                      <Button
                        onClick={handleSend}
                        disabled={!draft.trim()}
                        className="w-full shrink-0 sm:w-auto"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Send
                      </Button>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Press Enter to send, Shift+Enter for new line.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-sm text-muted-foreground">
                  Select a conversation to start messaging.
                </div>
              )}
            </CardContent>
          </div>
        </div>
      </Card>
    </>
  );

  if (embedded) {
    return <div className="space-y-6">{content}</div>;
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">{content}</div>
    </div>
  );
}
