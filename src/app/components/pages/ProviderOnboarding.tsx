import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@/lib/router";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  AlertCircle,
  Briefcase,
  Calendar,
  Camera,
  CheckCircle2,
  CreditCard,
  Shield,
  Upload,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import {
  useProviderOnboardingBootstrap,
  type ProviderOnboardingDocument,
} from "@/app/hooks/useProviderOnboardingBootstrap";
import {
  PROVIDER_ONBOARDING_WEEKDAYS,
  buildProviderPayoutMetadataPatch,
  buildWeeklyAvailability,
  getSelectedWeekdaysFromAvailability,
  type ProviderOnboardingStep,
  type ProviderOnboardingWeekday,
} from "@/lib/providerOnboarding";

const WEEKDAY_LABELS: Record<ProviderOnboardingWeekday, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

const STEP_ORDER: ProviderOnboardingStep[] = [
  "email-verify",
  "documents",
  "profile",
  "availability",
  "payment",
  "review",
  "pending",
];

const STEP_CONFIG = [
  { id: "email-verify", label: "Verify Email", icon: Shield },
  { id: "documents", label: "Documents", icon: Upload },
  { id: "profile", label: "Profile Setup", icon: Briefcase },
  { id: "availability", label: "Availability", icon: Calendar },
  { id: "payment", label: "Payment", icon: CreditCard },
  { id: "review", label: "Review", icon: CheckCircle2 },
] as const;

const documentStatusClass: Record<string, string> = {
  approved: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  rejected: "bg-red-100 text-red-700",
  expired: "bg-red-100 text-red-700",
};

type OnboardingFiles = {
  governmentId: File | null;
  insurance: File | null;
};

type ProfileFormState = {
  profilePhoto: File | null;
  businessName: string;
  services: string;
  serviceAreas: string;
  hourlyRate: string;
  description: string;
};

type PaymentFormState = {
  bankName: string;
  accountType: string;
  accountNumber: string;
};

