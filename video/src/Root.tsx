import { Composition, Folder } from "remotion";
import { SmokeTest } from "./SmokeTest";
import { LessonVideo } from "./lesson/LessonVideo";
import { videos } from "./lesson/registry";
import { IconSheet } from "./lesson/IconSheet";
import { AppTutorial, tutorialDuration } from "./tutorial/AppTutorial";
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
      <Folder name="AppTutorial">
        {/* how to use the app: software instruction, kept apart from the handbook lesson videos */}
        <Composition id="APP-TUTORIAL" component={AppTutorial} durationInFrames={tutorialDuration} fps={30} width={1280} height={720} />
      </Folder>
      <Folder name="Pipeline">
        <Composition id="IconSheet" component={IconSheet} durationInFrames={1} fps={30} width={1280} height={720} />
        <Composition id="SmokeTest" component={SmokeTest} durationInFrames={90} fps={30} width={1280} height={720} />
      </Folder>
    </>
  );
};
