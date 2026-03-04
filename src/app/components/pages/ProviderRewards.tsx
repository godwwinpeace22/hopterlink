import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Progress } from "../ui/progress";
import {
  ArrowLeft,
  Trophy,
  Star,
  Award,
  Zap,
  Target,
  Crown,
  Shield,
  TrendingUp,
  DollarSign,
  Users,
  Copy,
  Check,
  Share2,
  Facebook,
  Twitter,
  Mail,
  MessageCircle,
  Gift,
  Flame,
  CheckCircle,
  Clock,
  ThumbsUp,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface ProviderRewardsProps {}

const mockProviderData = {
  name: "John Martinez",
  email: "john@martinezhandyman.com",
  memberSince: "2020-03",
  completedJobs: 234,
  rating: 4.8,
  totalReviews: 127,
  responseTime: "45 min",
  currentMonthEarnings: 3250,
  currentCommissionRate: 3.5,
  standardCommissionRate: 5.0,
  cashbackBalance: 245.5,
  lifetimeSavings: 892.75,
  referralCode: "JOHN-HIVE-2024",
  referralsCount: 12,
  referralEarnings: 600,
};

const providerBadges = [
  {
    id: "top-rated",
    name: "Top Rated",
    description: "Maintain 4.8+ rating with 50+ reviews",
    icon: Star,
    color: "bg-yellow-500",
    unlocked: true,
    benefits: [
      "Reduced commission: 3.5% (save 1.5%)",
      "Featured in search results",
      "Top Rated badge on profile",
      "Priority customer support",
    ],
    progress: 100,
    requirement: "4.8+ rating, 50+ reviews",
  },
  {
    id: "quick-responder",
    name: "Quick Responder",
    description: "Avg response time under 1 hour",
    icon: Zap,
    color: "bg-orange-500",
    unlocked: true,
    benefits: [
      "Higher placement in search",
      "Quick Responder badge",
      "More job requests",
      "Client trust indicator",
    ],
    progress: 100,
    requirement: "< 1 hour avg response",
  },
  {
    id: "super-provider",
    name: "Super Provider",
    description: "Complete 100+ jobs successfully",
    icon: Crown,
    color: "bg-purple-600",
    unlocked: true,
    benefits: [
      "Exclusive VIP status",
      "Featured homepage placement",
      "Premium profile customization",
      "Early access to high-value jobs",
    ],
    progress: 100,
    requirement: "100+ completed jobs",
  },
  {
    id: "rising-star",
    name: "Rising Star",
    description: "10+ 5-star reviews in 30 days",
    icon: Sparkles,
    color: "bg-pink-500",
    unlocked: true,
    benefits: [
      "Trending provider status",
      "Boosted visibility for 30 days",
      "$50 bonus reward",
      "Social media feature",
    ],
    progress: 100,
    requirement: "10+ 5-star reviews/month",
  },
  {
    id: "specialist",
    name: "Specialist",
    description: "Expert in specific category",
    icon: Target,
    color: "bg-blue-600",
    unlocked: false,
    benefits: [
      "Category expert badge",
      "Higher rates accepted",
      "Specialist directory listing",
      "Educational content contributor",
    ],
    progress: 60,
    requirement: "50+ jobs in one category",
  },
  {
    id: "verified-pro",
    name: "Verified Pro",
    description: "Complete all verifications",
    icon: Shield,
    color: "bg-green-600",
    unlocked: true,
    benefits: [
      "Full platform access",
      "Trust & safety indicator",
      "Insurance coverage eligible",
      "Background check badge",
    ],
    progress: 100,
    requirement: "All docs verified",
  },
];

const monthlyChallenges = [
  {
    id: "c1",
    title: "Complete 20 Jobs",
    description: "Finish 20 successful jobs this month",
    reward: "$100 Bonus",
    icon: Target,
    color: "bg-blue-600",
    progress: 15,
    total: 20,
    timeLeft: "12 days left",
    active: true,
  },
  {
    id: "c2",
    title: "Perfect 5.0 Rating",
    description: "Maintain 5.0 rating for 30 days",
    reward: "Featured Provider Badge",
    icon: Star,
    color: "bg-yellow-500",
    progress: 4.9,
    total: 5.0,
    timeLeft: "18 days left",
    active: true,
  },
  {
    id: "c3",
    title: "Under 30min Response",
    description: "Respond to all requests within 30 minutes",
    reward: "Priority Listing",
    icon: Zap,
    color: "bg-orange-500",
    progress: 28,
    total: 30,
    timeLeft: "5 days left",
    active: true,
  },
  {
    id: "c4",
    title: "Weekend Warrior",
    description: "Complete 5 weekend jobs",
    reward: "$50 Bonus",
    icon: Flame,
    color: "bg-red-600",
    progress: 3,
    total: 5,
    timeLeft: "This weekend",
    active: true,
  },
];

const achievementHistory = [
  {
    id: 1,
    title: "Top Rated Provider",
    date: "2024-11-15",
    reward: "Commission reduced to 3.5%",
  },
  {
    id: 2,
    title: "100 Jobs Milestone",
    date: "2024-10-22",
    reward: "$100 bonus",
  },
  {
    id: 3,
    title: "Rising Star",
    date: "2024-09-30",
    reward: "$50 bonus + Featured listing",
  },
  {
    id: 4,
    title: "Quick Responder",
    date: "2024-08-12",
    reward: "Priority placement",
  },
  {
    id: 5,
    title: "50 Jobs Milestone",
    date: "2024-06-18",
    reward: "$50 bonus",
  },
];

export function ProviderRewards({}: ProviderRewardsProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [copiedCode, setCopiedCode] = useState(false);
  const [providerData, setProviderData] = useState(mockProviderData);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const unlockedBadges = providerBadges.filter((b) => b.unlocked);
  const lockedBadges = providerBadges.filter((b) => !b.unlocked);
  const activeChallenges = monthlyChallenges.filter((c) => c.active);

  const monthlySavings = useMemo(
    () =>
      (providerData.currentMonthEarnings *
        (providerData.standardCommissionRate -
          providerData.currentCommissionRate)) /
      100,
    [
      providerData.currentMonthEarnings,
      providerData.standardCommissionRate,
      providerData.currentCommissionRate,
    ],
  );

  useEffect(() => {
    if (!user?.id) return;

    const fetchRewards = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const [profileResult, providerProfileResult, earningsResult] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("full_name, email, created_at")
            .eq("id", user.id)
            .single(),
          supabase
            .from("provider_profiles")
            .select(
              "jobs_completed, rating, total_reviews, response_time, verification_status",
            )
            .eq("user_id", user.id)
            .maybeSingle(),
          supabase
            .from("escrow_payments")
            .select("amount, created_at")
            .eq("provider_id", user.id)
            .gte("created_at", monthStart.toISOString()),
        ]);

      if (profileResult.error) {
        setErrorMessage(profileResult.error.message);
      }

      const monthEarnings = (earningsResult.data ?? []).reduce(
        (sum, entry) => sum + (entry.amount ?? 0),
        0,
      );
      const memberSince = profileResult.data?.created_at
        ? new Date(profileResult.data.created_at).toISOString().slice(0, 7)
        : mockProviderData.memberSince;

      setProviderData({
        ...mockProviderData,
        name: profileResult.data?.full_name ?? mockProviderData.name,
        email: profileResult.data?.email ?? mockProviderData.email,
        memberSince,
        completedJobs:
          providerProfileResult.data?.jobs_completed ??
          mockProviderData.completedJobs,
        rating: providerProfileResult.data?.rating ?? mockProviderData.rating,
        totalReviews:
          providerProfileResult.data?.total_reviews ??
          mockProviderData.totalReviews,
        responseTime: providerProfileResult.data?.response_time
          ? `${providerProfileResult.data.response_time} min`
          : mockProviderData.responseTime,
        currentMonthEarnings: monthEarnings,
        currentCommissionRate:
          providerProfileResult.data?.verification_status === "approved"
            ? mockProviderData.currentCommissionRate
            : mockProviderData.standardCommissionRate,
      });

      setIsLoading(false);
    };

    fetchRewards();
  }, [user?.id]);

  const handleCopyReferralCode = () => {
    navigator.clipboard.writeText(providerData.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleShare = (platform: string) => {
    const shareText = `Join Hopterlink as a service provider! Use my code: ${providerData.referralCode} and get $50 bonus when you complete your first job.`;
    const shareUrl = `https://hopterlink.com/provider-signup?ref=${providerData.referralCode}`;

    switch (platform) {
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
          "_blank",
        );
        break;
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
          "_blank",
        );
        break;
      case "email":
        window.location.href = `mailto:?subject=Join Hopterlink as a Provider&body=${encodeURIComponent(shareText + "\n\n" + shareUrl)}`;
        break;
      case "whatsapp":
        window.open(
          `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`,
          "_blank",
        );
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate("/dashboard/provider")}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">FH</span>
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:block">
              Hopterlink
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-4 border-white">
                <AvatarFallback className="bg-white text-blue-600 text-2xl font-bold">
                  {providerData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold mb-1">{providerData.name}</h1>
                <p className="text-blue-100">
                  Provider since {providerData.memberSince}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 text-center">
              <div className="bg-white/20 rounded-lg px-6 py-3">
                <Trophy className="h-6 w-6 mx-auto mb-1" />
                <p className="text-2xl font-bold">
                  {unlockedBadges.length}/{providerBadges.length}
                </p>
                <p className="text-sm text-blue-100">Badges</p>
              </div>
              <div className="bg-white/20 rounded-lg px-6 py-3">
                <DollarSign className="h-6 w-6 mx-auto mb-1" />
                <p className="text-2xl font-bold">
                  ${providerData.cashbackBalance}
                </p>
                <p className="text-sm text-blue-100">Savings</p>
              </div>
              <div className="bg-white/20 rounded-lg px-6 py-3">
                <Users className="h-6 w-6 mx-auto mb-1" />
                <p className="text-2xl font-bold">
                  {providerData.referralsCount}
                </p>
                <p className="text-sm text-blue-100">Referrals</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        {errorMessage && (
          <Card className="mb-6">
            <CardContent className="py-6">
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading && (
          <Card className="mb-6">
            <CardContent className="py-12 text-center text-gray-600">
              Loading rewards...
            </CardContent>
          </Card>
        )}

        {/* Commission Savings Banner */}
        <Card className="mb-8 border-t-4 border-t-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Reduced Commission Active
                  </h2>
                  <p className="text-gray-600">
                    You're paying {providerData.currentCommissionRate}% instead
                    of {providerData.standardCommissionRate}%
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">This Month's Savings</p>
                <p className="text-3xl font-bold text-green-600">
                  ${monthlySavings.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">
                  Lifetime: ${providerData.lifetimeSavings}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="badges" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="badges">
              <Award className="h-4 w-4 mr-2" />
              Badges
            </TabsTrigger>
            <TabsTrigger value="challenges">
              <Target className="h-4 w-4 mr-2" />
              Challenges
            </TabsTrigger>
            <TabsTrigger value="referrals">
              <Users className="h-4 w-4 mr-2" />
              Referrals
            </TabsTrigger>
            <TabsTrigger value="achievements">
              <Trophy className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Badges Tab */}
          <TabsContent value="badges" className="space-y-6">
            {/* Unlocked Badges */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Your Badges ({unlockedBadges.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {unlockedBadges.map((badge) => {
                  const Icon = badge.icon;
                  return (
                    <Card key={badge.id} className="border-2 border-green-500">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div
                            className={`h-16 w-16 ${badge.color} rounded-full flex items-center justify-center`}
                          >
                            <Icon className="h-8 w-8 text-white" />
                          </div>
                          <Badge className="bg-green-600">
                            <Check className="h-3 w-3 mr-1" />
                            Unlocked
                          </Badge>
                        </div>
                        <h3 className="font-bold text-xl text-gray-900 mb-2">
                          {badge.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          {badge.description}
                        </p>
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-gray-900">
                            Benefits:
                          </p>
                          {badge.benefits.map((benefit, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <p className="text-sm text-gray-700">{benefit}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Locked Badges */}
            {lockedBadges.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Unlock More Badges
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {lockedBadges.map((badge) => {
                    const Icon = badge.icon;
                    return (
                      <Card
                        key={badge.id}
                        className="border-2 border-gray-200 opacity-75"
                      >
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="h-16 w-16 bg-gray-300 rounded-full flex items-center justify-center">
                              <Icon className="h-8 w-8 text-gray-500" />
                            </div>
                            <Badge variant="outline" className="text-gray-600">
                              Locked
                            </Badge>
                          </div>
                          <h3 className="font-bold text-xl text-gray-900 mb-2">
                            {badge.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-4">
                            {badge.description}
                          </p>

                          <div className="mb-4">
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-gray-600">Progress</span>
                              <span className="font-semibold text-gray-900">
                                {badge.progress}%
                              </span>
                            </div>
                            <Progress value={badge.progress} className="h-2" />
                            <p className="text-xs text-gray-500 mt-2">
                              {badge.requirement}
                            </p>
                          </div>

                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-gray-900">
                              Unlock to get:
                            </p>
                            {badge.benefits.slice(0, 2).map((benefit, idx) => (
                              <p key={idx} className="text-sm text-gray-600">
                                • {benefit}
                              </p>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Challenges Tab */}
          <TabsContent value="challenges" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Challenges</CardTitle>
                <CardDescription>
                  Complete challenges to earn bonuses and special perks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeChallenges.map((challenge) => {
                    const Icon = challenge.icon;
                    const progressPercent =
                      (challenge.progress / challenge.total) * 100;

                    return (
                      <Card
                        key={challenge.id}
                        className="border-2 border-blue-200"
                      >
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-4">
                            <div
                              className={`h-12 w-12 ${challenge.color} rounded-lg flex items-center justify-center`}
                            >
                              <Icon className="h-6 w-6 text-white" />
                            </div>
                            <div className="text-right">
                              <Badge className="bg-blue-600 mb-1">
                                {challenge.reward}
                              </Badge>
                              <p className="text-xs text-gray-500">
                                {challenge.timeLeft}
                              </p>
                            </div>
                          </div>

                          <h3 className="font-bold text-lg text-gray-900 mb-2">
                            {challenge.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-4">
                            {challenge.description}
                          </p>

                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-gray-600">Progress</span>
                              <span className="font-semibold text-gray-900">
                                {typeof challenge.progress === "number" &&
                                challenge.progress < 10
                                  ? challenge.progress
                                  : challenge.progress.toFixed(1)}{" "}
                                / {challenge.total}
                              </span>
                            </div>
                            <Progress value={progressPercent} className="h-3" />
                            <p className="text-xs text-gray-500 mt-2 text-center">
                              {progressPercent >= 100
                                ? "Complete! 🎉"
                                : `${Math.round(progressPercent)}% complete`}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-6 w-6 text-blue-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Pro Tips for Challenges
                    </h3>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>
                        • Complete multiple challenges at once for maximum
                        rewards
                      </li>
                      <li>• Challenges reset on the 1st of each month</li>
                      <li>
                        • Bonus rewards are credited immediately upon completion
                      </li>
                      <li>
                        • Keep track of deadlines to maximize your earnings
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Referrals Tab */}
          <TabsContent value="referrals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Refer Other Service Providers</CardTitle>
                <CardDescription>
                  Earn $50 for every provider you refer who completes their
                  first job
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-8 text-white text-center mb-6">
                  <h3 className="text-2xl font-bold mb-4">
                    Your Referral Code
                  </h3>
                  <div className="bg-white/20 rounded-lg p-4 mb-4 inline-block">
                    <p className="text-4xl font-bold tracking-wider">
                      {providerData.referralCode}
                    </p>
                  </div>
                  <Button
                    onClick={handleCopyReferralCode}
                    className="bg-white text-blue-600 hover:bg-blue-50"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Code
                      </>
                    )}
                  </Button>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-4 text-center">
                    Share on Social Media
                  </h3>
                  <div className="flex justify-center gap-3">
                    <Button
                      onClick={() => handleShare("facebook")}
                      className="bg-[#1877F2] hover:bg-[#166FE5]"
                      size="lg"
                    >
                      <Facebook className="h-5 w-5 mr-2" />
                      Facebook
                    </Button>
                    <Button
                      onClick={() => handleShare("twitter")}
                      className="bg-[#1DA1F2] hover:bg-[#1A94DA]"
                      size="lg"
                    >
                      <Twitter className="h-5 w-5 mr-2" />
                      Twitter
                    </Button>
                    <Button
                      onClick={() => handleShare("whatsapp")}
                      className="bg-[#25D366] hover:bg-[#22C55E]"
                      size="lg"
                    >
                      <MessageCircle className="h-5 w-5 mr-2" />
                      WhatsApp
                    </Button>
                    <Button
                      onClick={() => handleShare("email")}
                      variant="outline"
                      size="lg"
                    >
                      <Mail className="h-5 w-5 mr-2" />
                      Email
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-3xl font-bold text-blue-600 mb-1">
                      {providerData.referralsCount}
                    </p>
                    <p className="text-sm text-gray-600">Total Referrals</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-3xl font-bold text-green-600 mb-1">
                      ${providerData.referralEarnings}
                    </p>
                    <p className="text-sm text-gray-600">Total Earned</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-3xl font-bold text-purple-600 mb-1">2</p>
                    <p className="text-sm text-gray-600">Pending</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">
                    How It Works
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        1
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          Share your code
                        </p>
                        <p className="text-sm text-gray-600">
                          Invite other service professionals to join Hopterlink
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        2
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          They sign up
                        </p>
                        <p className="text-sm text-gray-600">
                          Your friend registers as a provider using your code
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        3
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          They complete first job
                        </p>
                        <p className="text-sm text-gray-600">
                          They successfully finish their first paid job
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        4
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          You both earn rewards!
                        </p>
                        <p className="text-sm text-gray-600">
                          You get $50 bonus, they get waived commission on first
                          job
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievement History Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Achievement History</CardTitle>
                <CardDescription>
                  Your milestone achievements and earned rewards
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {achievementHistory.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-yellow-500 rounded-full flex items-center justify-center">
                          <Trophy className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">
                            {achievement.title}
                          </p>
                          <p className="text-sm text-gray-600">
                            {achievement.date}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-green-600">
                          {achievement.reward}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
