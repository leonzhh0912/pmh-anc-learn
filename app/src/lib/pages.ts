/**
 * Converts official-PDF page indices to what families see in the paper book.
 * Rule (content/handbook-source.json): printed = PDF − 2 for PDF p3–p66.
 */
export function printedLabel(pdfPage: number): string {
  if (pdfPage === 1) return "ปกหน้า";
  if (pdfPage === 2) return "ด้านในปกหน้า";
  if (pdfPage === 67) return "หน้าสรุปท้ายเล่ม";
  if (pdfPage === 68) return "ปกหลัง";
  return `หน้า ${pdfPage - 2}`;
}

export function pagesLabel(pdfPages: number[], printedPages?: string[]): string {
  if (printedPages && printedPages.length > 0) return `หน้า ${printedPages.join(", ")}`;
  return pdfPages.map(printedLabel).join(", ");
}
