import { AbsoluteFill } from "remotion";
import { FONT_FAMILY } from "../fonts";
import { Icon, iconNames } from "./Icon";
import { theme } from "./theme";

/** Reference sheet of every icon key available to video scripts. */
export const IconSheet: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundColor: theme.paper,
      fontFamily: FONT_FAMILY,
      padding: 40,
      display: "grid",
      gridTemplateColumns: "repeat(11, 1fr)",
      alignContent: "start",
      gap: 18,
    }}
  >
    {iconNames.map((n) => (
      <div key={n} style={{ display: "grid", justifyItems: "center", gap: 4 }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: 8 }}>
          <Icon name={n} size={68} />
        </div>
        <span style={{ fontSize: 18, color: theme.inkSoft }}>{n}</span>
      </div>
    ))}
  </AbsoluteFill>
);
