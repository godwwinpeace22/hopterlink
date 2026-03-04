import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { Calendar } from "../ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import {
  LayoutDashboard,
  Briefcase,
  Calendar as CalendarIcon,
  DollarSign,
  User,
  MessageSquare,
  Star,
  Settings,
  Bell,
  LogOut,
  Menu,
  Clock,
  TrendingUp,
  CheckCircle,
  Edit,
  X,
  Check,
  MapPin,
  AlertCircle,
} from "lucide-react";

interface ProviderDashboardProps {}

type DashboardSection =
  | "overview"
  | "requests"
  | "jobs"
  | "calendar"
  | "earnings"
  | "profile"
  | "messages"
  | "reviews"
  | "settings";

// Mock data
const mockProviderData = {
  name: "John Martinez",
  businessName: "Martinez Handyman Services",
  email: "john@martinezhandyman.com",
  phone: "(555) 123-4567",
  rating: 4.8,
  totalReviews: 127,
  completedJobs: 234,
  activeJobs: 3,
  pendingRequests: 5,
  earnings: {
    thisMonth: 3250,
    lastMonth: 2890,
    total: 45780,
    pending: 850,
  },
  services: ["Plumbing", "Electrical", "Carpentry", "Painting"],
  avatar: "",
  bio: "Professional handyman with 15+ years of experience. Specializing in residential repairs and home improvements.",
};

// Job Requests from clients
const mockJobRequests = [
  {
    id: "req-1",
    client: "Jennifer Adams",
    clientAvatar: "",
    service: "Bathroom Renovation",
    description:
      "Complete bathroom remodel including new tiles, fixtures, and painting. Approximately 80 sq ft.",
    date: "2025-01-05",
    timePreference: "Morning (8AM-12PM)",
    budget: "800-1200",
    address: "567 Cherry Lane, Springfield",
    urgency: "flexible",
    clientRating: 4.9,
    postedTime: "2 hours ago",
  },
  {
    id: "req-2",
    client: "David Thompson",
    clientAvatar: "",
    service: "Electrical Outlet Installation",
    description:
      "Need 3 new outlets installed in home office. Already have materials.",
    date: "2024-12-30",
    timePreference: "Afternoon (1PM-5PM)",
    budget: "150-250",
    address: "890 Willow Street, Springfield",
    urgency: "urgent",
    clientRating: 5.0,
    postedTime: "5 hours ago",
  },
  {
    id: "req-3",
    client: "Patricia Brown",
    clientAvatar: "",
    service: "Deck Repair",
    description:
      "Several loose boards need replacing and deck needs re-staining. About 200 sq ft.",
    date: "2025-01-08",
    timePreference: "Anytime",
    budget: "400-600",
    address: "234 Cedar Road, Springfield",
    urgency: "flexible",
    clientRating: 4.7,
    postedTime: "1 day ago",
  },
  {
    id: "req-4",
    client: "James Wilson",
    clientAvatar: "",
    service: "Leaky Faucet Repair",
    description: "Kitchen faucet is dripping constantly. Need quick fix.",
    date: "2024-12-28",
    timePreference: "ASAP",
    budget: "80-150",
    address: "456 Birch Avenue, Springfield",
    urgency: "urgent",
    clientRating: 4.8,
    postedTime: "3 hours ago",
  },
  {
    id: "req-5",
    client: "Maria Garcia",
    clientAvatar: "",
    service: "Fence Installation",
    description:
      "Install new privacy fence around backyard. Approximately 150 linear feet.",
    date: "2025-01-12",
    timePreference: "Weekends only",
    budget: "1500-2000",
    address: "789 Spruce Court, Springfield",
    urgency: "flexible",
    clientRating: 5.0,
    postedTime: "2 days ago",
  },
];

