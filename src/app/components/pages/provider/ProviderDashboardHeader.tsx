import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import { Button } from "../../ui/button";
import { useState } from "react";
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
  unreadNotifications,
}: ProviderDashboardHeaderProps) {
  const navigate = useNavigate();
  const {
    signOut,
    memberships,
    approvedRoles,
    activeRole,
    switchRole,
    startRoleOnboarding,
  } = useAuth();
  const [isRoleActionLoading, setIsRoleActionLoading] = useState(false);

  const clientMembership = memberships.find(
    (membership) => membership.role === "client",
  );
  const canSwitchToClient =
    approvedRoles.includes("client") && activeRole !== "client";
  const canBecomeClient = !clientMembership;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleClientAction = async () => {
    setIsRoleActionLoading(true);
    try {
      if (canSwitchToClient) {
        await switchRole("client");
        navigate("/dashboard/client");
        return;
      }

      if (canBecomeClient) {
        await startRoleOnboarding("client");
        await switchRole("client");
        navigate("/dashboard/client");
      }
    } finally {
      setIsRoleActionLoading(false);
    }
  };

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="px-4 lg:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => navigate("/dashboard/provider/notifications")}
          >
            <Bell className="h-5 w-5" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="rounded-full cursor-pointer"
                aria-label="Open user menu"
              >
                <Avatar>
                  <AvatarFallback className="bg-blue-600 text-white">
                    {getInitials(providerName || "Provider")}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={() => navigate("/dashboard/provider/profile")}
              >
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={() => navigate("/dashboard/provider/messages")}
              >
                Messages
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={() => navigate("/dashboard/provider/notifications")}
              >
                Notifications
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={() => navigate("/dashboard/provider/settings")}
              >
                Settings
              </DropdownMenuItem>
              {(canSwitchToClient || canBecomeClient) && (
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={handleClientAction}
                  disabled={isRoleActionLoading}
                >
                  {canSwitchToClient ? "Switch to Client" : "Become a Client"}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-red-600 focus:text-red-600"
                onSelect={handleSignOut}
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
