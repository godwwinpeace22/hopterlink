import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  CheckCircle2,
  Upload,
  Camera,
  Calendar,
  CreditCard,
  Shield,
  Clock,
  Briefcase,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useProviderOnboardingBootstrap } from "@/app/hooks/useProviderOnboardingBootstrap";

// Availability Calendar Component
interface AvailabilityCalendarProps {
  availability: Record<string, boolean>;
  setAvailability: (val: Record<string, boolean>) => void;
}

function AvailabilityCalendar({
  availability,
  setAvailability,
}: AvailabilityCalendarProps) {
  const generateNext14Days = () => {
    const days = [];
    const today = new Date();

    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }

    return days;
  };

  const days = generateNext14Days();
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const toggleDay = (dateStr: string) => {
    setAvailability({
      ...availability,
      [dateStr]: !availability[dateStr],
    });
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="grid grid-cols-7 gap-2">
        {days.map((date, index) => {
          const dateStr = date.toISOString().split("T")[0];
          const isAvailable = availability[dateStr];
          const dayName = dayNames[date.getDay()];
          const dayNumber = date.getDate();

          return (
            <button
              key={index}
              type="button"
              onClick={() => toggleDay(dateStr)}
              className={`p-3 rounded-lg border-2 transition-all ${
                isAvailable
                  ? "bg-green-100 border-green-500 text-green-700"
                  : "bg-white border-gray-200 text-gray-600 hover:border-blue-300"
              }`}
            >
              <div className="text-xs font-semibold">{dayName}</div>
              <div className="text-lg font-bold">{dayNumber}</div>
              {isAvailable && <CheckCircle2 className="h-4 w-4 mx-auto mt-1" />}
            </button>
          );
        })}
      </div>

      <div className="mt-4 text-sm text-gray-600 text-center">
        Click days to toggle availability •{" "}
        {Object.keys(availability).filter((k) => availability[k]).length} days
        selected
      </div>
    </div>
  );
}

type OnboardingStep =
  | "email-verify"
  | "documents"
  | "profile"
  | "availability"
  | "payment"
  | "review"
  | "pending";

