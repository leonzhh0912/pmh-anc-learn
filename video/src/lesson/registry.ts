/**
 * Every lesson video is registered here: its script (content/video-scripts)
 * and its generated timing (npm run narrate -- <id>).
 * To add a video: write the script JSON, run narrate, add two imports + entry.
 */
import overviewScript from "../../../content/video-scripts/V-OVR-001.json";
import overviewTiming from "../generated/V-OVR-001.timing.json";
import type { Timing, VideoScript } from "./types";

export const videos: { script: VideoScript; timing: Timing }[] = [
  { script: overviewScript as VideoScript, timing: overviewTiming as Timing },
];
