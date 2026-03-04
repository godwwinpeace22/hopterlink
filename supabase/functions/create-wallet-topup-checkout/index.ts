import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type CreateCheckoutPayload = {
  amountCents?: number;
  currency?: string;
  idempotencyKey?: string;
};

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");

  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    !supabaseServiceRoleKey ||
    !stripeSecretKey
  ) {
    return json(500, { error: "Missing required server configuration." });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return json(401, { error: "Missing authorization header." });
  }

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const serviceClient = createClient(supabaseUrl, supabaseServiceRoleKey);

  const { data: authData, error: authError } = await userClient.auth.getUser();
  if (authError || !authData.user) {
    return json(401, { error: "Unauthorized" });
  }

  let payload: CreateCheckoutPayload;
  try {
    payload = (await req.json()) as CreateCheckoutPayload;
  } catch {
    return json(400, { error: "Invalid JSON payload." });
  }

  const amountCents = Number(payload.amountCents);
  const currency = (payload.currency ?? "cad").toLowerCase();
  const idempotencyKey = (payload.idempotencyKey ?? "").trim();

  const minimumCents = Number(Deno.env.get("STRIPE_TOPUP_MIN_CENTS") ?? 100);
  const maximumCents = Number(Deno.env.get("STRIPE_TOPUP_MAX_CENTS") ?? 500000);

  if (
    !Number.isInteger(amountCents) ||
    amountCents < minimumCents ||
    amountCents > maximumCents
  ) {
    return json(400, {
      error: `Amount must be an integer between ${minimumCents} and ${maximumCents} cents.`,
    });
  }

  if (!/^[a-z]{3}$/.test(currency)) {
    return json(400, { error: "Currency must be a 3-letter code." });
  }

  if (
    !idempotencyKey ||
    idempotencyKey.length < 8 ||
    idempotencyKey.length > 128
  ) {
    return json(400, { error: "Invalid idempotency key." });
  }

  const userId = authData.user.id;

  const { data: existingTopup, error: existingError } = await serviceClient
    .from("wallet_topups")
    .select("id, status, checkout_url")
    .eq("user_id", userId)
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();

  if (existingError) {
    return json(500, { error: existingError.message });
  }

  if (existingTopup?.checkout_url && existingTopup.status === "pending") {
    return json(200, {
      topupId: existingTopup.id,
      status: existingTopup.status,
      checkoutUrl: existingTopup.checkout_url,
      reused: true,
    });
  }

  const siteUrl =
    Deno.env.get("WALLET_TOPUP_SITE_URL") ??
    req.headers.get("origin") ??
    "http://localhost:5173";

  const successUrl = `${siteUrl}/dashboard/client/wallet?topup=success&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${siteUrl}/dashboard/client/wallet?topup=cancel`;

  const { data: insertedTopup, error: insertError } = await serviceClient
    .from("wallet_topups")
    .insert({
      user_id: userId,
      amount_cents: amountCents,
      currency,
      status: "pending",
      provider: "stripe",
      idempotency_key: idempotencyKey,
      metadata: { origin: "client_wallet" },
    })
    .select("id")
    .single();

  if (insertError || !insertedTopup) {
    return json(500, {
      error: insertError?.message ?? "Unable to create top-up record.",
    });
  }

  const topupId = insertedTopup.id;

  const form = new URLSearchParams();
  form.set("mode", "payment");
  form.set("success_url", successUrl);
  form.set("cancel_url", cancelUrl);
  form.set("client_reference_id", userId);
  form.set("line_items[0][quantity]", "1");
  form.set("line_items[0][price_data][currency]", currency);
  form.set("line_items[0][price_data][unit_amount]", String(amountCents));
  form.set("line_items[0][price_data][product_data][name]", "Wallet top-up");
  form.set(
    "line_items[0][price_data][product_data][description]",
    "Hopterlink wallet credit",
  );
  form.set("metadata[topup_id]", topupId);
  form.set("metadata[user_id]", userId);
  form.set("metadata[idempotency_key]", idempotencyKey);

  const stripeResponse = await fetch(
    "https://api.stripe.com/v1/checkout/sessions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Idempotency-Key": `wallet-topup:${userId}:${idempotencyKey}`,
      },
      body: form,
    },
  );

  const stripeData = await stripeResponse.json();

  if (!stripeResponse.ok || !stripeData?.id || !stripeData?.url) {
    await serviceClient
      .from("wallet_topups")
      .update({
        status: "failed",
        failure_reason:
          typeof stripeData?.error?.message === "string"
            ? stripeData.error.message
            : "Stripe session creation failed.",
        failed_at: new Date().toISOString(),
      })
      .eq("id", topupId);

    return json(502, {
      error:
        typeof stripeData?.error?.message === "string"
          ? stripeData.error.message
          : "Unable to start Stripe checkout.",
    });
  }

  const updatePayload: Record<string, unknown> = {
    stripe_checkout_session_id: stripeData.id,
    checkout_url: stripeData.url,
  };

  if (typeof stripeData.payment_intent === "string") {
    updatePayload.stripe_payment_intent_id = stripeData.payment_intent;
  }

  const { error: updateError } = await serviceClient
    .from("wallet_topups")
    .update(updatePayload)
    .eq("id", topupId);

  if (updateError) {
    return json(500, { error: updateError.message });
  }

  return json(200, {
    topupId,
    status: "pending",
    checkoutUrl: stripeData.url,
    reused: false,
  });
});
