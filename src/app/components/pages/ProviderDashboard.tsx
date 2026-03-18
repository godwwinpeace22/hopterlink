import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link, Outlet } from "@/lib/router";
import logo from "@/assets/logo.png";
import { Badge } from "../ui/badge";
import {
  Bell,
  Calendar as CalendarIcon,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  Star,
  User,
  Search,
  Wallet,
} from "lucide-react";
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
} from "../ui/sidebar";
import { ProviderDashboardHeader } from "./provider/ProviderDashboardHeader";
import {
  ProviderDashboardProvider,
  type ProviderDashboardSection,
} from "./provider/ProviderDashboardContext";
import { useProviderDashboardData } from "./provider/useProviderDashboardData";

export function ProviderDashboard() {
  const data = useProviderDashboardData();
  const { t } = useTranslation();

  const navigationItems = useMemo(
    () => [
      {
        id: "overview" as ProviderDashboardSection,
        label: t("providerDashboard.navOverview"),
        icon: LayoutDashboard,
      },
      {
        id: "job-board" as ProviderDashboardSection,
        label: t("providerDashboard.navJobBoard"),
        icon: Search,
      },
      {
        id: "jobs" as ProviderDashboardSection,
        label: t("providerDashboard.navMyJobs"),
        icon: CalendarIcon,
      },
      {
        id: "calendar" as ProviderDashboardSection,
        label: t("providerDashboard.navAvailability"),
        icon: CalendarIcon,
      },
      {
        id: "wallet" as ProviderDashboardSection,
        label: t("providerDashboard.navWallet"),
        icon: Wallet,
      },
      {
        id: "profile" as ProviderDashboardSection,
        label: t("providerDashboard.navProfile"),
        icon: User,
      },
      {
        id: "messages" as ProviderDashboardSection,
        label: t("providerDashboard.navMessages"),
        icon: MessageSquare,
      },
      {
        id: "notifications" as ProviderDashboardSection,
        label: t("providerDashboard.navNotifications"),
        icon: Bell,
      },
      {
        id: "reviews" as ProviderDashboardSection,
        label: t("providerDashboard.navReviews"),
        icon: Star,
      },
      {
        id: "settings" as ProviderDashboardSection,
        label: t("providerDashboard.navSettings"),
        icon: Settings,
      },
    ],
    [t],
  );

  const navigationSections = useMemo(
    () => [
      {
        title: t("providerDashboard.sectionOverview"),
        items: ["overview"] as ProviderDashboardSection[],
      },
      {
        title: t("providerDashboard.sectionWork"),
        items: [
          "job-board",
          "jobs",
          "calendar",
          "messages",
          "notifications",
        ] as ProviderDashboardSection[],
      },
      {
        title: t("providerDashboard.sectionBusiness"),
        items: ["wallet", "reviews"] as ProviderDashboardSection[],
      },
      {
        title: t("providerDashboard.sectionAccount"),
        items: ["profile", "settings"] as ProviderDashboardSection[],
      },
    ],
    [t],
  );

  const contextValue = useMemo(
    () => ({
      providerData: data.providerData,
      jobRequests: data.jobRequests,
      acceptedJobs: data.acceptedJobs,
      providerQuotes: data.providerQuotes,
      transactions: data.transactions,
      reviews: data.reviews,
      quoteDialogOpen: data.quoteDialogOpen,
      setQuoteDialogOpen: data.setQuoteDialogOpen,
      selectedJobRequest: data.selectedJobRequest,
      setSelectedJobRequest: data.setSelectedJobRequest,
      quoteAmount: data.quoteAmount,
      setQuoteAmount: data.setQuoteAmount,
      quoteNotes: data.quoteNotes,
      setQuoteNotes: data.setQuoteNotes,
      handleSubmitQuote: data.handleSubmitQuote,
      handleAcceptRequest: data.handleAcceptRequest,
      handleDeclineRequest: data.handleDeclineRequest,
      selectedDate: data.selectedDate,
      setSelectedDate: data.setSelectedDate,
      handleStartJob: data.handleStartJob,
      handleCompleteJob: data.handleCompleteJob,
      responseDialogOpen: data.responseDialogOpen,
      setResponseDialogOpen: data.setResponseDialogOpen,
      selectedReview: data.selectedReview,
      setSelectedReview: data.setSelectedReview,
      responseText: data.responseText,
      setResponseText: data.setResponseText,
      handleSubmitResponse: data.handleSubmitResponse,
      isVerificationReady: data.isVerificationReady,
      isPendingReview: data.isPendingReview,
      needsOnboarding: data.needsOnboarding,
      verificationStatus: data.verificationStatus,
      lockedSections: data.lockedSections,
      navigateToSection: data.navigateToSection,
    }),
    [data],
  );

  return (
    <ProviderDashboardProvider value={contextValue}>
      <SidebarProvider className="min-h-0 h-svh">
        <Sidebar collapsible="icon">
          <SidebarHeader className="px-3 py-4">
            <Link to="/dashboard/provider" className="flex items-center gap-2">
              <img src={logo} alt="Hopterlink" className="h-7 w-auto" />
            </Link>
          </SidebarHeader>
          {/* <SidebarSeparator className="-mx-1" /> */}
          <SidebarContent>
            {navigationSections.map((section) => (
              <SidebarGroup key={section.items.join("-")} className="px-2">
                {section.title && (
                  <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
                )}
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.items.map((itemId) => {
                      const item = navigationItems.find((n) => n.id === itemId);
                      if (!item) return null;
                      const Icon = item.icon;
                      const isActive = data.activeSection === item.id;
                      const isRestricted = data.lockedSections.includes(
                        item.id,
                      );
                      return (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton
                            onClick={() => data.handleSectionChange(item.id)}
                            disabled={isRestricted}
                            aria-disabled={isRestricted}
                            isActive={isActive}
                            tooltip={item.label}
                            className="cursor-pointer"
                          >
                            <Icon className="h-4 w-4" />
                            <span>{item.label}</span>
                            {item.id === "messages" &&
                              data.unreadMessages > 0 && (
                                <Badge className="ml-auto bg-red-500 text-white">
                                  {data.unreadMessages}
                                </Badge>
                              )}
                            {item.id === "notifications" &&
                              data.unreadNotifications > 0 && (
                                <Badge className="ml-auto bg-red-500 text-white">
                                  {data.unreadNotifications}
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
                  onClick={() => data.navigate("/")}
                  className="text-red-600 hover:text-red-600 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t("providerDashboard.signOut")}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="bg-gray-50">
          <ProviderDashboardHeader
            providerName={data.providerData.name}
            avatarUrl={data.providerData.avatar}
            unreadNotifications={data.unreadNotifications}
          />
          <div className="flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {data.errorMessage && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {data.errorMessage}
                </div>
              )}
              <Outlet />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProviderDashboardProvider>
  );
}
