import React from "react";
import { AbsoluteFill, Audio, Sequence, useVideoConfig } from "remotion";
import type { Caption } from "@remotion/captions";
import { Background } from "./components/Background";
import { Intro } from "./components/Intro";
import { ChapterCard } from "./components/ChapterCard";
import { Captions } from "./components/Captions";
import { theme } from "./theme";
import { videoContent } from "./content";

export type VideoProps = {
  /** Sous-titres au mot près (générés par `npm run captions`) */
  captions: Caption[];
  /** URL de la piste audio (la voix originale), ou null si absente */
  audioSrc: string | null;
};

const msToFrames = (ms: number, fps: number) => Math.round((ms / 1000) * fps);

/**
 * Composition principale : fond animé + intro + chapitres + voix originale
 * + sous-titres synchronisés mot à mot.
 */
export const MainVideo: React.FC<
  VideoProps & { orientation: "landscape" | "portrait" }
> = ({ captions, audioSrc, orientation }) => {
  const { fps, width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: theme.colors.backgroundTop }}>
      <Background />

      {audioSrc ? <Audio src={audioSrc} /> : null}

      <Sequence
        durationInFrames={msToFrames(videoContent.introDurationMs, fps)}
        name="Intro"
      >
        <Intro />
      </Sequence>

      {videoContent.chapters.map((chapter, i) => (
        <Sequence
          key={i}
          from={msToFrames(chapter.startMs, fps)}
          durationInFrames={msToFrames(chapter.durationMs, fps)}
          name={`Chapitre : ${chapter.title}`}
        >
          <ChapterCard chapter={chapter} />
        </Sequence>
      ))}

      <Captions captions={captions} orientation={orientation} />

      {theme.branding.watermark ? (
        <div
          style={{
            position: "absolute",
            top: Math.round(height * 0.04),
            right: Math.round(width * 0.035),
            fontFamily: theme.fonts.heading,
            fontWeight: 800,
            fontSize: Math.round(width * 0.016),
            letterSpacing: "0.25em",
            color: theme.colors.textMuted,
            opacity: 0.8,
          }}
        >
          {theme.branding.watermark}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
