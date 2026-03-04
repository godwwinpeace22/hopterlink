import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import {
  Shield,
  CheckCircle,
  ArrowLeft,
  AlertCircle,
  Lock,
  Briefcase,
} from "lucide-react";
import { DocumentUpload } from "../verification/DocumentUpload";
import { CategoryRequirementsDisplay } from "../verification/CategoryRequirementsDisplay";
import {
  VerificationBadge,
  VerificationLevelBadge,
} from "../verification/VerificationBadge";
import {
  getVerificationConfig,
  ProviderVerificationStatus,
  VerificationStatus,
} from "@/app/config/verificationConfig";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface ProviderVerificationProps {}

export function ProviderVerification({}: ProviderVerificationProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("Electrical");

  const [verificationStatus, setVerificationStatus] =
    useState<ProviderVerificationStatus>({
      email: "approved",
      phone: "approved",
      identity: "approved",
      background: "pending",
      license: "not_started",
      insurance: "not_started",
    });

  const documentTypeMap = useMemo(
    () =>
      ({
        identity: "id",
        license: "license",
        insurance: "insurance",
        background: "certification",
      }) as Record<string, "id" | "license" | "insurance" | "certification">,
    [],
  );

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const loadVerification = async () => {
      const [
        profileResult,
        providerProfileResult,
        documentsResult,
        authResult,
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("phone_verified")
          .eq("id", user.id)
          .single(),
        supabase
          .from("provider_profiles")
          .select("services")
          .eq("user_id", user.id)
          .single(),
        supabase
          .from("verification_documents")
          .select("document_type, status")
          .eq("provider_id", user.id),
        supabase.auth.getUser(),
      ]);

      if (!providerProfileResult.error) {
        const services = providerProfileResult.data?.services ?? [];
        if (services.length > 0) {
          setSelectedCategory(services[0]);
        }
      }

      const emailStatus = authResult.data?.user?.email_confirmed_at
        ? "approved"
        : "pending";
      const phoneStatus = profileResult.data?.phone_verified
        ? "approved"
        : "pending";

      const docStatuses: Partial<ProviderVerificationStatus> = {};
      (documentsResult.data ?? []).forEach((doc) => {
        const entry = Object.entries(documentTypeMap).find(
          ([, value]) => value === doc.document_type,
        );
        if (entry) {
          const [key] = entry;
          docStatuses[key as keyof ProviderVerificationStatus] =
            doc.status as VerificationStatus;
        }
      });

      setVerificationStatus((prev) => ({
        ...prev,
        email: emailStatus as VerificationStatus,
        phone: phoneStatus as VerificationStatus,
        ...docStatuses,
      }));
    };

    loadVerification();
  }, [user?.id, documentTypeMap]);

  const config = getVerificationConfig(selectedCategory);

  if (!config) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <p>Category configuration not found.</p>
        </div>
      </div>
    );
  }

  // Calculate completion percentage
  const totalRequired = config.requirements.filter((r) => r.required).length;
  const completed = config.requirements.filter((r) => {
    const status = verificationStatus[r.id as keyof ProviderVerificationStatus];
    return r.required && status === "approved";
  }).length;
  const completionPercentage = Math.round((completed / totalRequired) * 100);

  // Check if can bid
  const canBid = config.requirements.every((req) => {
    if (!req.required) return true;
    const status =
      verificationStatus[req.id as keyof ProviderVerificationStatus];
    return status === "approved";
  });

  const handleDocumentUpload = (requirementId: string, file: File) => {
    const mappedType = documentTypeMap[requirementId];
    if (!mappedType || !user?.id) {
      return;
    }

    const uploadDocument = async () => {
      const filePath = `${user.id}/${mappedType}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("provider-documents")
        .upload(filePath, file);

      if (uploadError) {
        return;
      }

      await supabase.from("verification_documents").upsert(
        {
          provider_id: user.id,
          document_type: mappedType,
          file_url: filePath,
          file_name: file.name,
          status: "pending",
        },
        { onConflict: "provider_id,document_type" },
      );

      setVerificationStatus({
        ...verificationStatus,
        [requirementId]: "pending" as VerificationStatus,
      });
    };

    uploadDocument();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard/provider")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Status Overview */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Completion Card */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-[#F1A400]" />
                  Verification Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold text-[#2B2B2B]">
                      {completionPercentage}%
                    </span>
                    <span className="text-sm text-gray-600">
                      {completed} of {totalRequired}
                    </span>
                  </div>
                  <Progress value={completionPercentage} className="h-3" />
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Current Status:
                  </p>
                  {completionPercentage === 100 ? (
                    <VerificationLevelBadge level="professional" size="md" />
                  ) : completionPercentage >= 60 ? (
                    <VerificationLevelBadge level="standard" size="md" />
                  ) : (
                    <VerificationLevelBadge level="basic" size="md" />
                  )}
                </div>

                {!canBid && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Lock className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-semibold text-yellow-900">
                          Bidding Locked
                        </p>
                        <p className="text-yellow-800 text-xs mt-1">
                          Complete all required verifications to bid on{" "}
                          {selectedCategory} jobs.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {canBid && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-semibold text-green-900">
                          Fully Verified!
                        </p>
                        <p className="text-green-800 text-xs mt-1">
                          You can now bid on all {selectedCategory} jobs.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Service Category Info */}
            <Card className="border-2 bg-[#FDEFD6] border-[#F7C876]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#2B2B2B]">
                  <Briefcase className="h-5 w-5 text-[#F1A400]" />
                  Service Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-[#2B2B2B] mb-2">
                  {selectedCategory}
                </p>
                <p className="text-sm text-gray-700">
                  This is a {config.riskLevel} risk category requiring
                  professional verification.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full"
                  onClick={() => navigate("/dashboard/provider/profile")}
                >
                  Change Category
                </Button>
              </CardContent>
            </Card>

            {/* Benefits Card */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-base">Why Verify?</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-[#F1A400] mt-0.5">✓</span>
                    <span>Access premium, high-paying jobs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#F1A400] mt-0.5">✓</span>
                    <span>Build client trust with verified badge</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#F1A400] mt-0.5">✓</span>
                    <span>Higher visibility in search results</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#F1A400] mt-0.5">✓</span>
                    <span>Earn up to 40% more than unverified providers</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Requirements and Upload */}
          <div className="lg:col-span-2 space-y-6">
            {/* Category Requirements */}
            <CategoryRequirementsDisplay
              config={config}
              showDetailedInfo={true}
            />

            {/* Document Upload Section */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-[#F1A400]" />
                  Upload Documents
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  All documents are securely encrypted and reviewed by our
                  verification team within 24-48 hours.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {config.requirements.map((req) => {
                  const status =
                    verificationStatus[
                      req.id as keyof ProviderVerificationStatus
                    ] || "not_started";

                  return (
                    <DocumentUpload
                      key={req.id}
                      id={req.id}
                      label={req.label}
                      description={req.description}
                      required={req.required}
                      processingTime={req.processingTime}
                      status={status}
                      onUpload={(file) => handleDocumentUpload(req.id, file)}
                    />
                  );
                })}
              </CardContent>
            </Card>

            {/* Important Information */}
            <Card className="border-2 border-[#F7C876] bg-[#FDEFD6]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#2B2B2B]">
                  <AlertCircle className="h-5 w-5 text-[#F1A400]" />
                  Important Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start gap-2">
                  <span className="text-[#F1A400] font-bold">•</span>
                  <p>
                    <strong>Document Quality:</strong> Ensure all documents are
                    clear, legible, and not expired. Poor quality submissions
                    will be rejected.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#F1A400] font-bold">•</span>
                  <p>
                    <strong>Processing Time:</strong> Most documents are
                    reviewed within 24-48 hours. Background checks may take 3-7
                    business days.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#F1A400] font-bold">•</span>
                  <p>
                    <strong>Annual Renewal:</strong> Insurance and licenses must
                    be renewed annually. You'll receive reminders before
                    expiration.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#F1A400] font-bold">•</span>
                  <p>
                    <strong>Data Security:</strong> All personal information is
                    encrypted and stored securely. We comply with Canadian
                    privacy laws (PIPEDA).
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/dashboard/provider")}
              >
                Save Progress
              </Button>
              <Button
                className="flex-1 bg-[#F1A400] hover:bg-[#EFA055] text-white"
                disabled={!canBid}
                onClick={() => navigate("/dashboard/provider/job-board")}
              >
                {canBid
                  ? "Browse Jobs"
                  : "Complete Verification to Browse Jobs"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
