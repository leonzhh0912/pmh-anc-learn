import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONT_FAMILY } from "./fonts";

// Minimal pipeline check: Thai text rendering + animation -> MP4.
export const SmokeTest: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      name="Scene"
      style={{
        backgroundColor: "#FBF6F1",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: FONT_FAMILY,
        color: "#2E2A33",
      }}
    >
      <Interactive.Div
        name="Title"
        style={{
          fontSize: 96,
          fontWeight: 700,
          opacity: interpolate(frame, [0, 1 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          translate: interpolate(frame, [0, 1 * fps], ["0px 40px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        ทดสอบระบบวิดีโอ
      </Interactive.Div>
      <Interactive.Div
        name="Subtitle"
        style={{
          fontSize: 48,
          marginTop: 24,
          opacity: interpolate(frame, [1 * fps, 2 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        PMH Smart ANC Learn — Remotion pipeline check
      </Interactive.Div>
    </AbsoluteFill>
  );
};
