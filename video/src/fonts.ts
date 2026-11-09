import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Sarabun (SIL Open Font License 1.1) — looped Thai letterforms, easy to read
// for older and low-literacy readers. Thai and Latin subsets share one family.
export const FONT_FAMILY = "Sarabun";

const weights = ["400", "600", "700"] as const;

export const fontsLoaded = Promise.all(
  weights.flatMap((weight) => [
    loadFont({
      family: FONT_FAMILY,
      url: staticFile(`fonts/Sarabun-${weight}.woff2`),
      weight,
      display: "block",
    }),
    loadFont({
      family: FONT_FAMILY,
      url: staticFile(`fonts/Sarabun-latin-${weight}.woff2`),
      weight,
      display: "block",
    }),
  ]),
);
