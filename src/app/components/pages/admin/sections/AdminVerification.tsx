import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../ui/card";
import { Button } from "../../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../../../ui/dialog";
import { Badge } from "../../../ui/badge";
import { ScrollArea } from "../../../ui/scroll-area";
import {
  CheckCircle,
  XCircle,
  FileText,
  User,
  Briefcase,
  MapPin,
  Clock,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";

/** Extracts the storage-relative path from a full Supabase URL or returns the value as-is. */
function toStoragePath(fileUrl: string, bucket: string): string {
  if (!fileUrl) return "";
  const marker = `/${bucket}/`;
  const idx = fileUrl.indexOf(marker);
  return idx !== -1 ? fileUrl.slice(idx + marker.length) : fileUrl;
}

/**
 * Generates a signed URL directly via the Supabase JS client using the admin's
 * existing session. Works because the RLS policy on provider-documents already
 * grants SELECT to any profile with role = 'admin'.
 */
function DocPreview({
  fileUrl,
  documentType,
}: {
  fileUrl: string;
  documentType: string;
}) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const path = toStoragePath(fileUrl, "provider-documents");
  const isImage = /\.(jpe?g|png|gif|webp)$/i.test(path.split("?")[0]);

  useEffect(() => {
    if (!path) {
      setFailed(true);
      return;
    }
    supabase.storage
      .from("provider-documents")
      .createSignedUrl(path, 60 * 60)
      .then(({ data, error }) => {
        if (error || !data?.signedUrl) {
          setFailed(true);
        } else {
          setSignedUrl(data.signedUrl);
        }
      });
  }, [path]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-3 bg-gray-50 border-b">
        <CardTitle className="text-xs font-semibold capitalize">
          {documentType.replace(/_/g, " ")}
        </CardTitle>
      </CardHeader>
      <div className="bg-gray-100 flex items-center justify-center p-2 min-h-[140px] max-h-[220px]">
        {failed ? (
          <div className="flex flex-col items-center text-red-400 gap-2">
            <FileText className="w-8 h-8" />
            <span className="text-xs text-center">Could not load document</span>
          </div>
        ) : !signedUrl ? (
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        ) : isImage ? (
          <img
            src={signedUrl}
            alt={documentType}
            onClick={() => window.open(signedUrl, "_blank")}
            className="max-w-full max-h-[200px] object-contain rounded cursor-pointer hover:scale-105 transition-transform drop-shadow-sm"
          />
        ) : (
          <a
            href={signedUrl}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center justify-center text-gray-500 hover:text-blue-600 transition-colors"
          >
            <FileText className="w-10 h-10 mb-2" />
            <span className="text-xs font-medium">View Document</span>
          </a>
        )}
      </div>
    </Card>
  );
}

