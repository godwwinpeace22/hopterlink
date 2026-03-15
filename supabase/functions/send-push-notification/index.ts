import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

/**
 * Map notification types to deep-link data payloads for the mobile app.
 * When the user taps the push notification, the app routes based on these fields.
 */
function buildPushData(
  type: string,
  relatedId: string | null,
): Record<string, string> {
  if (!relatedId) return {};

  switch (type) {
    case "booking_confirmed":
    case "review_received":
      return { bookingId: relatedId };
    case "message_received":
      return { chatPartnerId: relatedId };
    case "quote_received":
    case "quote_accepted":
    case "job_posted":
      return { jobId: relatedId };
    case "payment_released":
      return { transactionId: relatedId };
    default:
      return {};
  }
}

interface WebhookPayload {
  type: "INSERT";
  table: string;
  schema: string;
  record: {
    id: string;
    user_id: string;
    type: string;
    title: string;
    message: string;
    related_id: string | null;
  };
  old_record: null;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return json(500, { error: "Missing required server configuration." });
  }

  // Verify the request comes from our own Supabase project via the webhook secret
  const webhookSecret = Deno.env.get("WEBHOOK_SECRET");
  if (webhookSecret) {
    const authHeader = req.headers.get("Authorization");
    if (authHeader !== `Bearer ${webhookSecret}`) {
      return json(401, { error: "Unauthorized" });
    }
  }

  let payload: WebhookPayload;
  try {
    payload = (await req.json()) as WebhookPayload;
  } catch {
    return json(400, { error: "Invalid JSON payload." });
  }

  const { record } = payload;
  if (!record?.user_id || !record?.title || !record?.message) {
    return json(400, { error: "Missing notification fields." });
  }

  // Fetch the user's push token from their profile metadata
  const serviceClient = createClient(supabaseUrl, supabaseServiceRoleKey);

  const { data: profile, error: profileError } = await serviceClient
    .from("profiles")
    .select("metadata")
    .eq("id", record.user_id)
    .single();

  if (profileError || !profile) {
    return json(200, { skipped: true, reason: "Profile not found" });
  }

  const pushToken = (profile.metadata as Record<string, unknown> | null)
    ?.push_token as string | undefined;

  if (!pushToken) {
    return json(200, {
      skipped: true,
      reason: "No push token registered for user",
    });
  }

  // Build and send the Expo push notification
  const pushPayload = {
    to: pushToken,
    sound: "default",
    title: record.title,
    body: record.message,
    data: buildPushData(record.type, record.related_id),
  };

  const expoResponse = await fetch(EXPO_PUSH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(pushPayload),
  });

  const expoResult = await expoResponse.json();

  // Check for Expo-level errors (e.g. DeviceNotRegistered)
  const ticket = expoResult?.data?.[0] ?? expoResult;
  if (ticket?.status === "error") {
    // If the token is invalid, clean it from the profile
    if (ticket.details?.error === "DeviceNotRegistered") {
      await serviceClient
        .from("profiles")
        .update({ metadata: { push_token: null } })
        .eq("id", record.user_id);
    }

    return json(200, {
      sent: false,
      reason: ticket.message ?? "Expo push error",
    });
  }

  return json(200, { sent: true, ticketId: ticket?.id });
});
