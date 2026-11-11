import { Audio } from "@remotion/media";
import { AbsoluteFill, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT_FAMILY } from "../fonts";
import { theme } from "../lesson/theme";
import timing from "../generated/app-tutorial/timing.json";

/**
 * App-use tutorial (Lesson 0 video). Real screens of the app (fictional person) in a phone frame, a ring
 * around the thing to tap, and large Thai text that matches the narration. Software instruction only:
 * no handbook content. DRAFT until PMH product review.
 */
type Segment = { file: string; from: number; durationInFrames: number; caption: string; screen: string; focus: number[] | null };
type Scene = { id: string; title: string; from: number; durationInFrames: number; segments: Segment[] };
const scenes = timing.scenes as Scene[];

const SCREEN_W = 390; // css px of the captured screens (captured at 2x)
const PHONE_H = 640;
const PHONE_W = Math.round((PHONE_H * 390) / 844);
const scale = PHONE_W / SCREEN_W;

export const tutorialDuration = timing.durationInFrames;

function current(scene: Scene, f: number) {
  let seg = scene.segments[0];
  for (const s of scene.segments) if (f >= s.from - 6) seg = s;
  return seg;
}

function SceneView({ scene, index }: { scene: Scene; index: number }) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seg = current(scene, f);
  const segStart = seg.from - 6;
  const enter = spring({ frame: f, fps, config: { damping: 200 } });
  const screenIn = interpolate(f - segStart, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const textIn = interpolate(f - segStart, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ring = interpolate((f - seg.from) % 40, [0, 20, 40], [1, 1.04, 1]);
  const ringIn = interpolate(f - seg.from, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const prev = scene.segments[scene.segments.indexOf(seg) - 1];

  return (
    <AbsoluteFill style={{ background: theme.paper, fontFamily: FONT_FAMILY, color: theme.ink }}>
      {scene.segments.map((s, i) => (
        <Audio key={i} src={staticFile(s.file)} from={s.from} durationInFrames={s.durationInFrames} />
      ))}
      {/* phone */}
      <div
        style={{
          position: "absolute",
          left: 120,
          top: 40,
          width: PHONE_W + 24,
          height: PHONE_H + 24,
          borderRadius: 44,
          background: "#2b1424",
          padding: 12,
          boxShadow: "0 18px 48px rgba(52,24,43,0.25)",
          transform: `translateY(${(1 - enter) * 30}px)`,
          opacity: enter,
        }}
      >
        <div style={{ position: "relative", width: PHONE_W, height: PHONE_H, borderRadius: 32, overflow: "hidden", background: "#fff" }}>
          {prev && prev.screen !== seg.screen && (
            <Img src={staticFile(`app-tutorial/${prev.screen}.png`)} style={{ position: "absolute", width: PHONE_W, height: PHONE_H }} />
          )}
          <Img
            src={staticFile(`app-tutorial/${seg.screen}.png`)}
            style={{ position: "absolute", width: PHONE_W, height: PHONE_H, opacity: prev && prev.screen !== seg.screen ? screenIn : 1 }}
          />
          {seg.focus && (
            <div
              style={{
                position: "absolute",
                left: seg.focus[0] * scale - 6,
                top: seg.focus[1] * scale - 6,
                width: seg.focus[2] * scale + 12,
                height: seg.focus[3] * scale + 12,
                border: `5px solid ${theme.magenta}`,
                borderRadius: 16,
                boxShadow: "0 0 0 9999px rgba(52,24,43,0.28)",
                opacity: ringIn,
                transform: `scale(${ring})`,
              }}
            />
          )}
        </div>
      </div>
      {/* words */}
      <div style={{ position: "absolute", left: 540, right: 70, top: 92 }}>
        <div style={{ fontSize: 26, fontWeight: 600, color: theme.inkSoft, opacity: enter }}>
          ขั้นที่ {index + 1} จาก {scenes.length}
        </div>
        <div style={{ fontSize: 58, fontWeight: 700, color: theme.magentaDeep, lineHeight: 1.25, marginTop: 6, opacity: enter }}>
          {scene.title}
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 40,
            fontWeight: 600,
            lineHeight: 1.55,
            opacity: textIn,
            transform: `translateY(${(1 - textIn) * 12}px)`,
          }}
        >
          {seg.caption}
        </div>
      </div>
      <div style={{ position: "absolute", left: 540, bottom: 34, fontSize: 20, color: theme.inkSoft }}>
        ภาพจากแอปจริง ใช้ชื่อ เบอร์ อีเมล และรหัสสมมุติ
      </div>
      <div
        style={{
          position: "absolute",
          right: 30,
          top: 24,
          fontSize: 18,
          fontWeight: 700,
          color: theme.draft,
          background: theme.draftWash,
          padding: "6px 14px",
          borderRadius: 999,
        }}
      >
        ฉบับร่าง รอโรงพยาบาลตรวจทาน
      </div>
    </AbsoluteFill>
  );
}

export const AppTutorial: React.FC = () => (
  <AbsoluteFill style={{ background: theme.paper }}>
    {scenes.map((s, i) => (
      <Sequence key={s.id} name={s.id} from={s.from} durationInFrames={s.durationInFrames}>
        <SceneView scene={s} index={i} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
