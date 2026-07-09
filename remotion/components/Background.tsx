import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { theme } from "../theme";

/**
 * Arrière-plan animé : dégradé profond + blobs lumineux en mouvement lent
 * + fine grille en surimpression. 100% généré par code, aucune image externe.
 */
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;

  const blob = (
    seed: number,
    color: string,
    size: number,
  ): React.CSSProperties => {
    const x =
      width * (0.5 + 0.38 * Math.sin(t * 0.18 + seed * 2.1)) - size / 2;
    const y =
      height * (0.5 + 0.34 * Math.cos(t * 0.14 + seed * 1.7)) - size / 2;
    return {
      position: "absolute",
      left: x,
      top: y,
      width: size,
      height: size,
      borderRadius: "50%",
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      opacity: 0.5,
      filter: "blur(40px)",
    };
  };

  const gridOpacity = interpolate(t, [0, 2], [0, 0.14], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${theme.colors.backgroundTop} 0%, ${theme.colors.backgroundBottom} 100%)`,
        }}
      />
      <div style={blob(1, theme.colors.glowPrimary, Math.min(width, height) * 0.9)} />
      <div style={blob(2, theme.colors.glowSecondary, Math.min(width, height) * 0.7)} />
      <div style={blob(3, theme.colors.glowTertiary, Math.min(width, height) * 0.5)} />
      <AbsoluteFill
        style={{
          opacity: gridOpacity,
          backgroundImage: `linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)`,
          backgroundSize: "72px 72px",
        }}
      />
      {/* Vignette pour la lisibilité des sous-titres */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.45) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
