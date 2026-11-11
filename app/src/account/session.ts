/**
 * Account session + progress sync (only active when accountsEnabled).
 *
 * - The Supabase client is imported on demand; guests on the public build never load it.
 * - Learning events are queued per account (key includes the account id) and sent with unique ids, so
 *   retries, two tabs and offline queues never double-count, and one account's queue can never be sent
 *   under another account's session.
 * - Roles shown here only choose which screens to draw. The database decides what anyone may see.
 */
import { useSyncExternalStore } from "react";
import { accountsEnabled } from "./config";
import {
  forgetAccountProgress,
  mergeAccountProgress,
  setProgressOwner,
  type LessonProgress,
  type ProgressEvent,
} from "../lib/progress";
import { setTutorialOwner, mergeTutorial } from "../lib/tutorial";

type SupabaseClient = (typeof import("./client"))["supabase"];

export type Account =
  | { kind: "none" }
  | {
      kind: "learner";
      status: "active" | "deactivated";
      display_name: string;
      contact_method: "phone" | "email" | "username";
      contact_hint: string;
      legacy_imported_at: string | null;
      created_at: string;
    }
  | { kind: "staff"; role: "staff" | "admin"; status: "active" | "deactivated"; display_name: string; aal: string };

export type SyncState = "idle" | "pending" | "sending" | "offline" | "error";

export type SessionState = {
  phase: "disabled" | "loading" | "guest" | "signed-in";
  uid: string | null;
  account: Account;
  sync: SyncState;
  pending: number;
  lastSyncedAt: string | null;
  error: string | null;
};

export type QueuedEvent = {
  id: string;
  kind: string;
  lessonId?: string | null;
  data: Record<string, unknown>;
  at: string;
};

let state: SessionState = {
  phase: accountsEnabled ? "loading" : "disabled",
  uid: null,
  account: { kind: "none" },
  sync: "idle",
  pending: 0,
  lastSyncedAt: null,
  error: null,
};
const listeners = new Set<() => void>();
function set(patch: Partial<SessionState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export function useSession(): SessionState {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => state,
  );
}

export function sessionState() {
  return state;
}

let clientPromise: Promise<SupabaseClient> | null = null;
export function getClient(): Promise<SupabaseClient> {
  if (!accountsEnabled) return Promise.reject(new Error("accounts_disabled"));
  clientPromise ??= import("./client").then((m) => m.supabase);
  return clientPromise;
}

// ---------------------------------------------------------------- queue (per account, on this device)

const queueKey = (uid: string) => `pmh-anc-learn:account:${uid}:queue:v1`;
const syncedKey = (uid: string) => `pmh-anc-learn:account:${uid}:synced-at`;

function readQueue(uid: string): QueuedEvent[] {
  try {
    return JSON.parse(localStorage.getItem(queueKey(uid)) ?? "[]") as QueuedEvent[];
  } catch {
    return [];
  }
}
function writeQueue(uid: string, q: QueuedEvent[]) {
  try {
    if (q.length) localStorage.setItem(queueKey(uid), JSON.stringify(q));
    else localStorage.removeItem(queueKey(uid));
  } catch {
    /* storage full or blocked: events stay in memory until sent */
  }
  memoryQueue.set(uid, q);
  if (state.uid === uid) set({ pending: q.length, sync: q.length ? (state.sync === "sending" ? "sending" : "pending") : "idle" });
}
const memoryQueue = new Map<string, QueuedEvent[]>();
const queueOf = (uid: string) => {
  const stored = readQueue(uid);
  return stored.length ? stored : (memoryQueue.get(uid) ?? []);
};

/**
 * Queue an event for the signed-in learner. Ignored for guests and staff. While the session is still
 * loading after a page load, events are kept under the account found in storage (see boot below) and
 * dropped later if that account turns out not to be a learner.
 */
export function recordEvent(e: Omit<QueuedEvent, "id" | "at">) {
  const uid = state.uid;
  if (!uid || !(state.account.kind === "learner" || state.phase === "loading")) return;
  const item: QueuedEvent = { ...e, id: crypto.randomUUID(), at: new Date().toISOString() };
  writeQueue(uid, [...queueOf(uid), item]);
  scheduleFlush();
}

function onProgressEvent(e: ProgressEvent) {
  recordEvent({ kind: e.kind, lessonId: e.lessonId, data: e.data });
}

let flushTimer: ReturnType<typeof setTimeout> | undefined;
let retryDelay = 2000;
function scheduleFlush(delay = 1200) {
  clearTimeout(flushTimer);
  flushTimer = setTimeout(() => void flush(), delay);
}

/** Send queued events for the CURRENT account only. */
export async function flush(): Promise<boolean> {
  const uid = state.uid;
  if (!uid || state.account.kind !== "learner") return false;
  const queue = queueOf(uid);
  if (!queue.length) {
    set({ sync: "idle", pending: 0 });
    return true;
  }
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    set({ sync: "offline" });
    return false;
  }
  set({ sync: "sending" });
  const batch = queue.slice(0, 100);
  try {
    const supabase = await getClient();
    const { data: session } = await supabase.auth.getSession();
    if (session.session?.user.id !== uid) throw new Error("session_changed"); // never send A's events as B
    const { data, error } = await supabase.rpc("sync_learning", { p_events: batch });
    if (error) throw error;
    const sent = new Set(batch.map((b) => b.id));
    writeQueue(uid, queueOf(uid).filter((q) => !sent.has(q.id)));
    const syncedAt = (data as { synced_at: string }).synced_at;
    try {
      localStorage.setItem(syncedKey(uid), syncedAt);
    } catch {
      /* ignore */
    }
    retryDelay = 2000;
    set({ lastSyncedAt: syncedAt, error: null, sync: queueOf(uid).length ? "pending" : "idle" });
    if (queueOf(uid).length) scheduleFlush(200);
    return true;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String((err as { message?: string })?.message ?? err);
    const offline = /fetch|network|Failed to fetch|Load failed/i.test(msg) || navigator.onLine === false;
    set({ sync: offline ? "offline" : "error", error: offline ? null : msg });
    if (msg === "account_deactivated") return false;
    scheduleFlush(retryDelay);
    retryDelay = Math.min(retryDelay * 2, 60_000);
    return false;
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("online", () => scheduleFlush(300));
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden" && state.pending) void flush();
  });
}