const mockAcceptedJobs = [
  {
    id: "1",
    client: "Sarah Johnson",
    service: "Kitchen Sink Repair",
    date: "2025-01-02",
    time: "10:00 AM",
    status: "upcoming",
    price: 125,
    address: "123 Oak Street, Springfield",
    description: "Kitchen sink won't drain properly. Suspect clogged pipe.",
  },
  {
    id: "2",
    client: "Mike Davis",
    service: "Fence Installation",
    date: "2025-01-03",
    time: "2:00 PM",
    status: "upcoming",
    price: 450,
    address: "456 Maple Ave, Springfield",
    description: "Install 50ft wood privacy fence in backyard.",
  },
  {
    id: "3",
    client: "Emily Chen",
    service: "Deck Staining",
    date: "2024-12-28",
    time: "9:00 AM",
    status: "in-progress",
    price: 380,
    address: "789 Pine Road, Springfield",
    description: "Re-stain 300 sq ft deck with provided materials.",
  },
  {
    id: "4",
    client: "Robert Wilson",
    service: "Door Installation",
    date: "2024-12-22",
    time: "11:00 AM",
    status: "completed",
    price: 280,
    address: "321 Elm Street, Springfield",
    description: "Replace front door with new pre-hung door.",
  },
];

const mockMessages = [
  {
    id: "1",
    client: "Sarah Johnson",
    message: "Hi! Can you arrive 30 minutes earlier tomorrow?",
    time: "2 hours ago",
    unread: true,
  },
  {
    id: "2",
    client: "Mike Davis",
    message: "Do you have the fence material ready?",
    time: "5 hours ago",
    unread: true,
  },
  {
    id: "3",
    client: "Emily Chen",
    message: "Thank you for the great work!",
    time: "1 day ago",
    unread: false,
  },
];

const mockReviews = [
  {
    id: "1",
    client: "Robert Wilson",
    rating: 5,
    date: "2024-12-23",
    service: "Door Installation",
    comment:
      "Excellent work! Very professional and finished ahead of schedule. Highly recommend!",
  },
  {
    id: "2",
    client: "Lisa Anderson",
    rating: 5,
    date: "2024-12-21",
    service: "Bathroom Tile Repair",
    comment:
      "Great attention to detail. The tiles look perfect now. Will definitely hire again.",
  },
  {
    id: "3",
    client: "James Brown",
    rating: 4,
    date: "2024-12-18",
    service: "Electrical Outlet Installation",
    comment:
      "Good work, though he arrived a bit late. Otherwise very satisfied with the service.",
  },
];

const mockTransactions = [
  {
    id: "1",
    date: "2024-12-22",
    client: "Robert Wilson",
    service: "Door Installation",
    amount: 280,
    status: "paid",
  },
  {
    id: "2",
    date: "2024-12-20",
    client: "Lisa Anderson",
    service: "Bathroom Tile Repair",
    amount: 220,
    status: "paid",
  },
  {
    id: "3",
    date: "2024-12-18",
    client: "James Brown",
    service: "Electrical Work",
    amount: 180,
    status: "pending",
  },
];

