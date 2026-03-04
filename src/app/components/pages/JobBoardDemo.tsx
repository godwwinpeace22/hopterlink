import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  MessageSquare,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  JobBiddingGate,
  JobCardLockBadge,
} from "../verification/JobBiddingGate";
import { ProviderVerificationStatus } from "@/app/config/verificationConfig";
import { Alert, AlertDescription } from "../ui/alert";

interface JobBoardDemoProps {}

interface Job {
  id: string;
  title: string;
  category: string;
  description: string;
  budget: string;
  budgetType: "fixed" | "hourly";
  location: string;
  urgency: "urgent" | "flexible";
  postedDate: string;
  clientName: string;
  quotesCount: number;
}

const mockJobs: Job[] = [
  // Low risk - can bid
  {
    id: "1",
    title: "Need landscaping for backyard",
    category: "Landscaping",
    description:
      "Looking for someone to clean up my backyard, remove weeds, trim hedges, and plant some flowers. Approximately 500 sq ft area.",
    budget: "300-500",
    budgetType: "fixed",
    location: "Toronto, ON",
    urgency: "flexible",
    postedDate: "2 hours ago",
    clientName: "Sarah M.",
    quotesCount: 3,
  },
  // Medium risk - missing insurance
  {
    id: "2",
    title: "Weekly house cleaning service",
    category: "Cleaning Services",
    description:
      "Looking for reliable weekly house cleaning. 2-bedroom condo, approximately 900 sq ft. Prefer same person each week.",
    budget: "25-35",
    budgetType: "hourly",
    location: "Calgary, AB",
    urgency: "flexible",
    postedDate: "1 day ago",
    clientName: "David L.",
    quotesCount: 12,
  },
  // High risk - missing license and insurance
  {
    id: "3",
    title: "Panel upgrade and rewiring - Electrical",
    category: "Electrical",
    description:
      "Need 200amp panel upgrade in basement. Old panel is outdated. Also need rewiring in 3 rooms. Must be licensed electrician.",
    budget: "2500-3500",
    budgetType: "fixed",
    location: "Toronto, ON",
    urgency: "urgent",
    postedDate: "3 hours ago",
    clientName: "Michael R.",
    quotesCount: 5,
  },
  // High risk - missing license
  {
    id: "4",
    title: "Kitchen and bathroom plumbing renovation",
    category: "Plumbing",
    description:
      "Full kitchen and bathroom plumbing renovation. New fixtures, pipes, and drains. Licensed plumber required.",
    budget: "4500",
    budgetType: "fixed",
    location: "Vancouver, BC",
    urgency: "flexible",
    postedDate: "5 hours ago",
    clientName: "Jennifer K.",
    quotesCount: 2,
  },
  // Sensitive category - missing multiple verifications
  {
    id: "5",
    title: "After-school childcare needed",
    category: "Childcare",
    description:
      "Need reliable after-school care for two children (ages 6 and 8). Monday to Friday, 3pm-6pm. Must have references and background check.",
    budget: "20-25",
    budgetType: "hourly",
    location: "Mississauga, ON",
    urgency: "urgent",
    postedDate: "1 hour ago",
    clientName: "Amanda T.",
    quotesCount: 8,
  },
  // Can bid
  {
    id: "6",
    title: "Interior painting - 3 bedrooms",
    category: "Painting",
    description:
      "Need 3 bedrooms painted. Walls are in good condition, just need fresh color. Paint will be provided by me.",
    budget: "1200",
    budgetType: "fixed",
    location: "Ottawa, ON",
    urgency: "flexible",
    postedDate: "4 hours ago",
    clientName: "Robert D.",
    quotesCount: 7,
  },
];

