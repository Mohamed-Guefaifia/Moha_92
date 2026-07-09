import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme } from "../theme";
import type { Chapter } from "../content";

/**
 * Carte de chapitre : bandeau animé qui apparaît en haut de l'écran
 * pour structurer visuellement la vidéo.
 */
export const ChapterCard: React.FC<{ chapter: Chapter }> = ({ chapter }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 15 } });
  const exit = interpolate(
    frame,
    [durationInFrames - Math.round(fps * 0.35), durationInFrames - 1],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ alignItems: "center", pointerEvents: "none" }}>
      <div
        style={{
          marginTop: "8%",
          maxWidth: "80%",
          padding: "26px 48px",
          borderRadius: 24,
          background: theme.colors.captionBackground,
          border: `2px solid ${theme.colors.accentSoft}`,
          backdropFilter: "blur(12px)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
          opacity: enter * exit,
          transform: `translateY(${interpolate(enter, [0, 1], [-80, 0])}px)`,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: theme.fonts.heading,
            fontWeight: 800,
            fontSize: Math.round(width * 0.032),
            color: theme.colors.text,
            lineHeight: 1.2,
          }}
        >
          {chapter.title}
        </div>
        {chapter.subtitle ? (
          <div
            style={{
              fontFamily: theme.fonts.body,
              fontWeight: 500,
              fontSize: Math.round(width * 0.017),
              color: theme.colors.textMuted,
              marginTop: 10,
            }}
          >
            {chapter.subtitle}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