export function ProviderDashboard({}: ProviderDashboardProps) {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] =
    useState<DashboardSection>("overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [selectedJobRequest, setSelectedJobRequest] = useState<
    (typeof mockJobRequests)[0] | null
  >(null);
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const [quoteAmount, setQuoteAmount] = useState("");
  const [quoteNotes, setQuoteNotes] = useState("");

  const navigationItems = [
    {
      id: "overview" as DashboardSection,
      label: "Overview",
      icon: LayoutDashboard,
    },
    {
      id: "requests" as DashboardSection,
      label: "Job Requests",
      icon: AlertCircle,
      badge: mockProviderData.pendingRequests,
    },
    { id: "jobs" as DashboardSection, label: "My Jobs", icon: Briefcase },
    {
      id: "calendar" as DashboardSection,
      label: "Availability",
      icon: CalendarIcon,
    },
    { id: "earnings" as DashboardSection, label: "Earnings", icon: DollarSign },
    { id: "profile" as DashboardSection, label: "Profile", icon: User },
    {
      id: "messages" as DashboardSection,
      label: "Messages",
      icon: MessageSquare,
    },
    { id: "reviews" as DashboardSection, label: "Reviews", icon: Star },
    { id: "settings" as DashboardSection, label: "Settings", icon: Settings },
  ];

  const unreadMessages = mockMessages.filter((m) => m.unread).length;

  const handleAcceptRequest = (requestId: string) => {
    console.log("Accepted request:", requestId);
    alert("Job request accepted! It has been added to your jobs.");
    setSelectedJobRequest(null);
  };

  const handleDeclineRequest = (requestId: string) => {
    console.log("Declined request:", requestId);
    alert("Job request declined.");
    setSelectedJobRequest(null);
  };

  const handleSubmitQuote = () => {
    console.log("Quote submitted:", { amount: quoteAmount, notes: quoteNotes });
    alert(`Quote of $${quoteAmount} submitted successfully!`);
    setQuoteDialogOpen(false);
    setQuoteAmount("");
    setQuoteNotes("");
    setSelectedJobRequest(null);
  };

  const renderStatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <Card className="border-l-4 border-l-red-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Pending Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">
                {mockProviderData.pendingRequests}
              </p>
              <p className="text-sm text-red-600 mt-1">Awaiting response</p>
            </div>
            <AlertCircle className="h-10 w-10 text-red-600 opacity-20" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            This Month's Earnings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">
                ${mockProviderData.earnings.thisMonth.toLocaleString()}
              </p>
              <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                <TrendingUp className="h-4 w-4" />
                +12% from last month
              </p>
            </div>
            <DollarSign className="h-10 w-10 text-blue-600 opacity-20" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Active Jobs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">
                {mockProviderData.activeJobs}
              </p>
              <p className="text-sm text-gray-600 mt-1">In progress</p>
            </div>
            <Briefcase className="h-10 w-10 text-blue-600 opacity-20" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Rating
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">
                {mockProviderData.rating}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${star <= Math.floor(mockProviderData.rating) ? "fill-red-500 text-red-500" : "text-gray-300"}`}
                  />
                ))}
                <span className="text-sm text-gray-600 ml-1">
                  ({mockProviderData.totalReviews})
                </span>
              </div>
            </div>
            <Star className="h-10 w-10 text-blue-600 opacity-20" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderJobRequestCard = (request: (typeof mockJobRequests)[0]) => (
    <Card key={request.id} className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-blue-600 text-white">
                {request.client
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold text-lg text-gray-900">
                {request.service}
              </h3>
              <p className="text-sm text-gray-600">{request.client}</p>
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-3 w-3 ${star <= Math.floor(request.clientRating) ? "fill-red-500 text-red-500" : "text-gray-300"}`}
                  />
                ))}
                <span className="text-xs text-gray-600 ml-1">
                  ({request.clientRating})
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <Badge
              className={
                request.urgency === "urgent" ? "bg-red-600" : "bg-blue-600"
              }
            >
              {request.urgency === "urgent" ? "Urgent" : "Flexible"}
            </Badge>
            <p className="text-xs text-gray-500 mt-1">{request.postedTime}</p>
          </div>
        </div>

        <div className="space-y-2 mb-4 text-sm">
          <p className="text-gray-700">{request.description}</p>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="flex items-center gap-2 text-gray-600">
              <CalendarIcon className="h-4 w-4" />
              <span>{request.date}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{request.timePreference}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="h-4 w-4" />
              <span className="truncate">{request.address}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <DollarSign className="h-4 w-4" />
              <span className="font-semibold text-gray-900">
                ${request.budget}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => setSelectedJobRequest(request)}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            View Details
          </Button>
          <Button
            onClick={() => {
              setSelectedJobRequest(request);
              setQuoteDialogOpen(true);
            }}
            variant="outline"
            className="flex-1"
          >
            Send Quote
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderJobRequests = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            Pending Job Requests
            <Badge className="bg-red-600 text-white">
              {mockJobRequests.length}
            </Badge>
          </CardTitle>
          <CardDescription>
            Review and respond to client job requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            {mockJobRequests.map((request) => renderJobRequestCard(request))}
          </div>
        </CardContent>
      </Card>

      {/* Job Request Detail Dialog */}
      <Dialog
        open={selectedJobRequest !== null && !quoteDialogOpen}
        onOpenChange={(open) => !open && setSelectedJobRequest(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedJobRequest?.service}</DialogTitle>
            <DialogDescription>
              Job request from {selectedJobRequest?.client}
            </DialogDescription>
          </DialogHeader>
          {selectedJobRequest && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-blue-600 text-white text-xl">
                    {selectedJobRequest.client
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-lg">
                    {selectedJobRequest.client}
                  </h3>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${star <= Math.floor(selectedJobRequest.clientRating) ? "fill-red-500 text-red-500" : "text-gray-300"}`}
                      />
                    ))}
                    <span className="text-sm text-gray-600 ml-1">
                      ({selectedJobRequest.clientRating} rating)
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Job Description</h4>
                <p className="text-gray-700">
                  {selectedJobRequest.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-1 text-sm">Preferred Date</h4>
                  <p className="text-gray-700">{selectedJobRequest.date}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1 text-sm">
                    Time Preference
                  </h4>
                  <p className="text-gray-700">
                    {selectedJobRequest.timePreference}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1 text-sm">Client Budget</h4>
                  <p className="text-gray-700">${selectedJobRequest.budget}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1 text-sm">Urgency</h4>
                  <Badge
                    className={
                      selectedJobRequest.urgency === "urgent"
                        ? "bg-red-600"
                        : "bg-blue-600"
                    }
                  >
                    {selectedJobRequest.urgency}
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-1 text-sm">Location</h4>
                <p className="text-gray-700 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {selectedJobRequest.address}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => handleAcceptRequest(selectedJobRequest.id)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Accept Job
                </Button>
                <Button
                  onClick={() => {
                    setQuoteDialogOpen(true);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Send Quote
                </Button>
                <Button
                  onClick={() => handleDeclineRequest(selectedJobRequest.id)}
                  variant="outline"
                  className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  Decline
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Quote Dialog */}
      <Dialog open={quoteDialogOpen} onOpenChange={setQuoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Quote</DialogTitle>
            <DialogDescription>
              Submit your quote for this job
            </DialogDescription>
          </DialogHeader>
          {selectedJobRequest && (
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-semibold">{selectedJobRequest.service}</p>
                <p className="text-sm text-gray-600">
                  Client budget: ${selectedJobRequest.budget}
                </p>
              </div>

              <div>
                <Label htmlFor="quoteAmount">Your Quote Amount ($)</Label>
                <Input
                  id="quoteAmount"
                  type="number"
                  placeholder="Enter amount"
                  value={quoteAmount}
                  onChange={(e) => setQuoteAmount(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="quoteNotes">Additional Notes (Optional)</Label>
                <Textarea
                  id="quoteNotes"
                  placeholder="Include details about timeline, materials, or any questions..."
                  rows={4}
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSubmitQuote}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={!quoteAmount}
                >
                  Send Quote
                </Button>
                <Button
                  onClick={() => {
                    setQuoteDialogOpen(false);
                    setQuoteAmount("");
                    setQuoteNotes("");
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {renderStatsCards()}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Requests Preview */}
        <Card className="border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              New Job Requests
              <Badge className="bg-red-600 text-white">
                {mockJobRequests.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockJobRequests.slice(0, 3).map((request) => (
                <div
                  key={request.id}
                  className="flex items-start gap-3 pb-3 border-b last:border-0"
                >
                  <Avatar>
                    <AvatarFallback className="bg-blue-600 text-white">
                      {request.client
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">
                      {request.service}
                    </p>
                    <p className="text-sm text-gray-600">{request.client}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {request.postedTime}
                    </p>
                  </div>
                  <Badge
                    className={
                      request.urgency === "urgent"
                        ? "bg-red-600"
                        : "bg-blue-600"
                    }
                  >
                    ${request.budget}
                  </Badge>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setActiveSection("requests")}
              >
                View All Requests
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Jobs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-600" />
              Upcoming Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAcceptedJobs
                .filter((j) => j.status === "upcoming")
                .slice(0, 3)
                .map((job) => (
                  <div
                    key={job.id}
                    className="flex items-start gap-4 pb-4 border-b last:border-0"
                  >
                    <div className="flex-shrink-0 h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Clock className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">
                        {job.service}
                      </p>
                      <p className="text-sm text-gray-600">{job.client}</p>
                      <p className="text-sm text-gray-500">
                        {job.date} at {job.time}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">${job.price}</p>
                      <Badge
                        variant="outline"
                        className="mt-1 text-blue-600 border-blue-600"
                      >
                        Scheduled
                      </Badge>
                    </div>
                  </div>
                ))}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setActiveSection("jobs")}
              >
                View All Jobs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Messages and Reviews Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Messages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              Recent Messages
              {unreadMessages > 0 && (
                <Badge className="bg-red-500 text-white">
                  {unreadMessages}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockMessages.slice(0, 3).map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-4 pb-4 border-b last:border-0 ${message.unread ? "bg-blue-50 -mx-6 px-6 py-3" : ""}`}
                >
                  <Avatar>
                    <AvatarFallback>
                      {message.client
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">
                        {message.client}
                      </p>
                      {message.unread && (
                        <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {message.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{message.time}</p>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setActiveSection("messages")}
              >
                View All Messages
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Reviews */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-red-500 fill-red-500" />
              Recent Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockReviews.slice(0, 2).map((review) => (
                <div key={review.id} className="pb-4 border-b last:border-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {review.client}
                      </p>
                      <p className="text-sm text-gray-600">{review.service}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${star <= review.rating ? "fill-red-500 text-red-500" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {review.date}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{review.comment}</p>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setActiveSection("reviews")}
              >
                View All Reviews
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderJobs = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Jobs</CardTitle>
          <CardDescription>
            Manage your accepted and active jobs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upcoming">
                Upcoming (
                {mockAcceptedJobs.filter((j) => j.status === "upcoming").length}
                )
              </TabsTrigger>
              <TabsTrigger value="in-progress">
                In Progress (
                {
                  mockAcceptedJobs.filter((j) => j.status === "in-progress")
                    .length
                }
                )
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed (
                {
                  mockAcceptedJobs.filter((j) => j.status === "completed")
                    .length
                }
                )
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4 mt-6">
              {mockAcceptedJobs
                .filter((j) => j.status === "upcoming")
                .map((job) => (
                  <Card key={job.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-lg text-gray-900">
                              {job.service}
                            </h3>
                            <Badge className="bg-blue-600">Upcoming</Badge>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>
                              <strong>Client:</strong> {job.client}
                            </p>
                            <p>
                              <strong>Date:</strong> {job.date} at {job.time}
                            </p>
                            <p>
                              <strong>Location:</strong> {job.address}
                            </p>
                            <p className="text-gray-700 mt-2">
                              {job.description}
                            </p>
                            <p className="mt-2">
                              <strong>Payment:</strong>{" "}
                              <span className="text-lg font-bold text-gray-900">
                                ${job.price}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            View Details
                          </Button>
                          <Button size="sm" variant="outline">
                            Contact Client
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => alert("Job marked as started")}
                          >
                            Start Job
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>

            <TabsContent value="in-progress" className="space-y-4 mt-6">
              {mockAcceptedJobs
                .filter((j) => j.status === "in-progress")
                .map((job) => (
                  <Card key={job.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-lg text-gray-900">
                              {job.service}
                            </h3>
                            <Badge className="bg-orange-500">In Progress</Badge>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>
                              <strong>Client:</strong> {job.client}
                            </p>
                            <p>
                              <strong>Date:</strong> {job.date} at {job.time}
                            </p>
                            <p>
                              <strong>Location:</strong> {job.address}
                            </p>
                            <p className="text-gray-700 mt-2">
                              {job.description}
                            </p>
                            <p className="mt-2">
                              <strong>Payment:</strong>{" "}
                              <span className="text-lg font-bold text-gray-900">
                                ${job.price}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() =>
                              alert(
                                "Job marked as complete! Payment will be processed.",
                              )
                            }
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark Complete
                          </Button>
                          <Button size="sm" variant="outline">
                            Contact Client
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4 mt-6">
              {mockAcceptedJobs
                .filter((j) => j.status === "completed")
                .map((job) => (
                  <Card key={job.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-lg text-gray-900">
                              {job.service}
                            </h3>
                            <Badge className="bg-green-600">Completed</Badge>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>
                              <strong>Client:</strong> {job.client}
                            </p>
                            <p>
                              <strong>Date:</strong> {job.date}
                            </p>
                            <p>
                              <strong>Location:</strong> {job.address}
                            </p>
                            <p className="text-gray-700 mt-2">
                              {job.description}
                            </p>
                            <p className="mt-2">
                              <strong>Payment:</strong>{" "}
                              <span className="text-lg font-bold text-green-600">
                                ${job.price} (Paid)
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          <Button size="sm" variant="outline">
                            View Receipt
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );

  const renderCalendar = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Availability Calendar</CardTitle>
          <CardDescription>
            Manage your availability for the next two weeks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </div>
            <div>
              <h3 className="font-semibold mb-4">
                Availability for{" "}
                {selectedDate?.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </h3>
              <div className="space-y-3">
                {[
                  "8:00 AM - 10:00 AM",
                  "10:00 AM - 12:00 PM",
                  "12:00 PM - 2:00 PM",
                  "2:00 PM - 4:00 PM",
                  "4:00 PM - 6:00 PM",
                ].map((slot) => (
                  <div
                    key={slot}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <span className="text-sm font-medium">{slot}</span>
                    <Switch />
                  </div>
                ))}
              </div>
              <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700">
                Save Availability
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockAcceptedJobs
              .filter(
                (j) => j.status === "upcoming" || j.status === "in-progress",
              )
              .map((job) => (
                <div
                  key={job.id}
                  className="flex items-center gap-4 p-4 border rounded-lg"
                >
                  <div className="flex-shrink-0 h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CalendarIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{job.service}</p>
                    <p className="text-sm text-gray-600">
                      {job.date} at {job.time}
                    </p>
                  </div>
                  <Badge
                    className={
                      job.status === "in-progress"
                        ? "bg-orange-500"
                        : "bg-blue-600"
                    }
                  >
                    {job.status === "in-progress" ? "In Progress" : "Scheduled"}
                  </Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderEarnings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">
              ${mockProviderData.earnings.total.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">
              ${mockProviderData.earnings.thisMonth.toLocaleString()}
            </p>
            <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
              <TrendingUp className="h-4 w-4" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending Payout
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">
              ${mockProviderData.earnings.pending.toLocaleString()}
            </p>
            <Button size="sm" className="mt-2 bg-red-600 hover:bg-red-700">
              Request Payout
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>View all your earnings and payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`h-10 w-10 rounded-lg flex items-center justify-center ${transaction.status === "paid" ? "bg-green-100" : "bg-orange-100"}`}
                  >
                    <DollarSign
                      className={`h-5 w-5 ${transaction.status === "paid" ? "text-green-600" : "text-orange-600"}`}
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {transaction.service}
                    </p>
                    <p className="text-sm text-gray-600">
                      {transaction.client} • {transaction.date}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-gray-900">
                    ${transaction.amount}
                  </p>
                  <Badge
                    className={
                      transaction.status === "paid"
                        ? "bg-green-600"
                        : "bg-orange-500"
                    }
                  >
                    {transaction.status === "paid" ? "Paid" : "Pending"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your public profile information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={mockProviderData.avatar} />
              <AvatarFallback className="text-2xl bg-blue-600 text-white">
                {mockProviderData.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline" className="mr-2">
                <Edit className="h-4 w-4 mr-2" />
                Change Photo
              </Button>
              <p className="text-sm text-gray-600 mt-2">
                JPG, PNG or GIF. Max size 5MB.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" defaultValue={mockProviderData.name} />
            </div>
            <div>
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                defaultValue={mockProviderData.businessName}
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                defaultValue={mockProviderData.email}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" defaultValue={mockProviderData.phone} />
            </div>
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" rows={4} defaultValue={mockProviderData.bio} />
            <p className="text-sm text-gray-600 mt-1">
              Brief description for your profile. Maximum 500 characters.
            </p>
          </div>

          <div>
            <Label>Services Offered</Label>
            <div className="flex flex-wrap gap-2 mt-2 mb-3">
              {mockProviderData.services.map((service) => (
                <Badge key={service} variant="outline" className="px-3 py-1">
                  {service}
                  <button className="ml-2 text-red-600 hover:text-red-700">
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            <Button variant="outline" size="sm">
              Add Service
            </Button>
          </div>

          <div className="flex gap-3 pt-4">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Save Changes
            </Button>
            <Button variant="outline">Cancel</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Public Profile Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <Star className="h-8 w-8 text-red-500 fill-red-500 mx-auto mb-2" />
              <p className="text-3xl font-bold text-gray-900">
                {mockProviderData.rating}
              </p>
              <p className="text-sm text-gray-600">Average Rating</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-gray-900">
                {mockProviderData.totalReviews}
              </p>
              <p className="text-sm text-gray-600">Total Reviews</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-gray-900">
                {mockProviderData.completedJobs}
              </p>
              <p className="text-sm text-gray-600">Jobs Completed</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderMessages = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Messages
            {unreadMessages > 0 && (
              <Badge className="bg-red-500 text-white">
                {unreadMessages} unread
              </Badge>
            )}
          </CardTitle>
          <CardDescription>Communicate with your clients</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockMessages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${message.unread ? "bg-blue-50 border-blue-200" : ""}`}
              >
                <Avatar>
                  <AvatarFallback>
                    {message.client
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900">
                      {message.client}
                    </p>
                    {message.unread && (
                      <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                    )}
                  </div>
                  <p className="text-sm text-gray-700">{message.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{message.time}</p>
                </div>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Reply
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderReviews = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Customer Reviews</CardTitle>
              <CardDescription>
                See what your clients are saying
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <Star className="h-6 w-6 fill-red-500 text-red-500" />
                <span className="text-3xl font-bold text-gray-900">
                  {mockProviderData.rating}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {mockProviderData.totalReviews} reviews
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {mockReviews.map((review) => (
              <div key={review.id} className="pb-6 border-b last:border-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {review.client
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {review.client}
                      </p>
                      <p className="text-sm text-gray-600">{review.service}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${star <= review.rating ? "fill-red-500 text-red-500" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">{review.date}</p>
                  </div>
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>
            Manage how you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">New Job Requests</p>
              <p className="text-sm text-gray-600">
                Get notified when clients request your services
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Messages</p>
              <p className="text-sm text-gray-600">
                Receive notifications for new messages
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Payment Updates</p>
              <p className="text-sm text-gray-600">
                Get notified about payments and payouts
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Reviews</p>
              <p className="text-sm text-gray-600">
                Notifications when you receive a new review
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="current-password">Current Password</Label>
            <Input id="current-password" type="password" />
          </div>
          <div>
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" type="password" />
          </div>
          <div>
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input id="confirm-password" type="password" />
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Update Password
          </Button>
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Once you delete your account, there is no going back. Please be
            certain.
          </p>
          <Button
            variant="outline"
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="px-4 lg:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">FH</span>
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">
                Fixers Hive
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </Button>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={mockProviderData.avatar} />
                <AvatarFallback className="bg-blue-600 text-white">
                  {mockProviderData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="font-semibold text-gray-900">
                  {mockProviderData.name}
                </p>
                <p className="text-sm text-gray-600">Provider Account</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside
          className={`
          fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r z-40
          transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        >
          <nav className="p-4 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <Badge
                      className={`ml-auto ${isActive ? "bg-red-600" : "bg-red-500"} text-white`}
                    >
                      {item.badge}
                    </Badge>
                  )}
                  {item.id === "messages" &&
                    unreadMessages > 0 &&
                    !item.badge && (
                      <Badge className="ml-auto bg-red-500 text-white">
                        {unreadMessages}
                      </Badge>
                    )}
                </button>
              );
            })}

            <div className="pt-4 mt-4 border-t">
              <button
                onClick={() => navigate("/")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Mobile overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {
                  navigationItems.find((item) => item.id === activeSection)
                    ?.label
                }
              </h1>
              <p className="text-gray-600">
                Welcome back, {mockProviderData.name.split(" ")[0]}! 👋
              </p>
            </div>

            {/* Render Active Section */}
            {activeSection === "overview" && renderOverview()}
            {activeSection === "requests" && renderJobRequests()}
            {activeSection === "jobs" && renderJobs()}
            {activeSection === "calendar" && renderCalendar()}
            {activeSection === "earnings" && renderEarnings()}
            {activeSection === "profile" && renderProfile()}
            {activeSection === "messages" && renderMessages()}
            {activeSection === "reviews" && renderReviews()}
            {activeSection === "settings" && renderSettings()}
          </div>
        </main>
      </div>
    </div>
  );
}
