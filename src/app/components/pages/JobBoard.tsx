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

type Job = ProviderJob;

const formatDate = (dateString?: string | null) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
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
      setErrorMessage("You must be signed in to submit a quote.");
      return;
    }

    if (selectedJob.hasQuoted) {
      setErrorMessage("You have already submitted a quote for this job.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const amountValue = Number.parseFloat(quoteData.amount);
      if (Number.isNaN(amountValue)) {
        setErrorMessage("Please enter a valid quote amount.");
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
      toast.success(
        "Quote submitted! The client will review and may message you.",
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to submit quote.";
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
      <PageHeader title="Job Board" hideBack />
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredJobs.length} jobs
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
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
          All Types
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
          Fixed
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
          Hourly
        </Button>
      </div>

      <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <SheetContent side="right" className="w-full sm:max-w-sm">
          <SheetHeader>
            <SheetTitle>Filter Jobs</SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-6 px-4">
            <div>
              <Label className="text-sm">Category</Label>
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
                      ? `All Jobs (${jobs.length})`
                      : (slugToName.get(slug) ?? slug)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date-filter">Date</Label>
                <select
                  id="date-filter"
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  value={dateFilter}
                  onChange={(event) =>
                    setDateFilter(event.target.value as typeof dateFilter)
                  }
                >
                  <option value="all">All time</option>
                  <option value="last7">Last 7 days</option>
                  <option value="last30">Last 30 days</option>
                  <option value="last90">Last 90 days</option>
                </select>
              </div>
              <div>
                <Label htmlFor="sort-filter">Sort by</Label>
                <select
                  id="sort-filter"
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  value={sortByDate}
                  onChange={(event) =>
                    setSortByDate(event.target.value as typeof sortByDate)
                  }
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                </select>
              </div>
              <div>
                <Label htmlFor="urgency-filter">Urgency</Label>
                <select
                  id="urgency-filter"
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  value={urgencyFilter}
                  onChange={(event) =>
                    setUrgencyFilter(event.target.value as typeof urgencyFilter)
                  }
                >
                  <option value="all">All</option>
                  <option value="urgent">Urgent</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount-min">Min amount</Label>
                <Input
                  id="amount-min"
                  type="number"
                  placeholder="0"
                  className="mt-1"
                  value={amountMin}
                  onChange={(event) => setAmountMin(event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="amount-max">Max amount</Label>
                <Input
                  id="amount-max"
                  type="number"
                  placeholder="1000"
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
              Clear filters
            </Button>
            <Button
              className="w-full bg-[#F7C876] hover:bg-[#EFA055]"
              onClick={() => setIsFilterOpen(false)}
            >
              Apply Filters
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Job Listings */}
      <div className="space-y-4">
        {(errorMessage || error) && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage ??
              (error instanceof Error ? error.message : "Failed to load jobs.")}
          </div>
        )}

        {isLoading && (
          <Card className="border border-gray-200/80 animate-pulse">
            <CardContent className="py-12 text-center text-gray-600">
              Loading jobs...
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
                            Urgent
                          </Badge>
                        )}
                        <span className="text-xs text-gray-500">
                          {formatDate(job.postedAt ?? job.postedDate)}
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
                        {job.budgetType === "fixed" ? "Fixed" : "Per hour"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      {formatLocation(job.location) || "Location not provided"}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4 text-gray-400" />
                      {job.quotesCount}{" "}
                      {job.quotesCount === 1 ? "quote" : "quotes"}
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
                        {job.hasQuoted ? "Quote Submitted" : "Submit Quote"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Submit Your Quote</DialogTitle>
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
                            <span>Client's Budget: ${selectedJob?.budget}</span>
                            <span>•</span>
                            <span>
                              {formatLocation(selectedJob?.location) ||
                                "Location not provided"}
                            </span>
                          </div>
                        </div>

                        {/* Quote Form */}
                        <div>
                          <Label htmlFor="amount">
                            Your Quote Amount{" "}
                            <span className="text-red-600">*</span>
                          </Label>
                          <div className="relative mt-1">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="amount"
                              type="number"
                              placeholder="Enter your price"
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
                            Be competitive but fair. Commission:{" "}
                            {parseFloat(quoteData.amount || "0") > 500
                              ? "3.5%"
                              : "5%"}
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="timeline">
                            Estimated Timeline{" "}
                            <span className="text-red-600">*</span>
                          </Label>
                          <div className="relative mt-1">
                            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="timeline"
                              placeholder="e.g., 2-3 days, Available tomorrow"
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
                            Message to Client{" "}
                            <span className="text-red-600">*</span>
                          </Label>
                          <Textarea
                            id="message"
                            placeholder="Introduce yourself, explain your approach, mention relevant experience..."
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
                            💡 <strong>Tip:</strong> Include details about your
                            experience with similar jobs and why you're the best
                            fit. Be professional and responsive to increase your
                            chances!
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
                            Cancel
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
                            {isSubmitting ? "Submitting..." : "Submit Quote"}
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
                    View Details
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
              Posted{" "}
              {formatDate(selectedJob?.postedAt ?? selectedJob?.postedDate)}
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
                  🔥 Urgent
                </Badge>
              )}
              <span className="text-sm text-gray-600">
                Budget: ${selectedJob?.budget} (
                {selectedJob?.budgetType === "fixed" ? "Fixed" : "Per hour"})
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 shrink-0" />
              {formatLocation(selectedJob?.location) || "Location not provided"}
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
              <p className="text-gray-700 whitespace-pre-line text-sm leading-relaxed">
                {selectedJob?.description}
              </p>
            </div>

            {selectedJob?.photos && selectedJob.photos.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Photos</h4>
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
                  <h4 className="font-semibold text-gray-900">Your Quote</h4>
                  {selectedJob.providerQuote.status && (
                    <Badge className="bg-white text-[#F1A400] border-[#F7C876]">
                      {selectedJob.providerQuote.status}
                    </Badge>
                  )}
                </div>
                <div className="grid gap-2 text-sm text-gray-700">
                  <div>
                    <span className="font-medium">Amount:</span>{" "}
                    {selectedJob.providerQuote.amount != null
                      ? `$${selectedJob.providerQuote.amount}`
                      : "Not specified"}
                  </div>
                  <div>
                    <span className="font-medium">Timeline:</span>{" "}
                    {selectedJob.providerQuote.estimatedDuration ||
                      "Not specified"}
                  </div>
                  {selectedJob.providerQuote.createdAt && (
                    <div>
                      <span className="font-medium">Submitted:</span>{" "}
                      {formatDate(selectedJob.providerQuote.createdAt)}
                    </div>
                  )}
                  {selectedJob.providerQuote.message && (
                    <div>
                      <span className="font-medium">Message:</span>
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
                Submit Quote
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
              alt="Expanded photo"
              className="max-h-[85vh] w-full rounded object-contain"
            />
          )}
        </DialogContent>
      </Dialog>

      {filteredJobs.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No jobs found in this category</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return content;
}
