import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONT_FAMILY } from "../fonts";
import { Icon } from "./Icon";
import { theme } from "./theme";
import { videos } from "./registry";
import { activeReveal, printedLabel, revealFrame } from "./types";
import type { ScriptScene, TimingScene, VideoScript } from "./types";

export type LessonVideoProps = { videoId: string; burnCaptions: boolean };

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);

export const LessonVideo: React.FC<LessonVideoProps> = ({ videoId, burnCaptions }) => {
  const entry = videos.find((v) => v.script.id === videoId);
  if (!entry) throw new Error(`Unknown video ${videoId}`);
  const { script, timing } = entry;

  return (
    <AbsoluteFill style={{ backgroundColor: theme.paper, fontFamily: FONT_FAMILY, color: theme.ink }}>
      {timing.scenes.map((t) => {
        const scene = script.scenes.find((s) => s.id === t.id)!;
        return (
          <Sequence key={t.id} name={t.id} from={t.from} durationInFrames={t.durationInFrames}>
            <SceneFade duration={t.durationInFrames}>
              <SceneBody scene={scene} timing={t} script={script} />
            </SceneFade>
            {t.segments.map((s, i) => (
              <Audio key={i} src={staticFile(s.file)} from={s.from} durationInFrames={s.durationInFrames} />
            ))}
            {burnCaptions && <Captions timing={t} />}
          </Sequence>
        );
      })}
      <Chrome script={script} />
    </AbsoluteFill>
  );
};

const SceneFade: React.FC<{ duration: number; children: React.ReactNode }> = ({ duration, children }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: interpolate(f, [0, 10, duration - 10, duration], [0, 1, 1, 0], clamp) }}>
      {children}
    </AbsoluteFill>
  );
};

const SceneBody: React.FC<{ scene: ScriptScene; timing: TimingScene; script: VideoScript }> = ({ scene, timing, script }) => {
  switch (scene.kind) {
    case "title":
      return <TitleScene heading={scene.heading} sub={scene.subheading} chips={scene.chips ?? []} timing={timing} />;
    case "stage":
      return <StageScene scene={scene} timing={timing} total={script.scenes.filter((s) => s.kind === "stage").length} />;
    case "summary":
      return <SummaryScene scene={scene} timing={timing} />;
  }
};

/** Persistent frame: source line and draft status (never hidden on drafts). */
const Chrome: React.FC<{ script: VideoScript }> = ({ script }) => (
  <>
    <div
      style={{
        position: "absolute",
        left: 48,
        top: 28,
        fontSize: 20,
        color: theme.inkSoft,
        fontWeight: 600,
      }}
    >
      สมุดบันทึกสุขภาพแม่และเด็ก ฉบับปรับปรุงใหม่ พ.ศ. 2568 ({pageText(script.handbookRef.pdfPages)})
    </div>
    {script.editorial.status !== "APPROVED" && script.editorial.status !== "PUBLISHED" && (
      <div
        style={{
          position: "absolute",
          right: 40,
          top: 22,
          fontSize: 20,
          fontWeight: 700,
          color: theme.draft,
          background: theme.draftWash,
          padding: "4px 14px",
          borderRadius: 8,
        }}
      >
        ฉบับร่าง ยังไม่ผ่านการตรวจทาน
      </div>
    )}
  </>
);

const Captions: React.FC<{ timing: TimingScene }> = ({ timing }) => {
  const f = useCurrentFrame();
  const seg = timing.segments.find((s) => f >= s.from && f < s.from + s.durationInFrames);
  if (!seg) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 34, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          maxWidth: 1100,
          background: "rgba(52,24,43,0.88)",
          color: "#fff",
          fontSize: 32,
          lineHeight: 1.45,
          padding: "8px 22px",
          borderRadius: 10,
          textAlign: "center",
        }}
      >
        {seg.caption}
      </div>
    </div>
  );
};

/* ---------------- scenes ---------------- */

function pageText(pdfPages: number[]) {
  const labels = pdfPages.map(printedLabel);
  if (labels.length <= 3) return labels.join(", ");
  return `${labels[0]}–${labels[labels.length - 1].replace("หน้า ", "")}`;
}

