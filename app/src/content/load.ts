/**
 * Loads lesson/section/video JSON from /content at build time.
 * Content is validated by `npm run validate:content` (build/CI gate).
 * In development we also validate in the browser to surface mistakes early;
 * the schema library is loaded only then, keeping the production bundle small.
 */
import type { Lesson, Section, Video } from "./schema";
import sectionsJson from "../../../content/sections.json";
import sourceJson from "../../../content/handbook-source.json";

const lessonModules = import.meta.glob("../../../content/lessons/*.json", {
  eager: true,
  import: "default",
});
const videoModules = import.meta.glob("../../../content/videos/*.json", {
  eager: true,
  import: "default",
});

export const sections = sectionsJson as Section[];
export const lessons = Object.values(lessonModules) as Lesson[];
export const videos = Object.values(videoModules) as Video[];

if (import.meta.env.DEV) {
  import("./schema").then(({ Lesson, Section, Video }) => {
    const check = (label: string, schema: { safeParse: (x: unknown) => { success: boolean; error?: unknown } }, data: unknown) => {
      const r = schema.safeParse(data);
      if (!r.success) console.error(`Invalid content: ${label}`, r.error);
    };
    sections.forEach((s) => check(`section ${s.id}`, Section, s));
    Object.entries(lessonModules).forEach(([p, d]) => check(p, Lesson, d));
    Object.entries(videoModules).forEach(([p, d]) => check(p, Video, d));
  });
}

export const handbookSource = sourceJson as {
  title: string;
  edition: string;
  publisher: string;
  url: string;
  pdfUrl: string;
  pdfSha256: string;
  pages: number;
};

export const lessonById = (id: string) => lessons.find((l) => l.id === id);
export const videoById = (id: string) => videos.find((v) => v.id === id);
export const lessonsInSection = (sectionId: string) =>
  lessons.filter((l) => l.sectionId === sectionId);

/** Whether this item may be presented as authoritative medical guidance. */
export const isApproved = (status: Lesson["editorial"]["status"]) =>
  status === "APPROVED" || status === "PUBLISHED";
