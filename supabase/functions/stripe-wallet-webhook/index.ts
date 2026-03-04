import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const parseStripeSignature = (header: string) => {
  const parts = header.split(",");
  const timestamp = parts
    .find((part) => part.startsWith("t="))
    ?.replace("t=", "")
    ?.trim();
  const signatures = parts
    .filter((part) => part.startsWith("v1="))
    .map((part) => part.replace("v1=", "").trim())
    .filter(Boolean);

  return { timestamp, signatures };
};

const toHex = (input: ArrayBuffer) =>
  Array.from(new Uint8Array(input))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

const secureCompare = (a: string, b: string) => {
  if (a.length !== b.length) return false;

  let result = 0;
  for (let index = 0; index < a.length; index += 1) {
    result |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }

  return result === 0;
};

const verifyStripeSignature = async (
  payload: string,
  signatureHeader: string,
  secret: string,
) => {
  const { timestamp, signatures } = parseStripeSignature(signatureHeader);
  if (!timestamp || signatures.length === 0) {
    return false;
  }

  const signedPayload = `${timestamp}.${payload}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(signedPayload),
  );
  const expected = toHex(digest);

  return signatures.some((candidate) => secureCompare(candidate, expected));
};

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!supabaseUrl || !supabaseServiceRoleKey || !stripeWebhookSecret) {
    return json(500, { error: "Missing required server configuration." });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return json(400, { error: "Missing stripe-signature header." });
  }

  const rawBody = await req.text();
  const isValid = await verifyStripeSignature(
    rawBody,
    signature,
    stripeWebhookSecret,
  );

  if (!isValid) {
    return json(400, { error: "Invalid Stripe signature." });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return json(400, { error: "Invalid JSON payload." });
  }

  const serviceClient = createClient(supabaseUrl, supabaseServiceRoleKey);

  const { error: insertEventError } = await serviceClient
    .from("stripe_webhook_events")
    .insert({
      event_id: event.id,
      event_type: event.type,
      payload: event,
    });

  if (insertEventError) {
    if (insertEventError.code === "23505") {
      return json(200, { received: true, duplicate: true });
    }

    return json(500, { error: insertEventError.message });
  }

  const eventType = String(event.type ?? "");
  const eventObject = event?.data?.object ?? {};
  const now = new Date().toISOString();

  const updateBySession = async (payload: Record<string, unknown>) => {
    if (typeof eventObject.id !== "string") return;
    await serviceClient
      .from("wallet_topups")
      .update(payload)
      .eq("stripe_checkout_session_id", eventObject.id);
  };

  const updateByPaymentIntent = async (payload: Record<string, unknown>) => {
    if (typeof eventObject.id !== "string") return;
    await serviceClient
      .from("wallet_topups")
      .update(payload)
      .eq("stripe_payment_intent_id", eventObject.id);
  };

  if (eventType === "checkout.session.completed") {
    const paymentStatus = String(eventObject.payment_status ?? "");
    const paymentIntent =
      typeof eventObject.payment_intent === "string"
        ? eventObject.payment_intent
        : null;

    await updateBySession({
      status: paymentStatus === "paid" ? "succeeded" : "pending",
      stripe_payment_intent_id: paymentIntent,
      succeeded_at: paymentStatus === "paid" ? now : null,
      failed_at: null,
      canceled_at: null,
      failure_reason: null,
    });
  } else if (eventType === "checkout.session.async_payment_succeeded") {
    await updateBySession({
      status: "succeeded",
      succeeded_at: now,
      failed_at: null,
      canceled_at: null,
      failure_reason: null,
    });
  } else if (eventType === "checkout.session.async_payment_failed") {
    await updateBySession({
      status: "failed",
      failed_at: now,
      failure_reason: "Stripe async payment failed.",
    });
  } else if (eventType === "checkout.session.expired") {
    await updateBySession({
      status: "canceled",
      canceled_at: now,
      failure_reason: "Checkout session expired.",
    });
  } else if (eventType === "payment_intent.succeeded") {
    await updateByPaymentIntent({
      status: "succeeded",
      succeeded_at: now,
      failed_at: null,
      canceled_at: null,
      failure_reason: null,
    });
  } else if (eventType === "payment_intent.payment_failed") {
    const failureReason =
      typeof eventObject.last_payment_error?.message === "string"
        ? eventObject.last_payment_error.message
        : "Payment failed.";

    await updateByPaymentIntent({
      status: "failed",
      failed_at: now,
      failure_reason: failureReason,
    });
  }

  await serviceClient
    .from("stripe_webhook_events")
    .update({ processed_at: now })
    .eq("event_id", event.id);

  return json(200, { received: true });
});
