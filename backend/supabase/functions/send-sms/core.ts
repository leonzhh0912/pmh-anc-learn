/**
 * Supabase Auth "send SMS" hook -> Thai SMS provider. Supabase generates the one-time code; this only
 * delivers it. Plain Web APIs (fetch, WebCrypto) so it runs in the Supabase Edge Runtime (Deno) and is
 * unit-tested in Node. No secrets in code: everything comes from the function's environment.
 *
 * Providers (docs read 2026-11-11):
 *  - ThaiBulkSMS: POST https://api-v2.thaibulksms.com/sms, HTTP Basic (API key : API secret),
 *    form fields sender, msisdn (66xxxxxxxxx), message, force=standard|premium (premium = Corporate).
 *  - SMSMKT: POST https://portal-otp.smsmkt.com/api/send-message, headers api_key / secret_key,
 *    form fields sender, phone (0xxxxxxxxx), message; success code "000".
 */
export type Provider = "thaibulksms" | "smsmkt";

export type SmsConfig = {
  provider: Provider;
  apiKey: string;
  apiSecret: string;
  sender: string; // registered sender name, 4-10 letters/digits
  hookSecret: string; // "v1,whsec_<base64>" as configured in Supabase Auth
  corporate?: boolean; // ThaiBulkSMS Corporate route (refunds undelivered)
  baseUrl?: string; // override for tests
};

export type SendResult = { ok: true; id: string } | { ok: false; status: number; message: string };

const enc = new TextEncoder();

function b64decode(s: string): Uint8Array {
  const bin = atob(s);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}
function b64encode(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

/** Standard Webhooks signature check (what Supabase Auth uses for HTTP hooks). */
export async function verifyHook(secret: string, headers: Headers, body: string, now = Date.now()): Promise<boolean> {
  const id = headers.get("webhook-id");
  const ts = headers.get("webhook-timestamp");
  const sigs = headers.get("webhook-signature");
  if (!id || !ts || !sigs) return false;
  if (Math.abs(now / 1000 - Number(ts)) > 300) return false; // 5-minute window against replays
  const raw = secret.replace(/^v1,/, "").replace(/^whsec_/, "");
  const key = await crypto.subtle.importKey("raw", b64decode(raw), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const expected = b64encode(await crypto.subtle.sign("HMAC", key, enc.encode(`${id}.${ts}.${body}`)));
  return sigs.split(" ").some((s) => s.split(",")[1] === expected);
}

/** Thai text costs one credit per 70 characters: keep the code message inside one SMS. */
export function buildMessage(otp: string): string {
  return `รหัสยืนยัน ANC Learn: ${otp} ใช้ได้ 10 นาที ห้ามบอกรหัสนี้กับผู้อื่น`;
}

/** Supabase passes E.164 without or with "+": 66812345678 / +66812345678. */
export function toProviderNumber(provider: Provider, phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (!/^66[689]\d{8}$/.test(digits)) throw new Error("not_thai_mobile");
  return provider === "smsmkt" ? "0" + digits.slice(2) : digits;
}

export async function sendSms(cfg: SmsConfig, phone: string, otp: string, fetchImpl: typeof fetch = fetch): Promise<SendResult> {
  const message = buildMessage(otp);
  const form = new URLSearchParams();
  let url: string;
  const headers: Record<string, string> = { "content-type": "application/x-www-form-urlencoded", accept: "application/json" };
  if (cfg.provider === "thaibulksms") {
    url = `${cfg.baseUrl ?? "https://api-v2.thaibulksms.com"}/sms`;
    headers.authorization = "Basic " + btoa(`${cfg.apiKey}:${cfg.apiSecret}`);
    form.set("msisdn", toProviderNumber("thaibulksms", phone));
    form.set("message", message);
    form.set("sender", cfg.sender);
    form.set("force", cfg.corporate === false ? "standard" : "premium");
  } else {
    url = `${cfg.baseUrl ?? "https://portal-otp.smsmkt.com"}/api/send-message`;
    headers.api_key = cfg.apiKey;
    headers.secret_key = cfg.apiSecret;
    form.set("phone", toProviderNumber("smsmkt", phone));
    form.set("message", message);
    form.set("sender", cfg.sender);
  }
  let res: Response;
  try {
    res = await fetchImpl(url, { method: "POST", headers, body: form.toString(), signal: AbortSignal.timeout(15_000) });
  } catch {
    return { ok: false, status: 503, message: "sms_provider_unreachable" };
  }
  const text = await res.text();
  let json: Record<string, unknown> = {};
  try {
    json = JSON.parse(text);
  } catch {
    /* not JSON */
  }
  if (cfg.provider === "thaibulksms") {
    const sent = (json.phone_number_list as { message_id?: string }[] | undefined) ?? [];
    if (res.status === 201 && sent.length) return { ok: true, id: String(sent[0].message_id ?? "") };
    const err = (json.error as { name?: string } | undefined)?.name;
    const bad = (json.bad_phone_number_list as unknown[] | undefined)?.length;
    return { ok: false, status: res.status >= 500 ? 503 : 400, message: err ?? (bad ? "bad_phone_number" : `provider_http_${res.status}`) };
  }
  if (json.code === "000") return { ok: true, id: String((json.result as { transaction_id?: string })?.transaction_id ?? "") };
  return { ok: false, status: json.code === "9999" || res.status >= 500 ? 503 : 400, message: `smsmkt_${json.code ?? res.status}` };
}

/** The hook endpoint: verify the call really comes from Supabase Auth, then send. Never logs codes. */
export async function handle(req: Request, cfg: SmsConfig, fetchImpl: typeof fetch = fetch): Promise<Response> {
  const json = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
  if (req.method !== "POST") return json(405, { error: { http_code: 405, message: "method_not_allowed" } });
  const body = await req.text();
  if (!(await verifyHook(cfg.hookSecret, req.headers, body))) {
    return json(401, { error: { http_code: 401, message: "invalid_signature" } });
  }
  let phone = "";
  let otp = "";
  try {
    const p = JSON.parse(body) as { user?: { phone?: string }; sms?: { otp?: string } };
    phone = p.user?.phone ?? "";
    otp = p.sms?.otp ?? "";
  } catch {
    /* handled below */
  }
  if (!phone || !/^\d{6,10}$/.test(otp)) return json(400, { error: { http_code: 400, message: "bad_payload" } });
  let result: SendResult;
  try {
    result = await sendSms(cfg, phone, otp, fetchImpl);
  } catch (e) {
    result = { ok: false, status: 400, message: (e as Error).message };
  }
  if (result.ok) return json(200, {});
  // Supabase Auth shows the sign-in page an error; the app explains it in Thai ("ส่งรหัสไม่สำเร็จ ...")
  console.error(`send-sms failed: ${result.message} (${phone.slice(0, 4)}xxxx${phone.slice(-2)})`);
  return json(result.status, { error: { http_code: result.status, message: result.message } });
}
