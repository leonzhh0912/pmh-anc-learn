import { useState } from "react";
import type { Step } from "../content/schema";

type FlagStep = Extract<Step, { type: "flag" }>;

const tierColors = ["#f3d27a", "#a9d8a0", "#9cc9e8", "#f2a7a0"];

/**
 * The nutrition flag drawn as an inverted triangle (original artwork).
 * Each tier is a real button; tapping it shows the food groups in that tier.
 * Tier widths shrink toward the tip, so the picture itself says "eat less".
 */
export function FoodFlag({ step }: { step: FlagStep }) {
  const [open, setOpen] = useState<string>(step.tiers[0].id);
  const [seen, setSeen] = useState<Set<string>>(new Set([step.tiers[0].id]));
  const n = step.tiers.length;
  const current = step.tiers.find((t) => t.id === open)!;

  return (
    <div className="flag">
      <p>{step.intro}</p>
      <div className="flag__layout">
        <div className="flag__triangle" role="group" aria-label="ธงโภชนาการ แตะแต่ละชั้นเพื่อดูกลุ่มอาหาร">
          {step.tiers.map((t, i) => {
            const width = 100 - (i * 70) / (n - 1); // 100% at the top, 30% at the tip
            return (
              <button
                key={t.id}
                type="button"
                className={`flag__tier ${open === t.id ? "is-open" : ""}`}
                style={{ width: `${width}%`, background: tierColors[i % tierColors.length] }}
                aria-pressed={open === t.id}
                aria-controls="flag-panel"
                onClick={() => {
                  setOpen(t.id);
                  setSeen(new Set(seen).add(t.id));
                }}
              >
                <span className="flag__tier-name">{t.groups.map((g) => g.name).join(" / ")}</span>
              </button>
            );
          })}
          <span className="flag__pole" aria-hidden="true" />
        </div>

        <div id="flag-panel" className="flag__panel" aria-live="polite">
          <p className="flag__amount">{current.amount}</p>
          <ul>
            {current.groups.map((g) => (
              <li key={g.name}>
                <strong>{g.name}</strong>
                <span>{g.examples}</span>
              </li>
            ))}
          </ul>
          <p className="flag__seen">
            ดูแล้ว {seen.size} จาก {n} ชั้น
          </p>
        </div>
      </div>
      {step.note && <p className="flag__note">{step.note}</p>}
    </div>
  );
}
