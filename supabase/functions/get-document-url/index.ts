import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
    },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: CORS_HEADERS });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json(401, { error: "Unauthorized" });

  // Verify the calling user is an admin using their own token
  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const {
    data: { user },
    error: authError,
  } = await userClient.auth.getUser();

  if (authError || !user) return json(401, { error: "Unauthorized" });

  const { data: profile, error: profileError } = await userClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || profile?.role !== "admin") {
    return json(403, { error: "Forbidden: admin access required" });
  }

  // Parse the requested path
  let path: string;
  try {
    const body = await req.json();
    path = body.path;
    if (!path || typeof path !== "string") throw new Error();
  } catch {
    return json(400, { error: "Missing or invalid 'path' in request body" });
  }

  // Use the service role to generate the signed URL (bypasses RLS entirely)
  const adminClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data, error } = await adminClient.storage
    .from("provider-documents")
    .createSignedUrl(path, 60 * 60); // 1 hour expiry

  if (error || !data) {
    return json(500, { error: error?.message ?? "Failed to generate URL" });
  }

  return json(200, { signedUrl: data.signedUrl });
});
