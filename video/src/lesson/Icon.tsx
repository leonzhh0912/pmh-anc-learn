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
  // --- added for R1 lesson videos ---
  flag: (
    <>
      <path d="M12 12h40L32 46z" {...S} fill="#fff" />
      <path d="M16.5 18h31M21 25h22M26 32h12" {...S} strokeWidth={2.5} />
      <path d="M12 12h40l-3.5 6h-33z" fill="#f3d27a" stroke="none" />
      <path d="M32 46v12" {...S} />
    </>
  ),
  water: (
    <>
      <path d="M18 12h28l-4 42H22z" {...S} fill="#fff" />
      <path d="M20 28h24l-2.4 26H22.4z" fill="#bfe3ef" stroke="none" />
      <path d="M18 12h28l-4 42H22z" {...S} />
    </>
  ),
  walk: (
    <>
      <circle cx="34" cy="12" r="5" {...S} fill={F} />
      <path d="M33 20l-6 14 8 6-2 14M27 34l-7 8M33 22l10 8M35 40l9 14" {...S} />
    </>
  ),
  bottle: (
    <>
      <rect x="22" y="22" width="20" height="32" rx="6" {...S} fill="#fff" />
      <path d="M22 34h20" {...S} />
      <rect x="22" y="34" width="20" height="20" rx="6" fill="#fdf3d6" stroke="none" />
      <rect x="22" y="22" width="20" height="32" rx="6" {...S} />
      <path d="M26 22v-5h12v5M29 17c0-4 6-4 6 0" {...S} fill={F} />
    </>
  ),
  fridge: (
    <>
      <rect x="18" y="8" width="28" height="48" rx="5" {...S} fill="#fff" />
      <path d="M18 26h28M24 15v6M24 32v9" {...S} />
      <rect x="18" y="8" width="28" height="18" rx="5" fill="#dceefa" stroke="none" />
      <path d="M18 26h28" {...S} />
      <rect x="18" y="8" width="28" height="48" rx="5" {...S} />
    </>
  ),
  snowflake: (
    <>
      <path d="M32 10v44M13 21l38 22M13 43l38-22" {...S} stroke="#2f6f9f" />
      <path d="M27 14l5 4 5-4M27 50l5-4 5 4" {...S} stroke="#2f6f9f" />
    </>
  ),
  clock: (
    <>
      <circle cx="32" cy="32" r="22" {...S} fill="#fff" />
      <path d="M32 18v14l10 6" {...S} />
      <circle cx="32" cy="32" r="2.5" fill={theme.ink} />
    </>
  ),
  thermometer: (
    <>
      <path d="M27 40V14a5 5 0 0 1 10 0v26a10 10 0 1 1-10 0z" {...S} fill="#fff" />
      <circle cx="32" cy="48" r="6" fill={theme.magenta} stroke="none" />
      <path d="M32 46V24" stroke={theme.magenta} strokeWidth="4" strokeLinecap="round" />
    </>
  ),
  toothbrush: (
    <>
      <path d="M10 46l30-30" {...S} strokeWidth={5} />
      <rect x="38" y="8" width="16" height="10" rx="3" transform="rotate(45 46 13)" {...S} fill="#fff" />
      <path d="M44 6l2-3M49 9l3-2M52 14l3-1" stroke="#7cc4e8" strokeWidth="2.5" strokeLinecap="round" />
    </>
  ),
  baby: (
    <>
      <circle cx="32" cy="24" r="12" {...S} fill="#fde7d6" />
      <path d="M27 24h.01M37 24h.01" {...S} strokeWidth={4} />
      <path d="M28 29c2.5 2 5.5 2 8 0" {...S} strokeWidth={2.5} />
      <path d="M18 56c0-10 6-16 14-16s14 6 14 16" {...S} fill={F} />
      <path d="M30 12c0-3 4-3 4 0" {...S} strokeWidth={2.5} />
    </>
  ),
  group: (
    <>
      <circle cx="22" cy="22" r="7" {...S} fill={F} />
      <circle cx="42" cy="22" r="7" {...S} fill={F2} />
      <path d="M8 52c0-9 6-15 14-15s14 6 14 15M28 52c0-9 6-15 14-15s14 6 14 15" {...S} fill="#fff" />
    </>
  ),
  noalcohol: (
    <>
      <path d="M24 14h16l-2 16a6 6 0 0 1-12 0z" {...S} fill="#fff" />
      <path d="M32 36v12M25 50h14" {...S} />
      <circle cx="32" cy="32" r="24" {...S} stroke="#a3221b" strokeWidth={4} />
      <path d="M15 15l34 34" stroke="#a3221b" strokeWidth="4" strokeLinecap="round" />
    </>
  ),
  nosmoking: (
    <>
      <rect x="14" y="30" width="32" height="7" rx="2" {...S} fill="#fff" />
      <path d="M46 30v7M51 30c0-5 3-6 3-11" {...S} />
      <circle cx="32" cy="32" r="24" {...S} stroke="#a3221b" strokeWidth={4} />
      <path d="M15 15l34 34" stroke="#a3221b" strokeWidth="4" strokeLinecap="round" />
    </>
  ),
  heart: (
    <path d="M32 54C16 43 9 34 9 25a11 11 0 0 1 23-5 11 11 0 0 1 23 5c0 9-7 18-23 29z" {...S} fill={F} />
  ),
  leaf: (
    <>
      <path d="M12 52C12 26 28 12 54 12c0 26-14 40-42 40z" {...S} fill={F2} />
      <path d="M12 52L40 24" {...S} />
    </>
  ),
  fish: (
    <>
      <path d="M8 32c8-12 24-14 36-6l10-8v28l-10-8C32 46 16 44 8 32z" {...S} fill="#dceefa" />
      <circle cx="20" cy="30" r="2.5" fill={theme.ink} />
    </>
  ),
  shield: (
    <>
      <path d="M32 8l20 8v14c0 13-8 22-20 26C20 52 12 43 12 30V16z" {...S} fill={F2} />
      <path d="M24 31l6 6 11-12" {...S} />
    </>
  ),
  warning: (
    <>
      <path d="M32 9L57 53H7z" {...S} fill="#fff3cc" />
      <path d="M32 25v13" {...S} strokeWidth={4} />
      <circle cx="32" cy="45" r="2.6" fill={theme.ink} />
    </>
  ),
  motorcycle: (
    <>
      <circle cx="15" cy="44" r="8" {...S} fill="#fff" />
      <circle cx="49" cy="44" r="8" {...S} fill="#fff" />
      <path d="M15 44l9-14h14l11 14M24 30l-4-6h-5M38 30l4-10h7" {...S} />
      <path d="M26 36h12" {...S} fill={F} />
    </>
  ),
  car: (
    <>
      <path d="M8 40v-7l6-11c1-2 3-3 5-3h26c2 0 4 1 5 3l6 11v7z" {...S} fill="#dceefa" />
      <path d="M15 31h34" {...S} />
      <circle cx="18" cy="42" r="5" {...S} fill="#fff" />
      <circle cx="46" cy="42" r="5" {...S} fill="#fff" />
    </>
  ),
  ear: (
    <>
      <path d="M22 26a12 12 0 0 1 24 0c0 8-6 10-8 15-1.5 4-3 9-8 9-4 0-6-3-6-6" {...S} fill="#fde7d6" />
      <path d="M28 26a6 6 0 0 1 12 0c0 4-4 5-4 8" {...S} />
      <path d="M50 18c3 3 4 6 4 10M54 13c4 4 6 9 6 15" {...S} stroke="#2f6f9f" strokeWidth={2.5} />
    </>
  ),
  smile: (
    <>
      <circle cx="32" cy="32" r="22" {...S} fill="#fde7d6" />
      <path d="M24 28h.01M40 28h.01" {...S} strokeWidth={5} />
      <path d="M22 37c5 7 15 7 20 0" {...S} />
    </>
  ),
  chat: (
    <>
      <path d="M8 14h32a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4H22l-8 7v-7H8a4 4 0 0 1-4-4V18a4 4 0 0 1 4-4z" {...S} fill={F} />
      <path d="M28 40h14l8 7v-7h6a4 4 0 0 0 4-4V26a4 4 0 0 0-4-4h-8" {...S} fill="#fff" />
      <path d="M13 24h22M13 29h14" {...S} strokeWidth={2.5} />
    </>
  ),
  form: (
    <>
      <rect x="14" y="8" width="36" height="48" rx="4" {...S} fill="#fff" />
      <path d="M21 19h22M21 28h22M21 37h22M21 46h12" {...S} strokeWidth={2.5} />
      <rect x="40" y="42" width="6" height="6" rx="1" {...S} strokeWidth={2} fill={F2} />
    </>
  ),
  office: (
    <>
      <path d="M8 24L32 10l24 14z" {...S} fill={F} />
      <path d="M12 24v26M22 24v26M32 24v26M42 24v26M52 24v26M8 52h48" {...S} />
    </>
  ),
  fence: (
    <>
      <path d="M12 20l4-6 4 6v32h-8zM28 20l4-6 4 6v32h-8zM44 20l4-6 4 6v32h-8z" {...S} fill="#f6e7b8" />
      <path d="M8 30h48M8 42h48" {...S} />
    </>
  ),
  blood: (
    <>
      <rect x="24" y="8" width="16" height="44" rx="8" {...S} fill="#fff" />
      <path d="M24 32h16v12a8 8 0 0 1-16 0z" fill="#e57373" stroke="none" />
      <rect x="24" y="8" width="16" height="44" rx="8" {...S} />
      <path d="M20 8h24" {...S} />
    </>
  ),
  play: (
    <>
      <rect x="10" y="34" width="20" height="20" rx="3" {...S} fill={F} />
      <rect x="34" y="34" width="20" height="20" rx="3" {...S} fill="#bfe3ef" />
      <rect x="22" y="12" width="20" height="20" rx="3" {...S} fill="#f3d27a" />
      <path d="M17 44h6M41 41v6M29 22h6" {...S} strokeWidth={2.5} />
    </>
  ),

};

export const iconNames = Object.keys(icons);

export const Icon: React.FC<{ name: string; size: number }> = ({ name, size }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden>
    {icons[name] ?? <circle cx="32" cy="32" r="20" {...S} />}
  </svg>
);
