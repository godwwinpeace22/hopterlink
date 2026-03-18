import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "@/lib/router";
import { Button } from "../ui/button";
import { PageHeader } from "../ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Pencil,
  Save,
  X,
  MessageSquare,
  Star,
  CheckCircle,
  Zap,
} from "lucide-react";
import { useServiceCategories } from "@/lib/useServiceCategories";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";

interface JobDetailsProps {
  jobId?: string | null;
}

type JobStatus = "open" | "accepted" | "in_progress" | "completed" | string;

type JobRecord = {
  id: string;
  title: string;
  category: string;
  description: string;
  status: JobStatus;
  created_at: string | null;
  budget_min: number | null;
  budget_max: number | null;
  preferred_date: string | null;
  urgency: "urgent" | "flexible" | string | null;
  location: unknown;
  metadata?: { budgetType?: "fixed" | "hourly" } | null;
  photo_urls?: string[] | null;
  bookings?: { id: string; status: string | null }[] | null;
};

type EditFormState = {
  title: string;
  category: string;
  description: string;
  budget: string;
  budgetType: "fixed" | "hourly";
  location: string;
  urgency: "urgent" | "flexible";
  preferredDate: string;
};

type Quote = {
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
};

const formatDate = (dateString?: string | null, locale = "en-US") => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(locale);
};

const getLocationLabel = (location: unknown) => {
  if (location && typeof location === "object") {
    const address = (location as { address?: string }).address;
    const city = (location as { city?: string }).city;
    return address ?? city ?? "";
  }
  return "";
};

