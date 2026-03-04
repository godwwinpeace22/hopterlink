import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { ChevronDown, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { paths } from "@/app/routes/paths";

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, activeRole, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: "/services", label: "Services" },
    { to: "/how-it-works", label: "How It Works" },
    { to: "/about", label: "About" },
    { to: "/pricing", label: "Pricing" },
  ];

  const isActiveLink = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const dashboardPath =
    activeRole === "provider"
      ? paths.dashboard.provider.root
      : paths.dashboard.client.root;
  const profilePath =
    activeRole === "provider"
      ? paths.dashboard.provider.absolute("profile")
      : paths.dashboard.client.absolute("profile");
  const roleCta =
    activeRole === "provider"
      ? {
          label: "Find Jobs",
          path: paths.dashboard.provider.absolute("jobBoard"),
        }
      : {
          label: "Find Providers",
          path: paths.dashboard.client.absolute("providers"),
        };
  const initials =
    profile?.full_name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") ||
    user?.email?.slice(0, 2).toUpperCase() ||
    "FH";

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
    navigate("/");
  };

  const renderAccountMenu = (
    avatarSizeClass: string,
    includePublicLinks = false,
  ) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1 rounded-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7C876] focus-visible:ring-offset-2">
          <Avatar className={`${avatarSizeClass} border border-gray-200`}>
            <AvatarImage src={profile?.avatar_url ?? undefined} />
            <AvatarFallback className="bg-[#F7C876] text-white text-sm font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <ChevronDown className="h-4 w-4 text-gray-600" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {includePublicLinks &&
          navLinks.map((link) => (
            <DropdownMenuItem
              key={link.to}
              onClick={() => navigate(link.to)}
              className={
                isActiveLink(link.to) ? "text-[#F1A400] font-semibold" : ""
              }
            >
              {link.label}
            </DropdownMenuItem>
          ))}
        {includePublicLinks && <DropdownMenuSeparator />}
        <DropdownMenuItem onClick={() => navigate(dashboardPath)}>
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate(profilePath)}>
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate(roleCta.path)}>
          {roleCta.label}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSignOut}>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex flex-1 items-center">
            <Link className="flex items-center gap-2 cursor-pointer" to="/">
              <div className="h-10 w-10 bg-[#F7C876] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">FH</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                Fixers Hive
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`transition-colors ${isActiveLink(link.to) ? "text-[#F1A400] font-semibold" : "text-gray-700 hover:text-[#F7C876]"}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex flex-1 items-center justify-end gap-3">
            {user ? (
              renderAccountMenu("h-9 w-9")
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate("/signin")}>
                  Sign In
                </Button>
                <Button
                  className="bg-[#F7C876] hover:bg-[#EFA055]"
                  onClick={() => navigate("/client-signup")}
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          {user ? (
            <div className="md:hidden">
              {renderAccountMenu("h-8 w-8", true)}
            </div>
          ) : (
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </button>
          )}
        </div>

        {/* Mobile Menu */}
        {!user && mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`block py-2 transition-colors ${isActiveLink(link.to) ? "text-[#F1A400] font-semibold" : "text-gray-700 hover:text-[#F7C876]"}`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 space-y-2">
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/signin");
                }}
              >
                Sign In
              </Button>
              <Button
                className="w-full bg-[#F7C876] hover:bg-[#EFA055]"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/client-signup");
                }}
              >
                Get Started
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
