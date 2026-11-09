/**
 * Original, simple line icons drawn for this project (not copied from the
 * handbook). Plum strokes with pink fills so they read on the paper background.
 * Add new keys here when a new script needs them.
 */
import { theme } from "./theme";

const S = { stroke: theme.ink, strokeWidth: 3, fill: "none", strokeLinecap: "round", strokeLinejoin: "round" } as const;
const F = theme.pinkSoft;
const F2 = theme.mint;

const icons: Record<string, React.ReactNode> = {
  vitamin: (
    <>
      <rect x="18" y="20" width="28" height="36" rx="6" {...S} fill={F} />
      <rect x="21" y="10" width="22" height="10" rx="3" {...S} fill={F2} />
      <path d="M18 32h28M18 44h28" {...S} />
      <rect x="44" y="42" width="14" height="8" rx="4" transform="rotate(-35 51 46)" {...S} fill="#fff" />
    </>
  ),
  calendar: (
    <>
      <rect x="10" y="14" width="44" height="40" rx="6" {...S} fill="#fff" />
      <path d="M10 26h44M22 9v10M42 9v10" {...S} />
      <rect x="10" y="14" width="44" height="12" rx="6" fill={F} stroke="none" />
      <path d="M10 26h44" {...S} />
      <text x="32" y="47" textAnchor="middle" fontSize="16" fontWeight="700" fill={theme.ink} fontFamily="Sarabun">2 ปี</text>
    </>
  ),
  scale: (
    <>
      <rect x="10" y="12" width="44" height="42" rx="10" {...S} fill={F} />
      <path d="M20 28a12 12 0 0 1 24 0" {...S} fill="#fff" />
      <path d="M32 28l5-7" {...S} />
      <path d="M22 44h20" {...S} />
    </>
  ),
  handbook: (
    <>
      <rect x="12" y="10" width="34" height="44" rx="3" {...S} fill={F} />
      <path d="M46 14h5v8h-5M46 24h5v8h-5M46 34h5v8h-5" {...S} fill={F2} />
      <path d="M20 22h18M20 30h14" {...S} />
      <path d="M30 50l14-14 4 4-14 14h-4z" {...S} fill="#fff" />
    </>
  ),
  clinic: (
    <>
      <path d="M10 30L32 12l22 18v24H10z" {...S} fill="#fff" />
      <rect x="25" y="22" width="14" height="14" rx="2" fill={F} stroke="none" />
      <path d="M32 24v10M27 29h10" {...S} />
      <path d="M26 54V44h12v10" {...S} />
    </>
  ),
  food: (
    <>
      <circle cx="32" cy="34" r="22" {...S} fill="#fff" />
      <path d="M32 12v22l18 12" {...S} />
      <path d="M32 34L13 44" {...S} />
      <circle cx="40" cy="24" r="4" fill={F2} stroke="none" />
      <circle cx="22" cy="28" r="4" fill={F} stroke="none" />
      <circle cx="33" cy="47" r="4" fill="#f3d27a" stroke="none" />
    </>
  ),
  relax: (
    <>
      <path d="M32 50c-6-8-6-20 0-30 6 10 6 22 0 30z" {...S} fill={F} />
      <path d="M32 50c-10-2-18-10-20-22 10 2 17 9 20 22zM32 50c10-2 18-10 20-22-10 2-17 9-20 22z" {...S} fill="#fff" />
      <path d="M14 54h36" {...S} />
    </>
  ),
  plan: (
    <>
      <rect x="14" y="12" width="36" height="44" rx="4" {...S} fill="#fff" />
      <rect x="24" y="8" width="16" height="8" rx="2" {...S} fill={F} />
      <path d="M21 28l3 3 6-6M21 42l3 3 6-6M34 29h10M34 43h10" {...S} />
    </>
  ),
  book: (
    <>
      <path d="M32 18c-6-4-14-5-22-4v36c8-1 16 0 22 4 6-4 14-5 22-4V14c-8-1-16 0-22 4z" {...S} fill="#fff" />
      <path d="M32 18v36" {...S} />
      <path d="M16 24h10M16 31h10M38 24h10M38 31h10" {...S} />
    </>
  ),
  breastfeed: (
    <>
      <path d="M32 10c8 12 16 20 16 30a16 16 0 0 1-32 0c0-10 8-18 16-30z" {...S} fill="#fff" />
      <path d="M32 48c-8-5-11-9-11-13a5 5 0 0 1 11-2 5 5 0 0 1 11 2c0 4-3 8-11 13z" fill={F} stroke={theme.ink} strokeWidth="2.5" strokeLinejoin="round" />
    </>
  ),
  bowl: (
    <>
      <path d="M10 32h44a22 18 0 0 1-44 0z" {...S} fill={F} />
      <path d="M14 32c4-4 10-6 18-6s14 2 18 6" {...S} fill="#f6e7b8" />
      <path d="M40 10l-6 18" {...S} />
      <ellipse cx="42" cy="8" rx="4" ry="6" transform="rotate(20 42 8)" {...S} fill="#fff" />
    </>
  ),
  vaccine: (
    <>
      <path d="M44 10l10 10M49 15l-6 6M40 18l6 6-22 22-8 2 2-8z" {...S} fill="#fff" />
      <path d="M22 38l4 4M28 32l4 4" {...S} />
      <path d="M40 18l6 6" {...S} />
      <path d="M18 42l-8 8" {...S} />
      <path d="M34 26l6 6-10 10-6-6z" fill={F} stroke="none" />
    </>
  ),
  tooth: (
    <>
      <path d="M20 12c-8 0-10 8-8 16 2 6 3 12 4 20 1 5 6 6 8 0l3-10c1-3 9-3 10 0l3 10c2 6 7 5 8 0 1-8 2-14 4-20 2-8 0-16-8-16-5 0-7 3-12 3s-7-3-12-3z" {...S} fill="#fff" />
      <path d="M50 8v8M46 12h8" stroke={theme.magenta} strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  story: (
    <>
      <path d="M32 26c-6-4-14-5-22-4v30c8-1 16 0 22 4 6-4 14-5 22-4V22c-8-1-16 0-22 4z" {...S} fill="#fff" />
      <path d="M32 26v30" {...S} />
      <path d="M32 18c-5-3-8-5-8-8a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 3-3 5-8 8z" fill={F} stroke={theme.ink} strokeWidth="2.5" strokeLinejoin="round" />
    </>
  ),
  ask: (
    <>
      <path d="M12 14h40a4 4 0 0 1 4 4v24a4 4 0 0 1-4 4H28l-10 8v-8h-6a4 4 0 0 1-4-4V18a4 4 0 0 1 4-4z" {...S} fill={F} />
      <path d="M27 25a5 5 0 1 1 7 5c-2 1-2 2-2 4" {...S} />
      <circle cx="32" cy="39" r="1.8" fill={theme.ink} />
    </>
  ),
  check: <path d="M14 34l12 12 24-26" {...S} strokeWidth={6} stroke={theme.correct} />,
};

export const Icon: React.FC<{ name: string; size: number }> = ({ name, size }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden>
    {icons[name] ?? <circle cx="32" cy="32" r="20" {...S} />}
  </svg>
);
