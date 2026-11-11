// Supabase Edge Function: the Auth "send SMS" hook. Deploy to the self-hosted functions volume
// (docs/THAI-CLOUD-SETUP.md). Configuration only from environment variables; nothing secret in Git.
import { handle, type Provider } from "./core.ts";

const env = (k: string) => Deno.env.get(k) ?? "";
const provider = (env("SMS_PROVIDER") || "thaibulksms") as Provider;
const cfg = {
  provider,
  apiKey: env(provider === "smsmkt" ? "SMSMKT_API_KEY" : "THAIBULKSMS_API_KEY"),
  apiSecret: env(provider === "smsmkt" ? "SMSMKT_SECRET_KEY" : "THAIBULKSMS_API_SECRET"),
  sender: env("SMS_SENDER"),
  hookSecret: env("SEND_SMS_HOOK_SECRET"),
  corporate: env("THAIBULKSMS_ROUTE") !== "standard",
};
// optional: point at a test double of the provider (staging / local tests only)
const baseUrl = env("SMS_PROVIDER_BASE_URL") || undefined;
for (const [k, v] of Object.entries(cfg)) if (v === "") throw new Error(`send-sms: ${k} is not configured`);

Deno.serve((req) => handle(req, { ...cfg, baseUrl }));
