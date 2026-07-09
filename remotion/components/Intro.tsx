import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme } from "../theme";
import { videoContent } from "../content";

/**
 * Écran-titre animé affiché au début de la vidéo.
 */
export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 14, mass: 0.8 } });
  const subtitleEnter = spring({
    frame: frame - Math.round(fps * 0.35),
    fps,
    config: { damping: 16 },
  });
  const exit = interpolate(
    frame,
    [durationInFrames - Math.round(fps * 0.4), durationInFrames - 1],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const lineWidth = interpolate(enter, [0, 1], [0, width * 0.18]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: exit,
        padding: "0 8%",
      }}
    >
      <div
        style={{
          height: 6,
          width: lineWidth,
          borderRadius: 3,
          background: `linear-gradient(90deg, ${theme.colors.glowPrimary}, ${theme.colors.glowSecondary})`,
          marginBottom: 36,
        }}
      />
      <h1
        style={{
          fontFamily: theme.fonts.heading,
          fontWeight: 800,
          fontSize: Math.round(width * 0.055),
          color: theme.colors.text,
          textAlign: "center",
          margin: 0,
          lineHeight: 1.15,
          transform: `translateY(${interpolate(enter, [0, 1], [60, 0])}px)`,
          opacity: enter,
          textShadow: "0 8px 40px rgba(0,0,0,0.45)",
        }}
      >
        {videoContent.title}
      </h1>
      {videoContent.subtitle ? (
        <p
          style={{
            fontFamily: theme.fonts.body,
            fontWeight: 500,
            fontSize: Math.round(width * 0.022),
            color: theme.colors.textMuted,
            textAlign: "center",
            marginTop: 28,
            transform: `translateY(${interpolate(subtitleEnter, [0, 1], [40, 0])}px)`,
            opacity: subtitleEnter,
          }}
        >
          {videoContent.subtitle}
        </p>
      ) : null}
    </AbsoluteFill>
  );
};
