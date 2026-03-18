import { useNavigate } from "@/lib/router";
import { useTranslation } from "react-i18next";
import { Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Button } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { SidebarTrigger } from "../../ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";

interface ProviderDashboardHeaderProps {
  providerName: string;
  avatarUrl?: string;
  unreadNotifications: number;
}

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (parts.length === 0) return "FH";
  return parts
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

export function ProviderDashboardHeader({
  providerName,
  avatarUrl,
  unreadNotifications,
}: ProviderDashboardHeaderProps) {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { t } = useTranslation();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="bg-white border-b shrink-0">
      <div className="px-4 lg:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            title="Notifications"
            className="relative"
            onClick={() => navigate("/dashboard/provider/notifications")}
            aria-label="View unread notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadNotifications > 0 && (
              <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
                {unreadNotifications > 99 ? "99+" : unreadNotifications}
              </span>
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="rounded-full cursor-pointer"
                aria-label="Open user menu"
              >
                <Avatar className="h-8 w-8 border">
                  {avatarUrl && <AvatarImage src={avatarUrl} />}
                  <AvatarFallback className="bg-[#F1A400] text-white">
                    {getInitials(providerName || "Provider")}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {t("providerDashboard.accountMenuLabel")}
              </DropdownMenuLabel>
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={() => navigate("/dashboard/provider/profile")}
              >
                {t("providerDashboard.profileMenuItem")}
              </DropdownMenuItem>

              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={() => navigate("/dashboard/provider/settings")}
              >
                {t("providerDashboard.settingsMenuItem")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-red-600 focus:text-red-600"
                onSelect={handleSignOut}
              >
                {t("providerDashboard.signOut")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
