/**
 * Progress through "Lesson 0: how to use the app". Kept apart from the 58 handbook lessons: it is not
 * counted in the curriculum and carries no handbook reference. Guests keep it on the device; a signed-in
 * learner's copy is per account and is also sent to the account as tutorial_* events.
 */
import { useSyncExternalStore } from "react";

export type TutorialState = {
  startedAt?: string;
  lastStep: number;
  completedAt?: string;
  skippedAt?: string;
};

type Emit = (e: { kind: string; lessonId: null; data: Record<string, unknown> }) => void;

const GUEST_KEY = "pmh-anc-learn:tutorial:v1";
const accountKey = (uid: string) => `pmh-anc-learn:account:${uid}:tutorial:v1`;

let owner: string | null = null;
let emit: Emit | null = null;
const key = () => (owner ? accountKey(owner) : GUEST_KEY);

function load(k: string): TutorialState {
  try {
    return { lastStep: 0, ...(JSON.parse(localStorage.getItem(k) ?? "{}") as Partial<TutorialState>) };
  } catch {
    return { lastStep: 0 };
  }
}

let state: TutorialState = load(GUEST_KEY);
const listeners = new Set<() => void>();
function write(next: TutorialState) {
  state = next;
  try {
    localStorage.setItem(key(), JSON.stringify(next));
  } catch {
    /* memory only */
  }
  listeners.forEach((l) => l());
}

export function useTutorial(): TutorialState {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => state,
  );
}

export function setTutorialOwner(uid: string | null, onEvent: Emit | null) {
  owner = uid;
  emit = uid ? onEvent : null;
  state = load(key());
  listeners.forEach((l) => l());
}

export function mergeTutorial(uid: string, remote: Record<string, unknown>) {
  if (owner !== uid) return;
  write({
    startedAt: state.startedAt ?? (remote.started_at as string | undefined) ?? undefined,
    lastStep: Math.max(state.lastStep, Number(remote.last_step ?? 0)),
    completedAt: state.completedAt ?? (remote.completed_at as string | undefined) ?? undefined,
    skippedAt: state.skippedAt ?? (remote.skipped_at as string | undefined) ?? undefined,
  });
}

const now = () => new Date().toISOString();

export function tutorialStep(step: number) {
  if (!state.startedAt) emit?.({ kind: "tutorial_start", lessonId: null, data: { step: 0 } });
  emit?.({ kind: "tutorial_step", lessonId: null, data: { step } });
  write({ ...state, startedAt: state.startedAt ?? now(), lastStep: Math.max(state.lastStep, step) });
}

export function tutorialComplete(stepCount: number) {
  emit?.({ kind: "tutorial_complete", lessonId: null, data: { step: stepCount } });
  write({ ...state, startedAt: state.startedAt ?? now(), lastStep: stepCount, completedAt: state.completedAt ?? now() });
}

export function tutorialSkip() {
  emit?.({ kind: "tutorial_skip", lessonId: null, data: { step: state.lastStep } });
  write({ ...state, skippedAt: state.skippedAt ?? now() });
}
