import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "../ui/button";
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
  ArrowLeft,
  Calendar,
  DollarSign,
  MapPin,
  Pencil,
  Save,
  X,
  MessageSquare,
  Star,
  CheckCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface JobDetailsProps {
  embedded?: boolean;
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

const formatDate = (dateString?: string | null) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString();
};

const getLocationLabel = (location: unknown) => {
  if (location && typeof location === "object") {
    const address = (location as { address?: string }).address;
    const city = (location as { city?: string }).city;
    return address ?? city ?? "";
  }
  return "";
};

export function JobDetails({
  embedded = false,
  jobId: propJobId,
}: JobDetailsProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
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
        providerName: provider?.full_name ?? "Service Provider",
        providerRating: providerProfile?.rating ?? 0,
        providerJobs: providerProfile?.jobs_completed ?? 0,
        amount: quote.amount?.toString?.() ?? `${quote.amount ?? ""}`,
        timeline: quote.estimated_duration ?? "Flexible",
        message: quote.message ?? "",
        submittedDate: formatDate(quote.created_at),
        status: (quote.status ?? "pending") as Quote["status"],
      };
    });

    setQuotes(mappedQuotes);
    setQuotesLoading(false);
  }, [jobId, user?.id]);

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
      setErrorMessage("You must be signed in to edit this job.");
      return;
    }

    if (!isEditable) {
      setErrorMessage("This job can no longer be edited.");
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
        error instanceof Error ? error.message : "Failed to update job.";
      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAcceptQuote = async (quote: Quote) => {
    if (!user?.id || !jobId || !job) {
      setErrorMessage("You must be signed in to accept a quote.");
      return;
    }

    try {
      const acceptedAt = new Date().toISOString();

      const { error: quoteError } = await supabase
        .from("quotes")
        .update({ status: "accepted", accepted_at: acceptedAt })
        .eq("id", quote.id);

      if (quoteError) {
        throw quoteError;
      }

      const { error: jobError } = await supabase
        .from("jobs")
        .update({ status: "accepted" })
        .eq("id", jobId);

      if (jobError) {
        throw jobError;
      }

      const amountValue = Number.parseFloat(quote.amount);
      const locationLabel = getLocationLabel(job.location);

      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          client_id: user.id,
          provider_id: quote.providerId,
          job_id: jobId,
          quote_id: quote.id,
          service_type: job.category,
          description: job.description,
          scheduled_date: new Date().toISOString(),
          amount: Number.isNaN(amountValue) ? 0 : amountValue,
          status: "confirmed",
          payment_status: "pending",
          location: {
            address: locationLabel,
          },
        })
        .select("id")
        .single();

      if (bookingError) {
        throw bookingError;
      }

      const bookingId = bookingData?.id ?? null;
      const escrowAmount = Number.isNaN(amountValue) ? 0 : amountValue;
      const platformFee = Number((escrowAmount * 0.1).toFixed(2));
      const providerAmount = Number((escrowAmount - platformFee).toFixed(2));

      if (bookingId) {
        const { error: escrowError } = await supabase
          .from("escrow_payments")
          .insert({
            booking_id: bookingId,
            client_id: user.id,
            provider_id: quote.providerId,
            amount: escrowAmount,
            platform_fee: platformFee,
            provider_amount: providerAmount,
            status: "pending",
            held_at: new Date().toISOString(),
          });

        if (escrowError) {
          throw escrowError;
        }
      }

      await supabase.from("notifications").insert({
        user_id: quote.providerId,
        type: "quote_accepted",
        title: "Quote accepted",
        message: `Your quote for ${job.title} was accepted.`,
        related_id: bookingId ?? jobId,
      });

      await supabase.from("notifications").insert({
        user_id: quote.providerId,
        type: "booking_confirmed",
        title: "Booking created",
        message: `A booking was created for ${job.title}.`,
        related_id: bookingId ?? jobId,
      });

      if (bookingId) {
        await supabase.from("notifications").insert({
          user_id: user.id,
          type: "payment_released",
          title: "Escrow created",
          message: `Escrow is holding $${escrowAmount.toFixed(2)} for ${job.title}.`,
          related_id: bookingId,
        });
      }

      await Promise.all([fetchJob(), fetchQuotes()]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to accept quote.";
      setErrorMessage(message);
    }
  };

  const handleSendMessage = async () => {
    if (!user?.id || !selectedQuote?.providerId || !jobId) {
      setErrorMessage("Unable to send message. Please try again.");
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

      await supabase.from("notifications").insert({
        user_id: selectedQuote.providerId,
        type: "message_received",
        title: "New message received",
        message:
          messageText.trim().length > 120
            ? `${messageText.trim().slice(0, 120)}...`
            : messageText.trim(),
        related_id: jobId,
      });

      setShowMessageDialog(false);
      setMessageText("");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to send message.";
      setErrorMessage(message);
    }
  };

  if (isLoading) {
    return (
      <div className={embedded ? "" : "min-h-screen bg-gray-50 py-8 px-4"}>
        <div
          className={
            embedded ? "text-gray-600" : "max-w-4xl mx-auto text-gray-600"
          }
        >
          Loading job...
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className={embedded ? "" : "min-h-screen bg-gray-50 py-8 px-4"}>
        <div className={embedded ? "" : "max-w-4xl mx-auto"}>
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage ?? "Job not found."}
          </div>
          <div className="mt-6">
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard/client/my-jobs")}
            >
              Back to My Jobs
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

  const content = (
    <div className={embedded ? "space-y-6" : "max-w-4xl mx-auto space-y-6"}>
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/dashboard/client/my-jobs")}
          className="flex items-center gap-2 text-gray-600 hover:text-[#F7C876] transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to My Jobs
        </button>
        {!isEditing && (
          <Button
            variant="outline"
            onClick={() => setIsEditing(true)}
            disabled={!isEditable}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit Job
          </Button>
        )}
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {!isEditable && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          This job can no longer be edited because it has been accepted or is in
          progress.
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{job.title}</CardTitle>
          <p className="text-gray-600">Job details and status</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-semibold text-gray-900 capitalize">
                {displayStatus.replace("_", " ")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Posted</p>
              <p className="font-semibold text-gray-900">
                {formatDate(job.created_at)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Budget</p>
              <p className="font-semibold text-gray-900">{budgetDisplay}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-semibold text-gray-900">
                {getLocationLabel(job.location)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Urgency</p>
              <p className="font-semibold text-gray-900 capitalize">
                {job.urgency ?? "Flexible"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Preferred Date</p>
              <p className="font-semibold text-gray-900">
                {formatDate(job.preferred_date)}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-2">Description</p>
            <p className="text-gray-700 whitespace-pre-wrap">
              {job.description}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quotes</CardTitle>
          <p className="text-gray-600">Review provider offers for this job</p>
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
                Loading quotes...
              </CardContent>
            </Card>
          )}

          {!quotesLoading && quotes.length === 0 && (
            <Card className="border border-dashed border-[#F7C876]/60 bg-[#FDEFD6]/30">
              <CardContent className="py-8 text-center text-gray-600">
                No quotes yet. Providers will respond soon.
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
                                      to={`/dashboard/client/profile/${quote.providerId}`}
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
                                    {quote.providerJobs} jobs completed
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-[#F1A400]">
                                  ${quote.amount}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Commission:{" "}
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
                                • Submitted {quote.submittedDate}
                              </span>
                            </div>

                            <p className="text-gray-700 text-sm mb-4 bg-[#FDEFD6]/50 rounded-lg p-3">
                              {quote.message}
                            </p>

                            <div className="flex gap-2 flex-wrap">
                              {quote.status === "accepted" && (
                                <Badge className="bg-green-100 text-green-700 border-green-200 font-medium">
                                  Accepted
                                </Badge>
                              )}
                              {canAccept && (
                                <Button
                                  className="bg-[#F7C876] hover:bg-[#EFA055] shadow-sm"
                                  onClick={() => handleAcceptQuote(quote)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Accept Quote
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
                                      Message Provider
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>
                                        Message {quote.providerName}
                                      </DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 mt-4">
                                      <Textarea
                                        placeholder="Type your message here..."
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
                                          Cancel
                                        </Button>
                                        <Button
                                          className="flex-1 bg-[#F7C876] hover:bg-[#EFA055]"
                                          onClick={handleSendMessage}
                                          disabled={!messageText.trim()}
                                        >
                                          Send Message
                                        </Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              )}

                              <Button asChild variant="ghost" size="sm">
                                <Link
                                  to={`/dashboard/client/profile/${quote.providerId}`}
                                >
                                  View Profile
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

      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Job</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <Label htmlFor="title">
                  Job Title <span className="text-red-600">*</span>
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
                <Label htmlFor="category">
                  Service Category <span className="text-red-600">*</span>
                </Label>
                <select
                  id="category"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={formState.category}
                  onChange={(event) =>
                    setFormState({
                      ...formState,
                      category: event.target.value,
                    })
                  }
                  required
                >
                  <option value="">Select a category</option>
                  <option value="snow-clearing">Snow Clearing</option>
                  <option value="landscaping">Landscaping</option>
                  <option value="cleaning">Cleaning Services</option>
                  <option value="handyman">Handyman</option>
                  <option value="painting">Painting</option>
                  <option value="auto">Auto Services</option>
                  <option value="childcare">Childcare</option>
                  <option value="tutoring">Tutoring</option>
                  <option value="moving">Moving Help</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <Label htmlFor="description">
                  Job Description <span className="text-red-600">*</span>
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
                  rows={6}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budgetType">Budget Type</Label>
                  <select
                    id="budgetType"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={formState.budgetType}
                    onChange={(event) =>
                      setFormState({
                        ...formState,
                        budgetType: event.target.value as "fixed" | "hourly",
                      })
                    }
                  >
                    <option value="fixed">Fixed Price</option>
                    <option value="hourly">Hourly Rate</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="budget">
                    Estimated Budget <span className="text-red-600">*</span>
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
                <Label htmlFor="location">
                  Job Location <span className="text-red-600">*</span>
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
                  <Label htmlFor="urgency">Urgency Level</Label>
                  <select
                    id="urgency"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={formState.urgency}
                    onChange={(event) =>
                      setFormState({
                        ...formState,
                        urgency: event.target.value as "urgent" | "flexible",
                      })
                    }
                  >
                    <option value="flexible">Flexible Timeline</option>
                    <option value="urgent">Urgent (ASAP)</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="preferredDate">Preferred Start Date</Label>
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

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsEditing(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#F7C876] hover:bg-[#EFA055]"
                  disabled={isSaving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );

  if (embedded) {
    return content;
  }

  return <div className="min-h-screen bg-gray-50 py-8 px-4">{content}</div>;
}
