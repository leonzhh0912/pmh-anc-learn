import { Composition, Folder } from "remotion";
import { SmokeTest } from "./SmokeTest";
import { LessonVideo } from "./lesson/LessonVideo";
import { videos } from "./lesson/registry";
import "./fonts";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Lessons">
        {videos.map(({ script, timing }) => (
          <Composition
            key={script.id}
            id={script.id}
            component={LessonVideo}
            width={1280}
            height={720}
            fps={timing.fps}
            durationInFrames={timing.durationInFrames}
            defaultProps={{ videoId: script.id, burnCaptions: false }}
          />
        ))}
        {videos.map(({ script, timing }) => (
          <Composition
            key={`${script.id}-captioned`}
            id={`${script.id}-captioned`}
            component={LessonVideo}
            width={1280}
            height={720}
            fps={timing.fps}
            durationInFrames={timing.durationInFrames}
            defaultProps={{ videoId: script.id, burnCaptions: true }}
          />
        ))}
      </Folder>
      <Folder name="Pipeline">
        <Composition id="SmokeTest" component={SmokeTest} durationInFrames={90} fps={30} width={1280} height={720} />
      </Folder>
    </>
  );
};
