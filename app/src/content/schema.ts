/**
 * Content schema for PMH Smart ANC Learn.
 *
 * All lesson content lives as JSON under /content (repo root) so that it can be
 * reviewed in Git, edited by non-developers later (e.g. through a Git-backed CMS
 * such as Decap/Sveltia), and validated with `npm run validate:content`.
 *
 * Every content item carries its handbook reference and editorial state.
 * Only APPROVED/PUBLISHED lessons may be shown as authoritative guidance.
 */
import { z } from "zod";

export const EDITORIAL_STATUSES = [
  "DRAFT",
  "MEDICAL_REVIEW",
  "APPROVED",
  "PUBLISHED",
] as const;
export const EditorialStatus = z.enum(EDITORIAL_STATUSES);
export type EditorialStatus = z.infer<typeof EditorialStatus>;

/** Pointer into the official handbook. */
export const HandbookRef = z.object({
  /** Edition key, see content/handbook-source.json */
  edition: z.literal("MCH-2568"),
  /** 1-based page index inside the official 68-page PDF */
  pdfPages: z.array(z.number().int().min(1).max(68)).min(1),
  /** Page numbers printed on the paper handbook (what families see) */
  printedPages: z.array(z.string()).default([]),
  note: z.string().optional(),
});
export type HandbookRef = z.infer<typeof HandbookRef>;

export const Editorial = z.object({
  status: EditorialStatus,
  author: z.string(),
  medicalReviewer: z.string().nullable(),
  reviewDate: z.string().nullable(),
  clinicalRisk: z.enum(["low", "medium", "high"]),
  reviewNotes: z.array(z.string()).default([]),
});

export const HistoryEntry = z.object({
  version: z.string(),
  date: z.string(),
  author: z.string(),
  change: z.string(),
});

const Option = z.object({
  id: z.string(),
  text: z.string(),
  /** Feedback shown when this option is chosen */
  feedback: z.string(),
});

export const Question = z.object({
  id: z.string(),
  kind: z.enum(["mcq", "truefalse", "scenario", "image"]),
  scenario: z.string().optional(),
  prompt: z.string(),
  options: z.array(Option).min(2),
  correctOptionId: z.string(),
  /** Shown after any answer, always ties back to the handbook */
  explanation: z.string(),
  source: HandbookRef.pick({ pdfPages: true, printedPages: true }),
});
export type Question = z.infer<typeof Question>;

const TimelineItem = z.object({
  n: z.number().int(),
  title: z.string(),
  detail: z.string(),
});

export const Step = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("text"),
    heading: z.string(),
    paragraphs: z.array(z.string()),
    audio: z.string().optional(),
  }),
  z.object({
    type: z.literal("timeline"),
    heading: z.string(),
    intro: z.string(),
    stages: z.array(
      z.object({
        id: z.string(),
        label: z.string(),
        items: z.array(TimelineItem),
      }),
    ),
  }),
  z.object({
    type: z.literal("sort"),
    heading: z.string(),
    intro: z.string(),
    /** items to place into the right bucket */
    buckets: z.array(z.object({ id: z.string(), label: z.string() })),
    items: z.array(
      z.object({ id: z.string(), text: z.string(), bucketId: z.string() }),
    ),
  }),
  z.object({
    /** Inverted-triangle nutrition flag (ธงโภชนาการ); tiers top (eat most) to tip (eat least) */
    type: z.literal("flag"),
    heading: z.string(),
    intro: z.string(),
    tiers: z
      .array(
        z.object({
          id: z.string(),
          amount: z.string(),
          groups: z.array(z.object({ name: z.string(), examples: z.string() })).min(1),
        }),
      )
      .min(2),
    note: z.string().optional(),
  }),
  z.object({
    type: z.literal("video"),
    heading: z.string(),
    videoId: z.string(),
  }),
  z.object({
    type: z.literal("quiz"),
    heading: z.string(),
    questions: z.array(Question).min(1),
  }),
  z.object({
    type: z.literal("takeaways"),
    heading: z.string(),
    items: z.array(z.string()).min(1),
    familyNote: z.string().optional(),
  }),
]);
export type Step = z.infer<typeof Step>;

export const Lesson = z.object({
  id: z.string().regex(/^MCH68-[A-Z0-9]+-\d{3}$/),
  version: z.string(),
  title: z.string(),
  summary: z.string(),
  sectionId: z.string(),
  stages: z.array(
    z.enum([
      "before-pregnancy",
      "pregnancy",
      "birth",
      "postpartum",
      "newborn",
      "child",
    ]),
  ),
  audience: z.array(z.enum(["mother", "family"])),
  minutes: z.number().int().positive(),
  objectives: z.array(z.string()).min(1),
  handbookRef: HandbookRef,
  editorial: Editorial,
  history: z.array(HistoryEntry).min(1),
  steps: z.array(Step).min(1),
});
export type Lesson = z.infer<typeof Lesson>;

export const Video = z.object({
  id: z.string(),
  lessonId: z.string(),
  title: z.string(),
  /** relative to app/public */
  mp4: z.string(),
  captionsVtt: z.string(),
  poster: z.string().optional(),
  durationSec: z.number(),
  /** draft-tts = local macOS voice (never in production); cloud-tts = licensed provider voice */
  narration: z.enum(["draft-tts", "cloud-tts", "recorded", "mixed", "none"]),
  voice: z.object({ engine: z.string(), voice: z.string(), model: z.string().nullable() }).optional(),
  editorial: Editorial,
});
export type Video = z.infer<typeof Video>;

export const Section = z.object({
  id: z.string(),
  title: z.string(),
  /** colour of the paper handbook's side tab */
  tabColor: z.string(),
  pdfPages: z.tuple([z.number(), z.number()]),
  kind: z.enum(["education", "record", "mixed"]),
  description: z.string(),
});
export type Section = z.infer<typeof Section>;
