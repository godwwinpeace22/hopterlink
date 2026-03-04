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
import { Input } from "../ui/input";
import { Progress } from "../ui/progress";
import {
  ArrowLeft,
  Trophy,
  Star,
  Gift,
  Zap,
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
  Award,
  Target,
  Crown,
  Sparkles,
  ShoppingBag,
  Percent,
  Calendar,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface ClientRewardsProps {}

const mockClientData = {
  name: "Sarah Johnson",
  email: "sarah.j@email.com",
  memberSince: "2024-01",
  totalSpent: 2450,
  currentPoints: 2450,
  currentTier: "Gold",
  cashbackBalance: 36.75,
  lifetimeCashback: 122.5,
  referralCode: "SARAH2024",
  referralsCount: 8,
  referralEarnings: 200,
};

const tierLevels = [
  {
    name: "Bronze",
    minPoints: 0,
    maxPoints: 499,
    pointsMultiplier: 1,
    cashbackRate: 0.5,
    color: "bg-orange-600",
    icon: "🥉",
    benefits: [
      "1x points on all bookings",
      "0.5% cashback",
      "Basic customer support",
      "Standard booking",
    ],
  },
  {
    name: "Silver",
    minPoints: 500,
    maxPoints: 1499,
    pointsMultiplier: 1.2,
    cashbackRate: 0.7,
    color: "bg-gray-400",
    icon: "🥈",
    benefits: [
      "1.2x points on all bookings",
      "0.7% cashback",
      "Priority support",
      "Free cancellation (up to 24hrs)",
    ],
  },
  {
    name: "Gold",
    minPoints: 1500,
    maxPoints: 2999,
    pointsMultiplier: 1.5,
    cashbackRate: 1.0,
    color: "bg-yellow-500",
    icon: "🥇",
    benefits: [
      "1.5x points on all bookings",
      "1% cashback",
      "VIP support line",
      "Free cancellation anytime",
      "Early access to top providers",
    ],
  },
  {
    name: "Platinum",
    minPoints: 3000,
    maxPoints: 999999,
    pointsMultiplier: 2,
    cashbackRate: 1.5,
    color: "bg-purple-600",
    icon: "👑",
    benefits: [
      "2x points on all bookings",
      "1.5% cashback",
      "Dedicated account manager",
      "Free cancellation + rescheduling",
      "VIP provider access",
      "Special promotional offers",
    ],
  },
];

const rewardsMarketplace = [
  {
    id: "r1",
    title: "$10 Service Credit",
    description: "Apply to any booking",
    pointsCost: 1000,
    category: "credits",
    icon: DollarSign,
    color: "bg-green-600",
  },
  {
    id: "r2",
    title: "$25 Service Credit",
    description: "Apply to any booking",
    pointsCost: 2500,
    category: "credits",
    icon: DollarSign,
    color: "bg-green-600",
    popular: true,
  },
  {
    id: "r3",
    title: "$50 Service Credit",
    description: "Apply to any booking",
    pointsCost: 5000,
    category: "credits",
    icon: DollarSign,
    color: "bg-green-600",
  },
  {
    id: "r4",
    title: "15% Off Next Booking",
    description: "Valid for 30 days",
    pointsCost: 750,
    category: "discounts",
    icon: Percent,
    color: "bg-red-600",
  },
  {
    id: "r5",
    title: "20% Off Weekend Booking",
    description: "Valid Sat-Sun only",
    pointsCost: 500,
    category: "discounts",
    icon: Calendar,
    color: "bg-red-600",
  },
  {
    id: "r6",
    title: "Free Priority Support (1 Month)",
    description: "24/7 VIP support access",
    pointsCost: 1500,
    category: "perks",
    icon: Star,
    color: "bg-blue-600",
  },
  {
    id: "r7",
    title: "Tier Boost",
    description: "Jump to next tier for 1 month",
    pointsCost: 3000,
    category: "perks",
    icon: Crown,
    color: "bg-purple-600",
  },
];

const mockRecentActivity = [
  {
    id: 1,
    type: "earned",
    description: "Plumbing service booking",
    points: 125,
    date: "2024-12-24",
  },
  {
    id: 2,
    type: "earned",
    description: "Cashback earned",
    amount: 1.25,
    date: "2024-12-24",
  },
  {
    id: 3,
    type: "redeemed",
    description: "$10 Service Credit",
    points: -1000,
    date: "2024-12-20",
  },
  {
    id: 4,
    type: "earned",
    description: "Review bonus",
    points: 50,
    date: "2024-12-18",
  },
  {
    id: 5,
    type: "earned",
    description: "Referral bonus - John Doe completed job",
    points: 2500,
    date: "2024-12-15",
  },
  {
    id: 6,
    type: "earned",
    description: "Cleaning service booking",
    points: 180,
    date: "2024-12-10",
  },
];

export function ClientRewards({}: ClientRewardsProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedReward, setSelectedReward] = useState<string | null>(null);
  const [clientData, setClientData] = useState(mockClientData);
  const [marketplaceRewards, setMarketplaceRewards] =
    useState(rewardsMarketplace);
  const [recentActivity, setRecentActivity] = useState(mockRecentActivity);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const fetchRewards = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      const [
        profileResult,
        rewardsResult,
        transactionsResult,
        marketplaceResult,
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name, email, created_at")
          .eq("id", user.id)
          .single(),
        supabase
          .from("client_rewards")
          .select("points, cashback, tier, referral_code, referrals_count")
          .eq("user_id", user.id)
          .single(),
        supabase
          .from("reward_transactions")
          .select("id, type, points, cashback, description, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("reward_marketplace")
          .select(
            "id, title, description, points_cost, discount_amount, discount_percent, is_active",
          )
          .eq("is_active", true)
          .order("points_cost", { ascending: true }),
      ]);

      if (profileResult.error) {
        setErrorMessage(profileResult.error.message);
      }

      const memberSince = profileResult.data?.created_at
        ? new Date(profileResult.data.created_at).toISOString().slice(0, 7)
        : mockClientData.memberSince;

      if (rewardsResult.error) {
        setErrorMessage(rewardsResult.error.message);
      }

      if (profileResult.data || rewardsResult.data) {
        setClientData({
          ...mockClientData,
          name: profileResult.data?.full_name ?? mockClientData.name,
          email: profileResult.data?.email ?? mockClientData.email,
          memberSince,
          currentPoints:
            rewardsResult.data?.points ?? mockClientData.currentPoints,
          cashbackBalance:
            rewardsResult.data?.cashback ?? mockClientData.cashbackBalance,
          currentTier: rewardsResult.data?.tier ?? mockClientData.currentTier,
          referralCode:
            rewardsResult.data?.referral_code ?? mockClientData.referralCode,
          referralsCount:
            rewardsResult.data?.referrals_count ??
            mockClientData.referralsCount,
        });
      }

      if (!transactionsResult.error) {
        const mappedActivity = (transactionsResult.data ?? []).map(
          (transaction) => ({
            id: transaction.id,
            type: transaction.type,
            description: transaction.description,
            points: transaction.points,
            amount: transaction.cashback,
            date: transaction.created_at
              ? new Date(transaction.created_at).toISOString().slice(0, 10)
              : "",
          }),
        );
        setRecentActivity(mappedActivity);
      }

      if (!marketplaceResult.error) {
        const mappedMarketplace = (marketplaceResult.data ?? []).map(
          (reward) => ({
            id: reward.id,
            title: reward.title,
            description: reward.description,
            pointsCost: reward.points_cost,
            category: reward.discount_percent
              ? "discounts"
              : reward.discount_amount
                ? "credits"
                : "perks",
            icon: reward.discount_percent
              ? Percent
              : reward.discount_amount
                ? DollarSign
                : Star,
            color: reward.discount_percent
              ? "bg-red-600"
              : reward.discount_amount
                ? "bg-green-600"
                : "bg-blue-600",
          }),
        );
        setMarketplaceRewards(mappedMarketplace);
      }

      setIsLoading(false);
    };

    fetchRewards();
  }, [user?.id]);

  const currentTierData = useMemo(
    () =>
      tierLevels.find((t) => t.name === clientData.currentTier) ||
      tierLevels[0],
    [clientData.currentTier],
  );
  const nextTierData = useMemo(
    () =>
      tierLevels.find((t) => t.minPoints > clientData.currentPoints) ||
      currentTierData,
    [clientData.currentPoints, currentTierData],
  );
  const pointsToNextTier = nextTierData.minPoints - clientData.currentPoints;
  const tierProgress =
    ((clientData.currentPoints - currentTierData.minPoints) /
      (currentTierData.maxPoints - currentTierData.minPoints)) *
    100;

  const handleCopyReferralCode = () => {
    navigator.clipboard.writeText(clientData.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleRedeemReward = async (rewardId: string, pointsCost: number) => {
    if (!user?.id) {
      alert("You must be signed in to redeem rewards.");
      return;
    }

    if (clientData.currentPoints >= pointsCost) {
      setSelectedReward(rewardId);
      try {
        const newPoints = clientData.currentPoints - pointsCost;
        await supabase
          .from("client_rewards")
          .update({ points: newPoints })
          .eq("user_id", user.id);

        await supabase.from("reward_transactions").insert({
          user_id: user.id,
          type: "redeemed",
          points: -pointsCost,
          description: "Reward redemption",
        });

        setClientData((prev) => ({
          ...prev,
          currentPoints: newPoints,
        }));
        alert(
          "Reward redeemed successfully! Check your account for the credit/perk.",
        );
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to redeem reward.";
        alert(message);
      } finally {
        setSelectedReward(null);
      }
    } else {
      alert(
        `You need ${pointsCost - clientData.currentPoints} more points to redeem this reward.`,
      );
    }
  };

  const handleShare = (platform: string) => {
    const shareText = `Join me on Fixers Hive and get $25 off your first booking! Use my code: ${clientData.referralCode}`;
    const shareUrl = `https://fixershive.com/signup?ref=${clientData.referralCode}`;

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
        window.location.href = `mailto:?subject=Join Fixers Hive&body=${encodeURIComponent(shareText + "\n\n" + shareUrl)}`;
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
            onClick={() => navigate("/dashboard/client")}
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
              Fixers Hive
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-4 border-white">
                <AvatarFallback className="bg-white text-blue-600 text-2xl font-bold">
                  {clientData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold mb-1">{clientData.name}</h1>
                <p className="text-blue-100">
                  Member since {clientData.memberSince}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 text-center">
              <div className="bg-white/20 rounded-lg px-6 py-3">
                <Trophy className="h-6 w-6 mx-auto mb-1" />
                <p className="text-2xl font-bold">
                  {clientData.currentPoints.toLocaleString()}
                </p>
                <p className="text-sm text-blue-100">Points</p>
              </div>
              <div className="bg-white/20 rounded-lg px-6 py-3">
                <DollarSign className="h-6 w-6 mx-auto mb-1" />
                <p className="text-2xl font-bold">
                  ${clientData.cashbackBalance}
                </p>
                <p className="text-sm text-blue-100">Cashback</p>
              </div>
              <div className="bg-white/20 rounded-lg px-6 py-3">
                <Users className="h-6 w-6 mx-auto mb-1" />
                <p className="text-2xl font-bold">
                  {clientData.referralsCount}
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

        {/* Tier Status Card */}
        <Card className="mb-8 border-t-4 border-t-yellow-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div
                  className={`h-16 w-16 ${currentTierData.color} rounded-full flex items-center justify-center text-4xl`}
                >
                  {currentTierData.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {currentTierData.name} Member
                  </h2>
                  <p className="text-gray-600">
                    Earning {currentTierData.pointsMultiplier}x points •{" "}
                    {currentTierData.cashbackRate}% cashback
                  </p>
                </div>
              </div>
              {nextTierData.name !== currentTierData.name && (
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    Next Tier: {nextTierData.name}
                  </p>
                  <p className="font-bold text-lg text-blue-600">
                    {pointsToNextTier.toLocaleString()} points to go
                  </p>
                </div>
              )}
            </div>

            {nextTierData.name !== currentTierData.name && (
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">
                    Progress to {nextTierData.name}
                  </span>
                  <span className="font-semibold text-gray-900">
                    {Math.round(tierProgress)}%
                  </span>
                </div>
                <Progress value={tierProgress} className="h-3" />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Current Benefits
                </h3>
                <ul className="space-y-1">
                  {currentTierData.benefits.map((benefit, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-gray-700"
                    >
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {nextTierData.name !== currentTierData.name && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Unlock at {nextTierData.name}
                  </h3>
                  <ul className="space-y-1">
                    {nextTierData.benefits.slice(0, 4).map((benefit, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm text-gray-700"
                      >
                        <Sparkles className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview">
              <Trophy className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="rewards">
              <Gift className="h-4 w-4 mr-2" />
              Rewards
            </TabsTrigger>
            <TabsTrigger value="referrals">
              <Users className="h-4 w-4 mr-2" />
              Referrals
            </TabsTrigger>
            <TabsTrigger value="activity">
              <Target className="h-4 w-4 mr-2" />
              Activity
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Points Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Points Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-gray-900 mb-2">
                    {clientData.currentPoints.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    Earn 1 point per $1 spent
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Earned</span>
                      <span className="font-semibold">
                        {clientData.currentPoints.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Spent</span>
                      <span className="font-semibold">0</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cashback Wallet */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    Cashback Wallet
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-gray-900 mb-2">
                    ${clientData.cashbackBalance}
                  </p>
                  <p className="text-sm text-gray-600 mb-4">Available to use</p>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Apply to Next Booking
                  </Button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Lifetime earned: ${clientData.lifetimeCashback}
                  </p>
                </CardContent>
              </Card>

              {/* Referral Earnings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    Referral Earnings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-gray-900 mb-2">
                    ${clientData.referralEarnings}
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    {clientData.referralsCount} successful referrals
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      document.getElementById("referrals-tab")?.click()
                    }
                  >
                    Invite Friends
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Ways to Earn More</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                    <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ShoppingBag className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        Book Another Service
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Earn {currentTierData.pointsMultiplier}x points on every
                        booking
                      </p>
                      <Button
                        size="sm"
                        onClick={() => navigate("/dashboard/client/providers")}
                      >
                        Browse Providers
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg">
                    <div className="h-12 w-12 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Star className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        Leave a Review
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Earn 50 bonus points for detailed reviews with photos
                      </p>
                      <Button size="sm" variant="outline">
                        Write Review
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg">
                    <div className="h-12 w-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        Refer Friends
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Get $25 when your friend completes their first $100+ job
                      </p>
                      <Button size="sm" variant="outline">
                        Share Code
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-yellow-50 rounded-lg">
                    <div className="h-12 w-12 bg-yellow-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        Special Promotions
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Double points on weekend bookings this month!
                      </p>
                      <Badge className="bg-yellow-600">Active Now</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rewards Marketplace Tab */}
          <TabsContent value="rewards" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Rewards Marketplace</CardTitle>
                <CardDescription>
                  Redeem your points for exclusive perks and discounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {marketplaceRewards.map((reward) => {
                    const Icon = reward.icon;
                    const canAfford =
                      clientData.currentPoints >= reward.pointsCost;

                    return (
                      <Card
                        key={reward.id}
                        className={`relative ${reward.popular ? "border-2 border-yellow-500" : ""}`}
                      >
                        {reward.popular && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <Badge className="bg-yellow-500">Popular</Badge>
                          </div>
                        )}
                        <CardContent className="pt-6">
                          <div
                            className={`h-12 w-12 ${reward.color} rounded-lg flex items-center justify-center mb-4`}
                          >
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <h3 className="font-bold text-lg text-gray-900 mb-1">
                            {reward.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-4">
                            {reward.description}
                          </p>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-1">
                              <Trophy className="h-4 w-4 text-yellow-500" />
                              <span className="font-bold text-gray-900">
                                {reward.pointsCost.toLocaleString()}
                              </span>
                              <span className="text-sm text-gray-600">
                                points
                              </span>
                            </div>
                          </div>
                          <Button
                            onClick={() =>
                              handleRedeemReward(reward.id, reward.pointsCost)
                            }
                            disabled={
                              !canAfford || selectedReward === reward.id
                            }
                            className={`w-full ${canAfford ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-300"}`}
                          >
                            {selectedReward === reward.id
                              ? "Redeeming..."
                              : canAfford
                                ? "Redeem Now"
                                : "Not Enough Points"}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Referrals Tab */}
          <TabsContent value="referrals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Invite Friends & Earn Rewards</CardTitle>
                <CardDescription>
                  Share your unique code and earn $25 for every friend who
                  completes a $100+ job
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white text-center mb-6">
                  <h3 className="text-2xl font-bold mb-4">
                    Your Referral Code
                  </h3>
                  <div className="bg-white/20 rounded-lg p-4 mb-4 inline-block">
                    <p className="text-4xl font-bold tracking-wider">
                      {clientData.referralCode}
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
                      {clientData.referralsCount}
                    </p>
                    <p className="text-sm text-gray-600">Total Referrals</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-3xl font-bold text-green-600 mb-1">
                      ${clientData.referralEarnings}
                    </p>
                    <p className="text-sm text-gray-600">Total Earned</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-3xl font-bold text-purple-600 mb-1">3</p>
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
                          Send your unique referral code to friends and family
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
                          Your friend creates an account using your code
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        3
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          They book a service
                        </p>
                        <p className="text-sm text-gray-600">
                          They complete a job of $100 or more
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
                          You get $25 credit, they get $25 off their booking
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Track your points and cashback earnings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                            activity.type === "earned"
                              ? "bg-green-100"
                              : "bg-red-100"
                          }`}
                        >
                          {activity.type === "earned" ? (
                            <TrendingUp className="h-5 w-5 text-green-600" />
                          ) : (
                            <Gift className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {activity.description}
                          </p>
                          <p className="text-sm text-gray-600">
                            {activity.date}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {activity.points && (
                          <p
                            className={`font-bold text-lg ${activity.points > 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {activity.points > 0 ? "+" : ""}
                            {activity.points.toLocaleString()} pts
                          </p>
                        )}
                        {activity.amount && (
                          <p className="font-bold text-lg text-green-600">
                            +${activity.amount.toFixed(2)}
                          </p>
                        )}
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
