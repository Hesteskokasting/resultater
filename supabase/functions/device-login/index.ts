import { createClient } from "jsr:@supabase/supabase-js@2";

/**
 * Turns a device key pushed by the MDM (Intune) into a real Supabase session for
 * the club account that device belongs to.
 *
 * The key is a bearer secret, so nothing but its sha256 is ever stored or logged:
 * the kiosk_device table cannot hand anyone a working key. The response is a
 * one-time magic-link token the client redeems with verifyOtp — the club account's
 * password stays server-side and is never pushed to a device.
 */

const MIN_KEY_LENGTH = 16;

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Same answer for an unknown, a malformed and a deactivated key — nothing to probe for. */
function denied(): Response {
  return new Response(JSON.stringify({ error: "unknown device" }), {
    status: 403,
    headers: { "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  const { deviceKey } = (await req.json()) as { deviceKey?: unknown };
  if (typeof deviceKey !== "string" || deviceKey.length < MIN_KEY_LENGTH) return denied();

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: device } = await supabase
    .from("kiosk_device")
    .select("id, user_id")
    .eq("key_hash", await sha256Hex(deviceKey))
    .eq("active", true)
    .maybeSingle();

  if (!device) return denied();

  const { data: account, error: accountError } = await supabase.auth.admin.getUserById(
    device.user_id,
  );
  const email = account?.user.email;
  if (accountError || !email) {
    console.error("device-login: kiosk account has no e-mail", device.id, accountError);
    return denied();
  }

  const { data: link, error: linkError } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  if (linkError || !link.properties.hashed_token) {
    console.error("device-login: generateLink failed", device.id, linkError);
    return new Response(JSON.stringify({ error: "could not create session" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Best-effort audit trail: a failed update must not cost the kiosk its session.
  await supabase
    .from("kiosk_device")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", device.id);

  return new Response(JSON.stringify({ tokenHash: link.properties.hashed_token }), {
    headers: { "Content-Type": "application/json" },
  });
});