export function JobBoardDemo({}: JobBoardDemoProps) {
  const navigate = useNavigate();
  // Mock provider verification status - partially verified
  // Can bid on low-medium risk jobs, but not high risk or sensitive
  const [providerStatus] = useState<ProviderVerificationStatus>({
    email: "approved",
    phone: "approved",
    identity: "approved",
    background: "approved",
    insurance: "not_started", // Missing!
    license: "not_started", // Missing!
    vulnerable_sector: "not_started", // Missing for sensitive jobs
  });

  const [filter, setFilter] = useState("all");

  const filteredJobs =
    filter === "all"
      ? mockJobs
      : mockJobs.filter(
          (job) => job.category.toLowerCase() === filter.toLowerCase(),
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
            <h1 className="text-3xl font-bold">
              Available Jobs (Verification Demo)
            </h1>
            <p className="text-gray-600">
              Browse jobs - some require additional verification
            </p>
          </div>
        </div>

        {/* Provider Status Alert */}
        <Alert className="mb-6 border-[#F7C876] bg-[#FDEFD6]">
          <Shield className="h-5 w-5 text-[#F1A400]" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-[#2B2B2B]">
                  Your Verification Status
                </p>
                <p className="text-sm text-gray-700">
                  ✓ Email, Phone, Identity, Background Check • ✗ Insurance,
                  Trade Licenses • Some jobs require additional verification
                </p>
              </div>
              <Button
                size="sm"
                className="bg-[#F1A400] hover:bg-[#EFA055]"
                onClick={() => navigate("/provider/verification")}
              >
                Complete Verification
              </Button>
            </div>
          </AlertDescription>
        </Alert>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                className={
                  filter === "all" ? "bg-[#F7C876] hover:bg-[#EFA055]" : ""
                }
                onClick={() => setFilter("all")}
              >
                All Jobs ({mockJobs.length})
              </Button>
              <Button
                variant={filter === "landscaping" ? "default" : "outline"}
                className={
                  filter === "landscaping"
                    ? "bg-[#F7C876] hover:bg-[#EFA055]"
                    : ""
                }
                onClick={() => setFilter("landscaping")}
              >
                Landscaping
              </Button>
              <Button
                variant={filter === "cleaning services" ? "default" : "outline"}
                className={
                  filter === "cleaning services"
                    ? "bg-[#F7C876] hover:bg-[#EFA055]"
                    : ""
                }
                onClick={() => setFilter("cleaning services")}
              >
                Cleaning
              </Button>
              <Button
                variant={filter === "electrical" ? "default" : "outline"}
                className={
                  filter === "electrical"
                    ? "bg-[#F7C876] hover:bg-[#EFA055]"
                    : ""
                }
                onClick={() => setFilter("electrical")}
              >
                Electrical 🔒
              </Button>
              <Button
                variant={filter === "plumbing" ? "default" : "outline"}
                className={
                  filter === "plumbing" ? "bg-[#F7C876] hover:bg-[#EFA055]" : ""
                }
                onClick={() => setFilter("plumbing")}
              >
                Plumbing 🔒
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Job Listings */}
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <Badge className="bg-[#FDEFD6] text-[#F1A400] border-[#F7C876]">
                        {job.category}
                      </Badge>
                      {job.urgency === "urgent" && (
                        <Badge className="bg-red-100 text-red-600 border-red-300">
                          🔥 Urgent
                        </Badge>
                      )}
                      <span className="text-sm text-gray-500">
                        {job.postedDate}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-4">{job.description}</p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-semibold">${job.budget}</span>
                        <span className="text-gray-400">
                          ({job.budgetType === "fixed" ? "Fixed" : "Per hour"})
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        {job.quotesCount}{" "}
                        {job.quotesCount === 1 ? "quote" : "quotes"}
                      </div>
                    </div>
                  </div>

                  {/* Lock badge on card */}
                  <div>
                    <JobCardLockBadge
                      jobCategory={job.category}
                      providerStatus={providerStatus}
                    />
                  </div>
                </div>

                {/* Bidding Gate - shows button if can bid, or gate if can't */}
                <JobBiddingGate
                  jobCategory={job.category}
                  providerStatus={providerStatus}
                  onNavigateToVerification={() =>
                    navigate("/provider/verification")
                  }
                >
                  {/* This button only shows if provider can bid */}
                  <Button
                    className="w-full bg-[#F7C876] hover:bg-[#EFA055]"
                    onClick={() =>
                      alert(`You can bid on this ${job.category} job!`)
                    }
                  >
                    Submit Quote
                  </Button>
                </JobBiddingGate>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No jobs found in this category</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