export function ProviderOnboarding() {
  const navigate = useNavigate();
  const { user, memberships, startRoleOnboarding } = useAuth();
  const onboardingQuery = useProviderOnboardingBootstrap(user?.id);
  const onboardingBootstrap = onboardingQuery.data;

  const [currentStep, setCurrentStep] =
    useState<ProviderOnboardingStep>("email-verify");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isInitializedFromBootstrap, setIsInitializedFromBootstrap] =
    useState(false);
  const [documents, setDocuments] = useState<OnboardingFiles>({
    governmentId: null,
    insurance: null,
  });
  const [profile, setProfile] = useState<ProfileFormState>({
    profilePhoto: null,
    businessName: "",
    services: "",
    serviceAreas: "",
    hourlyRate: "",
    description: "",
  });
  const [selectedDays, setSelectedDays] = useState<ProviderOnboardingWeekday[]>(
    [],
  );
  const [payment, setPayment] = useState<PaymentFormState>({
    bankName: "",
    accountType: "",
    accountNumber: "",
  });
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);

  const providerMembership = useMemo(
    () => memberships.find((membership) => membership.role === "provider"),
    [memberships],
  );
  const shouldRecordOnboardingStart =
    providerMembership?.state == null ||
    providerMembership.state === "not_started" ||
    providerMembership.state === "rejected";

  useEffect(() => {
    setIsInitializedFromBootstrap(false);
    setCurrentStep("email-verify");
    setDocuments({ governmentId: null, insurance: null });
    setProfile({
      profilePhoto: null,
      businessName: "",
      services: "",
      serviceAreas: "",
      hourlyRate: "",
      description: "",
    });
    setSelectedDays([]);
    setPayment({ bankName: "", accountType: "", accountNumber: "" });
    setErrorMessage(null);
  }, [user?.id]);

  useEffect(() => {
    if (!profile.profilePhoto) {
      setAvatarPreviewUrl(onboardingBootstrap?.profile?.avatar_url ?? null);
      return;
    }

    const nextUrl = URL.createObjectURL(profile.profilePhoto);
    setAvatarPreviewUrl(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [onboardingBootstrap?.profile?.avatar_url, profile.profilePhoto]);

  useEffect(() => {
    if (!onboardingBootstrap || isInitializedFromBootstrap) {
      return;
    }

    const payout =
      onboardingBootstrap.profile?.metadata &&
      typeof onboardingBootstrap.profile.metadata === "object" &&
      !Array.isArray(onboardingBootstrap.profile.metadata)
        ? ((onboardingBootstrap.profile.metadata as { payout?: unknown })
            .payout as
            | {
                bankName?: string;
                accountType?: string;
                last4?: string;
              }
            | undefined)
        : undefined;

    setCurrentStep(onboardingBootstrap.resumeStep);
    setProfile((current) => ({
      ...current,
      businessName: onboardingBootstrap.providerProfile?.business_name ?? "",
      services: (onboardingBootstrap.providerProfile?.services ?? []).join(
        ", ",
      ),
      serviceAreas: (
        onboardingBootstrap.providerProfile?.service_areas ?? []
      ).join(", "),
      hourlyRate:
        onboardingBootstrap.providerProfile?.hourly_rate?.toString() ?? "",
      description: onboardingBootstrap.providerProfile?.bio ?? "",
    }));
    setSelectedDays(
      getSelectedWeekdaysFromAvailability(
        onboardingBootstrap.providerProfile?.availability,
      ),
    );
    setPayment({
      bankName: payout?.bankName ?? "",
      accountType: payout?.accountType ?? "",
      accountNumber: payout?.last4 ?? "",
    });
    setIsInitializedFromBootstrap(true);
  }, [isInitializedFromBootstrap, onboardingBootstrap]);

  const getCurrentStepIndex = () =>
    STEP_CONFIG.findIndex((step) => step.id === currentStep);

  const existingDocuments = useMemo(() => {
    const byType: Record<
      "id" | "insurance",
      ProviderOnboardingDocument | null
    > = {
      id: null,
      insurance: null,
    };

    for (const document of onboardingBootstrap?.documents ?? []) {
      if (
        document.document_type === "id" ||
        document.document_type === "insurance"
      ) {
        byType[document.document_type] = document;
      }
    }

    return byType;
  }, [onboardingBootstrap?.documents]);

  const hasProfilePhoto = Boolean(
    profile.profilePhoto || onboardingBootstrap?.profile?.avatar_url,
  );
  const hasGovernmentId = Boolean(
    documents.governmentId || existingDocuments.id,
  );
  const hasInsurance = Boolean(
    documents.insurance || existingDocuments.insurance,
  );

  const selectedDaySummary =
    selectedDays.length > 0
      ? selectedDays.map((day) => WEEKDAY_LABELS[day]).join(", ")
      : "No days selected";

  const updateProfile = (updates: Partial<ProfileFormState>) => {
    setProfile((current) => ({ ...current, ...updates }));
  };

  const updatePayment = (updates: Partial<PaymentFormState>) => {
    setPayment((current) => ({ ...current, ...updates }));
  };

  const handleFileUpload = (
    field: keyof OnboardingFiles | "profilePhoto",
    file: File | null,
  ) => {
    if (field === "profilePhoto") {
      updateProfile({ profilePhoto: file });
      return;
    }

    setDocuments((current) => ({ ...current, [field]: file }));
  };

  const handleNext = () => {
    const currentIndex = STEP_ORDER.indexOf(currentStep);
    if (currentIndex >= 0 && currentIndex < STEP_ORDER.length - 1) {
      setCurrentStep(STEP_ORDER[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const currentIndex = STEP_ORDER.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEP_ORDER[currentIndex - 1]);
    }
  };

  const toggleDay = (day: ProviderOnboardingWeekday) => {
    setSelectedDays((current) =>
      current.includes(day)
        ? current.filter((entry) => entry !== day)
        : [...current, day],
    );
  };

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
    documentType: "id" | "insurance",
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

    const { error: documentError } = await supabase
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

    if (documentError) {
      throw documentError;
    }
  };

  const refreshBootstrap = async () => {
    await onboardingQuery.refetch();
  };

  const ensureProviderOnboardingStarted = async () => {
    if (!shouldRecordOnboardingStart) {
      return;
    }

    await startRoleOnboarding("provider");
  };

  useEffect(() => {
    if (
      !user?.id ||
      !onboardingBootstrap ||
      onboardingBootstrap.hasSubmittedVerification ||
      !shouldRecordOnboardingStart ||
      onboardingBootstrap.resumeStep === "email-verify"
    ) {
      return;
    }

    void ensureProviderOnboardingStarted().catch(() => {
      setErrorMessage(
        "We could not sync your provider onboarding state right now.",
      );
    });
  }, [
    onboardingBootstrap,
    shouldRecordOnboardingStart,
    startRoleOnboarding,
    user?.id,
  ]);

  const handleContinueDocuments = async () => {
    if (!user?.id) {
      setErrorMessage("You must be signed in to continue.");
      return;
    }

    if (!hasGovernmentId || !hasInsurance) {
      setErrorMessage("Upload both required documents to continue.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      if (documents.governmentId) {
        await uploadDocument("id", documents.governmentId);
      }

      if (documents.insurance) {
        await uploadDocument("insurance", documents.insurance);
      }

      await ensureProviderOnboardingStarted();
      setDocuments({ governmentId: null, insurance: null });
      await refreshBootstrap();
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

    if (
      !hasProfilePhoto ||
      !profile.description.trim() ||
      !profile.hourlyRate.trim()
    ) {
      setErrorMessage("Add a profile photo, bio, and hourly rate to continue.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      if (profile.profilePhoto) {
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

        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            avatar_url: avatarPublic?.publicUrl ?? null,
          })
          .eq("id", user.id);

        if (profileError) {
          throw profileError;
        }
      }

      const hourlyRate = Number.parseFloat(profile.hourlyRate);
      const services = profile.services
        .split(",")
        .map((service) => service.trim())
        .filter(Boolean);
      const serviceAreas = profile.serviceAreas
        .split(",")
        .map((area) => area.trim())
        .filter(Boolean);

      const { error: providerError } = await supabase
        .from("provider_profiles")
        .update({
          business_name:
            profile.businessName.trim() ||
            onboardingBootstrap?.profile?.full_name ||
            null,
          bio: profile.description.trim(),
          hourly_rate: Number.isNaN(hourlyRate) ? null : hourlyRate,
          service_areas: serviceAreas,
          services: services.length > 0 ? services : ["General Services"],
        })
        .eq("user_id", user.id);

      if (providerError) {
        throw providerError;
      }

      await ensureProviderOnboardingStarted();
      updateProfile({ profilePhoto: null });
      await refreshBootstrap();
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

    if (selectedDays.length === 0) {
      setErrorMessage("Choose at least one recurring work day to continue.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const { error } = await supabase
        .from("provider_profiles")
        .update({ availability: buildWeeklyAvailability(selectedDays) })
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      await ensureProviderOnboardingStarted();
      await refreshBootstrap();
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

    const accountDigits = payment.accountNumber.replace(/\D/g, "");
    const last4 = accountDigits.slice(-4);

    if (
      !payment.bankName.trim() ||
      !payment.accountType.trim() ||
      last4.length !== 4
    ) {
      setErrorMessage(
        "Add a bank name, account type, and a valid account number ending.",
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const { error } = await supabase
        .from("profiles")
        .update({
          metadata: buildProviderPayoutMetadataPatch(
            onboardingBootstrap?.profile?.metadata,
            {
              bankName: payment.bankName,
              accountType: payment.accountType,
              accountNumberLast4: last4,
            },
          ),
        })
        .eq("id", user.id);

      if (error) {
        throw error;
      }

      await ensureProviderOnboardingStarted();
      updatePayment({ accountNumber: last4 });
      await refreshBootstrap();
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
        { p_role: "provider" },
      );

      if (membershipError) {
        throw membershipError;
      }

      await refreshBootstrap();
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

  const renderDocumentUpload = (
    id: keyof OnboardingFiles,
    title: string,
    description: string,
  ) => {
    const existingDocument =
      id === "governmentId"
        ? existingDocuments.id
        : existingDocuments.insurance;
    const status = existingDocument?.status ?? "not_started";
    const selectedFile = documents[id];

    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-6 transition-colors hover:border-blue-400">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-red-100">
            <Shield className="h-6 w-6 text-red-600" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <Label className="text-lg font-semibold">{title}</Label>
              <p className="text-sm text-gray-600">{description}</p>
            </div>

            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(event) =>
                handleFileUpload(id, event.target.files?.[0] || null)
              }
              className="hidden"
              id={id}
            />
            <label htmlFor={id}>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                asChild
              >
                <span>
                  <Upload className="mr-2 h-4 w-4" />
                  {selectedFile?.name ??
                    existingDocument?.file_name ??
                    "Choose file"}
                </span>
              </Button>
            </label>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${
                  documentStatusClass[status] ?? "bg-gray-100 text-gray-700"
                }`}
              >
                {status.replace("_", " ")}
              </span>
              {existingDocument?.file_name ? (
                <span>Current file: {existingDocument.file_name}</span>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "email-verify":
        return (
          <div className="space-y-6">
            <div className="py-8 text-center">
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
                <Shield className="h-10 w-10 text-blue-600" />
              </div>
              <h2 className="mb-4 text-2xl font-bold">Verify Your Email</h2>
              <p className="mb-6 text-gray-600">
                We sent a verification link to{" "}
                <strong>{user?.email ?? "your email"}</strong>
              </p>

              {onboardingBootstrap?.emailVerified ? (
                <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-semibold">
                      Email verified successfully.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-gray-700">
                  Refresh after opening the verification link in your inbox.
                </div>
              )}

              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void onboardingQuery.refetch()}
                  disabled={onboardingQuery.isFetching}
                >
                  {onboardingQuery.isFetching
                    ? "Refreshing..."
                    : "Refresh status"}
                </Button>
                {!onboardingBootstrap?.emailVerified ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleResendVerification}
                  >
                    Resend verification
                  </Button>
                ) : null}
              </div>
            </div>

            <Button
              onClick={handleNext}
              disabled={!onboardingBootstrap?.emailVerified}
              className="w-full bg-blue-600 py-6 hover:bg-blue-700"
            >
              Continue to Document Upload
            </Button>
          </div>
        );

      case "documents":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="mb-2 text-2xl font-bold">Upload Documents</h2>
              <p className="text-gray-600">
                Upload your government ID and proof of insurance. Existing
                uploads are preserved when you resume.
              </p>
            </div>

            {renderDocumentUpload(
              "governmentId",
              "Government-Issued ID",
              "Driver's license, passport, state ID, or PDF copy.",
            )}
            {renderDocumentUpload(
              "insurance",
              "Proof of Insurance",
              "Liability insurance certificate image or PDF.",
            )}

            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-gray-700">
              Documents are reviewed by the verification team after submission.
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
                disabled={!hasGovernmentId || !hasInsurance || isSubmitting}
                className="flex-1 bg-blue-600 py-6 hover:bg-blue-700"
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
              <h2 className="mb-2 text-2xl font-bold">Complete Your Profile</h2>
              <p className="text-gray-600">
                Keep this aligned with the mobile provider setup: business name,
                services, service areas, rate, and bio.
              </p>
            </div>

            <div>
              <Label className="mb-3 block text-lg font-semibold">
                Profile Photo
              </Label>
              <div className="flex items-center gap-6">
                <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-gray-200">
                  {avatarPreviewUrl ? (
                    <img
                      src={avatarPreviewUrl}
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
                    onChange={(event) =>
                      handleFileUpload(
                        "profilePhoto",
                        event.target.files?.[0] || null,
                      )
                    }
                    className="hidden"
                    id="profilePhoto"
                  />
                  <label htmlFor="profilePhoto">
                    <Button type="button" variant="outline" asChild>
                      <span>
                        <Upload className="mr-2 h-4 w-4" />
                        {profile.profilePhoto
                          ? profile.profilePhoto.name
                          : "Upload Photo"}
                      </span>
                    </Button>
                  </label>
                  <p className="mt-2 text-sm text-gray-500">
                    Professional headshot recommended.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  value={profile.businessName}
                  onChange={(event) =>
                    updateProfile({ businessName: event.target.value })
                  }
                  placeholder="Your business name"
                />
              </div>
              <div>
                <Label htmlFor="services">Services</Label>
                <Input
                  id="services"
                  value={profile.services}
                  onChange={(event) =>
                    updateProfile({ services: event.target.value })
                  }
                  placeholder="Cleaning, painting, electrical"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="serviceAreas">Service Areas</Label>
              <Input
                id="serviceAreas"
                value={profile.serviceAreas}
                onChange={(event) =>
                  updateProfile({ serviceAreas: event.target.value })
                }
                placeholder="Kingston, Montego Bay"
              />
            </div>

            <div>
              <Label htmlFor="hourlyRate">Base Hourly Rate</Label>
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
                  onChange={(event) =>
                    updateProfile({ hourlyRate: event.target.value })
                  }
                  placeholder="50"
                  className="pl-8"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Service Description</Label>
              <Textarea
                id="description"
                rows={6}
                value={profile.description}
                onChange={(event) =>
                  updateProfile({ description: event.target.value })
                }
                placeholder="Tell clients what you specialize in and the types of jobs you take."
              />
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
                  !hasProfilePhoto ||
                  !profile.description.trim() ||
                  !profile.hourlyRate.trim() ||
                  isSubmitting
                }
                className="flex-1 bg-blue-600 py-6 hover:bg-blue-700"
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
              <h2 className="mb-2 text-2xl font-bold">
                Set Weekly Availability
              </h2>
              <p className="text-gray-600">
                Choose the weekdays you normally accept work. This saves the
                same recurring weekly schedule mobile uses.
              </p>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-gray-700">
              Pick at least one day. You can refine exact working hours later
              from the provider calendar.
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
              {PROVIDER_ONBOARDING_WEEKDAYS.map((day) => {
                const active = selectedDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                      active
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-gray-200 bg-white text-gray-700 hover:border-blue-300"
                    }`}
                  >
                    {WEEKDAY_LABELS[day]}
                  </button>
                );
              })}
            </div>

            <div className="rounded-lg border bg-gray-50 px-4 py-3 text-sm text-gray-600">
              Selected days: {selectedDaySummary}
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
                onClick={handleContinueAvailability}
                className="flex-1 bg-blue-600 py-6 hover:bg-blue-700"
                disabled={selectedDays.length === 0 || isSubmitting}
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
              <h2 className="mb-2 text-2xl font-bold">Payout Details</h2>
              <p className="text-gray-600">
                Store the payout metadata needed before provider earnings can be
                released.
              </p>
            </div>

            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-gray-700">
              Only the bank name, account type, and last 4 digits are stored.
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  value={payment.bankName}
                  onChange={(event) =>
                    updatePayment({ bankName: event.target.value })
                  }
                  placeholder="RBC"
                />
              </div>
              <div>
                <Label htmlFor="accountType">Account Type</Label>
                <Input
                  id="accountType"
                  value={payment.accountType}
                  onChange={(event) =>
                    updatePayment({ accountType: event.target.value })
                  }
                  placeholder="Checking"
                />
              </div>
              <div>
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  value={payment.accountNumber}
                  onChange={(event) =>
                    updatePayment({ accountNumber: event.target.value })
                  }
                  placeholder="Only the last 4 digits are stored"
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
                  !payment.bankName.trim() ||
                  !payment.accountType.trim() ||
                  payment.accountNumber.replace(/\D/g, "").length < 4 ||
                  isSubmitting
                }
                className="flex-1 bg-blue-600 py-6 hover:bg-blue-700"
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
              <h2 className="mb-2 text-2xl font-bold">Review & Submit</h2>
              <p className="text-gray-600">
                Confirm the same core provider setup used on mobile before
                submitting.
              </p>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    Government ID:{" "}
                    {documents.governmentId?.name ??
                      existingDocuments.id?.file_name ??
                      "Not uploaded"}
                  </div>
                  <div>
                    Insurance:{" "}
                    {documents.insurance?.name ??
                      existingDocuments.insurance?.file_name ??
                      "Not uploaded"}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    Business name:{" "}
                    {profile.businessName ||
                      onboardingBootstrap?.profile?.full_name ||
                      "Not provided"}
                  </div>
                  <div>Services: {profile.services || "General Services"}</div>
                  <div>
                    Service areas: {profile.serviceAreas || "Not provided"}
                  </div>
                  <div>
                    Hourly rate:{" "}
                    {profile.hourlyRate
                      ? `$${profile.hourlyRate}/hr`
                      : "Not provided"}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Availability</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  Recurring schedule: {selectedDaySummary}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payout</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>Bank: {payment.bankName || "Not provided"}</div>
                  <div>
                    Account type: {payment.accountType || "Not provided"}
                  </div>
                  <div>
                    Ending:{" "}
                    {payment.accountNumber
                      ? `•••• ${payment.accountNumber.slice(-4)}`
                      : "Not provided"}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                <div className="text-sm text-gray-700">
                  <p className="mb-1 font-semibold text-red-600">
                    What happens next?
                  </p>
                  <p>
                    Your application is reviewed after submission. We will email
                    you when the provider role is approved.
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
                className="flex-1 bg-red-600 py-6 hover:bg-red-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </div>
        );

      case "pending":
        return (
          <div className="space-y-6 py-8 text-center">
            <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>

            <h2 className="text-3xl font-bold">Application Submitted</h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-600">
              Your provider application is in review. We will unlock the
              provider dashboard after approval.
            </p>

            <div className="mx-auto max-w-2xl rounded-lg border border-blue-200 bg-blue-50 p-6 text-left text-sm text-gray-700">
              <p>1. The review team checks your documents and profile.</p>
              <p>2. You receive an email when the provider role is approved.</p>
              <p>
                3. Once approved, you can switch into the provider dashboard.
              </p>
            </div>

            <Button
              onClick={() => navigate("/dashboard")}
              className="bg-blue-600 px-8 py-6 hover:bg-blue-700"
            >
              Return to Dashboard
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  if (onboardingQuery.isLoading && !isInitializedFromBootstrap) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <Card>
            <CardContent className="p-8 text-center text-gray-600">
              Loading provider onboarding...
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <Card>
            <CardContent className="p-8 text-center text-gray-600">
              Sign in to continue provider onboarding.
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (currentStep === "pending") {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <Card className="border-2 border-green-200">
            <CardContent className="p-8">{renderStepContent()}</CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Provider Onboarding</h1>
          <p className="text-gray-600">
            Complete the same onboarding data across web and mobile before
            submitting your provider application.
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
          {STEP_CONFIG.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = getCurrentStepIndex() > index;

            return (
              <div key={step.id} className="flex min-w-[96px] items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors ${
                      isActive
                        ? "border-blue-600 bg-blue-600 text-white"
                        : isCompleted
                          ? "border-green-500 bg-green-500 text-white"
                          : "border-gray-300 bg-white text-gray-400"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      <Icon className="h-6 w-6" />
                    )}
                  </div>
                  <span
                    className={`mt-2 max-w-[84px] text-center text-xs ${
                      isActive ? "font-semibold text-blue-600" : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < STEP_CONFIG.length - 1 ? (
                  <div
                    className={`mx-2 hidden h-0.5 w-12 sm:block ${
                      isCompleted ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                ) : null}
              </div>
            );
          })}
        </div>

        {errorMessage ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>
              {STEP_CONFIG.find((step) => step.id === currentStep)?.label}
            </CardTitle>
            <CardDescription>
              Resume step: {onboardingBootstrap?.resumeStep ?? "email-verify"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">{renderStepContent()}</CardContent>
        </Card>
      </div>
    </div>
  );
}
