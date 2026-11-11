import { getClient, refreshAccount } from "./session";

export type Method = "phone" | "email";
export type AuthProblem = { message: string; cooldown?: number };

/** Turn provider errors into plain Thai the learner can act on. Never pretends a code was sent. */
export function explain(err: unknown): AuthProblem {
  const e = err as { message?: string; status?: number; code?: string };
  const msg = e?.message ?? String(err);
  const wait = /after (\d+) seconds?/.exec(msg)?.[1];
  if (wait) return { message: `ขอรหัสใหม่ได้อีกครั้งใน ${wait} วินาที`, cooldown: Number(wait) };
  if (/rate limit|too many/i.test(msg) || e?.status === 429)
    return { message: "ขอรหัสบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่" };
  if (e?.code === "otp_expired" || /expired|invalid/i.test(msg))
    return { message: "รหัสไม่ถูกต้องหรือหมดอายุแล้ว ตรวจตัวเลขอีกครั้ง หรือกดขอรหัสใหม่" };
  if (/provider_disabled|Unsupported phone provider|signups not allowed/i.test(msg) || /provider_disabled/.test(e?.code ?? ""))
    return { message: "ตอนนี้ยังเข้าสู่ระบบด้วยวิธีนี้ไม่ได้ ลองอีกวิธีหนึ่ง หรือติดต่อเจ้าหน้าที่" };
  if (/Database error saving new user|no_staff_invitation/i.test(msg))
    return { message: "ไม่พบคำเชิญเจ้าหน้าที่สำหรับอีเมลนี้ หรือคำเชิญหมดอายุแล้ว ติดต่อผู้ดูแลระบบ" };
  if (/sending|sms|send/i.test(msg) && (e?.status ?? 0) >= 500)
    return { message: "ส่งรหัสไม่สำเร็จ ระบบส่งข้อความขัดข้อง ลองอีกครั้งภายหลัง หรือใช้อีกวิธีหนึ่ง" };
  if (/fetch|network|Load failed/i.test(msg))
    return { message: "เชื่อมต่ออินเทอร์เน็ตไม่ได้ การเข้าสู่ระบบต้องใช้อินเทอร์เน็ต" };
  if (/email/i.test(msg) && /valid/i.test(msg)) return { message: "อีเมลนี้ไม่ถูกต้อง ตรวจอีกครั้ง" };
  return { message: "เกิดข้อผิดพลาด ลองอีกครั้ง หรือติดต่อเจ้าหน้าที่" };
}

/** Ask the auth service to send a one-time code. `contact` is E.164 for phone, lower-case email. */
export async function sendCode(method: Method, contact: string, meta: Record<string, string> = {}) {
  const supabase = await getClient();
  const options = { shouldCreateUser: true, data: meta };
  const { error } =
    method === "phone"
      ? await supabase.auth.signInWithOtp({ phone: contact, options })
      : await supabase.auth.signInWithOtp({ email: contact, options });
  if (error) throw error;
}

export async function verifyCode(method: Method, contact: string, token: string) {
  const supabase = await getClient();
  const { error } =
    method === "phone"
      ? await supabase.auth.verifyOtp({ phone: contact, token, type: "sms" })
      : await supabase.auth.verifyOtp({ email: contact, token, type: "email" });
  if (error) throw error;
  await refreshAccount();
}

// ------------------------------------------------------------------ staff second factor (TOTP)

export async function mfaStatus() {
  const supabase = await getClient();
  const [{ data: aal }, { data: factors }] = await Promise.all([
    supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
    supabase.auth.mfa.listFactors(),
  ]);
  const verified = factors?.totp?.find((f) => f.status === "verified") ?? null;
  return { level: aal?.currentLevel ?? "aal1", factorId: verified?.id ?? null };
}

export async function mfaEnroll() {
  const supabase = await getClient();
  // drop half-finished enrolments so the person can start again cleanly
  const { data: f } = await supabase.auth.mfa.listFactors();
  for (const x of f?.all ?? []) if (x.status !== "verified") await supabase.auth.mfa.unenroll({ factorId: x.id });
  const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "ANC Learn staff" });
  if (error) throw error;
  return { factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret };
}

export async function mfaVerify(factorId: string, code: string) {
  const supabase = await getClient();
  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
  if (error) throw error;
  await refreshAccount();
}

/** Call a database function; errors keep the server's code (e.g. 'mfa_required', 'not_staff'). */
export async function call<T>(fn: string, args?: Record<string, unknown>): Promise<T> {
  const supabase = await getClient();
  const { data, error } = await supabase.rpc(fn, args);
  if (error) throw new Error(error.message);
  return data as T;
}
