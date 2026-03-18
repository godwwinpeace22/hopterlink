import { PageHeader } from "../ui/page-header";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { MapPin, DollarSign } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@/lib/router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface Quote {
  id: string;
  providerId: string;
  providerName: string;
  providerRating: number;
  providerJobs: number;
  amount: string;
  timeline: string;
  message: string;
  submittedDate: string;
  status: "pending" | "accepted" | "rejected" | "client_messaged" | "withdrawn";
}

interface Job {
  id: string;
  title: string;
  category: string;
  description: string;
  budget: string;
  location: string;
  status: "open" | "accepted" | "in_progress" | "completed";
  postedDate: string;
  quotesReceived: Quote[];
}

const formatDate = (dateString?: string | null) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString();
};

export function MyJobs() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const lastFetchRef = useRef<{ userId: string; at: number }>({
    userId: "",
    at: 0,
  });
  const fetchCooldownMs = 30_000;

  const getFirst = <T,>(value: T | T[] | null | undefined) =>
    Array.isArray(value) ? value[0] : value;

  const getLocationLabel = (location: unknown) => {
    if (location && typeof location === "object") {
      const address = (location as { address?: string }).address;
      const city = (location as { city?: string }).city;
      return address ?? city ?? "";
    }
    return "";
  };

  const fetchJobs = useCallback(
    async (force = false) => {
      if (!user?.id) {
        setJobs([]);
        return;
      }

      const now = Date.now();
      if (
        !force &&
        lastFetchRef.current.userId === user.id &&
        now - lastFetchRef.current.at < fetchCooldownMs
      ) {
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      const { data, error } = await supabase
        .from("jobs")
        .select(
          `
          id,
          title,
          category,
          description,
          location,
          status,
          created_at,
          budget_min,
          budget_max,
          preferred_date,
          quotes:quotes (
            id,
            amount,
            estimated_duration,
            message,
            created_at,
            status,
            provider_id,
            provider:profiles!quotes_provider_id_fkey (
              id,
              full_name,
              provider_profiles (
                rating,
                jobs_completed
              )
            )
          )
        `,
        )
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      const mappedJobs: Job[] = (data ?? []).map((job) => {
        const locationValue = getLocationLabel(job.location);
        const budgetMin = job.budget_min ?? null;
        const budgetMax = job.budget_max ?? null;
        const budget =
          budgetMin && budgetMax
            ? `${budgetMin}-${budgetMax}`
            : budgetMin
              ? `${budgetMin}`
              : budgetMax
                ? `${budgetMax}`
                : "";

        const quotesReceived: Quote[] = (job.quotes ?? []).map((quote) => {
          const provider = getFirst(quote.provider);
          const providerProfiles = provider?.provider_profiles ?? [];
          const providerProfile = getFirst(providerProfiles);

          return {
            id: quote.id,
            providerId: quote.provider_id,
            providerName: provider?.full_name ?? t("myJobs.providerDefault"),
            providerRating: providerProfile?.rating ?? 0,
            providerJobs: providerProfile?.jobs_completed ?? 0,
            amount: quote.amount?.toString?.() ?? `${quote.amount ?? ""}`,
            timeline: quote.estimated_duration ?? t("myJobs.flexible"),
            message: quote.message ?? "",
            submittedDate: formatDate(quote.created_at),
            status: (quote.status ?? "pending") as Quote["status"],
          };
        });

        return {
          id: job.id,
          title: job.title,
          category: job.category,
          description: job.description,
          budget,
          location: locationValue,
          status:
            job.status === "completed"
              ? "completed"
              : job.status === "in_progress"
                ? "in_progress"
                : job.status === "accepted"
                  ? "accepted"
                  : "open",
          postedDate: formatDate(job.created_at),
          quotesReceived,
        };
      });

      setJobs(mappedJobs);
      setIsLoading(false);
      lastFetchRef.current = { userId: user.id, at: Date.now() };
    },
    [t, user?.id],
  );

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const content = (
    <>
      <div className="flex justify-end mb-4">
        <Button
          className="cursor-pointer text-black bg-[#F7C876] hover:bg-[#EFA055]"
          onClick={() => navigate("/dashboard/client/post-job")}
          size="sm"
        >
          + {t("myJobs.postNewJob")}
        </Button>
      </div>

      <div className="space-y-6">
        {errorMessage && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {isLoading && (
          <Card className="border border-gray-200/80 animate-pulse">
            <CardContent className="py-10 text-center text-gray-600">
              {t("myJobs.loading")}
            </CardContent>
          </Card>
        )}

        {!isLoading && jobs.length === 0 && (
          <Card className="border border-gray-200/80">
            <CardContent className="py-10 text-center text-gray-600">
              {t("myJobs.empty")}
            </CardContent>
          </Card>
        )}

        {jobs.map((job) => (
          <Card
            key={job.id}
            className="border border-gray-200/80 bg-white hover:shadow-lg transition-shadow"
          >
            <CardHeader className="bg-[#FDEFD6]/40">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl tracking-tight">
                    <a
                      href={`/dashboard/client/job/${job.id}`}
                      className="hover:text-[#EFA055] transition-colors"
                    >
                      {job.title}
                    </a>
                  </CardTitle>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge className="bg-[#FDEFD6] text-[#F1A400] border-[#F7C876] font-medium">
                      {job.category}
                    </Badge>
                    {job.status === "open" && (
                      <Badge className="bg-green-100 text-green-700 border-green-200 font-medium">
                        {t("myJobs.statusOpen")}
                      </Badge>
                    )}
                    {job.status === "accepted" && (
                      <Badge className="bg-amber-100 text-amber-700 border-amber-200 font-medium">
                        {t("myJobs.statusAccepted")}
                      </Badge>
                    )}
                    {job.status === "in_progress" && (
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200 font-medium">
                        {t("myJobs.statusInProgress")}
                      </Badge>
                    )}
                    {job.status === "completed" && (
                      <Badge className="bg-gray-100 text-gray-700 border-gray-200 font-medium">
                        {t("myJobs.statusCompleted")}
                      </Badge>
                    )}
                    <span className="text-sm text-gray-500">
                      {t("myJobs.posted", { date: job.postedDate })}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#F1A400]">
                    {job.quotesReceived.length}
                  </div>
                  <div className="text-sm text-gray-500">
                    {t("myJobs.quote", { count: job.quotesReceived.length })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => {
                      window.location.href = `/dashboard/client/job/${job.id}`;
                    }}
                  >
                    {t("myJobs.viewDetails")}
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <p className="text-gray-600 mb-4 line-clamp-2">
                {job.description}
              </p>

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  {t("myJobs.budget")}: ${job.budget}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {job.location}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );

  return (
    <div className="space-y-6 pt-6">
      <PageHeader title={t("myJobs.title")} hideBack />
      {content}
    </div>
  );
}