// ---------------------------------------------------------------- loading the account

type Row = Record<string, unknown>;

/** Pull what the account already holds (another phone, earlier sessions) into this device's copy. */
async function pull(uid: string) {
  const supabase = await getClient();
  const [lp, qa, tp] = await Promise.all([
    supabase.from("lesson_progress").select("lesson_id, furthest_step, first_completed_at"),
    supabase.from("quiz_answers").select("lesson_id, question_id, correct").eq("attempt_no", 1),
    supabase.from("tutorial_progress").select("started_at, last_step, completed_at, skipped_at").maybeSingle(),
  ]);
  if (state.uid !== uid) return;
  const lessons: Record<string, LessonProgress> = {};
  for (const r of (lp.data ?? []) as Row[]) {
    lessons[r.lesson_id as string] = {
      step: r.furthest_step as number,
      completedAt: (r.first_completed_at as string | null) ?? undefined,
      firstTry: {},
    };
  }
  for (const r of (qa.data ?? []) as Row[]) {
    const l = (lessons[r.lesson_id as string] ??= { step: 0, firstTry: {} });
    l.firstTry[r.question_id as string] = r.correct as boolean;
  }
  mergeAccountProgress(uid, lessons);
  if (tp.data) mergeTutorial(uid, tp.data as Row);
}

export async function refreshAccount() {
  if (!accountsEnabled) return;
  const supabase = await getClient();
  const { data } = await supabase.auth.getSession();
  const uid = data.session?.user.id ?? null;
  if (!uid) {
    setProgressOwner(null, null);
    setTutorialOwner(null, null);
    set({ phase: "guest", uid: null, account: { kind: "none" }, pending: 0, sync: "idle", lastSyncedAt: null });
    return;
  }
  const { data: me, error } = await supabase.rpc("my_account");
  const account = (error ? { kind: "none" } : me) as Account;
  let lastSyncedAt: string | null = null;
  try {
    lastSyncedAt = localStorage.getItem(syncedKey(uid));
  } catch {
    /* ignore */
  }
  set({ phase: "signed-in", uid, account, pending: queueOf(uid).length, lastSyncedAt, error: error?.message ?? null });
  if (account.kind === "learner" && account.status === "active") {
    setProgressOwner(uid, onProgressEvent);
    setTutorialOwner(uid, (e) => recordEvent(e));
    try {
      await pull(uid);
    } catch {
      set({ sync: "offline" });
    }
    scheduleFlush(300);
  } else {
    // staff and deactivated accounts never record learning progress; drop anything queued while loading
    if (account.kind === "staff") writeQueue(uid, []);
    setProgressOwner(null, null);
    setTutorialOwner(null, null);
  }
}

// Boot: if this device holds a signed-in session, attach progress to that account straight away, before
// any page records a step. Otherwise the first step after a reload would land in the guest store.
const AUTH_KEY = "pmh-anc-learn:auth";
function storedUid(): string | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? ((JSON.parse(raw) as { user?: { id?: string } }).user?.id ?? null) : null;
  } catch {
    return null;
  }
}
if (accountsEnabled && typeof window !== "undefined") {
  const uid = storedUid();
  if (uid) {
    state = { ...state, uid, pending: queueOf(uid).length };
    setProgressOwner(uid, onProgressEvent);
    setTutorialOwner(uid, (e) => recordEvent(e));
  }
}

let started = false;
export function startAccounts() {
  if (!accountsEnabled || started) return;
  started = true;
  void (async () => {
    const supabase = await getClient();
    supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "MFA_CHALLENGE_VERIFIED") {
        setTimeout(() => void refreshAccount(), 0);
      }
    });
    await refreshAccount().catch(() => set({ phase: "guest" }));
  })();
}

/**
 * Sign out and remove this account's data from the device (shared phones). If events are still waiting
 * to be sent, the caller must have asked the user first; `discardPending` confirms that choice.
 */
export async function signOut({ discardPending = false } = {}) {
  const uid = state.uid;
  if (uid && queueOf(uid).length && !discardPending) {
    const ok = await flush();
    if (!ok || queueOf(uid).length) throw new Error("pending_not_sent");
  }
  const supabase = await getClient();
  await supabase.auth.signOut({ scope: "local" });
  if (uid) {
    forgetAccountProgress(uid);
    writeQueue(uid, []);
    try {
      localStorage.removeItem(syncedKey(uid));
      localStorage.removeItem(`pmh-anc-learn:account:${uid}:tutorial:v1`);
    } catch {
      /* ignore */
    }
  }
  // a full reload drops every in-memory copy of personal or staff data
  window.location.replace(import.meta.env.BASE_URL);
}
