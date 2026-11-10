export type ScriptSegment = { speak: string; caption: string; reveal?: number };
export type ScriptItem = { n: number; icon: string; text: string };

export type ScriptScene =
  | {
      id: string;
      kind: "title";
      heading: string;
      subheading: string;
      /** optional topic chips shown under the title, revealed with the 2nd segment */
      chips?: string[];
      segments: ScriptSegment[];
    }
  | {
      id: string;
      kind: "stage";
      stage: number;
      label: string;
      /** word before the part number: "ตอนที่" (default) or e.g. "ช่วงที่" for time periods */
      prefix?: string;
      /** hide the "ข้อ N" badges when item texts carry their own numbering */
      hideNumbers?: boolean;
      items: ScriptItem[];
      segments: ScriptSegment[];
    }
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

/** Page label as families see it in the paper book (printed = PDF − 2 for PDF p3–p66). */
export function printedLabel(pdfPage: number): string {
  if (pdfPage === 1) return "ปกหน้า";
  if (pdfPage === 2) return "ด้านในปกหน้า";
  if (pdfPage === 67) return "หน้าสรุปท้ายเล่ม";
  if (pdfPage === 68) return "ปกหลัง";
  return `หน้า ${pdfPage - 2}`;
}

/** The published record (content/videos/<id>.json): where a reviewer's approval is recorded. */
export type Published = { editorial: { status: string } };
