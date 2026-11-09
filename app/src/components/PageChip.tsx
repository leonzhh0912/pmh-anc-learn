import { pagesLabel } from "../lib/pages";

/** Points the learner back to the page in their paper handbook. */
export function PageChip({
  pdfPages,
  printedPages,
}: {
  pdfPages: number[];
  printedPages?: string[];
}) {
  return (
    <span className="page-chip" title={`อ้างอิงไฟล์ PDF ทางการ หน้า ${pdfPages.join(", ")}`}>
      <svg aria-hidden="true" viewBox="0 0 20 20" width="16" height="16">
        <path
          d="M3 3.5h6a2 2 0 0 1 2 2V17a1.6 1.6 0 0 0-1.6-1.6H3zM17 3.5h-6a2 2 0 0 0-2 2V17a1.6 1.6 0 0 1 1.6-1.6H17z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
      สมุดสีชมพู {pagesLabel(pdfPages, printedPages)}
    </span>
  );
}
