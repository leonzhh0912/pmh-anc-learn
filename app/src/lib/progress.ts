/**
 * Anonymous, on-device learning progress.
 * Nothing leaves the device; no account, no personal data.
 * localStorage can be unavailable (private mode, blocked storage), so every
 * access is guarded and the app keeps working in memory.
 */
import { useSyncExternalStore } from "react";

const KEY = "pmh-anc-learn:progress:v1";

export type LessonProgress = {
  /** furthest step reached (0-based) */
  step: number;
  completedAt?: string;
  /** questionId -> whether the first try was correct */
  firstTry: Record<string, boolean>;
};

export type ProgressState = {
  lessons: Record<string, LessonProgress>;
  textScale: 1 | 1.15 | 1.3;
};

const initial: ProgressState = { lessons: {}, textScale: 1 };

function read(): ProgressState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initial;
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    return { ...initial, ...parsed, lessons: parsed.lessons ?? {} };
  } catch {
    return initial;
  }
}

let state: ProgressState = read();
const listeners = new Set<() => void>();

function write(next: ProgressState) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
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

function lesson(id: string): LessonProgress {
  return state.lessons[id] ?? { step: 0, firstTry: {} };
}

export function reachStep(lessonId: string, step: number) {
  const cur = lesson(lessonId);
  if (step <= cur.step) return;
  write({
    ...state,
    lessons: { ...state.lessons, [lessonId]: { ...cur, step } },
  });
}

export function recordAnswer(
  lessonId: string,
  questionId: string,
  correct: boolean,
) {
  const cur = lesson(lessonId);
  if (questionId in cur.firstTry) return; // only the first try is recorded
  write({
    ...state,
    lessons: {
      ...state.lessons,
      [lessonId]: {
        ...cur,
        firstTry: { ...cur.firstTry, [questionId]: correct },
      },
    },
  });
}

export function completeLesson(lessonId: string) {
  const cur = lesson(lessonId);
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

export function resetProgress() {
  write({ ...initial, textScale: state.textScale });
}
