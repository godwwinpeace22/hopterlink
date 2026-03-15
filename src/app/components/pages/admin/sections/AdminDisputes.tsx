import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Button } from "../../../ui/button";
import { Textarea } from "../../../ui/textarea";
import { toast } from "sonner";

export function AdminDisputes() {
  const queryClient = useQueryClient();
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  const { data: disputes, isLoading } = useQuery({
    queryKey: ["admin", "disputes"],
    queryFn: async () => {
      const { data } = await supabase
        .from("reports")
        .select(
          "id, booking_id, reporter_id, reason, status, created_at, reporter:profiles!reports_reporter_id_fkey(full_name)",
        )
        .order("created_at", { ascending: true });
      return data ?? [];
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async ({
      bookingId,
      resolution,
      notes,
    }: {
      bookingId: string;
      resolution: string;
      notes: string;
    }) => {
      const { error } = await supabase.rpc("admin_resolve_dispute" as any, {
        p_booking_id: bookingId,
        p_resolution: resolution,
        p_admin_notes: notes,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Dispute resolved");
      setResolvingId(null);
      setAdminNotes("");
      queryClient.invalidateQueries({ queryKey: ["admin", "disputes"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to resolve dispute");
    },
  });

  const pendingDisputes = disputes?.filter((d: any) => d.status === "pending");
  const resolvedDisputes = disputes?.filter((d: any) => d.status !== "pending");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Disputes & Reports</h1>

      <div>
        <h2 className="text-lg font-semibold mb-3">
          Open ({pendingDisputes?.length ?? 0})
        </h2>
        {isLoading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : !pendingDisputes?.length ? (
          <Card>
            <CardContent className="py-6 text-center text-gray-500">
              No open disputes.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingDisputes.map((d: any) => (
              <Card key={d.id}>
                <CardHeader>
                  <CardTitle className="text-base">
                    Report by {d.reporter?.full_name ?? "Unknown"}
                  </CardTitle>
                  <p className="text-xs text-gray-400">
                    {new Date(d.created_at).toLocaleDateString()} · Booking{" "}
                    {d.booking_id?.slice(0, 8)}...
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm">{d.reason}</p>

                  {resolvingId === d.id ? (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Admin notes..."
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            resolveMutation.mutate({
                              bookingId: d.booking_id,
                              resolution: "release",
                              notes: adminNotes,
                            })
                          }
                          disabled={resolveMutation.isPending}
                        >
                          Release to Provider
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            resolveMutation.mutate({
                              bookingId: d.booking_id,
                              resolution: "refund",
                              notes: adminNotes,
                            })
                          }
                          disabled={resolveMutation.isPending}
                        >
                          Refund Client
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setResolvingId(null);
                            setAdminNotes("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setResolvingId(d.id)}
                    >
                      Resolve
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {resolvedDisputes && resolvedDisputes.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">
            Resolved ({resolvedDisputes.length})
          </h2>
          <div className="space-y-2">
            {resolvedDisputes.map((d: any) => (
              <Card key={d.id} className="opacity-60">
                <CardContent className="py-3">
                  <div className="flex justify-between text-sm">
                    <span>{d.reporter?.full_name ?? "Unknown"}</span>
                    <span className="capitalize text-gray-500">{d.status}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
