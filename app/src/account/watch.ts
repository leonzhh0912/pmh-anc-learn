import { useEffect, type RefObject } from "react";
import { recordEvent, sessionState } from "./session";

/**
 * Records which parts of a video were actually PLAYED (signed-in learners only). Seeking ends the current
 * range, so jumping to the end never counts as watching it. Ranges are sent in small batches (on pause,
 * end, leaving the page, or every 30 s of playback), never every frame; the server merges overlaps and
 * marks a video watched at >= 90 % coverage. Playback does not prove attention.
 */
export function useWatchTracking(ref: RefObject<HTMLVideoElement | null>, videoId: string, lessonId: string | null) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let ranges: [number, number][] = [];
    let start: number | null = null;
    let last = 0;
    let sinceFlush = 0;

    const signedInLearner = () => sessionState().account.kind === "learner";
    const close = () => {
      if (start !== null && last - start >= 0.5) ranges.push([round(start), round(last)]);
      start = null;
    };
    const flush = () => {
      close();
      if (!ranges.length || !signedInLearner() || !Number.isFinite(el.duration) || el.duration <= 0) {
        ranges = [];
        return;
      }
      recordEvent({
        kind: "video_watch",
        lessonId,
        data: { videoId, duration: round(el.duration), ranges, position: round(el.currentTime) },
      });
      ranges = [];
      sinceFlush = 0;
    };
    const onTime = () => {
      if (el.paused || el.seeking) return;
      const t = el.currentTime;
      if (start === null) {
        start = t;
      } else if (t < last || t - last > 1.5) {
        // a jump, not playback: end the range here
        close();
        start = t;
      } else {
        sinceFlush += t - last;
      }
      last = t;
      if (sinceFlush >= 30) {
        flush();
        start = t;
      }
    };
    const onSeeking = () => close();
    const onPlay = () => {
      start = el.currentTime;
      last = el.currentTime;
    };
    const onHide = () => {
      if (document.visibilityState === "hidden") flush();
    };
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("seeking", onSeeking);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", flush);
    el.addEventListener("ended", flush);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      flush();
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("seeking", onSeeking);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", flush);
      el.removeEventListener("ended", flush);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [ref, videoId, lessonId]);
}

const round = (n: number) => Math.round(n * 10) / 10;