export function JobDetails({ jobId: propJobId }: JobDetailsProps) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { categories } = useServiceCategories();
  const { jobId: routeJobId } = useParams();
  const jobId = propJobId ?? routeJobId ?? null;
  const [job, setJob] = useState<JobRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [quotesError, setQuotesError] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [formState, setFormState] = useState<EditFormState>({
    title: "",
    category: "",
    description: "",
    budget: "",
    budgetType: "fixed",
    location: "",
    urgency: "flexible",
    preferredDate: "",
  });

  const fetchJob = useCallback(async () => {
    if (!user?.id || !jobId) {
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
        status,
        created_at,
        budget_min,
        budget_max,
        preferred_date,
        urgency,
        location,
        metadata,
        photo_urls,
        bookings:bookings (
          id,
          status
        )
      `,
      )
      .eq("id", jobId)
      .eq("client_id", user.id)
      .single();

    if (error) {
      setErrorMessage(error.message);
      setIsLoading(false);
      return;
    }

    setJob(data as JobRecord);
    setIsLoading(false);
  }, [jobId, user?.id]);

  const fetchQuotes = useCallback(async () => {
    if (!user?.id || !jobId) {
      return;
    }

    setQuotesLoading(true);
    setQuotesError(null);

    const { data, error } = await supabase
      .from("quotes")
      .select(
        `
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
      `,
      )
      .eq("job_id", jobId)
      .order("created_at", { ascending: false });

    if (error) {
      setQuotesError(error.message);
      setQuotesLoading(false);
      return;
    }

    const mappedQuotes: Quote[] = (data ?? []).map((quote: any) => {
      const provider = Array.isArray(quote.provider)
        ? quote.provider[0]
        : quote.provider;
      const providerProfiles = provider?.provider_profiles ?? [];
      const providerProfile = Array.isArray(providerProfiles)
        ? providerProfiles[0]
        : providerProfiles;

      return {
        id: quote.id,
        providerId: quote.provider_id,
        providerName: provider?.full_name ?? t("jobDetails.serviceProvider"),
        providerRating: providerProfile?.rating ?? 0,
        providerJobs: providerProfile?.jobs_completed ?? 0,
        amount: quote.amount?.toString?.() ?? `${quote.amount ?? ""}`,
        timeline: quote.estimated_duration ?? t("jobDetails.flexible"),
        message: quote.message ?? "",
        submittedDate: formatDate(quote.created_at, i18n.language),
        status: (quote.status ?? "pending") as Quote["status"],
      };
    });

    setQuotes(mappedQuotes);
    setQuotesLoading(false);
  }, [i18n.language, jobId, t, user?.id]);

  useEffect(() => {
    fetchJob();
    fetchQuotes();
  }, [fetchJob, fetchQuotes]);

  useEffect(() => {
    if (!job) {
      return;
    }

    const budgetValue = job.budget_min ?? job.budget_max ?? null;
    const preferredDate = job.preferred_date
      ? new Date(job.preferred_date).toISOString().slice(0, 10)
      : "";

    setFormState({
      title: job.title ?? "",
      category: job.category ?? "",
      description: job.description ?? "",
      budget: budgetValue === null ? "" : String(budgetValue),
      budgetType: job.metadata?.budgetType ?? "fixed",
      location: getLocationLabel(job.location),
      urgency: (job.urgency as "urgent" | "flexible") ?? "flexible",
      preferredDate,
    });
  }, [job]);

  const displayStatus = useMemo(() => {
    if (!job) return "";
    if (job.status !== "open") return job.status;
    if ((job.bookings ?? []).length > 0) return "accepted";
    return job.status;
  }, [job]);

  const isEditable = useMemo(() => {
    if (!displayStatus) return false;
    const blockedStatuses = new Set(["accepted", "in_progress", "completed"]);
    return !blockedStatuses.has(displayStatus);
  }, [displayStatus]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user?.id || !jobId) {
      setErrorMessage(t("jobDetails.errors.mustSignInToEdit"));
      return;
    }

    if (!isEditable) {
      setErrorMessage(t("jobDetails.errors.notEditable"));
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const budgetValue = Number.parseFloat(formState.budget);

      const { error } = await supabase
        .from("jobs")
        .update({
          title: formState.title,
          category: formState.category,
          description: formState.description,
          location: {
            address: formState.location,
          },
          urgency: formState.urgency,
          budget_min: Number.isNaN(budgetValue) ? null : budgetValue,
          budget_max: Number.isNaN(budgetValue) ? null : budgetValue,
          preferred_date: formState.preferredDate
            ? new Date(formState.preferredDate).toISOString()
            : null,
          metadata: {
            budgetType: formState.budgetType,
          },
        })
        .eq("id", jobId)
        .eq("client_id", user.id);

      if (error) {
        throw error;
      }

      setIsEditing(false);
      setJob((prev) =>
        prev
          ? {
              ...prev,
              title: formState.title,
              category: formState.category,
              description: formState.description,
              location: { address: formState.location },
              urgency: formState.urgency,
              budget_min: Number.isNaN(budgetValue) ? null : budgetValue,
              budget_max: Number.isNaN(budgetValue) ? null : budgetValue,
              preferred_date: formState.preferredDate
                ? new Date(formState.preferredDate).toISOString()
                : null,
              metadata: { budgetType: formState.budgetType },
            }
          : prev,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : t("jobDetails.errors.updateJob");
      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAcceptQuote = async (quote: Quote) => {
    if (!user?.id || !jobId || !job) {
      setErrorMessage(t("jobDetails.errors.mustSignInToAccept"));
      return;
    }

    try {
      const { error } = await supabase.rpc("accept_quote", {
        p_quote_id: quote.id,
      });

      if (error) {
        throw error;
      }

      await Promise.all([fetchJob(), fetchQuotes()]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : t("jobDetails.errors.acceptQuote");
      setErrorMessage(message);
    }
  };

  const handleSendMessage = async () => {
    if (!user?.id || !selectedQuote?.providerId || !jobId) {
      setErrorMessage(t("jobDetails.errors.sendMessage"));
      return;
    }

    if (!messageText.trim()) {
      return;
    }

    try {
      const { error } = await supabase.from("messages").insert({
        sender_id: user.id,
        recipient_id: selectedQuote.providerId,
        job_id: jobId,
        message_type: "text",
        content: messageText.trim(),
      });

      if (error) {
        throw error;
      }

      setShowMessageDialog(false);
      setMessageText("");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : t("jobDetails.errors.sendMessageFailed");
      setErrorMessage(message);
    }
  };

  if (isLoading) {
    return (
      <div>
        <div className="text-gray-600">{t("jobDetails.loadingJob")}</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div>
        <div>
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage ?? t("jobDetails.errors.notFound")}
          </div>
          <div className="mt-6">
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard/client/my-jobs")}
            >
              {t("jobDetails.backToMyJobs")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const budgetDisplay =
    job.budget_min && job.budget_max
      ? `${job.budget_min}-${job.budget_max}`
      : (job.budget_min ?? job.budget_max ?? "");

  const statusConfig: Record<string, { label: string; className: string }> = {
    open: {
      label: t("jobDetails.status.open"),
      className: "bg-blue-100 text-blue-700 border-blue-200",
    },
    accepted: {
      label: t("jobDetails.status.accepted"),
      className: "bg-green-100 text-green-700 border-green-200",
    },
    in_progress: {
      label: t("jobDetails.status.inProgress"),
      className: "bg-amber-100 text-amber-700 border-amber-200",
    },
    completed: {
      label: t("jobDetails.status.completed"),
      className: "bg-gray-100 text-gray-700 border-gray-200",
    },
  };
  const statusCfg = statusConfig[displayStatus] ?? {
    label: displayStatus.replace("_", " "),
    className: "bg-gray-100 text-gray-700 border-gray-200",
  };

  const content = (
    <div className="space-y-6 py-6 max-w-5xl">
      <PageHeader
        title={isEditing ? t("jobDetails.editJob") : job.title}
        backTo="/dashboard/client/my-jobs"
        actions={
          !isEditing ? (
            isEditable ? (
              <Button
                size="sm"
                className="bg-[#F7C876] hover:bg-[#EFA055] text-white shadow-sm"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                {t("jobDetails.editJob")}
              </Button>
            ) : undefined
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(false)}
            >
              <X className="h-4 w-4 mr-2" />
              {t("common.cancel")}
            </Button>
          )
        }
      />

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {!isEditable && !isEditing && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {t("jobDetails.notEditableNotice")}
        </div>
      )}

      {isEditing ? (
        <Card>
          <CardHeader>
            <p className="text-sm text-gray-500 mt-1">
              {t("jobDetails.editDescription")}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-5 max-w-3xl">
              <div>
                <Label htmlFor="title" className="mb-1.5 block">
                  {t("jobDetails.jobTitle")}{" "}
                  <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="title"
                  value={formState.title}
                  onChange={(event) =>
                    setFormState({ ...formState, title: event.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="category" className="mb-1.5 block">
                  {t("jobDetails.serviceCategory")}{" "}
                  <span className="text-red-600">*</span>
                </Label>
                <select
                  id="category"
                  className="w-full border border-gray-300 max-w-3xl rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F7C876]"
                  value={formState.category}
                  onChange={(event) =>
                    setFormState({ ...formState, category: event.target.value })
                  }
                  required
                >
                  <option value="">{t("jobDetails.selectCategory")}</option>
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="description" className="mb-1.5 block">
                  {t("jobDetails.jobDescription")}{" "}
                  <span className="text-red-600">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={formState.description}
                  onChange={(event) =>
                    setFormState({
                      ...formState,
                      description: event.target.value,
                    })
                  }
                  rows={5}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budgetType" className="mb-1.5 block">
                    {t("jobDetails.budgetType")}
                  </Label>
                  <select
                    id="budgetType"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F7C876]"
                    value={formState.budgetType}
                    onChange={(event) =>
                      setFormState({
                        ...formState,
                        budgetType: event.target.value as "fixed" | "hourly",
                      })
                    }
                  >
                    <option value="fixed">
                      {t("jobDetails.budgetTypeOptions.fixed")}
                    </option>
                    <option value="hourly">
                      {t("jobDetails.budgetTypeOptions.hourly")}
                    </option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="budget" className="mb-1.5 block">
                    {t("jobDetails.estimatedBudget")}{" "}
                    <span className="text-red-600">*</span>
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="budget"
                      type="number"
                      className="pl-10"
                      value={formState.budget}
                      onChange={(event) =>
                        setFormState({
                          ...formState,
                          budget: event.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="location" className="mb-1.5 block">
                  {t("jobDetails.jobLocation")}{" "}
                  <span className="text-red-600">*</span>
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="location"
                    className="pl-10"
                    value={formState.location}
                    onChange={(event) =>
                      setFormState({
                        ...formState,
                        location: event.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="urgency" className="mb-1.5 block">
                    {t("jobDetails.urgencyLevel")}
                  </Label>
                  <select
                    id="urgency"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F7C876]"
                    value={formState.urgency}
                    onChange={(event) =>
                      setFormState({
                        ...formState,
                        urgency: event.target.value as "urgent" | "flexible",
                      })
                    }
                  >
                    <option value="flexible">
                      {t("jobDetails.urgencyOptions.flexible")}
                    </option>
                    <option value="urgent">
                      {t("jobDetails.urgencyOptions.urgent")}
                    </option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="preferredDate" className="mb-1.5 block">
                    {t("jobDetails.preferredStartDate")}
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="preferredDate"
                      type="date"
                      className="pl-10"
                      value={formState.preferredDate}
                      onChange={(event) =>
                        setFormState({
                          ...formState,
                          preferredDate: event.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsEditing(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  {t("common.cancel")}
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#F7C876] hover:bg-[#EFA055] text-white"
                  disabled={isSaving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving
                    ? t("jobDetails.saving")
                    : t("jobDetails.saveChanges")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden border border-[#F7C876]/30 shadow-sm">
          <div className="bg-gradient-to-br from-[#FEF3DB] to-white px-6 py-6 border-b border-[#F7C876]/30">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#C17A00] mb-1">
                  {job.category.replace(/-/g, " ")}
                </p>
                <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                  {job.title}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {t("jobDetails.posted", {
                    date: formatDate(job.created_at, i18n.language),
                  })}
                </p>
              </div>
              <Badge
                className={`${statusCfg.className} text-sm px-3 py-1 shrink-0`}
              >
                {statusCfg.label}
              </Badge>
            </div>
          </div>
          <CardContent className="py-6 space-y-5">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="flex items-start gap-3 rounded-lg bg-gray-50 px-4 py-3">
                <DollarSign className="h-5 w-5 text-[#C17A00] mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {t("jobDetails.budget")}
                  </p>
                  <p className="font-semibold text-gray-900 truncate">
                    ${budgetDisplay}
                  </p>
                  <p className="text-xs text-gray-400 capitalize">
                    {(job.metadata?.budgetType ?? "fixed") === "fixed"
                      ? t("jobDetails.budgetTypeOptions.fixed")
                      : t("jobDetails.budgetTypeOptions.hourly")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg bg-gray-50 px-4 py-3">
                <MapPin className="h-5 w-5 text-[#C17A00] mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {t("jobDetails.location")}
                  </p>
                  <p className="font-semibold text-gray-900 truncate">
                    {getLocationLabel(job.location) ||
                      t("jobDetails.notAvailable")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg bg-gray-50 px-4 py-3">
                <Calendar className="h-5 w-5 text-[#C17A00] mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {t("jobDetails.preferredDate")}
                  </p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(job.preferred_date, i18n.language) ||
                      t("jobDetails.flexible")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg bg-gray-50 px-4 py-3">
                {job.urgency === "urgent" ? (
                  <Zap className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                ) : (
                  <Clock className="h-5 w-5 text-[#C17A00] mt-0.5 shrink-0" />
                )}
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {t("jobDetails.urgency")}
                  </p>
                  <p className="font-semibold text-gray-900 capitalize">
                    {job.urgency === "urgent"
                      ? t("jobDetails.urgencyOptions.urgent")
                      : t("jobDetails.urgencyOptions.flexible")}
                  </p>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-5">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                {t("jobDetails.description")}
              </p>
              <p className="text-gray-600 whitespace-pre-wrap leading-relaxed text-sm">
                {job.description}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>{t("jobDetails.quotes")}</CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              {t("jobDetails.reviewOffers")}
            </p>
          </CardHeader>
          <CardContent>
            {quotesError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {quotesError}
              </div>
            )}

            {quotesLoading && (
              <Card className="border border-gray-200/80 animate-pulse">
                <CardContent className="py-8 text-center text-gray-600">
                  {t("jobDetails.loadingQuotes")}
                </CardContent>
              </Card>
            )}

            {!quotesLoading && quotes.length === 0 && (
              <Card className="border border-dashed border-[#F7C876]/60 bg-[#FDEFD6]/30">
                <CardContent className="py-8 text-center text-gray-600">
                  {t("jobDetails.noQuotes")}
                </CardContent>
              </Card>
            )}

            {!quotesLoading && quotes.length > 0 && (
              <div className="space-y-4">
                {quotes.map((quote) => {
                  const canMessageProvider = quote.status === "accepted";
                  const canAccept =
                    displayStatus === "open" && quote.status !== "accepted";

                  return (
                    <Card
                      key={quote.id}
                      className="border border-[#F7C876]/40 bg-white hover:border-[#F7C876] hover:shadow-md transition-all"
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex gap-4 flex-1">
                            <Avatar className="h-12 w-12 ring-2 ring-[#FDEFD6]">
                              <AvatarFallback className="bg-[#F7C876] text-white">
                                {quote.providerName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h5 className="font-semibold text-gray-900">
                                    {quote.providerId ? (
                                      <Link
                                        to="/dashboard/client/profile/$userId"
                                        params={{ userId: quote.providerId }}
                                        className="text-[#F1A400] hover:underline"
                                      >
                                        {quote.providerName}
                                      </Link>
                                    ) : (
                                      quote.providerName
                                    )}
                                  </h5>
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                      <span>{quote.providerRating}</span>
                                    </div>
                                    <span>•</span>
                                    <span>
                                      {t("jobDetails.jobsCompleted", {
                                        count: quote.providerJobs,
                                      })}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-[#F1A400]">
                                    ${quote.amount}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {t("jobDetails.commission")}:{" "}
                                    {parseFloat(quote.amount) > 500
                                      ? "3.5%"
                                      : "5%"}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                                <Calendar className="h-4 w-4" />
                                <span>{quote.timeline}</span>
                                <span className="text-gray-400">
                                  •{" "}
                                  {t("jobDetails.submitted", {
                                    date: quote.submittedDate,
                                  })}
                                </span>
                              </div>

                              <p className="text-gray-700 text-sm mb-4 bg-[#FDEFD6]/50 rounded-lg p-3">
                                {quote.message}
                              </p>

                              <div className="flex gap-2 flex-wrap">
                                {quote.status === "accepted" && (
                                  <Badge className="bg-green-100 text-green-700 border-green-200 font-medium">
                                    {t("jobDetails.status.accepted")}
                                  </Badge>
                                )}
                                {canAccept && (
                                  <Button
                                    className="bg-[#F7C876] hover:bg-[#EFA055] shadow-sm"
                                    onClick={() => handleAcceptQuote(quote)}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    {t("jobDetails.acceptQuote")}
                                  </Button>
                                )}

                                {canMessageProvider && (
                                  <Dialog
                                    open={
                                      showMessageDialog &&
                                      selectedQuote?.id === quote.id
                                    }
                                    onOpenChange={setShowMessageDialog}
                                  >
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        className="hover:border-[#F7C876]"
                                        onClick={() => setSelectedQuote(quote)}
                                      >
                                        <MessageSquare className="h-4 w-4 mr-2" />
                                        {t("jobDetails.messageProvider")}
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>
                                          {t("jobDetails.messageProviderName", {
                                            name: quote.providerName,
                                          })}
                                        </DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-4 mt-4">
                                        <Textarea
                                          placeholder={t(
                                            "jobDetails.messagePlaceholder",
                                          )}
                                          value={messageText}
                                          onChange={(e) =>
                                            setMessageText(e.target.value)
                                          }
                                          rows={5}
                                        />
                                        <div className="flex gap-2">
                                          <Button
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => {
                                              setShowMessageDialog(false);
                                              setMessageText("");
                                            }}
                                          >
                                            {t("common.cancel")}
                                          </Button>
                                          <Button
                                            className="flex-1 bg-[#F7C876] hover:bg-[#EFA055]"
                                            onClick={handleSendMessage}
                                            disabled={!messageText.trim()}
                                          >
                                            {t("jobDetails.sendMessage")}
                                          </Button>
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                )}

                                <Button asChild variant="ghost" size="sm">
                                  <Link
                                    to="/dashboard/client/profile/$userId"
                                    params={{ userId: quote.providerId }}
                                  >
                                    {t("jobDetails.viewProfile")}
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );

  return content;
}
