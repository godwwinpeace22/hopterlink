import { Link, Outlet, useLocation, useNavigate } from "@/lib/router";
import logo from "@/assets/logo.png";
import {
  BarChart3,
  CheckCircle,
  LayoutDashboard,
  LogOut,
  MessageSquareWarning,
  Shield,
  Tag,
  Users,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
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

const NAV_ITEMS = [
  { label: "Overview", path: "overview", icon: LayoutDashboard },
  { label: "Users", path: "users", icon: Users },
  { label: "Service Categories", path: "services", icon: Tag },
  { label: "Provider Verification", path: "verification", icon: CheckCircle },
  { label: "Disputes & Reports", path: "disputes", icon: MessageSquareWarning },
  { label: "Revenue", path: "revenue", icon: BarChart3 },
] as const;

export function AdminDashboardLayout() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname.split("/").pop() ?? "overview";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <SidebarProvider className="min-h-0 h-svh">
      <Sidebar>
        <SidebarHeader>
          <Link to="/" className="flex items-center gap-2 px-2 py-3">
            <img src={logo} alt="Hopterlink" className="h-8 w-auto" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900">
                Hopterlink
              </span>
              <span className="text-xs text-red-600 font-medium flex items-center gap-1">
                <Shield className="h-3 w-3" /> Admin
              </span>
            </div>
          </Link>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Management</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV_ITEMS.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={currentPath === item.path}
                      onClick={() => navigate(`/dashboard/admin/${item.path}`)}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarSeparator />
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <div className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
