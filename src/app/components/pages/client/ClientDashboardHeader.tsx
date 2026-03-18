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

interface ClientDashboardHeaderProps {
  clientName: string;
  avatarUrl?: string | null;
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

export function ClientDashboardHeader({
  clientName,
  avatarUrl,
  unreadNotifications,
}: ClientDashboardHeaderProps) {
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

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => navigate("/dashboard/client/notifications")}
            aria-label="View unread notifications"
          >
            <Bell className="h-5 w-5 text-gray-600" />
            {unreadNotifications > 0 && (
              <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
                {unreadNotifications > 99 ? "99+" : unreadNotifications}
              </span>
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-3 cursor-pointer rounded-full"
                aria-label="Open user menu"
              >
                <Avatar>
                  {avatarUrl && <AvatarImage src={avatarUrl} />}
                  <AvatarFallback className="bg-[#F1A400] text-white">
                    {getInitials(clientName || "Client")}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="font-semibold text-gray-900">{clientName}</p>
                  <p className="text-sm text-gray-600">
                    {t("clientDashboard.clientAccountLabel")}
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {t("clientDashboard.accountMenuLabel")}
              </DropdownMenuLabel>
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={() => navigate("/dashboard/client/profile")}
              >
                {t("clientDashboard.profileMenuItem")}
              </DropdownMenuItem>

              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={() => navigate("/dashboard/client/my-jobs")}
              >
                {t("clientDashboard.myJobsMenuItem")}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={() => navigate("/dashboard/client/post-job")}
              >
                {t("clientDashboard.postJobMenuItem")}
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-red-600 focus:text-red-600"
                onSelect={handleSignOut}
              >
                {t("clientDashboard.signOut")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
