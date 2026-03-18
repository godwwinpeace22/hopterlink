import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type ProviderJob = {
  id: string;
  clientId: string;
  title: string;
  category: string;
  description: string;
  budget: string;
  budgetType: "fixed" | "hourly";
  location: string;
  urgency: "urgent" | "flexible";
  postedAt?: string | null;
  postedDate: string;
  clientName: string;
  quotesCount: number;
  photos?: string[];
  hasQuoted?: boolean;
  providerQuote?: {
    id: string;
    amount?: number | null;
    estimatedDuration?: string | null;
    message?: string | null;
    createdAt?: string | null;
    status?: string | null;
  } | null;
};

const formatDate = (dateString?: string | null) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString();
};

const getFirst = <T>(value: T | T[] | null | undefined) =>
  Array.isArray(value) ? value[0] : value;

export function useProviderGetJobs(
  userId?: string | null,
  country?: string | null,
) {
  const query = useQuery({
    queryKey: ["provider-job-board", userId, country],
    queryFn: async () => {
      const [{ data: myQuotes, error: quotesError }, { data, error }] =
        await Promise.all([
          userId
            ? supabase
                .from("quotes")
                .select(
                  "id, job_id, amount, estimated_duration, message, created_at, status",
                )
                .eq("provider_id", userId)
            : Promise.resolve({ data: [], error: null }),
          supabase
            .from("jobs")
            .select(
              `
              id,
              title,
              category,
              description,
              location,
              urgency,
              created_at,
              budget_min,
              budget_max,
              photo_urls,
              quotes_count,
              metadata,
              client:profiles!jobs_client_id_fkey (
                id,
                full_name,
                country
              )
            `,
            )
            .in("status", ["open", "quoted"])
            .order("created_at", { ascending: false }),
        ]);

      if (quotesError) {
        throw quotesError;
      }

      if (error) {
        throw error;
      }

      const latestQuoteByJob = new Map<
        string,
        NonNullable<typeof myQuotes>[number]
      >();

      for (const quote of myQuotes ?? []) {
        const existing = latestQuoteByJob.get(quote.job_id);
        if (!existing) {
          latestQuoteByJob.set(quote.job_id, quote);
          continue;
        }

        const existingTime = existing.created_at ?? "";
        const nextTime = quote.created_at ?? "";
        if (nextTime >= existingTime) {
          latestQuoteByJob.set(quote.job_id, quote);
        }
      }

      const jobs: ProviderJob[] = [];

      for (const job of data ?? []) {
        const client = getFirst(job.client);
        if (country && client?.country && client.country !== country) continue;

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

        const metadata =
          job.metadata &&
          typeof job.metadata === "object" &&
          !Array.isArray(job.metadata)
            ? (job.metadata as { budgetType?: string })
            : null;
        const budgetType =
          metadata?.budgetType === "hourly" ? "hourly" : "fixed";

        const locationValue =
          job.location &&
          typeof job.location === "object" &&
          !Array.isArray(job.location)
            ? ((job.location as { address?: string; city?: string }).address ??
              (job.location as { city?: string }).city ??
              "")
            : "";

        const providerQuote = latestQuoteByJob.get(job.id) ?? null;
        const hasQuoted = Boolean(providerQuote);

        jobs.push({
          id: job.id,
          clientId: client?.id ?? "",
          title: job.title,
          category: job.category,
          description: job.description,
          budget,
          budgetType,
          location: locationValue,
          urgency: job.urgency === "urgent" ? "urgent" : "flexible",
          postedAt: job.created_at ?? null,
          postedDate: formatDate(job.created_at),
          clientName: client?.full_name ?? "Client",
          quotesCount: job.quotes_count ?? 0,
          photos: job.photo_urls ?? [],
          hasQuoted,
          providerQuote: providerQuote
            ? {
                id: providerQuote.id,
                amount: providerQuote.amount ?? null,
                estimatedDuration: providerQuote.estimated_duration ?? null,
                message: providerQuote.message ?? null,
                createdAt: providerQuote.created_at ?? null,
                status: providerQuote.status ?? null,
              }
            : null,
        });
      }

      return jobs;
    },
  });

  return {
    jobs: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refresh: query.refetch,
  };
}
