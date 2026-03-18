import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@/lib/router";
import { Button } from "../../../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../ui/card";
import { Input } from "../../../ui/input";
import { Search } from "lucide-react";

export const ClientBrowse = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [service, setService] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (service.trim()) params.set("q", service.trim());
    if (location.trim()) params.set("location", location.trim());
    const qs = params.toString();
    navigate(`/dashboard/client/providers${qs ? `?${qs}` : ""}`);
  };

  return (
    <div className="space-y-6 pt-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("clientBrowse.cardTitle")}</CardTitle>
          <CardDescription>{t("clientBrowse.cardDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Input
              placeholder={t("clientBrowse.servicePlaceholder")}
              value={service}
              onChange={(e) => setService(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Input
              placeholder={t("clientBrowse.locationPlaceholder")}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button
              className="bg-[#F1A400] text-slate-950 hover:bg-[#EFA055]"
              onClick={handleSearch}
            >
              <Search className="h-4 w-4 mr-2" />
              {t("clientBrowse.searchButton")}
            </Button>
          </div>

          <div className="rounded-2xl border border-[#F7C876]/60 bg-[#FFF7E8] px-6 py-10 text-center">
            <Search className="mx-auto mb-4 h-16 w-16 text-[#F1A400]" />
            <p className="text-gray-700 mb-4">{t("clientBrowse.readyText")}</p>
            <Button
              className="bg-[#F1A400] text-slate-950 hover:bg-[#EFA055]"
              onClick={() => navigate("/dashboard/client/providers")}
            >
              {t("clientBrowse.browseAll")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
