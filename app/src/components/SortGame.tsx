import { useRef, useState } from "react";
import type { Step } from "../content/schema";

type SortStep = Extract<Step, { type: "sort" }>;

/**
 * Tap a card, then tap the box it belongs to (a stage, group, place…). No dragging, so it works with
 * one thumb, a screen reader, or a keyboard. Wrong placements bounce back with
 * a hint; nothing is scored.
 */
export function SortGame({ step, onDone }: { step: SortStep; onDone?: () => void }) {
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const bucketsRef = useRef<HTMLDivElement>(null);

  // after choosing a card, bring the destination boxes into view (long lists on phones)
  function revealBuckets() {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    bucketsRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
  }

  const remaining = step.items.filter((it) => !placed[it.id]);

  function drop(bucketId: string) {
    if (!selected) {
      setMessage("แตะการ์ดก่อน แล้วจึงแตะช่องที่ต้องการวาง");
      return;
    }
    const item = step.items.find((i) => i.id === selected)!;
    const bucket = step.buckets.find((b) => b.id === bucketId)!;
    if (item.bucketId === bucketId) {
      const next = { ...placed, [item.id]: bucketId };
      setPlaced(next);
      setSelected(null);
      const left = step.items.length - Object.keys(next).length;
      setMessage(
        left === 0 ? "ครบทุกข้อแล้ว เก่งมาก" : `ถูกต้อง “${item.text}” อยู่ในช่อง “${bucket.label}”`,
      );
      if (left === 0) onDone?.();
    } else {
      setMessage(`ยังไม่ใช่ช่อง “${bucket.label}” ลองช่องอื่นดู`);
    }
  }

  return (
    <div className="sort">
      <p>{step.intro}</p>

      <div className="sort__cards" aria-label="การ์ดที่ยังไม่ได้จัด">
        {remaining.length === 0 && <p className="sort__empty">จัดครบแล้ว</p>}
        {remaining.map((it) => (
          <button
            key={it.id}
            type="button"
            className={`sort__card ${selected === it.id ? "is-selected" : ""}`}
            aria-pressed={selected === it.id}
            onClick={() => {
              const next = selected === it.id ? null : it.id;
              setSelected(next);
              setMessage("");
              if (next) revealBuckets();
            }}
          >
            {it.text}
          </button>
        ))}
      </div>

      <p className="sort__message" aria-live="polite">
        {message}
      </p>

      <div ref={bucketsRef} className={`sort__buckets ${step.buckets.length > 3 ? "sort__buckets--many" : ""}`}>
        {step.buckets.map((b) => (
          <button
            key={b.id}
            type="button"
            className="sort__bucket"
            onClick={() => drop(b.id)}
            aria-label={`วางในช่อง ${b.label}`}
          >
            <span className="sort__bucket-label">{b.label}</span>
            <span className="sort__bucket-items">
              {step.items
                .filter((it) => placed[it.id] === b.id)
                .map((it) => (
                  <span key={it.id} className="sort__placed">
                    {it.text}
                  </span>
                ))}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
