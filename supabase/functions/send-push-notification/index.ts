import { createClient } from "jsr:@supabase/supabase-js@2";

const ONESIGNAL_APP_ID = Deno.env.get("ONESIGNAL_APP_ID")!;
const ONESIGNAL_REST_API_KEY = Deno.env.get("ONESIGNAL_REST_API_KEY")!;
const PUSH_WEBHOOK_SECRET = Deno.env.get("PUSH_WEBHOOK_SECRET")!;

interface NotificationQueueRow {
  id: number;
  user_id: string;
  notification_type: string;
  title: string;
  body: string;
  deep_link: string;
  status: string;
}

interface WebhookPayload {
  record: NotificationQueueRow;
}

Deno.serve(async (req) => {
  if (req.headers.get("x-webhook-secret") !== PUSH_WEBHOOK_SECRET) {
    return new Response("unauthorized", { status: 401 });
  }

  const { record: row } = (await req.json()) as WebhookPayload;

  if (row.status !== "pending") {
    return new Response("ok", { status: 200 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const oneSignalRes = await fetch("https://api.onesignal.com/notifications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Key ${ONESIGNAL_REST_API_KEY}`,
    },
    body: JSON.stringify({
      app_id: ONESIGNAL_APP_ID,
      include_aliases: { external_id: [row.user_id] },
      target_channel: "push",
      headings: { en: row.title },
      contents: { en: row.body },
      // No `url` field: setting one makes OneSignal's Android SDK default to
      // opening it via a system browser intent on tap, overriding the app's
      // own click listener (which reads data.route and navigates in-app via
      // location.hash instead).
      data: { notificationType: row.notification_type, route: row.deep_link },
    }),
  });

  if (oneSignalRes.ok) {
    await supabase
      .from("notification_queue")
      .update({ status: "sent", sent_at: new Date().toISOString() })
      .eq("id", row.id);
  } else {
    const errorText = await oneSignalRes.text();
    await supabase
      .from("notification_queue")
      .update({ status: "failed", error: errorText })
      .eq("id", row.id);
  }

  return new Response("ok", { status: 200 });
});
