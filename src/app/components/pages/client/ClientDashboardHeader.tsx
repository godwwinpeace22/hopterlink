import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
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
  const {
    signOut,
    memberships,
    approvedRoles,
    activeRole,
    switchRole,
    startRoleOnboarding,
  } = useAuth();
  const [isRoleActionLoading, setIsRoleActionLoading] = useState(false);

  const providerMembership = memberships.find(
    (membership) => membership.role === "provider",
  );
  const canSwitchToProvider =
    approvedRoles.includes("provider") && activeRole !== "provider";
  const canStartProviderOnboarding = !providerMembership;
  const canContinueProviderOnboarding =
    Boolean(providerMembership) && providerMembership?.state !== "approved";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleProviderAction = async () => {
    setIsRoleActionLoading(true);
    try {
      if (canSwitchToProvider) {
        await switchRole("provider");
        navigate("/dashboard/provider");
        return;
      }

      if (canStartProviderOnboarding) {
        await startRoleOnboarding("provider");
        navigate("/provider/onboarding");
        return;
      }

      if (canContinueProviderOnboarding) {
        navigate("/provider/onboarding");
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

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => navigate("/dashboard/client/notifications")}
          >
            <Bell className="h-5 w-5 text-gray-600" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
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
                  <AvatarFallback className="bg-blue-600 text-white">
                    {getInitials(clientName || "Client")}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="font-semibold text-gray-900">{clientName}</p>
                  <p className="text-sm text-gray-600">Client Account</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={() => navigate("/dashboard/client/profile")}
              >
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={() => navigate("/dashboard/client/messages")}
              >
                Messages
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={() => navigate("/dashboard/client/my-jobs")}
              >
                My Jobs
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={() => navigate("/dashboard/client/post-job")}
              >
                Post a Job
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={() => navigate("/rewards")}
              >
                Rewards
              </DropdownMenuItem>
              {(canSwitchToProvider ||
                canStartProviderOnboarding ||
                canContinueProviderOnboarding) && (
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={handleProviderAction}
                  disabled={isRoleActionLoading}
                >
                  {canSwitchToProvider
                    ? "Switch to Provider"
                    : canStartProviderOnboarding
                      ? "Become a Provider"
                      : "Continue Provider Onboarding"}
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
