import { useState } from "react";
import type { Question } from "../content/schema";
import { recordAnswer } from "../lib/progress";
import { PageChip } from "./PageChip";

type Props = {
  lessonId: string;
  questions: Question[];
  onDone: () => void;
};

/**
 * One question at a time with immediate feedback.
 * - Correct: confirm, explain, link to the handbook page.
 * - Not yet: feedback for the chosen option only; the learner can try again
 *   or ask to see the answer. Unlimited retries, no score, no penalty.
 * Only the first attempt is noted locally (to suggest review later).
 */
export function Quiz({ lessonId, questions, onDone }: Props) {
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const q = questions[index];
  const isLast = index === questions.length - 1;
  const correct = chosen === q.correctOptionId;
  const chosenOption = q.options.find((o) => o.id === chosen);
  const locked = revealed || (chosen !== null && !correct);

  function choose(optionId: string) {
    if (locked || correct) return;
    setChosen(optionId);
    recordAnswer(lessonId, q.id, optionId === q.correctOptionId);
    if (optionId === q.correctOptionId) setRevealed(true);
  }

  function retry() {
    setChosen(null);
  }

  function next() {
    if (isLast) {
      onDone();
      return;
    }
    setIndex(index + 1);
    setChosen(null);
    setRevealed(false);
  }

  return (
    <div className="quiz">
      <p className="quiz__count">
        ข้อ {index + 1} จาก {questions.length}
      </p>
      {q.scenario && <p className="quiz__scenario">{q.scenario}</p>}
      <h3 className="quiz__prompt" id={`q-${q.id}`}>
        {q.prompt}
      </h3>

      <div className="quiz__options" role="group" aria-labelledby={`q-${q.id}`}>
        {q.options.map((o) => {
          let state = "";
          if (revealed && o.id === q.correctOptionId) state = "is-correct";
          else if (o.id === chosen && !correct) state = "is-wrong";
          else if (revealed || locked) state = "is-dim";
          return (
            <button
              key={o.id}
              type="button"
              className={`option ${state}`}
              onClick={() => choose(o.id)}
              aria-pressed={o.id === chosen}
              aria-disabled={locked || revealed}
            >
              <span className="option__text">{o.text}</span>
              {revealed && o.id === q.correctOptionId && (
                <span className="option__mark" aria-label="คำตอบที่ถูก">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div aria-live="polite">
        {chosenOption && !revealed && (
          <div className="feedback feedback--gentle">
            <p className="feedback__title">ยังไม่ใช่</p>
            <p>{chosenOption.feedback}</p>
          </div>
        )}
        {revealed && (
          <div className="feedback feedback--correct">
            <p className="feedback__title">{correct ? "ถูกต้อง" : "คำตอบคือ"}</p>
            {correct && chosenOption ? <p>{chosenOption.feedback}</p> : null}
            <p className="feedback__why">{q.explanation}</p>
            <PageChip pdfPages={q.source.pdfPages} printedPages={q.source.printedPages} />
          </div>
        )}
      </div>

      {chosen !== null && !revealed && (
        <div className="quiz__actions">
          <button type="button" className="btn btn--quiet" onClick={() => setRevealed(true)}>
            ดูเฉลย
          </button>
          <button type="button" className="btn btn--primary" onClick={retry}>
            ลองตอบอีกครั้ง
          </button>
        </div>
      )}
      {revealed && (
        <div className="quiz__actions">
          <button type="button" className="btn btn--primary" onClick={next}>
            {isLast ? "จบแบบทดสอบ" : "ข้อต่อไป"}
          </button>
        </div>
      )}
    </div>
  );
}
