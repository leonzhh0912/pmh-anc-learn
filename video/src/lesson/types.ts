export type ScriptSegment = { speak: string; caption: string; reveal?: number };
export type ScriptItem = { n: number; icon: string; text: string };

export type ScriptScene =
  | { id: string; kind: "title"; heading: string; subheading: string; segments: ScriptSegment[] }
  | { id: string; kind: "stage"; stage: number; label: string; items: ScriptItem[]; segments: ScriptSegment[] }
  | { id: string; kind: "summary"; heading: string; points: string[]; segments: ScriptSegment[] };

export type VideoScript = {
  id: string;
  lessonId: string;
  version: string;
  title: string;
  handbookRef: { pdfPages: number[]; printedPages: string[] };
  editorial: { status: string };
  scenes: ScriptScene[];
};

export type TimingSegment = {
  file: string;
  from: number;
  durationInFrames: number;
  caption: string;
  reveal: number | null;
};
export type TimingScene = { id: string; from: number; durationInFrames: number; segments: TimingSegment[] };
export type Timing = {
  id: string;
  fps: number;
  durationInFrames: number;
  narration: string;
  scenes: TimingScene[];
};

/** Index of the reveal value that is active at frame f inside a scene. */
export function activeReveal(scene: TimingScene, f: number): number {
  let r = -1;
  for (const s of scene.segments) if (f >= s.from && s.reveal !== null) r = s.reveal;
  return r;
}

/** Frame (scene-relative) when a given reveal value starts. */
export function revealFrame(scene: TimingScene, reveal: number): number {
  return scene.segments.find((s) => s.reveal === reveal)?.from ?? Infinity;
}
