import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Progress } from "../ui/progress";
import {
  CheckCircle,
  Shield,
  Briefcase,
  Mail,
  Phone,
  ArrowRight,
} from "lucide-react";
import { CategoryRequirementsDisplay } from "../verification/CategoryRequirementsDisplay";
import {
  SERVICE_CATEGORIES,
  getVerificationConfig,
  getRiskLevelColor,
} from "@/app/config/verificationConfig";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

type OnboardingStep =
  | "email"
  | "phone"
  | "category"
  | "requirements-review"
  | "complete";

const ONBOARDING_STEPS: OnboardingStep[] = [
  "email",
  "phone",
  "category",
  "requirements-review",
  "complete",
];

const getOnboardingStorageKey = (userId: string) =>
  `provider-onboarding-enhanced:${userId}`;

const getStepIndex = (step: OnboardingStep) => ONBOARDING_STEPS.indexOf(step);

const getMoreAdvancedStep = (a: OnboardingStep, b: OnboardingStep) =>
  getStepIndex(a) >= getStepIndex(b) ? a : b;

export function ProviderOnboardingEnhanced() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("email");
  const [formData, setFormData] = useState({
    email: "",
    emailCode: "",
    phone: "",
    phoneCode: "",
    selectedCategory: "",
  });
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [showEmailCode, setShowEmailCode] = useState(false);
  const [showPhoneCode, setShowPhoneCode] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setIsBootstrapping(false);
      return;
    }

    const bootstrap = async () => {
      const storageKey = getOnboardingStorageKey(user.id);

      let localStep: OnboardingStep | null = null;
      let localForm: Partial<typeof formData> = {};
      let localEmailVerified = false;
      let localPhoneVerified = false;
      let localShowEmailCode = false;
      let localShowPhoneCode = false;

      const raw = localStorage.getItem(storageKey);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as {
            currentStep?: OnboardingStep;
            formData?: typeof formData;
            emailVerified?: boolean;
            phoneVerified?: boolean;
            showEmailCode?: boolean;
            showPhoneCode?: boolean;
          };

          if (
            parsed.currentStep &&
            ONBOARDING_STEPS.includes(parsed.currentStep)
          ) {
            localStep = parsed.currentStep;
          }
          if (parsed.formData) {
            localForm = parsed.formData;
          }
          localEmailVerified = Boolean(parsed.emailVerified);
          localPhoneVerified = Boolean(parsed.phoneVerified);
          localShowEmailCode = Boolean(parsed.showEmailCode);
          localShowPhoneCode = Boolean(parsed.showPhoneCode);
        } catch {
          localStorage.removeItem(storageKey);
        }
      }

      const [{ data: authData }, profileResult, providerProfileResult] =
        await Promise.all([
          supabase.auth.getUser(),
          supabase
            .from("profiles")
            .select("phone, phone_verified")
            .eq("id", user.id)
            .maybeSingle(),
          supabase
            .from("provider_profiles")
            .select("services, verification_status")
            .eq("user_id", user.id)
            .maybeSingle(),
        ]);

      const serverEmailVerified = Boolean(authData.user?.email_confirmed_at);
      const serverPhone = profileResult.data?.phone ?? "";
      const serverPhoneVerified = Boolean(profileResult.data?.phone_verified);
      const services = providerProfileResult.data?.services;
      const serverCategory = Array.isArray(services) ? (services[0] ?? "") : "";
      const serverVerificationStatus =
        providerProfileResult.data?.verification_status;

      let serverStep: OnboardingStep = "email";
      if (serverEmailVerified) {
        serverStep = "phone";
      }
      if (serverPhoneVerified) {
        serverStep = "category";
      }
      if (serverCategory) {
        serverStep = "requirements-review";
      }
      if (
        serverVerificationStatus === "pending" ||
        serverVerificationStatus === "approved"
      ) {
        serverStep = "complete";
      }

      const resolvedStep = localStep
        ? getMoreAdvancedStep(localStep, serverStep)
        : serverStep;

      setFormData((prev) => ({
        ...prev,
        ...localForm,
        email: user.email ?? prev.email,
        phone: localForm.phone ?? serverPhone ?? prev.phone,
        selectedCategory:
          localForm.selectedCategory ?? serverCategory ?? prev.selectedCategory,
      }));
      setEmailVerified(localEmailVerified || serverEmailVerified);
      setPhoneVerified(localPhoneVerified || serverPhoneVerified);
      setShowEmailCode(localShowEmailCode || serverEmailVerified);
      setShowPhoneCode(localShowPhoneCode || serverPhoneVerified);
      setCurrentStep(resolvedStep);
      setIsBootstrapping(false);
    };

    void bootstrap();
  }, [user?.id, user?.email]);

  useEffect(() => {
    if (!user?.id) return;

    const storageKey = getOnboardingStorageKey(user.id);
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        currentStep,
        formData,
        emailVerified,
        phoneVerified,
        showEmailCode,
        showPhoneCode,
      }),
    );
  }, [
    user?.id,
    currentStep,
    formData,
    emailVerified,
    phoneVerified,
    showEmailCode,
    showPhoneCode,
  ]);

  const currentStepIndex = ONBOARDING_STEPS.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / ONBOARDING_STEPS.length) * 100;

  const selectedCategoryConfig = formData.selectedCategory
    ? getVerificationConfig(formData.selectedCategory)
    : null;

  const handleSendEmailCode = () => {
    setShowEmailCode(true);
    setErrorMessage(null);
    if (!formData.email) return;

    supabase.auth
      .resend({
        type: "signup",
        email: formData.email,
      })
      .catch((error) => {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to resend verification email.";
        setErrorMessage(message);
      });
  };

  const handleVerifyEmail = () => {
    setEmailVerified(true);
  };

  const handleSendPhoneCode = () => {
    // In real app, send SMS code
    setShowPhoneCode(true);
  };

  const handleVerifyPhone = () => {
    setPhoneVerified(true);

    if (user?.id) {
      supabase
        .from("profiles")
        .update({ phone: formData.phone, phone_verified: true })
        .eq("id", user.id)
        .catch((error) => {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to save phone verification.";
          setErrorMessage(message);
        });
    }
  };

  const handleContinue = () => {
    const nextStepMap: Record<OnboardingStep, OnboardingStep> = {
      email: "phone",
      phone: "category",
      category: "requirements-review",
      "requirements-review": "complete",
      complete: "complete",
    };
    const nextStep = nextStepMap[currentStep];
    if (
      currentStep === "requirements-review" &&
      user?.id &&
      formData.selectedCategory
    ) {
      void (async () => {
        const { error } = await supabase
          .from("provider_profiles")
          .update({
            services: [formData.selectedCategory],
            verification_status: "pending",
          })
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
      })().catch((error) => {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to save service category.";
        setErrorMessage(message);
      });
    }
    setCurrentStep(nextStep);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "email":
        return (
          <div className="space-y-6">
            {errorMessage && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 bg-[#FDEFD6] rounded-full mb-4">
                <Mail className="h-8 w-8 text-[#F1A400]" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Email verification</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              {!showEmailCode && (
                <Button
                  className="w-full bg-[#F1A400] hover:bg-[#EFA055]"
                  onClick={handleSendEmailCode}
                  disabled={!formData.email}
                >
                  Send code
                </Button>
              )}

              {showEmailCode && !emailVerified && (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      Code sent to {formData.email}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="emailCode">Verification Code</Label>
                    <Input
                      id="emailCode"
                      type="text"
                      placeholder="000000"
                      maxLength={6}
                      value={formData.emailCode}
                      onChange={(e) =>
                        setFormData({ ...formData, emailCode: e.target.value })
                      }
                    />
                  </div>

                  <Button
                    className="w-full bg-[#F1A400] hover:bg-[#EFA055]"
                    onClick={handleVerifyEmail}
                    disabled={formData.emailCode.length !== 6}
                  >
                    Verify
                  </Button>

                  <button
                    type="button"
                    className="text-sm text-[#F1A400] hover:underline w-full"
                    onClick={handleSendEmailCode}
                  >
                    Resend code
                  </button>
                </>
              )}

              {emailVerified && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">Email verified</span>
                  </div>
                </div>
              )}
            </div>

            {emailVerified && (
              <Button
                className="w-full bg-[#F1A400] hover:bg-[#EFA055]"
                onClick={handleContinue}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        );

      case "phone":
        return (
          <div className="space-y-6">
            {errorMessage && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 bg-[#FDEFD6] rounded-full mb-4">
                <Phone className="h-8 w-8 text-[#F1A400]" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Phone verification</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>

              {!showPhoneCode && (
                <Button
                  className="w-full bg-[#F1A400] hover:bg-[#EFA055]"
                  onClick={handleSendPhoneCode}
                  disabled={!formData.phone}
                >
                  Send code
                </Button>
              )}

              {showPhoneCode && !phoneVerified && (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      Code sent to {formData.phone}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="phoneCode">SMS Code</Label>
                    <Input
                      id="phoneCode"
                      type="text"
                      placeholder="000000"
                      maxLength={6}
                      value={formData.phoneCode}
                      onChange={(e) =>
                        setFormData({ ...formData, phoneCode: e.target.value })
                      }
                    />
                  </div>

                  <Button
                    className="w-full bg-[#F1A400] hover:bg-[#EFA055]"
                    onClick={handleVerifyPhone}
                    disabled={formData.phoneCode.length !== 6}
                  >
                    Verify
                  </Button>

                  <button
                    type="button"
                    className="text-sm text-[#F1A400] hover:underline w-full"
                    onClick={handleSendPhoneCode}
                  >
                    Resend code
                  </button>
                </>
              )}

              {phoneVerified && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">Phone verified</span>
                  </div>
                </div>
              )}
            </div>

            {phoneVerified && (
              <Button
                className="w-full bg-[#F1A400] hover:bg-[#EFA055]"
                onClick={handleContinue}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        );

      case "category":
        return (
          <div className="space-y-6">
            {errorMessage && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 bg-[#FDEFD6] rounded-full mb-4">
                <Briefcase className="h-8 w-8 text-[#F1A400]" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Service category</h2>
            </div>

            <div className="grid gap-3">
              {SERVICE_CATEGORIES.map((category) => {
                const isSelected =
                  formData.selectedCategory === category.category;
                return (
                  <button
                    type="button"
                    key={category.category}
                    onClick={() =>
                      setFormData({
                        ...formData,
                        selectedCategory: category.category,
                      })
                    }
                    className={`text-left p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? "border-[#F1A400] bg-[#FDEFD6]"
                        : "border-gray-200 hover:border-[#F7C876] bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {category.category}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span
                            className={`text-xs px-2 py-0.5 rounded border ${getRiskLevelColor(category.riskLevel)}`}
                          >
                            {category.riskLevel.charAt(0).toUpperCase() +
                              category.riskLevel.slice(1)}{" "}
                            Risk
                          </span>
                          {category.licenseRequired && (
                            <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                              License Required
                            </span>
                          )}
                          {category.insuranceRequired && (
                            <span className="text-xs px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                              Insurance: {category.insuranceMinimum}
                            </span>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle className="h-6 w-6 text-[#F1A400] flex-shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {formData.selectedCategory && (
              <Button
                className="w-full bg-[#F1A400] hover:bg-[#EFA055]"
                onClick={handleContinue}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        );

      case "requirements-review":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 bg-[#FDEFD6] rounded-full mb-4">
                <Shield className="h-8 w-8 text-[#F1A400]" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Requirements</h2>
            </div>

            {selectedCategoryConfig && (
              <CategoryRequirementsDisplay config={selectedCategoryConfig} />
            )}

            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setCurrentStep("category")}
              >
                Back
              </Button>
              <Button
                className="flex-1 bg-[#F1A400] hover:bg-[#EFA055]"
                onClick={handleContinue}
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case "complete":
        return (
          <div className="space-y-6 text-center py-6">
            <div className="inline-flex items-center justify-center h-24 w-24 bg-green-100 rounded-full mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>

            <h2 className="text-3xl font-bold">Setup complete</h2>
            <p className="text-gray-600">
              Continue to verification or job board.
            </p>

            <div className="flex gap-4 max-w-md mx-auto">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/dashboard/provider/job-board")}
              >
                Browse Jobs
              </Button>
              <Button
                className="flex-1 bg-[#F1A400] hover:bg-[#EFA055]"
                onClick={() => navigate("/provider/verification")}
              >
                Complete Verification
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isBootstrapping) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <Card className="border-2">
            <CardContent className="p-8 text-sm text-gray-600">
              Loading…
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStepIndex + 1} of {ONBOARDING_STEPS.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="border-2">
          <CardContent className="p-8">{renderStepContent()}</CardContent>
        </Card>
      </div>
    </div>
  );
}
