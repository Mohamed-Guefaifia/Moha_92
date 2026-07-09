import React, { useMemo } from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { Caption } from "@remotion/captions";
import { createTikTokStyleCaptions } from "@remotion/captions";
import { theme } from "../theme";

/**
 * Sous-titres « karaoké » : les phrases s'affichent par groupes courts,
 * et chaque mot s'illumine exactement au moment où il est prononcé
 * (les timestamps proviennent de la transcription Whisper de l'audio,
 * donc la synchronisation avec la voix est au mot près).
 */
export const Captions: React.FC<{
  captions: Caption[];
  orientation: "landscape" | "portrait";
}> = ({ captions, orientation }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentMs = (frame / fps) * 1000;

  const { pages } = useMemo(
    () =>
      createTikTokStyleCaptions({
        captions,
        combineTokensWithinMilliseconds:
          theme.captions.combineTokensWithinMilliseconds,
      }),
    [captions],
  );

  const page = pages.find(
    (p, i) => {
      const nextStart = pages[i + 1]?.startMs ?? Infinity;
      return currentMs >= p.startMs && currentMs < nextStart;
    },
  );

  if (!page) {
    return null;
  }

  const isPortrait = orientation === "portrait";
  const fontSize = isPortrait
    ? theme.captions.fontSizePortrait
    : theme.captions.fontSizeLandscape;
  const bottomOffset = isPortrait
    ? theme.captions.bottomOffsetPortrait
    : theme.captions.bottomOffsetLandscape;

  // Apparition douce de la page de sous-titres
  const pageStartFrame = (page.startMs / 1000) * fps;
  const pageEnter = spring({
    frame: frame - pageStartFrame,
    fps,
    config: { damping: 200 },
    durationInFrames: Math.round(fps * 0.15),
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: bottomOffset,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          maxWidth: "88%",
          padding: "22px 40px",
          borderRadius: 20,
          background: theme.colors.captionBackground,
          backdropFilter: "blur(10px)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
          textAlign: "center",
          opacity: pageEnter,
          transform: `translateY(${interpolate(pageEnter, [0, 1], [24, 0])}px)`,
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: theme.fonts.captions,
            fontWeight: 800,
            fontSize,
            lineHeight: 1.35,
            color: theme.colors.captionText,
            textShadow: "0 3px 12px rgba(0,0,0,0.6)",
          }}
        >
          {page.tokens.map((token, i) => {
            const isActive =
              currentMs >= token.fromMs && currentMs < token.toMs;
            const wasSpoken = currentMs >= token.toMs;
            return (
              <span
                key={`${token.fromMs}-${i}`}
                style={{
                  display: "inline-block",
                  whiteSpace: "pre",
                  color: isActive
                    ? theme.colors.captionActiveWord
                    : theme.colors.captionText,
                  opacity: wasSpoken || isActive ? 1 : 0.55,
                  transform: isActive ? "scale(1.08)" : "scale(1)",
                }}
              >
                {token.text}
              </span>
            );
          })}
        </p>
      </div>
    </AbsoluteFill>
  );
};
