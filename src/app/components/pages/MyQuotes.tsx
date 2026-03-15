import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  ArrowLeft,
  DollarSign,
  Clock,
  MapPin,
  MessageSquare,
  CheckCircle,
  XCircle,
  Hourglass,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@/lib/router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface MyQuotesProps {}

interface Quote {
  id: string;
  jobId: string;
  jobTitle: string;
  jobDescription: string;
  clientId: string;
  clientName: string;
  clientBudget: string;
  location: string;
  myQuoteAmount: string;
  myTimeline: string;
  myMessage: string;
  submittedDate: string;
  status: "pending" | "accepted" | "rejected" | "client_messaged";
  category: string;
  totalQuotes: number;
}

const formatDate = (dateString?: string | null) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString();
};

export function MyQuotes({}: MyQuotesProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<
    "all" | "pending" | "accepted" | "rejected"
  >("all");
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setQuotes([]);
      return;
    }

    const fetchQuotes = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      const { data, error } = await supabase
        .from("quotes")
        .select(
          `
          id,
          job_id,
          amount,
          estimated_duration,
          message,
          created_at,
          status,
          job:jobs (
            title,
            description,
            category,
            location,
            budget_min,
            budget_max,
            quotes_count,
            client:profiles!jobs_client_id_fkey (
              id,
              full_name
            )
          )
        `,
        )
        .eq("provider_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      const mappedQuotes: Quote[] = (data ?? []).map((quote) => {
        const job = Array.isArray(quote.job) ? quote.job[0] : quote.job;
        const budgetMin = job?.budget_min ?? null;
        const budgetMax = job?.budget_max ?? null;
        const clientBudget =
          budgetMin && budgetMax
            ? `${budgetMin}-${budgetMax}`
            : budgetMin
              ? `${budgetMin}`
              : budgetMax
                ? `${budgetMax}`
                : "";
        const locationValue =
          job?.location?.address ?? job?.location?.city ?? "";
        const status =
          quote.status === "accepted"
            ? "accepted"
            : quote.status === "rejected"
              ? "rejected"
              : quote.status === "client_messaged"
                ? "client_messaged"
                : "pending";

        const jobClient = Array.isArray(job?.client)
          ? job?.client[0]
          : job?.client;

        return {
          id: quote.id,
          jobId: quote.job_id,
          jobTitle: job?.title ?? "Job",
          jobDescription: job?.description ?? "",
          clientId: jobClient?.id ?? "",
          clientName: jobClient?.full_name ?? "Client",
          clientBudget,
          location: locationValue,
          myQuoteAmount: quote.amount?.toString?.() ?? `${quote.amount ?? ""}`,
          myTimeline: quote.estimated_duration ?? "Flexible",
          myMessage: quote.message ?? "",
          submittedDate: formatDate(quote.created_at),
          status,
          category: job?.category ?? "",
          totalQuotes: job?.quotes_count ?? 0,
        };
      });

      setQuotes(mappedQuotes);
      setIsLoading(false);
    };

    fetchQuotes();
  }, [user?.id]);

  const getStatusBadge = (status: Quote["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">
            <Hourglass className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "accepted":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Accepted
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-300">
            <XCircle className="h-3 w-3 mr-1" />
            Not Selected
          </Badge>
        );
      case "client_messaged":
        return (
          <Badge className="bg-[#FDEFD6] text-[#F1A400] border-[#F7C876]">
            <MessageSquare className="h-3 w-3 mr-1" />
            Client Messaged
          </Badge>
        );
    }
  };

  const filteredQuotes = useMemo(
    () =>
      selectedTab === "all"
        ? quotes
        : quotes.filter((q) => q.status === selectedTab),
    [quotes, selectedTab],
  );

  const pendingCount = useMemo(
    () => quotes.filter((q) => q.status === "pending").length,
    [quotes],
  );
  const acceptedCount = useMemo(
    () => quotes.filter((q) => q.status === "accepted").length,
    [quotes],
  );
  const rejectedCount = useMemo(
    () => quotes.filter((q) => q.status === "rejected").length,
    [quotes],
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => navigate("/dashboard/provider")}
              className="flex items-center gap-2 text-gray-600 hover:text-[#F7C876] transition-colors mb-2"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold">My Submitted Quotes</h1>
            <p className="text-gray-600">
              Track and manage all your job quotes
            </p>
          </div>
          <Button
            className="bg-[#F7C876] hover:bg-[#EFA055]"
            onClick={() => navigate("/dashboard/provider/job-board")}
          >
            Browse More Jobs
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {errorMessage && (
            <Card className="md:col-span-4">
              <CardContent className="pt-6">
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">
                  {quotes.length}
                </p>
                <p className="text-sm text-gray-600 mt-1">Total Quotes</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-600">
                  {pendingCount}
                </p>
                <p className="text-sm text-gray-600 mt-1">Pending</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">
                  {acceptedCount}
                </p>
                <p className="text-sm text-gray-600 mt-1">Accepted</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">
                  {rejectedCount}
                </p>
                <p className="text-sm text-gray-600 mt-1">Not Selected</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Card>
          <CardContent className="pt-6">
            <Tabs
              value={selectedTab}
              onValueChange={(v) => setSelectedTab(v as any)}
            >
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="all">All ({quotes.length})</TabsTrigger>
                <TabsTrigger value="pending">
                  Pending ({pendingCount})
                </TabsTrigger>
                <TabsTrigger value="accepted">
                  Accepted ({acceptedCount})
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  Not Selected ({rejectedCount})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={selectedTab} className="space-y-4">
                {isLoading && (
                  <Card>
                    <CardContent className="py-12 text-center text-gray-600">
                      Loading quotes...
                    </CardContent>
                  </Card>
                )}
                {filteredQuotes.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">
                      No quotes in this category
                    </p>
                    <Button
                      className="bg-[#F7C876] hover:bg-[#EFA055]"
                      onClick={() => navigate("/dashboard/provider/job-board")}
                    >
                      Browse Available Jobs
                    </Button>
                  </div>
                ) : (
                  filteredQuotes.map((quote) => (
                    <Card
                      key={quote.id}
                      className="border-2 hover:shadow-lg transition-shadow"
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                  {quote.jobTitle}
                                </h3>
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <Badge className="bg-[#FDEFD6] text-[#F1A400] border-[#F7C876]">
                                    {quote.category}
                                  </Badge>
                                  {getStatusBadge(quote.status)}
                                  <span className="text-sm text-gray-500">
                                    • {quote.submittedDate}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-[#F1A400]">
                                  ${quote.myQuoteAmount}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Your quote
                                </div>
                              </div>
                            </div>

                            {/* Job Details */}
                            <p className="text-gray-600 mb-3">
                              {quote.jobDescription}
                            </p>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                              <div className="flex items-center gap-1">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs bg-gray-200">
                                    {quote.clientName.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                {quote.clientId ? (
                                  <Link
                                    to={`/dashboard/provider/profile/${quote.clientId}`}
                                    className="text-[#F1A400] hover:underline"
                                  >
                                    {quote.clientName}
                                  </Link>
                                ) : (
                                  <span>{quote.clientName}</span>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                Client Budget: ${quote.clientBudget}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {quote.location}
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageSquare className="h-4 w-4" />
                                {quote.totalQuotes} total quotes
                              </div>
                            </div>

                            {/* Your Quote Details */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                              <h4 className="font-semibold text-gray-900 mb-2">
                                Your Quote Details:
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-gray-400" />
                                  <span className="text-gray-700">
                                    <strong>Timeline:</strong>{" "}
                                    {quote.myTimeline}
                                  </span>
                                </div>
                                <p className="text-gray-700 mt-2">
                                  <strong>Message:</strong> {quote.myMessage}
                                </p>
                              </div>
                            </div>

                            {/* Status-specific Messages */}
                            {quote.status === "pending" && (
                              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                                <p className="text-sm text-yellow-800">
                                  ⏳{" "}
                                  <strong>Waiting for client response.</strong>{" "}
                                  The client is reviewing all quotes. You'll be
                                  notified if they message you or accept your
                                  quote.
                                </p>
                              </div>
                            )}

                            {quote.status === "client_messaged" && (
                              <div className="bg-[#FDEFD6] border border-[#F7C876] rounded-lg p-3 mb-3">
                                <p className="text-sm text-[#F1A400]">
                                  💬 <strong>Client reached out.</strong>{" "}
                                  Messaging unlocks after a quote is accepted.
                                </p>
                              </div>
                            )}

                            {quote.status === "accepted" && (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                                <p className="text-sm text-green-800">
                                  🎉{" "}
                                  <strong>
                                    Congratulations! Your quote was accepted.
                                  </strong>{" "}
                                  The client has funded the job. You can now
                                  start work. Check your active jobs.
                                </p>
                              </div>
                            )}

                            {quote.status === "rejected" && (
                              <div className="bg-gray-100 border border-gray-200 rounded-lg p-3 mb-3">
                                <p className="text-sm text-gray-700">
                                  The client selected another provider for this
                                  job. Keep bidding on more jobs!
                                </p>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              {quote.status === "pending" && (
                                <>
                                  <Button variant="outline" size="sm">
                                    Edit Quote
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    Withdraw Quote
                                  </Button>
                                </>
                              )}

                              {quote.status === "client_messaged" && (
                                <Button variant="outline" size="sm" disabled>
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  Messaging locked
                                </Button>
                              )}

                              {quote.status === "accepted" && (
                                <Button
                                  className="bg-green-600 hover:bg-green-700"
                                  size="sm"
                                  onClick={() =>
                                    navigate("/dashboard/provider")
                                  }
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Go to Active Job
                                </Button>
                              )}

                              <Button variant="ghost" size="sm">
                                View Full Job Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
