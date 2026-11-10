import { useState } from "react";
import type { Step } from "../content/schema";

type TimelineStep = Extract<Step, { type: "timeline" }>;

/**
 * A stage-by-stage journey. Learners pick a stage, then open each item.
 * The numbering mirrors the handbook's own numbered sequence.
 */
export function Timeline({ step, onAllSeen }: { step: TimelineStep; onAllSeen?: () => void }) {
  const [stageId, setStageId] = useState(step.stages[0].id);
  // keyed by stage + number: content may restart numbering in each stage
  const [open, setOpen] = useState<Set<string>>(new Set());
  const key = (stageKey: string, n: number) => `${stageKey}:${n}`;
  const stage = step.stages.find((s) => s.id === stageId)!;
  const total = step.stages.reduce((n, s) => n + s.items.length, 0);

  function toggle(k: string) {
    const next = new Set(open);
    if (next.has(k)) next.delete(k);
    else next.add(k);
    setOpen(next);
    if (next.size === total) onAllSeen?.();
  }

  return (
    <div className="timeline">
      <p>{step.intro}</p>
      <div className="timeline__stages" role="tablist" aria-label="ช่วงเวลา">
        {step.stages.map((s, i) => {
          const seen = s.items.filter((it) => open.has(key(s.id, it.n))).length;
          return (
            <button
              key={s.id}
              role="tab"
              type="button"
              aria-selected={s.id === stageId}
              aria-controls={`stage-${s.id}`}
              className="timeline__stage"
              onClick={() => setStageId(s.id)}
            >
              <span className="timeline__stage-index">{i + 1}</span>
              <span className="timeline__stage-label">{s.label}</span>
              <span className="timeline__stage-seen">
                เปิดแล้ว {seen}/{s.items.length}
              </span>
            </button>
          );
        })}
      </div>

      <ol className="timeline__items" id={`stage-${stage.id}`} role="tabpanel">
        {stage.items.map((it) => {
          const isOpen = open.has(key(stage.id, it.n));
          return (
            <li key={key(stage.id, it.n)} className={`timeline__item ${isOpen ? "is-open" : ""}`}>
              <button
                type="button"
                className="timeline__toggle"
                aria-expanded={isOpen}
                onClick={() => toggle(key(stage.id, it.n))}
              >
                <span className="timeline__n" aria-hidden="true">
                  {it.n}
                </span>
                <span className="timeline__title">{it.title}</span>
                <span className="timeline__chev" aria-hidden="true">
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              {isOpen && <p className="timeline__detail">{it.detail}</p>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
