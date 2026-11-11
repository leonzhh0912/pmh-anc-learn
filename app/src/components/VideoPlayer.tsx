import { useRef } from "react";
import { videoById, isApproved } from "../content/load";
import { useWatchTracking } from "../account/watch";

/**
 * Native <video> with Thai WebVTT captions on by default. The native player
 * gives accessible controls, speed control and fullscreen on every phone
 * without extra JavaScript. preload="none" protects low-bandwidth users:
 * nothing downloads until they press play.
 */
export function VideoPlayer({ videoId, lessonId }: { videoId: string; lessonId?: string }) {
  const v = videoById(videoId);
  const ref = useRef<HTMLVideoElement>(null);
  useWatchTracking(ref, videoId, lessonId ?? null);
  if (!v) {
    return <p className="notice">ยังไม่มีวิดีโอสำหรับบทเรียนนี้</p>;
  }
  const base = import.meta.env.BASE_URL;
  const mins = Math.floor(v.durationSec / 60);
  const secs = Math.round(v.durationSec % 60);
  return (
    <figure className="video">
      <video
        ref={ref}
        controls
        preload="none"
        playsInline
        poster={v.poster ? base + v.poster : undefined}
        aria-describedby={`vid-${v.id}-meta`}
      >
        <source src={base + v.mp4} type="video/mp4" />
        <track
          kind="captions"
          srcLang="th"
          label="ไทย"
          src={base + v.captionsVtt}
          default
        />
        เบราว์เซอร์นี้เล่นวิดีโอไม่ได้
      </video>
      <figcaption id={`vid-${v.id}-meta`} className="video__meta">
        <span>{v.title}</span>
        <span>
          ความยาว {mins > 0 ? `${mins} นาที ` : ""}
          {secs} วินาที มีคำบรรยายภาษาไทย (กดปุ่ม CC เพื่อเปิดหรือปิด)
        </span>
        {v.narration === "draft-tts" && (
          <span className="video__draft">
            เสียงบรรยายเป็นเสียงสังเคราะห์ฉบับร่าง ยังไม่ผ่านการตรวจการออกเสียง
          </span>
        )}
        {(v.narration === "cloud-tts" || v.narration === "mixed") && <span>เสียงบรรยายสังเคราะห์ด้วย AI</span>}
        {!isApproved(v.editorial.status) && (
          <span className="video__draft">วิดีโอฉบับร่าง ยังไม่ผ่านการตรวจทานทางการแพทย์</span>
        )}
      </figcaption>
    </figure>
  );
}
