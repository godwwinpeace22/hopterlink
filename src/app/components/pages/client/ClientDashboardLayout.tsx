import { useMemo } from "react";
import { Link, Outlet, useLocation, useNavigate } from "@/lib/router";
import { useTranslation } from "react-i18next";
import logo from "@/assets/logo.png";
import { Badge } from "../../ui/badge";
import {
  Bell,
  Briefcase,
  Calendar,
  Gift,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Star,
  User,
  Wallet,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useSupabaseQuery } from "@/lib/useSupabaseQuery";
import { useAuth } from "@/contexts/AuthContext";
import {
  ClientDashboardProvider,
  ClientDashboardSection,
} from "./ClientDashboardContext";
import { ClientDashboardHeader } from "./ClientDashboardHeader";
import { useUnreadCounts } from "@/lib/useUnreadCounts";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
} from "../../ui/sidebar";

interface ClientDashboardLayoutProps {}

const emptyClientData = {
  name: "",
  email: "",
  phone: "",
  address: "",
  avatar: "",
  memberSince: "",
};

const dashboardSections: ClientDashboardSection[] = [
  "overview",
  "providers",
  "booking",
  "bookings",
  "reviews",
  "my-jobs",
  "job-details",
  "post-job",
  "messages",
  "notifications",
  "profile",
];

export function ClientDashboardLayout({}: ClientDashboardLayoutProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const { unreadMessages, unreadNotifications } = useUnreadCounts(user?.id);

  const activeSection = useMemo<ClientDashboardSection>(() => {
    const base = "/dashboard/client";
    if (!location.pathname.startsWith(base)) return "overview";
    const remainder = location.pathname.slice(base.length).replace(/^\//, "");
    if (!remainder) return "overview";
    const section = remainder.split("/")[0];
    if (section === "job") return "job-details";
    const candidate = section as ClientDashboardSection;
    return dashboardSections.includes(candidate) ? candidate : "overview";
  }, [location.pathname]);

  const navigateToSection = (
    section: ClientDashboardSection,
    replace = false,
    jobIdValue?: string | null,
  ) => {
    let path = "/dashboard/client";
    if (section === "job-details") {
      path = jobIdValue
        ? `/dashboard/client/job/${jobIdValue}`
        : "/dashboard/client";
    } else if (section !== "overview") {
      path = `/dashboard/client/${section}`;
    }
    navigate(path, { replace });
  };

  const { data: profileResult } = useSupabaseQuery(
    ["profiles", user?.id],
    () =>
      supabase
        .from("profiles")
        .select("full_name, email, phone, avatar_url, location, created_at")
        .eq("id", user?.id ?? "")
        .single(),
    { enabled: Boolean(user?.id) },
  );

  const clientData = useMemo(() => {
    if (!profileResult?.data) return emptyClientData;
    const memberSince = profileResult.data.created_at
      ? new Date(profileResult.data.created_at).getFullYear().toString()
      : "";
    const address =
      profileResult.data.location &&
      typeof profileResult.data.location === "object" &&
      !Array.isArray(profileResult.data.location)
        ? ((profileResult.data.location as { address?: string }).address ?? "")
        : "";
    return {
      name: profileResult.data.full_name ?? "",
      email: profileResult.data.email ?? "",
      phone: profileResult.data.phone ?? "",
      address,
      avatar: profileResult.data.avatar_url ?? "",
      memberSince,
    };
  }, [profileResult]);

  const navigationItems = useMemo(
    () => [
      {
        id: "overview",
        label: t("clientDashboard.navOverview"),
        icon: LayoutDashboard,
      },
      {
        id: "providers",
        label: t("clientDashboard.navProviders"),
        icon: Briefcase,
      },
      {
        id: "bookings",
        label: t("clientDashboard.navBookings"),
        icon: Calendar,
      },
      { id: "reviews", label: t("clientDashboard.navReviews"), icon: Star },
      { id: "my-jobs", label: t("clientDashboard.navMyJobs"), icon: Briefcase },
      { id: "post-job", label: t("clientDashboard.navPostJob"), icon: Gift },
      {
        id: "messages",
        label: t("clientDashboard.navMessages"),
        icon: MessageSquare,
      },
      {
        id: "notifications",
        label: t("clientDashboard.navNotifications"),
        icon: Bell,
      },
      { id: "profile", label: t("clientDashboard.navProfile"), icon: User },
    ],
    [t],
  );

  const navigationSections = useMemo(
    () => [
      {
        title: t("clientDashboard.sectionOverview"),
        items: ["overview"] as ClientDashboardSection[],
      },
      {
        title: t("clientDashboard.sectionServices"),
        items: ["providers", "bookings", "reviews"] as ClientDashboardSection[],
      },
      {
        title: t("clientDashboard.sectionJobs"),
        items: ["my-jobs", "post-job"] as ClientDashboardSection[],
      },
      {
        title: t("clientDashboard.sectionCommunication"),
        items: ["messages", "notifications"] as ClientDashboardSection[],
      },
      {
        title: t("clientDashboard.sectionAccount"),
        items: ["profile"] as ClientDashboardSection[],
      },
    ],
    [t],
  );

  const contextValue = {
    navigateToSection,
    unreadMessages,
    clientData,
  };

  return (
    <ClientDashboardProvider value={contextValue}>
      <SidebarProvider className="min-h-0 h-svh">
        <Sidebar collapsible="icon">
          <SidebarHeader className="px-3 py-4">
            <Link to="/dashboard/client" className="flex items-center gap-2">
              <img src={logo} alt="Hopterlink" className="h-7 w-auto" />
            </Link>
          </SidebarHeader>
          <SidebarSeparator />
          <SidebarContent>
            {navigationSections.map((section) => (
              <SidebarGroup key={section.title} className="px-2">
                <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.items.map((itemId) => {
                      const item = navigationItems.find(
                        (navItem) => navItem.id === itemId,
                      );
                      if (!item) return null;
                      const Icon = item.icon;
                      const isActive = activeSection === item.id;
                      return (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton
                            onClick={() =>
                              navigateToSection(
                                item.id as ClientDashboardSection,
                              )
                            }
                            isActive={isActive}
                            tooltip={item.label}
                            className="cursor-pointer"
                          >
                            <Icon className="h-4 w-4" />
                            <span>{item.label}</span>
                            {item.id === "messages" && unreadMessages > 0 && (
                              <Badge className="ml-auto bg-red-500 text-white">
                                {unreadMessages}
                              </Badge>
                            )}
                            {item.id === "notifications" &&
                              unreadNotifications > 0 && (
                                <Badge className="ml-auto bg-red-500 text-white">
                                  {unreadNotifications}
                                </Badge>
                              )}
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>
          <SidebarSeparator />
          <SidebarFooter className="px-2 pb-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate("/")}
                  className="text-red-600 hover:text-red-600 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t("clientDashboard.signOut")}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="bg-gray-50">
          <ClientDashboardHeader
            clientName={clientData.name}
            avatarUrl={clientData.avatar}
            unreadNotifications={unreadNotifications}
          />

          <div className="flex-1 overflow-y-auto px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ClientDashboardProvider>
  );
}
