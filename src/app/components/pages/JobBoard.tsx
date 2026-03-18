import { toast } from "sonner";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  MapPin,
  DollarSign,
  Clock,
  Send,
  MessageSquare,
  SlidersHorizontal,
  Maximize2,
} from "lucide-react";
import { useMemo, useState } from "react";
// import { useNavigate } from "@/lib/router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "../ui/page-header";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import {
  useProviderGetJobs,
  type ProviderJob,
} from "@/app/hooks/useProviderGetJobs";
import { useServiceCategories } from "@/lib/useServiceCategories";
import { useTranslation } from "react-i18next";

type Job = ProviderJob;

const formatDate = (dateString?: string | null, locale = "en-US") => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const formatLocation = (value?: string | null) => {
  if (!value) return "";
  const parts = value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length <= 1) return parts[0] ?? value;
  return parts.slice(-2).join(", ");
};

const parseBudgetRange = (budget: string) => {
  if (!budget) return null;
  const cleaned = budget.replace(/[^0-9\-\.]/g, "");
  const parts = cleaned.split("-").map((part) => Number(part));
  const [min, max] = parts.length > 1 ? parts : [parts[0], parts[0]];
  if (!Number.isFinite(min)) return null;
  return {
    min,
    max: Number.isFinite(max) ? max : min,
  };
};

const getDateThreshold = (
  filterValue: "all" | "last7" | "last30" | "last90",
) => {
  if (filterValue === "all") return null;
  const days = filterValue === "last7" ? 7 : filterValue === "last30" ? 30 : 90;
  return Date.now() - days * 24 * 60 * 60 * 1000;
};

