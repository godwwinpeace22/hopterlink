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
import { Textarea } from "../ui/textarea";
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Clock,
  MessageSquare,
  Star,
  CheckCircle,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface MyJobsProps {
  embedded?: boolean;
}

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

export function MyJobs({ embedded = false }: MyJobsProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [messageText, setMessageText] = useState("");
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Quote | null>(null);
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
    [user?.id],
  );

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleAcceptQuote = async (job: Job, quote: Quote) => {
    if (!user?.id) {
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
        .eq("id", job.id);

      if (jobError) {
        throw jobError;
      }

      const amountValue = Number.parseFloat(quote.amount);

      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          client_id: user.id,
          provider_id: quote.providerId,
          job_id: job.id,
          quote_id: quote.id,
          service_type: job.category,
          description: job.description,
          scheduled_date: new Date().toISOString(),
          amount: Number.isNaN(amountValue) ? 0 : amountValue,
          status: "confirmed",
          payment_status: "pending",
          location: {
            address: job.location,
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
        related_id: bookingId ?? job.id,
      });

      await supabase.from("notifications").insert({
        user_id: quote.providerId,
        type: "booking_confirmed",
        title: "Booking created",
        message: `A booking was created for ${job.title}.`,
        related_id: bookingId ?? job.id,
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

      await fetchJobs(true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to accept quote.";
      setErrorMessage(message);
    }
  };

  const handleSendMessage = async () => {
    if (!user?.id || !selectedProvider?.providerId || !selectedJob?.id) {
      setErrorMessage("Unable to send message. Please try again.");
      return;
    }

    if (!messageText.trim()) {
      return;
    }

    try {
      const { error } = await supabase.from("messages").insert({
        sender_id: user.id,
        recipient_id: selectedProvider.providerId,
        job_id: selectedJob.id,
        message_type: "text",
        content: messageText.trim(),
      });

      if (error) {
        throw error;
      }

      await supabase.from("notifications").insert({
        user_id: selectedProvider.providerId,
        type: "message_received",
        title: "New message received",
        message:
          messageText.trim().length > 120
            ? `${messageText.trim().slice(0, 120)}...`
            : messageText.trim(),
        related_id: selectedJob.id,
      });

      setShowMessageDialog(false);
      setMessageText("");
      alert("Message sent! The provider will respond soon.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to send message.";
      setErrorMessage(message);
    }
  };

  const content = (
    <>
      {!embedded ? (
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => navigate("/dashboard/client")}
              className="flex items-center gap-2 text-gray-600 hover:text-[#F7C876] transition-colors mb-2"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold">My Posted Jobs</h1>
            <p className="text-gray-600">
              View and manage your job posts and quotes
            </p>
          </div>
          <Button
            className="cursor-pointerbg-[#EFA055]"
            onClick={() => navigate("/dashboard/client/post-job")}
          >
            + Post New Job
          </Button>
        </div>
      ) : (
        <div className="flex justify-end mb-4">
          <Button
            className="cursor-pointer text-black bg-[#F7C876] hover:bg-[#EFA055]"
            onClick={() => navigate("/dashboard/client/post-job")}
            size="sm"
          >
            + Post New Job
          </Button>
        </div>
      )}

      <div className="space-y-6">
        {errorMessage && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {isLoading && (
          <Card className="border border-gray-200/80 animate-pulse">
            <CardContent className="py-10 text-center text-gray-600">
              Loading jobs...
            </CardContent>
          </Card>
        )}

        {!isLoading && jobs.length === 0 && (
          <Card className="border border-gray-200/80">
            <CardContent className="py-10 text-center text-gray-600">
              No jobs yet. Post your first job to get quotes.
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
                    <Link
                      to={`/dashboard/client/job/${job.id}`}
                      className="hover:text-[#EFA055] transition-colors"
                    >
                      {job.title}
                    </Link>
                  </CardTitle>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge className="bg-[#FDEFD6] text-[#F1A400] border-[#F7C876] font-medium">
                      {job.category}
                    </Badge>
                    {job.status === "open" && (
                      <Badge className="bg-green-100 text-green-700 border-green-200 font-medium">
                        Open
                      </Badge>
                    )}
                    {job.status === "accepted" && (
                      <Badge className="bg-amber-100 text-amber-700 border-amber-200 font-medium">
                        Accepted
                      </Badge>
                    )}
                    {job.status === "in_progress" && (
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200 font-medium">
                        In progress
                      </Badge>
                    )}
                    {job.status === "completed" && (
                      <Badge className="bg-gray-100 text-gray-700 border-gray-200 font-medium">
                        Completed
                      </Badge>
                    )}
                    <span className="text-sm text-gray-500">
                      Posted {job.postedDate}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#F1A400]">
                    {job.quotesReceived.length}
                  </div>
                  <div className="text-sm text-gray-500">
                    {job.quotesReceived.length === 1 ? "Quote" : "Quotes"}
                  </div>
                  <Button asChild variant="outline" size="sm" className="mt-3">
                    <Link to={`/dashboard/client/job/${job.id}`}>
                      View Details
                    </Link>
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
                  Budget: ${job.budget}
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

  if (embedded) {
    return <div className="space-y-6">{content}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">{content}</div>
    </div>
  );
}
