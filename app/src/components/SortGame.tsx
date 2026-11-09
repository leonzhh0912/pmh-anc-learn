import { useState } from "react";
import type { Step } from "../content/schema";

type SortStep = Extract<Step, { type: "sort" }>;

/**
 * Tap a card, then tap the stage it belongs to. No dragging, so it works with
 * one thumb, a screen reader, or a keyboard. Wrong placements bounce back with
 * a hint; nothing is scored.
 */
export function SortGame({ step, onDone }: { step: SortStep; onDone?: () => void }) {
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const remaining = step.items.filter((it) => !placed[it.id]);

  function drop(bucketId: string) {
    if (!selected) {
      setMessage("แตะการ์ดข้อความก่อน แล้วจึงแตะช่วงเวลา");
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
        left === 0 ? "ครบทุกข้อแล้ว เก่งมาก" : `ถูกต้อง “${item.text}” อยู่ในช่วง${bucket.label}`,
      );
      if (left === 0) onDone?.();
    } else {
      setMessage(`ยังไม่ใช่ช่วง${bucket.label} ลองช่วงอื่นดู`);
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
              setSelected(selected === it.id ? null : it.id);
              setMessage("");
            }}
          >
            {it.text}
          </button>
        ))}
      </div>

      <p className="sort__message" aria-live="polite">
        {message}
      </p>

      <div className="sort__buckets">
        {step.buckets.map((b) => (
          <button
            key={b.id}
            type="button"
            className="sort__bucket"
            onClick={() => drop(b.id)}
            aria-label={`วางในช่วง ${b.label}`}
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