export function JobBoard() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { categorySlugsWithAll, slugToName } = useServiceCategories();
  // const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<
    "all" | "last7" | "last30" | "last90"
  >("all");
  const [sortByDate, setSortByDate] = useState<"newest" | "oldest">("newest");
  const [amountMin, setAmountMin] = useState("");
  const [amountMax, setAmountMax] = useState("");
  const [budgetTypeFilter, setBudgetTypeFilter] = useState<
    "all" | "fixed" | "hourly"
  >("all");
  const [urgencyFilter, setUrgencyFilter] = useState<
    "all" | "urgent" | "flexible"
  >("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [quoteData, setQuoteData] = useState({
    amount: "",
    timeline: "",
    message: "",
  });
  const [showQuoteDialog, setShowQuoteDialog] = useState(false);
  const [showDetailsSheet, setShowDetailsSheet] = useState(false);
  const [expandedPhoto, setExpandedPhoto] = useState<string | null>(null);
  const { jobs, isLoading, error, refresh } = useProviderGetJobs(user?.id);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitQuote = async () => {
    if (!user?.id || !selectedJob) {
      setErrorMessage(t("jobBoard.errors.mustSignInToQuote"));
      return;
    }

    if (selectedJob.hasQuoted) {
      setErrorMessage(t("jobBoard.errors.alreadyQuoted"));
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const amountValue = Number.parseFloat(quoteData.amount);
      if (Number.isNaN(amountValue)) {
        setErrorMessage(t("jobBoard.errors.invalidQuoteAmount"));
        setIsSubmitting(false);
        return;
      }

      const { error } = await supabase.from("quotes").insert({
        job_id: selectedJob.id,
        provider_id: user.id,
        amount: amountValue,
        estimated_duration: quoteData.timeline,
        message: quoteData.message,
        status: "pending",
      });

      if (error) {
        throw error;
      }

      await refresh();

      setShowQuoteDialog(false);
      setQuoteData({ amount: "", timeline: "", message: "" });
      toast.success(t("jobBoard.quoteSuccess"));
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : t("jobBoard.errors.submitQuote");
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredJobs = useMemo(() => {
    const threshold = getDateThreshold(dateFilter);
    const minValue = amountMin ? Number(amountMin) : null;
    const maxValue = amountMax ? Number(amountMax) : null;

    const filtered = jobs.filter((job) => {
      if (filter !== "all" && job.category.toLowerCase() !== filter) {
        return false;
      }

      if (budgetTypeFilter !== "all" && job.budgetType !== budgetTypeFilter) {
        return false;
      }

      if (urgencyFilter !== "all" && job.urgency !== urgencyFilter) {
        return false;
      }

      if (threshold) {
        const postedAt = job.postedAt ? new Date(job.postedAt).getTime() : NaN;
        if (!Number.isFinite(postedAt) || postedAt < threshold) {
          return false;
        }
      }

      if (minValue !== null || maxValue !== null) {
        const range = parseBudgetRange(job.budget);
        if (!range) {
          return false;
        }
        if (minValue !== null && range.max < minValue) {
          return false;
        }
        if (maxValue !== null && range.min > maxValue) {
          return false;
        }
      }

      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      const aTime = a.postedAt ? new Date(a.postedAt).getTime() : 0;
      const bTime = b.postedAt ? new Date(b.postedAt).getTime() : 0;
      return sortByDate === "newest" ? bTime - aTime : aTime - bTime;
    });

    return sorted;
  }, [
    amountMax,
    amountMin,
    budgetTypeFilter,
    dateFilter,
    filter,
    jobs,
    sortByDate,
    urgencyFilter,
  ]);

  const content = (
    <div className="space-y-6 pt-3">
      <PageHeader title={t("jobBoard.title")} hideBack />
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {t("jobBoard.showingCount", { count: filteredJobs.length })}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {t("jobBoard.filters")}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={budgetTypeFilter === "all" ? "default" : "outline"}
          className={
            budgetTypeFilter === "all" ? "bg-[#F7C876] hover:bg-[#EFA055]" : ""
          }
          onClick={() => setBudgetTypeFilter("all")}
        >
          {t("jobBoard.types.all")}
        </Button>
        <Button
          variant={budgetTypeFilter === "fixed" ? "default" : "outline"}
          className={
            budgetTypeFilter === "fixed"
              ? "bg-[#F7C876] hover:bg-[#EFA055]"
              : ""
          }
          onClick={() => setBudgetTypeFilter("fixed")}
        >
          {t("jobBoard.types.fixed")}
        </Button>
        <Button
          variant={budgetTypeFilter === "hourly" ? "default" : "outline"}
          className={
            budgetTypeFilter === "hourly"
              ? "bg-[#F7C876] hover:bg-[#EFA055]"
              : ""
          }
          onClick={() => setBudgetTypeFilter("hourly")}
        >
          {t("jobBoard.types.hourly")}
        </Button>
      </div>

      <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <SheetContent side="right" className="w-full sm:max-w-sm">
          <SheetHeader>
            <SheetTitle>{t("jobBoard.filterJobs")}</SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-6 px-4">
            <div>
              <Label className="text-sm">{t("jobBoard.category")}</Label>
              <div className="mt-3 flex flex-wrap gap-2">
                {categorySlugsWithAll.map((slug) => (
                  <Button
                    key={slug}
                    variant={filter === slug ? "default" : "outline"}
                    className={
                      filter === slug ? "bg-[#F7C876] hover:bg-[#EFA055]" : ""
                    }
                    onClick={() => setFilter(slug)}
                  >
                    {slug === "all"
                      ? t("jobBoard.allJobsCount", { count: jobs.length })
                      : (slugToName.get(slug) ?? slug)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date-filter">{t("jobBoard.date")}</Label>
                <select
                  id="date-filter"
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  value={dateFilter}
                  onChange={(event) =>
                    setDateFilter(event.target.value as typeof dateFilter)
                  }
                >
                  <option value="all">
                    {t("jobBoard.dateOptions.allTime")}
                  </option>
                  <option value="last7">
                    {t("jobBoard.dateOptions.last7")}
                  </option>
                  <option value="last30">
                    {t("jobBoard.dateOptions.last30")}
                  </option>
                  <option value="last90">
                    {t("jobBoard.dateOptions.last90")}
                  </option>
                </select>
              </div>
              <div>
                <Label htmlFor="sort-filter">{t("jobBoard.sortBy")}</Label>
                <select
                  id="sort-filter"
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  value={sortByDate}
                  onChange={(event) =>
                    setSortByDate(event.target.value as typeof sortByDate)
                  }
                >
                  <option value="newest">
                    {t("jobBoard.sortOptions.newest")}
                  </option>
                  <option value="oldest">
                    {t("jobBoard.sortOptions.oldest")}
                  </option>
                </select>
              </div>
              <div>
                <Label htmlFor="urgency-filter">{t("jobBoard.urgency")}</Label>
                <select
                  id="urgency-filter"
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  value={urgencyFilter}
                  onChange={(event) =>
                    setUrgencyFilter(event.target.value as typeof urgencyFilter)
                  }
                >
                  <option value="all">
                    {t("jobBoard.urgencyOptions.all")}
                  </option>
                  <option value="urgent">
                    {t("jobBoard.urgencyOptions.urgent")}
                  </option>
                  <option value="flexible">
                    {t("jobBoard.urgencyOptions.flexible")}
                  </option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount-min">{t("jobBoard.minAmount")}</Label>
                <Input
                  id="amount-min"
                  type="number"
                  placeholder={t("jobBoard.minAmountPlaceholder")}
                  className="mt-1"
                  value={amountMin}
                  onChange={(event) => setAmountMin(event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="amount-max">{t("jobBoard.maxAmount")}</Label>
                <Input
                  id="amount-max"
                  type="number"
                  placeholder={t("jobBoard.maxAmountPlaceholder")}
                  className="mt-1"
                  value={amountMax}
                  onChange={(event) => setAmountMax(event.target.value)}
                />
              </div>
            </div>
          </div>

          <SheetFooter className="mt-6 flex flex-col gap-3">
            <Button
              variant="ghost"
              className="self-start text-sm text-gray-500 hover:text-gray-700"
              onClick={() => {
                setFilter("all");
                setDateFilter("all");
                setSortByDate("newest");
                setAmountMin("");
                setAmountMax("");
                setUrgencyFilter("all");
              }}
            >
              {t("jobBoard.clearFilters")}
            </Button>
            <Button
              className="w-full bg-[#F7C876] hover:bg-[#EFA055]"
              onClick={() => setIsFilterOpen(false)}
            >
              {t("jobBoard.applyFilters")}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Job Listings */}
      <div className="space-y-4">
        {(errorMessage || error) && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage ??
              (error instanceof Error
                ? error.message
                : t("jobBoard.errors.loadJobs"))}
          </div>
        )}

        {isLoading && (
          <Card className="border border-gray-200/80 animate-pulse">
            <CardContent className="py-12 text-center text-gray-600">
              {t("jobBoard.loadingJobs")}
            </CardContent>
          </Card>
        )}

        {filteredJobs.map((job) => (
          <Card
            key={job.id}
            className="relative border border-gray-200/80 bg-white hover:shadow-lg hover:border-blue-100 transition-all"
          >
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-semibold text-gray-900 tracking-tight">
                          {job.title}
                        </h3>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge className="bg-blue-50 text-blue-700 border-blue-100 font-medium">
                          {job.category}
                        </Badge>
                        {job.urgency === "urgent" && (
                          <Badge className="bg-red-50 text-red-600 border-red-100 inline-flex items-center gap-1 font-medium">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                            {t("jobBoard.urgencyOptions.urgent")}
                          </Badge>
                        )}
                        <span className="text-xs text-gray-500">
                          {formatDate(
                            job.postedAt ?? job.postedDate,
                            i18n.language,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                    {job.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span className="font-semibold text-gray-800">
                        ${job.budget}
                      </span>
                      <span className="text-gray-400">
                        {job.budgetType === "fixed"
                          ? t("jobBoard.types.fixed")
                          : t("jobBoard.perHour")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      {formatLocation(job.location) ||
                        t("jobBoard.locationNotProvided")}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4 text-gray-400" />
                      {t("jobBoard.quoteCount", { count: job.quotesCount })}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Dialog
                    open={showQuoteDialog && selectedJob?.id === job.id}
                    onOpenChange={setShowQuoteDialog}
                  >
                    <DialogTrigger asChild>
                      <Button
                        className="bg-[#F7C876] hover:bg-[#EFA055] focus-visible:ring-2 focus-visible:ring-[#F7C876] focus-visible:ring-offset-2"
                        onClick={() => setSelectedJob(job)}
                        disabled={job.hasQuoted}
                      >
                        {job.hasQuoted
                          ? t("jobBoard.quoteSubmitted")
                          : t("jobBoard.submitQuote")}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>
                          {t("jobBoard.submitYourQuote")}
                        </DialogTitle>
                      </DialogHeader>

                      <div className="space-y-4 mt-4">
                        {/* Job Summary */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-semibold mb-2">
                            {selectedJob?.title}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {selectedJob?.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>
                              {t("jobBoard.clientBudget", {
                                budget: selectedJob?.budget ?? "",
                              })}
                            </span>
                            <span>•</span>
                            <span>
                              {formatLocation(selectedJob?.location) ||
                                t("jobBoard.locationNotProvided")}
                            </span>
                          </div>
                        </div>

                        {/* Quote Form */}
                        <div>
                          <Label htmlFor="amount">
                            {t("jobBoard.yourQuoteAmount")}{" "}
                            <span className="text-red-600">*</span>
                          </Label>
                          <div className="relative mt-1">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="amount"
                              type="number"
                              placeholder={t("jobBoard.quoteAmountPlaceholder")}
                              className="pl-10"
                              value={quoteData.amount}
                              onChange={(e) =>
                                setQuoteData({
                                  ...quoteData,
                                  amount: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {t("jobBoard.commissionLabel")}{" "}
                            {parseFloat(quoteData.amount || "0") > 500
                              ? t("jobBoard.commissionHigh")
                              : t("jobBoard.commissionStandard")}
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="timeline">
                            {t("jobBoard.estimatedTimeline")}{" "}
                            <span className="text-red-600">*</span>
                          </Label>
                          <div className="relative mt-1">
                            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="timeline"
                              placeholder={t("jobBoard.timelinePlaceholder")}
                              className="pl-10"
                              value={quoteData.timeline}
                              onChange={(e) =>
                                setQuoteData({
                                  ...quoteData,
                                  timeline: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="message">
                            {t("jobBoard.messageToClient")}{" "}
                            <span className="text-red-600">*</span>
                          </Label>
                          <Textarea
                            id="message"
                            placeholder={t("jobBoard.messagePlaceholder")}
                            value={quoteData.message}
                            onChange={(e) =>
                              setQuoteData({
                                ...quoteData,
                                message: e.target.value,
                              })
                            }
                            rows={4}
                            className="mt-1"
                            required
                          />
                        </div>

                        <div className="bg-[#FDEFD6] border border-[#F7C876] rounded-lg p-3 text-sm">
                          <p className="text-gray-700">
                            <strong>{t("jobBoard.tipTitle")}</strong>{" "}
                            {t("jobBoard.tipBody")}
                          </p>
                        </div>

                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                              setShowQuoteDialog(false);
                              setQuoteData({
                                amount: "",
                                timeline: "",
                                message: "",
                              });
                            }}
                          >
                            {t("common.cancel")}
                          </Button>
                          <Button
                            className="flex-1 bg-[#F7C876] hover:bg-[#EFA055]"
                            onClick={handleSubmitQuote}
                            disabled={
                              isSubmitting ||
                              !quoteData.amount ||
                              !quoteData.timeline ||
                              !quoteData.message
                            }
                          >
                            <Send className="h-4 w-4 mr-2" />
                            {isSubmitting
                              ? t("jobBoard.submitting")
                              : t("jobBoard.submitQuote")}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="outline"
                    size="sm"
                    className="focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-2"
                    onClick={() => {
                      setSelectedJob(job);
                      setShowDetailsSheet(true);
                    }}
                  >
                    {t("jobBoard.viewDetails")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Job Details Sheet */}
      <Sheet open={showDetailsSheet} onOpenChange={setShowDetailsSheet}>
        <SheetContent
          side="right"
          className="flex w-full flex-col sm:max-w-2xl overflow-y-auto"
        >
          <SheetHeader className="border-b pb-4">
            <SheetTitle className="text-xl leading-tight">
              {selectedJob?.title}
            </SheetTitle>
            <p className="text-sm text-gray-500">
              {t("jobBoard.posted")}{" "}
              {formatDate(
                selectedJob?.postedAt ?? selectedJob?.postedDate,
                i18n.language,
              )}
              {selectedJob?.clientName ? ` • ${selectedJob.clientName}` : ""}
            </p>
          </SheetHeader>

          <div className="flex-1 space-y-5 overflow-y-auto py-4 px-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="bg-[#FDEFD6] text-[#F1A400] border-[#F7C876]">
                {selectedJob?.category}
              </Badge>
              {selectedJob?.urgency === "urgent" && (
                <Badge className="bg-red-100 text-red-600 border-red-300">
                  {t("jobBoard.urgentBadge")}
                </Badge>
              )}
              <span className="text-sm text-gray-600">
                {t("jobBoard.budgetLabel")}: ${selectedJob?.budget} (
                {selectedJob?.budgetType === "fixed"
                  ? t("jobBoard.types.fixed")
                  : t("jobBoard.perHour")}
                )
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 shrink-0" />
              {formatLocation(selectedJob?.location) ||
                t("jobBoard.locationNotProvided")}
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                {t("jobBoard.description")}
              </h4>
              <p className="text-gray-700 whitespace-pre-line text-sm leading-relaxed">
                {selectedJob?.description}
              </p>
            </div>

            {selectedJob?.photos && selectedJob.photos.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  {t("jobBoard.photos")}
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {selectedJob.photos.map((photo, index) => (
                    <button
                      key={`sheet-photo-${selectedJob.id}-${index}`}
                      type="button"
                      className="group relative overflow-hidden rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F7C876]"
                      onClick={() => setExpandedPhoto(photo)}
                    >
                      <img
                        src={photo}
                        alt={`${selectedJob.title} photo ${index + 1}`}
                        className="h-36 w-full object-cover transition-opacity group-hover:opacity-90"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                        <Maximize2 className="h-5 w-5 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedJob?.providerQuote && (
              <div className="rounded-lg border border-[#F7C876]/40 bg-[#FDEFD6]/60 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">
                    {t("jobBoard.yourQuote")}
                  </h4>
                  {selectedJob.providerQuote.status && (
                    <Badge className="bg-white text-[#F1A400] border-[#F7C876]">
                      {selectedJob.providerQuote.status}
                    </Badge>
                  )}
                </div>
                <div className="grid gap-2 text-sm text-gray-700">
                  <div>
                    <span className="font-medium">
                      {t("jobBoard.amount")}:{" "}
                    </span>{" "}
                    {selectedJob.providerQuote.amount != null
                      ? `$${selectedJob.providerQuote.amount}`
                      : t("jobBoard.notSpecified")}
                  </div>
                  <div>
                    <span className="font-medium">
                      {t("jobBoard.timeline")}:{" "}
                    </span>{" "}
                    {selectedJob.providerQuote.estimatedDuration ||
                      t("jobBoard.notSpecified")}
                  </div>
                  {selectedJob.providerQuote.createdAt && (
                    <div>
                      <span className="font-medium">
                        {t("jobBoard.submitted")}:{" "}
                      </span>{" "}
                      {formatDate(
                        selectedJob.providerQuote.createdAt,
                        i18n.language,
                      )}
                    </div>
                  )}
                  {selectedJob.providerQuote.message && (
                    <div>
                      <span className="font-medium">
                        {t("jobBoard.message")}:{" "}
                      </span>
                      <p className="mt-1 whitespace-pre-line">
                        {selectedJob.providerQuote.message}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {!selectedJob?.hasQuoted && (
            <div className=" pt-4 px-6 pb-6">
              <Button
                className="w-full bg-[#F7C876] hover:bg-[#EFA055]"
                onClick={() => {
                  setShowDetailsSheet(false);
                  setShowQuoteDialog(true);
                }}
              >
                <Send className="mr-2 h-4 w-4" />
                {t("jobBoard.submitQuote")}
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Photo lightbox */}
      <Dialog
        open={expandedPhoto !== null}
        onOpenChange={() => setExpandedPhoto(null)}
      >
        <DialogContent className="max-w-5xl border-0 bg-black/95 p-2">
          {expandedPhoto && (
            <img
              src={expandedPhoto}
              alt={t("jobBoard.expandedPhotoAlt")}
              className="max-h-[85vh] w-full rounded object-contain"
            />
          )}
        </DialogContent>
      </Dialog>

      {filteredJobs.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">{t("jobBoard.noJobsInCategory")}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return content;
}
