import { Link, useLocation } from "react-router-dom";
import { User, Briefcase } from "lucide-react";

const tabs = [
  {
    to: "/client-signup",
    label: "I need a service",
    sublabel: "Client",
    icon: User,
  },
  {
    to: "/provider-signup",
    label: "I offer services",
    sublabel: "Provider",
    icon: Briefcase,
  },
] as const;

export function SignupTabs() {
  const { pathname } = useLocation();

  return (
    <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
      {tabs.map((tab) => {
        const active = pathname === tab.to;
        const Icon = tab.icon;
        return (
          <Link
            key={tab.to}
            to={tab.to}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium transition-all ${
              active
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.sublabel}</span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