export function AdminVerification() {
  const queryClient = useQueryClient();
  const [selectedProvider, setSelectedProvider] = useState<any>(null);

  const { data: pending, isLoading } = useQuery({
    queryKey: ["admin", "pending-providers"],
    queryFn: async () => {
      const { data: memberships, error } = await supabase
        .from("user_role_memberships")
        .select(
          "id, user_id, state, created_at, profiles:user_id(id, full_name, email, avatar_url, phone)",
        )
        .eq("role", "provider")
        .eq("state", "pending_review")
        .order("created_at", { ascending: true });

      if (error) throw error;
      if (!memberships?.length) return [];

      const providerIds = memberships.map((m) => m.user_id);

      const [{ data: providerProfiles }, { data: documents }] =
        await Promise.all([
          supabase
            .from("provider_profiles")
            .select("*")
            .in("user_id", providerIds),
          supabase
            .from("verification_documents")
            .select("*")
            .in("provider_id", providerIds),
        ]);

      return memberships.map((m: any) => ({
        ...m,
        profile: m.profiles,
        provider_profile:
          providerProfiles?.find((p) => p.user_id === m.user_id) ?? {},
        documents: documents?.filter((d) => d.provider_id === m.user_id) ?? [],
      }));
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async ({
      userId,
      approved,
      reason,
    }: {
      userId: string;
      approved: boolean;
      reason: string;
    }) => {
      const { error } = await supabase.rpc("admin_verify_provider" as any, {
        p_provider_id: userId,
        p_approved: approved,
        p_rejection_reason: reason,
      });
      if (error) throw error;
    },
    onSuccess: (_, { approved }) => {
      toast.success(approved ? "Provider approved" : "Provider rejected");
      setSelectedProvider(null);
      queryClient.invalidateQueries({
        queryKey: ["admin", "pending-providers"],
      });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to verify provider");
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Provider Verification</h1>
        <Badge variant="outline" className="text-sm">
          {pending?.length || 0} Pending
        </Badge>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <p className="text-gray-500 animate-pulse text-sm">
            Loading applications...
          </p>
        </div>
      ) : !pending?.length ? (
        <Card className="border-dashed">
          <CardContent className="py-12 flex flex-col items-center text-center text-gray-500 space-y-3">
            <CheckCircle className="h-10 w-10 text-gray-300" />
            <p>No pending provider verifications. You're all caught up!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pending.map((item: any) => {
            const profile = item.profile;
            const pProfile = item.provider_profile;
            return (
              <Card key={item.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-gray-400" />
                    {profile?.full_name ?? "Unknown"}
                  </CardTitle>
                  <CardDescription>
                    {pProfile?.business_name || profile?.email}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 flex-1">
                  <div className="text-sm text-gray-500 flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Applied: {new Date(item.created_at).toLocaleDateString()}
                    </div>
                    {pProfile?.services?.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        {pProfile.services.length} Services listed
                      </div>
                    )}
                    {item.documents?.length > 0 && (
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        {item.documents.length} Docs uploaded
                      </div>
                    )}
                  </div>

                  <Dialog
                    open={selectedProvider?.id === item.id}
                    onOpenChange={(open) => !open && setSelectedProvider(null)}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setSelectedProvider(item)}
                      >
                        Review Application
                      </Button>
                    </DialogTrigger>
                    {selectedProvider?.id === item.id && (
                      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
                        <DialogHeader>
                          <DialogTitle className="text-xl">
                            Provider Application
                          </DialogTitle>
                        </DialogHeader>

                        <ScrollArea className="flex-1 overflow-y-auto px-1 border-y my-2">
                          <div className="space-y-6 py-4">
                            {/* Personal & Business Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-3">
                                <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wider">
                                  Applicant Details
                                </h3>
                                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                                  <p className="text-sm">
                                    <strong>Name:</strong> {profile?.full_name}
                                  </p>
                                  <p className="text-sm">
                                    <strong>Email:</strong> {profile?.email}
                                  </p>
                                  <p className="text-sm">
                                    <strong>Phone:</strong>{" "}
                                    {profile?.phone || "Not provided"}
                                  </p>
                                </div>
                              </div>
                              <div className="space-y-3">
                                <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wider">
                                  Business Details
                                </h3>
                                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                                  <p className="text-sm">
                                    <strong>Business:</strong>{" "}
                                    {pProfile?.business_name || "N/A"}
                                  </p>
                                  <p className="text-sm">
                                    <strong>Experience:</strong>{" "}
                                    {pProfile?.experience_years
                                      ? `${pProfile.experience_years} years`
                                      : "N/A"}
                                  </p>
                                  <div className="text-sm">
                                    <strong>Services:</strong>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {pProfile?.services?.map(
                                        (svc: string) => (
                                          <Badge variant="secondary" key={svc}>
                                            {svc}
                                          </Badge>
                                        ),
                                      ) || (
                                        <span className="text-gray-400">
                                          None
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Bio & Extended details */}
                            {pProfile?.bio && (
                              <div className="space-y-3">
                                <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wider">
                                  Bio
                                </h3>
                                <p className="text-sm bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                                  {pProfile.bio}
                                </p>
                              </div>
                            )}

                            {/* Service Areas */}
                            {pProfile?.service_areas?.length > 0 && (
                              <div className="space-y-3">
                                <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wider">
                                  Service Areas
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                  {pProfile.service_areas.map(
                                    (area: string) => (
                                      <div
                                        key={area}
                                        className="flex items-center text-sm bg-gray-100 px-2 py-1 rounded"
                                      >
                                        <MapPin className="w-3 h-3 mr-1" />{" "}
                                        {area}
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Documents */}
                            <div className="space-y-3">
                              <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wider">
                                Verification Documents
                              </h3>
                              {item.documents?.length === 0 ? (
                                <p className="text-sm text-gray-500 italic">
                                  No documents submitted
                                </p>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {item.documents.map((doc: any) => (
                                    <DocPreview
                                      key={doc.id}
                                      fileUrl={doc.file_url}
                                      documentType={doc.document_type}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </ScrollArea>

                        <DialogFooter className="pt-2 sm:justify-between items-center w-full">
                          <span className="text-sm text-gray-500 hidden sm:inline-block">
                            Make a decision on this application.
                          </span>
                          <div className="flex gap-2">
                            <Button
                              variant="destructive"
                              onClick={() =>
                                verifyMutation.mutate({
                                  userId: item.user_id,
                                  approved: false,
                                  reason: "Does not meet requirements",
                                })
                              }
                              disabled={verifyMutation.isPending}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                            <Button
                              onClick={() =>
                                verifyMutation.mutate({
                                  userId: item.user_id,
                                  approved: true,
                                  reason: "Approved by admin",
                                })
                              }
                              disabled={verifyMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                          </div>
                        </DialogFooter>
                      </DialogContent>
                    )}
                  </Dialog>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
