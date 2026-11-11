// Unit tests for the "send SMS" hook (supabase/functions/send-sms/core.ts) with a fake provider:
// no SMS is sent, no network is used.
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildMessage, handle, toProviderNumber, verifyHook } from "../supabase/functions/send-sms/core.ts";

const rawKey = Buffer.from("local-test-hook-secret-0123456789").toString("base64");
const hookSecret = `v1,whsec_${rawKey}`;
const base = { apiKey: "test-key", apiSecret: "test-secret", sender: "PMHANC", hookSecret, baseUrl: "https://provider.test" };

async function signed(body, { secret = rawKey, ts = Math.floor(Date.now() / 1000) } = {}) {
  const id = "msg_" + Math.random().toString(36).slice(2);
  const key = await crypto.subtle.importKey("raw", Buffer.from(secret, "base64"), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = Buffer.from(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${id}.${ts}.${body}`))).toString("base64");
  return new Request("https://hook.test/send-sms", {
    method: "POST",
    headers: { "webhook-id": id, "webhook-timestamp": String(ts), "webhook-signature": `v1,${sig}`, "content-type": "application/json" },
    body,
  });
}

function fakeProvider(status, body) {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init, form: new URLSearchParams(init.body) });
    return new Response(JSON.stringify(body), { status });
  };
  return { calls, fetchImpl };
}

const payload = JSON.stringify({ user: { id: "u1", phone: "66812345678" }, sms: { otp: "482913" } });

test("the code message fits one Thai SMS (70 characters)", () => {
  assert.ok(buildMessage("123456").length <= 70);
});

test("Thai numbers are converted for each provider; anything else is refused", () => {
  assert.equal(toProviderNumber("thaibulksms", "+66812345678"), "66812345678");
  assert.equal(toProviderNumber("smsmkt", "66812345678"), "0812345678");
  assert.throws(() => toProviderNumber("thaibulksms", "6621234567"), /not_thai_mobile/);
  assert.throws(() => toProviderNumber("thaibulksms", "14155550100"), /not_thai_mobile/);
});

test("ThaiBulkSMS: signed hook call -> one POST with Basic auth, 66 number, sender, Corporate route", async () => {
  const p = fakeProvider(201, { phone_number_list: [{ number: "66812345678", message_id: "m1", used_credit: 1 }], bad_phone_number_list: [] });
  const res = await handle(await signed(payload), { ...base, provider: "thaibulksms" }, p.fetchImpl);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), {});
  assert.equal(p.calls.length, 1);
  const c = p.calls[0];
  assert.equal(c.url, "https://provider.test/sms");
  assert.equal(c.init.headers.authorization, "Basic " + Buffer.from("test-key:test-secret").toString("base64"));
  assert.equal(c.form.get("msisdn"), "66812345678");
  assert.equal(c.form.get("sender"), "PMHANC");
  assert.equal(c.form.get("force"), "premium");
  assert.match(c.form.get("message"), /482913/);
});

test("SMSMKT: key headers, 0-prefixed number", async () => {
  const p = fakeProvider(200, { code: "000", detail: "OK", result: { transaction_id: "t1" } });
  const res = await handle(await signed(payload), { ...base, provider: "smsmkt" }, p.fetchImpl);
  assert.equal(res.status, 200);
  assert.equal(p.calls[0].url, "https://provider.test/api/send-message");
  assert.equal(p.calls[0].init.headers.api_key, "test-key");
  assert.equal(p.calls[0].init.headers.secret_key, "test-secret");
  assert.equal(p.calls[0].form.get("phone"), "0812345678");
});

test("calls not signed by Supabase Auth are refused and nothing is sent", async () => {
  const p = fakeProvider(201, {});
  const forged = await signed(payload, { secret: Buffer.from("someone-else").toString("base64") });
  assert.equal((await handle(forged, { ...base, provider: "thaibulksms" }, p.fetchImpl)).status, 401);
  const old = await signed(payload, { ts: Math.floor(Date.now() / 1000) - 3600 });
  assert.equal((await handle(old, { ...base, provider: "thaibulksms" }, p.fetchImpl)).status, 401);
  const tampered = await signed(payload);
  const body = payload.replace("482913", "000000");
  const t2 = new Request(tampered.url, { method: "POST", headers: tampered.headers, body });
  assert.equal((await handle(t2, { ...base, provider: "thaibulksms" }, p.fetchImpl)).status, 401);
  assert.equal(p.calls.length, 0);
});

test("provider errors become clear failures (never a fake success), and the code is never logged", async () => {
  const logs = [];
  const orig = console.error;
  console.error = (...a) => logs.push(a.join(" "));
  try {
    const bad = fakeProvider(400, { error: { code: 1, name: "ERROR_INVALID_REQUEST", description: "x" } });
    const r1 = await handle(await signed(payload), { ...base, provider: "thaibulksms" }, bad.fetchImpl);
    assert.equal(r1.status, 400);
    assert.equal((await r1.json()).error.message, "ERROR_INVALID_REQUEST");

    const down = async () => { throw new TypeError("fetch failed"); };
    const r2 = await handle(await signed(payload), { ...base, provider: "thaibulksms" }, down);
    assert.equal(r2.status, 503);

    const credit = fakeProvider(200, { code: "400", detail: "insufficient credit" });
    const r3 = await handle(await signed(payload), { ...base, provider: "smsmkt" }, credit.fetchImpl);
    assert.equal(r3.status, 400);
    assert.equal((await r3.json()).error.message, "smsmkt_400");
  } finally {
    console.error = orig;
  }
  assert.ok(logs.length >= 3);
  assert.ok(!logs.some((l) => l.includes("482913")), "OTP must not be logged");
  assert.ok(!logs.some((l) => l.includes("66812345678")), "full phone number must not be logged");
});

test("verifyHook accepts one of several signatures (secret rotation)", async () => {
  const req = await signed("{}");
  const h = new Headers(req.headers);
  h.set("webhook-signature", `v1,AAAA ${req.headers.get("webhook-signature")}`);
  assert.equal(await verifyHook(hookSecret, h, "{}"), true);
});