const TitleScene: React.FC<{ heading: string; sub: string; chips: string[]; timing: TimingScene }> = ({
  heading,
  sub,
  chips,
  timing,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  // chips appear with the second narration line; with only one line, shortly after the heading
  const stagesAt = timing.segments[1]?.from ?? 40;
  const pop = spring({ frame: f - 4, fps, config: { damping: 200 } });
  return (
    <AbsoluteFill style={{ padding: "110px 96px 120px", flexDirection: "row", alignItems: "center", gap: 64 }}>
      <Handbook scale={pop} />
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: heading.length > 26 ? 64 : heading.length > 16 ? 76 : 92,
            fontWeight: 700,
            lineHeight: 1.2,
            color: theme.magentaDeep,
            opacity: interpolate(f, [6, 26], [0, 1], clamp),
            translate: interpolate(f, [6, 26], ["0px 30px", "0px 0px"], { ...clamp, easing: ease }),
          }}
        >
          {heading}
        </div>
        <div style={{ fontSize: 27, marginTop: 18, color: theme.inkSoft, whiteSpace: "nowrap", opacity: interpolate(f, [20, 40], [0, 1], clamp) }}>
          {sub}
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 40, flexWrap: "wrap" }}>
          {chips.map((l, i) => (
            <div
              key={l}
              style={{
                fontSize: 28,
                fontWeight: 600,
                padding: "8px 20px",
                borderRadius: 999,
                background: theme.stageColors[i % theme.stageColors.length],
                opacity: interpolate(f, [stagesAt + i * 12, stagesAt + i * 12 + 14], [0, 1], clamp),
                translate: interpolate(f, [stagesAt + i * 12, stagesAt + i * 12 + 14], ["0px 16px", "0px 0px"], { ...clamp, easing: ease }),
              }}
            >
              {chips.length > 1 ? `${i + 1}. ` : ""}
              {l}
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** The pink handbook, drawn in CSS (original artwork, evokes the real book's tab edge). */
const Handbook: React.FC<{ scale: number }> = ({ scale }) => {
  const tabs = ["#f6b8ac", "#f8cfdc", "#fdd5bd", "#fbf0c4", "#cfeadb", "#d9e8c8", "#bfe3ef", "#a9bfe3", "#d8c7e6"];
  return (
    <div style={{ position: "relative", width: 330, height: 400, scale: String(scale), flex: "none" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          right: 26,
          borderRadius: "10px 4px 4px 10px",
          background: `linear-gradient(160deg, #fbd0df, #f4a9c5)`,
          boxShadow: "0 30px 50px -30px rgba(52,24,43,0.6)",
        }}
      >
        <div style={{ position: "absolute", left: 28, top: 56, fontSize: 24, fontWeight: 700, color: theme.ink, whiteSpace: "nowrap" }}>
          สมุดบันทึกสุขภาพ
        </div>
        <div style={{ position: "absolute", left: 28, top: 86, fontSize: 46, fontWeight: 700, color: theme.magenta, whiteSpace: "nowrap" }}>
          แม่และเด็ก
        </div>
        <div style={{ position: "absolute", left: 30, bottom: 50, display: "flex", gap: 10, alignItems: "flex-end" }}>
          <div style={{ width: 54, height: 54, borderRadius: "50%", background: "#fff" }} />
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#fff", opacity: 0.8 }} />
        </div>
      </div>
      {tabs.map((c, i) => (
        <div
          key={c}
          style={{
            position: "absolute",
            right: 0,
            top: 14 + i * 41,
            width: 30,
            height: 38,
            background: c,
            borderRadius: "0 8px 8px 0",
          }}
        />
      ))}
    </div>
  );
};

const StageScene: React.FC<{ scene: Extract<ScriptScene, { kind: "stage" }>; timing: TimingScene; total: number }> = ({
  scene,
  timing,
  total,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const current = activeReveal(timing, f);
  const item = scene.items.find((it) => it.n === current);
  const color = theme.stageColors[scene.stage - 1];
  const introOut = revealFrame(timing, scene.items[0].n);

  // stage opener: big number + label, then it shrinks into a header pill
  const shrink = interpolate(f, [introOut - 8, introOut + 10], [0, 1], { ...clamp, easing: ease });

  return (
    <AbsoluteFill>
      {/* opener */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          opacity: 1 - shrink,
          scale: String(1 - shrink * 0.2),
        }}
      >
        <div
          style={{
            width: 170,
            height: 170,
            borderRadius: "50%",
            background: color,
            display: "grid",
            placeItems: "center",
            fontSize: 110,
            fontWeight: 700,
            scale: String(spring({ frame: f - 4, fps, config: { damping: 14, stiffness: 120 } })),
          }}
        >
          {scene.stage}
        </div>
        <div style={{ fontSize: 30, color: theme.inkSoft, marginTop: 24 }}>
          {scene.prefix ?? "ตอนที่"} {scene.stage} จาก {total}
        </div>
        <div style={{ fontSize: 84, fontWeight: 700, color: theme.magentaDeep, lineHeight: 1.2 }}>{scene.label}</div>
      </AbsoluteFill>

      {/* items */}
      <AbsoluteFill style={{ opacity: shrink, padding: "84px 72px 120px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              fontSize: 30,
              fontWeight: 700,
              padding: "6px 20px",
              borderRadius: 999,
              background: color,
            }}
          >
            {scene.prefix ?? "ตอนที่"} {scene.stage}: {scene.label}
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 56, marginTop: 10 }}>
          {item && (
            <CurrentItem
              key={item.n}
              n={scene.hideNumbers ? null : item.n}
              icon={item.icon}
              text={item.text}
              start={revealFrame(timing, item.n)}
            />
          )}
        </div>

        {/* progress chips through this stage */}
        <div style={{ display: "flex", gap: 12 }}>
          {scene.items.map((it) => {
            const shown = f >= revealFrame(timing, it.n);
            const isCur = it.n === current;
            return (
              <div
                key={it.n}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "6px 14px 6px 6px",
                  borderRadius: 999,
                  background: isCur ? theme.magenta : shown ? "#fff" : "transparent",
                  border: `2px solid ${shown ? theme.magenta : "#e6c9d5"}`,
                  color: isCur ? "#fff" : theme.ink,
                  opacity: shown ? 1 : 0.5,
                }}
              >
                <Icon name={it.icon} size={38} />
                {!scene.hideNumbers && <span style={{ fontSize: 24, fontWeight: 700 }}>ข้อ {it.n}</span>}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const CurrentItem: React.FC<{ n: number | null; icon: string; text: string; start: number }> = ({ n, icon, text, start }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - start, fps, config: { damping: 200 } });
  return (
    <>
      <div
        style={{
          width: 260,
          height: 260,
          borderRadius: 40,
          background: "#fff",
          display: "grid",
          placeItems: "center",
          boxShadow: "0 24px 40px -28px rgba(52,24,43,0.55)",
          flex: "none",
          scale: String(0.85 + 0.15 * s),
          opacity: s,
        }}
      >
        <Icon name={icon} size={190} />
      </div>
      <div style={{ flex: 1, opacity: s, translate: `${(1 - s) * 40}px 0px` }}>
        {n !== null && <div style={{ fontSize: 34, fontWeight: 700, color: theme.magenta }}>ข้อ {n}</div>}
        <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.3 }}>{text}</div>
      </div>
    </>
  );
};

const SummaryScene: React.FC<{ scene: Extract<ScriptScene, { kind: "summary" }>; timing: TimingScene }> = ({ scene, timing }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ padding: "100px 110px 130px", justifyContent: "center" }}>
      <div style={{ fontSize: 84, fontWeight: 700, color: theme.magentaDeep, marginBottom: 28 }}>{scene.heading}</div>
      {scene.points.map((p, i) => {
        const at = revealFrame(timing, i + 1);
        const s = spring({ frame: f - at, fps, config: { damping: 200 } });
        return (
          <div
            key={p}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 22,
              marginBottom: 22,
              opacity: s,
              translate: `0px ${(1 - s) * 24}px`,
            }}
          >
            <div
              style={{
                width: 70,
                height: 70,
                borderRadius: "50%",
                background: "#ddf3ea",
                display: "grid",
                placeItems: "center",
                flex: "none",
              }}
            >
              <Icon name="check" size={52} />
            </div>
            <div style={{ fontSize: 48, fontWeight: 600, lineHeight: 1.3 }}>{p}</div>
          </div>
        );
      })}
      <div
        style={{
          marginTop: 24,
          fontSize: 30,
          color: theme.inkSoft,
          opacity: interpolate(f, [timing.durationInFrames - 70, timing.durationInFrames - 50], [0, 1], clamp),
        }}
      >
        พกสมุดสีชมพูไปทุกครั้งที่พบเจ้าหน้าที่สาธารณสุข
      </div>
    </AbsoluteFill>
  );
};