export function ProviderOnboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] =
    useState<OnboardingStep>("email-verify");
  const [emailVerified, setEmailVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isInitializedFromBootstrap, setIsInitializedFromBootstrap] =
    useState(false);

  const { data: onboardingBootstrap } = useProviderOnboardingBootstrap(
    user?.id,
  );

  // Document upload state
  const [documents, setDocuments] = useState({
    governmentId: null as File | null,
    insurance: null as File | null,
    certifications: [] as File[],
  });

  // Profile state
  const [profile, setProfile] = useState({
    profilePhoto: null as File | null,
    portfolioImages: [] as File[],
    serviceAreas: [] as string[],
    serviceRadius: "10",
    hourlyRate: "",
    description: "",
  });

  // Availability state (simplified 2-week view)
  const [availability, setAvailability] = useState<Record<string, boolean>>({});

  // Payment state
  const [payment, setPayment] = useState({
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    routingNumber: "",
    accountType: "checking",
  });

  const steps = [
    { id: "email-verify", label: "Verify Email", icon: Shield },
    { id: "documents", label: "Documents", icon: Upload },
    { id: "profile", label: "Profile Setup", icon: Briefcase },
    { id: "availability", label: "Availability", icon: Calendar },
    { id: "payment", label: "Payment", icon: CreditCard },
    { id: "review", label: "Review", icon: CheckCircle2 },
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex((s) => s.id === currentStep);
  };

  const handleFileUpload = (field: string, file: File | null) => {
    if (field === "governmentId" || field === "insurance") {
      setDocuments({ ...documents, [field]: file });
    } else if (field === "profilePhoto") {
      setProfile({ ...profile, profilePhoto: file });
    }
  };

  const handleNext = () => {
    const stepOrder: OnboardingStep[] = [
      "email-verify",
      "documents",
      "profile",
      "availability",
      "payment",
      "review",
      "pending",
    ];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const stepOrder: OnboardingStep[] = [
      "email-verify",
      "documents",
      "profile",
      "availability",
      "payment",
      "review",
    ];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  useEffect(() => {
    if (!onboardingBootstrap || isInitializedFromBootstrap) {
      return;
    }

    if (onboardingBootstrap.emailVerified) {
      setEmailVerified(true);
    }

    setCurrentStep(onboardingBootstrap.resumeStep);
    setIsInitializedFromBootstrap(true);
  }, [onboardingBootstrap, isInitializedFromBootstrap]);

  const handleResendVerification = async () => {
    if (!user?.email) {
      setErrorMessage("Please sign in again to resend verification email.");
      return;
    }

    try {
      setErrorMessage(null);
      await supabase.auth.resend({
        type: "signup",
        email: user.email,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to resend verification email.";
      setErrorMessage(message);
    }
  };

  const uploadDocument = async (
    documentType: "id" | "insurance" | "certification",
    file: File,
  ) => {
    if (!user?.id) {
      throw new Error("You must be signed in to upload documents.");
    }

    const safeFileName = file.name
      .normalize("NFKD")
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/_+/g, "_");

    const filePath = `${user.id}/${documentType}/${Date.now()}-${safeFileName}`;

    const { error: uploadError } = await supabase.storage
      .from("provider-documents")
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { error: docError } = await supabase
      .from("verification_documents")
      .upsert(
        {
          provider_id: user.id,
          document_type: documentType,
          file_url: filePath,
          file_name: file.name,
          status: "pending",
        },
        { onConflict: "provider_id,document_type" },
      );

    if (docError) {
      throw docError;
    }
  };

  const handleContinueDocuments = async () => {
    if (!documents.governmentId || !documents.insurance) {
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      await uploadDocument("id", documents.governmentId);
      await uploadDocument("insurance", documents.insurance);

      handleNext();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to upload documents.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinueProfile = async () => {
    if (!user?.id) {
      setErrorMessage("You must be signed in to continue.");
      return;
    }

    if (!profile.profilePhoto || !profile.description || !profile.hourlyRate) {
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const safeAvatarName = profile.profilePhoto.name
        .normalize("NFKD")
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .replace(/_+/g, "_");

      const photoPath = `${user.id}/${Date.now()}-${safeAvatarName}`;
      const { error: avatarError } = await supabase.storage
        .from("avatars")
        .upload(photoPath, profile.profilePhoto);

      if (avatarError) {
        throw avatarError;
      }

      const { data: avatarPublic } = supabase.storage
        .from("avatars")
        .getPublicUrl(photoPath);

      await supabase
        .from("profiles")
        .update({
          avatar_url: avatarPublic?.publicUrl ?? null,
        })
        .eq("id", user.id);

      const hourlyRate = Number.parseFloat(profile.hourlyRate);

      const { error: providerError } = await supabase
        .from("provider_profiles")
        .update({
          bio: profile.description,
          hourly_rate: Number.isNaN(hourlyRate) ? null : hourlyRate,
          service_areas: profile.serviceAreas,
        })
        .eq("user_id", user.id);

      if (providerError) {
        throw providerError;
      }

      handleNext();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save profile.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinueAvailability = async () => {
    if (!user?.id) {
      setErrorMessage("You must be signed in to continue.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const { error } = await supabase
        .from("provider_profiles")
        .update({ availability })
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      handleNext();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save availability.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinuePayment = async () => {
    if (!user?.id) {
      setErrorMessage("You must be signed in to continue.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const last4 = payment.accountNumber.slice(-4);
      const { error } = await supabase
        .from("profiles")
        .update({
          metadata: {
            payout: {
              bankName: payment.bankName,
              accountType: payment.accountType,
              last4,
            },
          },
        })
        .eq("id", user.id);

      if (error) {
        throw error;
      }

      handleNext();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to save payout details.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitApplication = async () => {
    if (!user?.id) {
      setErrorMessage("You must be signed in to submit your application.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const { error } = await supabase
        .from("provider_profiles")
        .update({ verification_status: "pending" })
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      const { error: membershipError } = await supabase.rpc(
        "submit_role_onboarding",
        {
          p_role: "provider",
        },
      );

      if (membershipError) {
        throw membershipError;
      }

      setCurrentStep("pending");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to submit application.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "email-verify":
        return (
          <div className="space-y-6">
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center h-20 w-20 bg-blue-100 rounded-full mb-6">
                <Shield className="h-10 w-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Verify Your Email</h2>
              <p className="text-gray-600 mb-6">
                We've sent a verification link to{" "}
                <strong>provider@example.com</strong>
              </p>

              {!emailVerified ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-700">
                    Check your inbox and click the verification link. This page
                    will update automatically.
                  </p>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center gap-2 text-green-700">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-semibold">
                      Email verified successfully!
                    </span>
                  </div>
                </div>
              )}

              <Button
                onClick={() => setEmailVerified(true)}
                variant="outline"
                className="mb-4"
              >
                Simulate Email Verification (Demo)
              </Button>

              <p className="text-sm text-gray-500">
                Didn't receive the email?{" "}
                <button
                  className="text-blue-600 hover:underline"
                  onClick={handleResendVerification}
                >
                  Resend verification
                </button>
              </p>
            </div>

            <Button
              onClick={handleNext}
              disabled={!emailVerified}
              className="w-full bg-blue-600 hover:bg-blue-700 py-6"
            >
              Continue to Document Upload
            </Button>
          </div>
        );

      case "documents":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Upload Documents</h2>
              <p className="text-gray-600 mb-6">
                All documents are{" "}
                <span className="text-red-600 font-semibold">
                  securely encrypted
                </span>{" "}
                and reviewed by our verification team
              </p>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <Label className="text-lg font-semibold">
                    Government-Issued ID <span className="text-red-600">*</span>
                  </Label>
                  <p className="text-sm text-gray-600 mb-3">
                    Driver's license, passport, or state ID
                  </p>

                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) =>
                      handleFileUpload(
                        "governmentId",
                        e.target.files?.[0] || null,
                      )
                    }
                    className="hidden"
                    id="governmentId"
                  />
                  <label htmlFor="governmentId">
                    <Button
                      type="button"
                      variant="outline"
                      className="cursor-pointer"
                      asChild
                    >
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        {documents.governmentId
                          ? documents.governmentId.name
                          : "Choose File"}
                      </span>
                    </Button>
                  </label>

                  {documents.governmentId && (
                    <div className="mt-2 flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm">File uploaded</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <Label className="text-lg font-semibold">
                    Proof of Insurance <span className="text-red-600">*</span>
                  </Label>
                  <p className="text-sm text-gray-600 mb-3">
                    Liability insurance certificate or opt-in form
                  </p>

                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) =>
                      handleFileUpload("insurance", e.target.files?.[0] || null)
                    }
                    className="hidden"
                    id="insurance"
                  />
                  <label htmlFor="insurance">
                    <Button
                      type="button"
                      variant="outline"
                      className="cursor-pointer"
                      asChild
                    >
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        {documents.insurance
                          ? documents.insurance.name
                          : "Choose File"}
                      </span>
                    </Button>
                  </label>

                  {documents.insurance && (
                    <div className="mt-2 flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm">File uploaded</span>
                    </div>
                  )}

                  <button className="text-blue-600 hover:underline text-sm mt-2 block">
                    Don't have insurance? Learn about our coverage plan →
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">
                  Documents typically take 24-48 hours to verify. You'll receive
                  an email when approved.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleBack}
                variant="outline"
                className="flex-1 py-6"
              >
                Back
              </Button>
              <Button
                onClick={handleContinueDocuments}
                disabled={
                  !documents.governmentId ||
                  !documents.insurance ||
                  isSubmitting
                }
                className="flex-1 bg-blue-600 hover:bg-blue-700 py-6"
              >
                {isSubmitting ? "Uploading..." : "Continue to Profile Setup"}
              </Button>
            </div>
          </div>
        );

      case "profile":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Complete Your Profile</h2>
              <p className="text-gray-600 mb-6">
                Help clients find you and understand your services
              </p>
            </div>

            <div>
              <Label className="text-lg font-semibold mb-3 block">
                Profile Photo <span className="text-red-600">*</span>
              </Label>
              <div className="flex items-center gap-6">
                <div className="h-32 w-32 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  {profile.profilePhoto ? (
                    <img
                      src={URL.createObjectURL(profile.profilePhoto)}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Camera className="h-12 w-12 text-gray-400" />
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleFileUpload(
                        "profilePhoto",
                        e.target.files?.[0] || null,
                      )
                    }
                    className="hidden"
                    id="profilePhoto"
                  />
                  <label htmlFor="profilePhoto">
                    <Button type="button" variant="outline" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Photo
                      </span>
                    </Button>
                  </label>
                  <p className="text-sm text-gray-500 mt-2">
                    Professional headshot recommended
                  </p>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="text-lg font-semibold">
                Service Description <span className="text-red-600">*</span>
              </Label>
              <p className="text-sm text-gray-600 mb-2">
                Describe your services and experience
              </p>
              <Textarea
                id="description"
                placeholder="I specialize in residential plumbing with 10+ years of experience..."
                rows={6}
                value={profile.description}
                onChange={(e) =>
                  setProfile({ ...profile, description: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="serviceRadius">
                Service Radius (miles) <span className="text-red-600">*</span>
              </Label>
              <Input
                id="serviceRadius"
                type="number"
                min="1"
                max="100"
                value={profile.serviceRadius}
                onChange={(e) =>
                  setProfile({ ...profile, serviceRadius: e.target.value })
                }
                placeholder="10"
              />
              <p className="text-sm text-gray-500 mt-1">
                How far are you willing to travel for jobs?
              </p>
            </div>

            <div>
              <Label htmlFor="hourlyRate">
                Base Hourly Rate <span className="text-red-600">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  $
                </span>
                <Input
                  id="hourlyRate"
                  type="number"
                  min="0"
                  step="5"
                  value={profile.hourlyRate}
                  onChange={(e) =>
                    setProfile({ ...profile, hourlyRate: e.target.value })
                  }
                  placeholder="50"
                  className="pl-8"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleBack}
                variant="outline"
                className="flex-1 py-6"
              >
                Back
              </Button>
              <Button
                onClick={handleContinueProfile}
                disabled={
                  !profile.profilePhoto ||
                  !profile.description ||
                  !profile.hourlyRate ||
                  isSubmitting
                }
                className="flex-1 bg-blue-600 hover:bg-blue-700 py-6"
              >
                {isSubmitting ? "Saving..." : "Continue to Availability"}
              </Button>
            </div>
          </div>
        );

      case "availability":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Set Your Availability</h2>
              <p className="text-gray-600 mb-6">
                Let clients know when you're available for the next 2 weeks
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>How it works:</strong> Select the days you're
                    available. You can update this anytime.
                  </p>
                  <p className="text-sm text-gray-600">
                    Clients see your availability in real-time when booking.
                  </p>
                </div>
              </div>
            </div>

            <AvailabilityCalendar
              availability={availability}
              setAvailability={setAvailability}
            />

            <div className="flex gap-4">
              <Button
                onClick={handleBack}
                variant="outline"
                className="flex-1 py-6"
              >
                Back
              </Button>
              <Button
                onClick={handleContinueAvailability}
                className="flex-1 bg-blue-600 hover:bg-blue-700 py-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Continue to Payment Setup"}
              </Button>
            </div>
          </div>
        );

      case "payment":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Payment Information</h2>
              <p className="text-gray-600 mb-6">
                Where should we send your earnings?
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">
                  All financial information is{" "}
                  <span className="text-red-600 font-semibold">encrypted</span>{" "}
                  and <span className="text-red-600 font-semibold">secure</span>
                  .
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="accountHolderName">
                  Account Holder Name <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="accountHolderName"
                  type="text"
                  placeholder="John Doe"
                  value={payment.accountHolderName}
                  onChange={(e) =>
                    setPayment({
                      ...payment,
                      accountHolderName: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="bankName">
                  Bank Name <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="bankName"
                  type="text"
                  placeholder="Chase Bank"
                  value={payment.bankName}
                  onChange={(e) =>
                    setPayment({ ...payment, bankName: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="accountNumber">
                  Account Number <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="accountNumber"
                  type="text"
                  placeholder="1234567890"
                  value={payment.accountNumber}
                  onChange={(e) =>
                    setPayment({ ...payment, accountNumber: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="routingNumber">
                  Routing Number <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="routingNumber"
                  type="text"
                  placeholder="123456789"
                  maxLength={9}
                  value={payment.routingNumber}
                  onChange={(e) =>
                    setPayment({ ...payment, routingNumber: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleBack}
                variant="outline"
                className="flex-1 py-6"
              >
                Back
              </Button>
              <Button
                onClick={handleContinuePayment}
                disabled={
                  !payment.accountHolderName ||
                  !payment.bankName ||
                  !payment.accountNumber ||
                  !payment.routingNumber ||
                  isSubmitting
                }
                className="flex-1 bg-blue-600 hover:bg-blue-700 py-6"
              >
                {isSubmitting ? "Saving..." : "Continue to Review"}
              </Button>
            </div>
          </div>
        );

      case "review":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Review & Submit</h2>
              <p className="text-gray-600 mb-6">
                Please review your information before submitting
              </p>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>
                        Government ID:{" "}
                        {documents.governmentId?.name || "Not uploaded"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>
                        Insurance: {documents.insurance?.name || "Not uploaded"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Service radius: {profile.serviceRadius} miles</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Hourly rate: ${profile.hourlyRate}/hr</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Availability</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>
                      {
                        Object.keys(availability).filter((k) => availability[k])
                          .length
                      }{" "}
                      days marked available
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-700">
                  <p className="font-semibold text-red-600 mb-1">
                    What happens next?
                  </p>
                  <p>
                    Your application will be reviewed within 24-48 hours. You'll
                    receive an email when approved.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleBack}
                variant="outline"
                className="flex-1 py-6"
              >
                Back
              </Button>
              <Button
                onClick={handleSubmitApplication}
                className="flex-1 bg-red-600 hover:bg-red-700 py-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </div>
        );

      case "pending":
        return (
          <div className="space-y-6 text-center py-8">
            <div className="inline-flex items-center justify-center h-24 w-24 bg-green-100 rounded-full mb-6">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>

            <h2 className="text-3xl font-bold">Application Submitted!</h2>

            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Thank you for applying to become a Fixers Hive service provider
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="font-semibold text-lg mb-4">What's Next?</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm">
                    1
                  </div>
                  <p className="text-sm text-gray-700">
                    Our verification team will review your documents (24-48
                    hours)
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm">
                    2
                  </div>
                  <p className="text-sm text-gray-700">
                    You'll receive an email confirmation when approved
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm">
                    3
                  </div>
                  <p className="text-sm text-gray-700">
                    Once approved, you can start accepting jobs immediately!
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => navigate("/dashboard/provider")}
              className="bg-blue-600 hover:bg-blue-700 px-8 py-6"
            >
              Return to Dashboard
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  if (currentStep === "pending") {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-green-200">
            <CardContent className="p-8">{renderStepContent()}</CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = getCurrentStepIndex() > index;

              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`h-12 w-12 rounded-full flex items-center justify-center border-2 transition-colors ${
                        isActive
                          ? "bg-blue-600 border-blue-600 text-white"
                          : isCompleted
                            ? "bg-green-500 border-green-500 text-white"
                            : "bg-white border-gray-300 text-gray-400"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : (
                        <Icon className="h-6 w-6" />
                      )}
                    </div>
                    <span
                      className={`text-xs mt-2 text-center max-w-[80px] ${
                        isActive
                          ? "font-semibold text-blue-600"
                          : "text-gray-500"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-0.5 w-12 mx-2 ${
                        isCompleted ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <Card>
          <CardContent className="p-8">
            {errorMessage && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}
            {renderStepContent()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
