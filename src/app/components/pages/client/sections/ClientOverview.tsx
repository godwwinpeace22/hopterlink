import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useClientDashboard } from "../ClientDashboardContext";
import { supabase } from "@/lib/supabase";
import { useSupabaseQuery } from "@/lib/useSupabaseQuery";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "../../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Avatar, AvatarFallback } from "../../../ui/avatar";
import { Badge } from "../../../ui/badge";
import {
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  ArrowRight,
  Sparkles,
  MessageSquare,
  Plus,
  Star,
  User,
} from "lucide-react";

const ClientStatsCards = ({
  bookings,
  unreadMessages,
  memberSince,
}: {
  bookings: { status: string }[];
  unreadMessages: number;
  memberSince: string;
}) => {
  const { t } = useTranslation();
  const stats = [
    {
      title: t("clientOverview.statActiveBookings"),
      value: bookings.filter((booking: any) => booking.status !== "completed")
        .length,
      hint: t("clientOverview.statActiveHint"),
      icon: <Briefcase className="h-5 w-5" />,
      tone: "bg-[#FFF1D6] text-[#B87503]",
    },
    {
      title: t("clientOverview.statCompleted"),
      value: bookings.filter((booking: any) => booking.status === "completed")
        .length,
      hint: t("clientOverview.statCompletedHint"),
      icon: <CheckCircle className="h-5 w-5" />,
      tone: "bg-emerald-100 text-emerald-700",
    },
    {
      title: t("clientOverview.statUnread"),
      value: unreadMessages,
      hint: t("clientOverview.statUnreadHint"),
      icon: <MessageSquare className="h-5 w-5" />,
      tone: "bg-[#FFF7E8] text-[#A15C00]",
    },
    {
      title: t("clientOverview.statMemberSince"),
      value: memberSince || "2026",
      hint: t("clientOverview.statMemberHint"),
      icon: <User className="h-5 w-5" />,
      tone: "bg-slate-100 text-slate-700",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card
          key={stat.title}
          className="border-[#F3E4BE] bg-white/95 shadow-sm shadow-[#F7C876]/10"
        >
          <CardContent className="flex items-start justify-between p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {stat.title}
              </p>
              <p className="mt-3 text-3xl font-semibold text-slate-950">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-slate-500">{stat.hint}</p>
            </div>
            <div className={`rounded-2xl p-3 ${stat.tone}`}>{stat.icon}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export const ClientOverview = () => {
  const { user } = useAuth();
  const { clientData, navigateToSection, unreadMessages } =
    useClientDashboard();
  const { t } = useTranslation();

  const { data: bookingsResult } = useSupabaseQuery(
    ["client_bookings_overview_main", user?.id],
    () =>
      supabase
        .from("bookings")
        .select(
          `
            id,
            scheduled_date,
            status,
            amount,
            service_type,
            provider:profiles!bookings_provider_id_fkey (
              full_name,
              provider_profiles (
                rating
              )
            )
          `,
        )
        .eq("client_id", user?.id ?? "")
        .order("scheduled_date", { ascending: true }),
    { enabled: Boolean(user?.id) },
  );

  const { data: messagesResult } = useSupabaseQuery(
    ["client_messages_overview", user?.id],
    () =>
      supabase
        .from("messages")
        .select(
          `
            id,
            content,
            is_read,
            created_at,
            sender:profiles!messages_sender_id_fkey (
              full_name
            )
          `,
        )
        .eq("recipient_id", user?.id ?? "")
        .order("created_at", { ascending: false })
        .limit(5),
    { enabled: Boolean(user?.id) },
  );

  const getFirst = <T,>(value: T | T[] | null | undefined) =>
    Array.isArray(value) ? value[0] : value;

  const bookings = useMemo(() => {
    return (bookingsResult?.data ?? []).map((booking) => {
      const scheduledDate = booking.scheduled_date
        ? new Date(booking.scheduled_date)
        : null;
      const status =
        booking.status === "completed"
          ? "completed"
          : booking.status === "in_progress"
            ? "in-progress"
            : booking.status === "cancelled" || booking.status === "disputed"
              ? "cancelled"
              : "upcoming";
      const provider = getFirst(booking.provider);
      const providerProfile = getFirst(provider?.provider_profiles ?? []);
      return {
        id: booking.id,
        service: booking.service_type ?? "Service",
        provider: provider?.full_name ?? "Service Provider",
        providerRating: providerProfile?.rating ?? 0,
        date: scheduledDate ? scheduledDate.toLocaleDateString() : "",
        time: scheduledDate
          ? scheduledDate.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "",
        status,
        price: booking.amount ?? 0,
      };
    });
  }, [bookingsResult]);

  const messages = useMemo(() => {
    return (messagesResult?.data ?? []).map((message) => {
      const createdAt = message.created_at
        ? new Date(message.created_at)
        : null;
      const sender = getFirst(message.sender);
      return {
        id: message.id,
        provider: sender?.full_name ?? "Provider",
        message: message.content ?? "",
        time: createdAt ? createdAt.toLocaleString() : "",
        unread: !message.is_read,
      };
    });
  }, [messagesResult]);

  const upcomingBookings = bookings.filter(
    (booking: any) => booking.status === "upcoming",
  );
  // const recentBookings = bookings.slice(0, 3);

  return (
    <div className="space-y-8 pt-6">
      <section className="overflow-hidden rounded-[28px] border border-[#F7C876]/60 bg-[radial-gradient(circle_at_top_left,_rgba(247,200,118,0.35),_rgba(255,255,255,0.98)_55%)] shadow-[0_22px_60px_-28px_rgba(241,164,0,0.45)]">
        <div className="grid gap-8 px-6 py-7 lg:grid-cols-[1.3fr_0.9fr] lg:px-8">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#F7C876]/70 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#9A6500]">
              <Sparkles className="h-3.5 w-3.5" />
              {t("clientOverview.dashboardBadge")}
            </div>
            <div>
              <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-slate-950 lg:text-4xl">
                {t("clientOverview.welcome", {
                  name: (clientData.name || "there").split(" ")[0],
                })}
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                className="bg-[#F1A400] text-slate-950 hover:bg-[#EFA055]"
                onClick={() => navigateToSection("providers")}
              >
                {t("clientOverview.browseProviders")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="border-[#F7C876] bg-white/80 text-[#8A5A00] hover:bg-[#FFF7E8] hover:text-[#8A5A00]"
                onClick={() => navigateToSection("post-job")}
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("clientOverview.postJobButton")}
              </Button>
              <Button
                variant="ghost"
                className="text-slate-700 hover:bg-white/70"
                onClick={() => navigateToSection("bookings")}
              >
                {t("clientOverview.viewAllBookings")}
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-2xl border border-white/70 bg-white/80 p-5 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {t("clientOverview.nextUp")}
              </p>
              {upcomingBookings[0] ? (
                <>
                  <p className="mt-3 text-lg font-semibold text-slate-950">
                    {upcomingBookings[0].service}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {upcomingBookings[0].provider}
                  </p>
                  <p className="mt-3 text-sm text-slate-500">
                    {upcomingBookings[0].date} at {upcomingBookings[0].time}
                  </p>
                  <Button
                    variant="ghost"
                    className="mt-4 h-auto p-0 text-[#A15C00] hover:bg-transparent hover:text-[#8A4E00]"
                    onClick={() => navigateToSection("bookings")}
                  >
                    {t("clientOverview.openBookingTimeline")}
                  </Button>
                </>
              ) : (
                <p className="mt-3 text-sm text-slate-500">
                  {t("clientOverview.noUpcomingBooking")}
                </p>
              )}
            </div>

            {/* <div className="rounded-2xl border border-white/70 bg-slate-950 p-5 text-white shadow-lg shadow-slate-900/20">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                Inbox
              </p>
              <p className="mt-3 text-4xl font-semibold">{unreadMessages}</p>
              <p className="mt-1 text-sm text-white/70">
                unread {unreadMessages === 1 ? "message" : "messages"}
              </p>
              <Button
                variant="ghost"
                className="mt-4 h-auto p-0 text-[#F7C876] hover:bg-transparent hover:text-[#FFD98F]"
                onClick={() => navigateToSection("messages")}
              >
                Go to messages
              </Button>
            </div> */}
          </div>
        </div>
      </section>

      <ClientStatsCards
        bookings={bookings}
        unreadMessages={unreadMessages}
        memberSince={clientData.memberSince}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-[#F3E4BE] shadow-sm shadow-[#F7C876]/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#F1A400]" />
              {t("clientOverview.upcomingBookingsTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingBookings.map((booking: any) => (
                <div
                  key={booking.id}
                  className="flex items-start gap-4 rounded-2xl border border-[#F4E7C7] bg-[#FFFCF3] p-4"
                >
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#FFF1D6]">
                    <Clock className="h-6 w-6 text-[#C78000]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">
                      {booking.service}
                    </p>
                    <p className="text-sm text-gray-600">{booking.provider}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3 w-3 ${star <= Math.floor(booking.providerRating) ? "fill-red-500 text-red-500" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {booking.date} at {booking.time}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">${booking.price}</p>
                    <Badge
                      variant="outline"
                      className="mt-1 border-[#F7C876] text-[#A15C00]"
                    >
                      {t("clientOverview.scheduled")}
                    </Badge>
                  </div>
                </div>
              ))}
              {upcomingBookings.length === 0 && (
                <div className="rounded-2xl border border-dashed border-[#F7C876]/60 bg-[#FFF7E8] px-5 py-8 text-center text-sm text-slate-600">
                  {t("clientOverview.noUpcomingYet")}
                </div>
              )}
              <Button
                variant="outline"
                className="w-full border-[#F7C876] text-[#8A5A00] hover:bg-[#FFF7E8] hover:text-[#8A5A00]"
                onClick={() => navigateToSection("bookings")}
              >
                {t("clientOverview.viewAllBookingsBtn")}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full border-[#F7C876] text-[#8A5A00] hover:bg-[#FFF7E8] hover:text-[#8A5A00]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-[#F1A400]" />
              {t("clientOverview.recentMessagesTitle")}
              {unreadMessages > 0 && (
                <Badge className="bg-red-500 text-white">
                  {unreadMessages}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {messages.map((message: any) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-4 rounded-2xl border border-transparent p-4 ${message.unread ? "border-[#F7C876]/50 bg-[#FFF7E8]" : "bg-white"}`}
                >
                  <Avatar>
                    <AvatarFallback>
                      {message.provider
                        .split(" ")
                        .map((n: string) => n[0])
                        ?.slice(0, 2)
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">
                        {message.provider}
                      </p>
                      {message.unread && (
                        <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {message.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{message.time}</p>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigateToSection("messages")}
              >
                {t("clientOverview.viewAllMessages")}
              </Button>
              {messages.length === 0 && (
                <div className="rounded-2xl border border-dashed border-[#F7C876]/60 bg-[#FFF7E8] px-5 py-8 text-center text-sm text-slate-600">
                  {t("clientOverview.recentMessagesEmpty")}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center">
                <Gift className="h-8 w-8" />

      <Card className="border-[#F3E4BE] bg-[linear-gradient(135deg,rgba(255,247,232,0.95),rgba(255,255,255,1))] shadow-sm shadow-[#F7C876]/10">
        <CardContent className="grid gap-6 p-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9A6500]">
              Recent activity
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">
              Keep every booking moving with one clean workspace.
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Review upcoming appointments, reply to providers, and return to any completed work from one place.
            </p>
          </div>
          <div className="grid min-w-[220px] gap-3 rounded-2xl border border-[#F7C876]/60 bg-white/80 p-4">
            {recentBookings.length > 0 ? (
              recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between gap-3 text-sm">
                  <div>
                    <p className="font-medium text-slate-900">{booking.service}</p>
                    <p className="text-slate-500">{booking.date}</p>
                  </div>
                  <Badge className="bg-[#FFF1D6] text-[#A15C00] hover:bg-[#FFF1D6]">
                    {booking.status.replace("-", " ")}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">Your latest activity will appear here.</p>
            )}
          </div>
        </CardContent>
      </Card>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-1">
                  Earn Rewards & Cashback!
                </h3>
                <p className="text-purple-100">
                  Get points on every booking, refer friends, and unlock
                  exclusive perks
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate("/rewards")}
              className="bg-white text-purple-600 hover:bg-gray-100 font-semibold"
              size="lg"
            >
              View Rewards
            </Button>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
};
