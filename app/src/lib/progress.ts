/**
 * Learning progress, kept per "owner":
 * - guest (no account): on this device only, under the original key `pmh-anc-learn:progress:v1`, exactly as
 *   before accounts existed. It never leaves the device.
 * - a signed-in learner: a separate on-device copy keyed by the account's internal id, plus a queue of
 *   events that is sent to the account (lib/sync.ts). Guest progress is never mixed into an account
 *   automatically; the learner may import it once, on request (import_device_progress).
 * localStorage can be unavailable (private mode, blocked storage), so every access is guarded and the app
 * keeps working in memory.
 */
import { useSyncExternalStore } from "react";

const GUEST_KEY = "pmh-anc-learn:progress:v1";
const PREFS_KEY = "pmh-anc-learn:prefs:v1";
const accountKey = (uid: string) => `pmh-anc-learn:account:${uid}:progress:v1`;

export type LessonProgress = {
  /** furthest step reached (0-based) */
  step: number;
  /** first time the learner finished the lesson; never overwritten */
  completedAt?: string;
  /** questionId -> whether the first try was correct */
  firstTry: Record<string, boolean>;
};

export type ProgressState = {
  lessons: Record<string, LessonProgress>;
  textScale: 1 | 1.15 | 1.3;
};

/** Facts the account sync layer needs for each event (lesson length and content version). */
export type LessonMeta = { stepCount: number; version: string };

export type ProgressEvent =
  | { kind: "lesson_step"; lessonId: string; data: { step: number } & LessonMeta }
  | { kind: "lesson_complete"; lessonId: string; data: LessonMeta }
  | { kind: "quiz_answer"; lessonId: string; data: { questionId: string; correct: boolean } };

const initial: ProgressState = { lessons: {}, textScale: 1 };

function load(key: string): ProgressState["lessons"] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    return (JSON.parse(raw) as Partial<ProgressState>).lessons ?? {};
  } catch {
    return {};
  }
}

function loadTextScale(): ProgressState["textScale"] {
  try {
    const prefs = JSON.parse(localStorage.getItem(PREFS_KEY) ?? "null") as { textScale?: number } | null;
    const legacy = JSON.parse(localStorage.getItem(GUEST_KEY) ?? "null") as { textScale?: number } | null;
    const v = prefs?.textScale ?? legacy?.textScale ?? 1;
    return v === 1.15 || v === 1.3 ? v : 1;
  } catch {
    return 1;
  }
}

let owner: string | null = null; // null = guest
let state: ProgressState = { lessons: load(GUEST_KEY), textScale: loadTextScale() };
const listeners = new Set<() => void>();
let emit: ((e: ProgressEvent) => void) | null = null;

function storageKey() {
  return owner ? accountKey(owner) : GUEST_KEY;
}

function write(next: ProgressState) {
  state = next;
  try {
    // the guest file keeps its original shape (lessons + textScale) so older versions still read it
    localStorage.setItem(storageKey(), JSON.stringify(owner ? { lessons: next.lessons } : next));
    localStorage.setItem(PREFS_KEY, JSON.stringify({ textScale: next.textScale }));
  } catch {
    /* storage unavailable: keep in memory only */
  }
  listeners.forEach((l) => l());
}

export function useProgress(): ProgressState {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => state,
  );
}

/** Switch whose progress is shown and recorded. Called by the account layer on sign-in / sign-out. */
export function setProgressOwner(uid: string | null, onEvent: ((e: ProgressEvent) => void) | null) {
  owner = uid;
  emit = uid ? onEvent : null;
  state = { lessons: load(storageKey()), textScale: state.textScale };
  listeners.forEach((l) => l());
}

export function progressOwner() {
  return owner;
}

/** Merge progress held by the account on the server into this device's copy (furthest / earliest wins). */
export function mergeAccountProgress(uid: string, lessons: ProgressState["lessons"]) {
  if (owner !== uid) return;
  const merged = { ...state.lessons };
  for (const [id, remote] of Object.entries(lessons)) {
    const local = merged[id] ?? { step: 0, firstTry: {} };
    const completedAt =
      local.completedAt && remote.completedAt
        ? local.completedAt < remote.completedAt
          ? local.completedAt
          : remote.completedAt
        : (local.completedAt ?? remote.completedAt);
    merged[id] = {
      step: Math.max(local.step, remote.step),
      completedAt,
      firstTry: { ...remote.firstTry, ...local.firstTry },
    };
  }
  write({ ...state, lessons: merged });
}

/** Remove an account's on-device copy (sign-out on a shared phone). */
export function forgetAccountProgress(uid: string) {
  try {
    localStorage.removeItem(accountKey(uid));
  } catch {
    /* nothing stored */
  }
}

/** The guest (device) progress, for the one-time "is this yours?" import offer. */
export function guestProgress(): ProgressState["lessons"] {
  return load(GUEST_KEY);
}

function lesson(id: string): LessonProgress {
  return state.lessons[id] ?? { step: 0, firstTry: {} };
}

export function reachStep(lessonId: string, step: number, meta?: LessonMeta) {
  if (meta) emit?.({ kind: "lesson_step", lessonId, data: { step, ...meta } });
  const cur = lesson(lessonId);
  if (step <= cur.step && state.lessons[lessonId]) return;
  write({
    ...state,
    lessons: { ...state.lessons, [lessonId]: { ...cur, step: Math.max(step, cur.step) } },
  });
}

export function recordAnswer(lessonId: string, questionId: string, correct: boolean) {
  // every answer actually given is sent to the account; on the device only the first try is kept
  emit?.({ kind: "quiz_answer", lessonId, data: { questionId, correct } });
  const cur = lesson(lessonId);
  if (questionId in cur.firstTry) return;
  write({
    ...state,
    lessons: {
      ...state.lessons,
      [lessonId]: { ...cur, firstTry: { ...cur.firstTry, [questionId]: correct } },
    },
  });
}

export function completeLesson(lessonId: string, meta?: LessonMeta) {
  if (meta) emit?.({ kind: "lesson_complete", lessonId, data: meta });
  const cur = lesson(lessonId);
  if (cur.completedAt) return; // keep the first completion time
  write({
    ...state,
    lessons: {
      ...state.lessons,
      [lessonId]: { ...cur, completedAt: new Date().toISOString() },
    },
  });
}

export function setTextScale(textScale: ProgressState["textScale"]) {
  write({ ...state, textScale });
}

/** Clears progress on this device for the current owner. Account progress on the server is not touched. */
export function resetProgress() {
  write({ ...initial, textScale: state.textScale });
}
