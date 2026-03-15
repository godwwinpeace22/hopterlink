import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Button } from "../../../ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

export function AdminVerification() {
  const queryClient = useQueryClient();

  const { data: pending, isLoading } = useQuery({
    queryKey: ["admin", "pending-providers"],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_role_memberships")
        .select(
          "id, user_id, state, created_at, profiles:user_id(full_name, email, avatar_url, bio)",
        )
        .eq("role", "provider")
        .eq("state", "pending_review")
        .order("created_at", { ascending: true });
      return data ?? [];
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
        p_reason: reason,
      });
      if (error) throw error;
    },
    onSuccess: (_, { approved }) => {
      toast.success(approved ? "Provider approved" : "Provider rejected");
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
      <h1 className="text-2xl font-bold">Provider Verification</h1>

      {isLoading ? (
        <p className="text-gray-500 text-sm">Loading...</p>
      ) : !pending?.length ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            No pending provider verifications.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pending.map((item: any) => {
            const profile = item.profiles;
            return (
              <Card key={item.id}>
                <CardHeader>
                  <CardTitle className="text-base">
                    {profile?.full_name ?? "Unknown"}
                  </CardTitle>
                  <p className="text-sm text-gray-500">{profile?.email}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {profile?.bio && (
                    <p className="text-sm text-gray-700">{profile.bio}</p>
                  )}
                  <p className="text-xs text-gray-400">
                    Applied {new Date(item.created_at).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        verifyMutation.mutate({
                          userId: item.user_id,
                          approved: true,
                          reason: "Approved by admin",
                        })
                      }
                      disabled={verifyMutation.isPending}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
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
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
