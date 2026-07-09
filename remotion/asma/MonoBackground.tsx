import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

/**
 * Fond « papier » strictement noir et blanc, assorti au personnage
 * dessiné au trait : blanc, deux très légères ombres grises qui
 * dérivent lentement, et un vignettage discret.
 */
export const MonoBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const drift1 = interpolate(frame % 900, [0, 450, 900], [0, 60, 0]);
  const drift2 = interpolate(frame % 1100, [0, 550, 1100], [0, -70, 0]);

  return (
    <AbsoluteFill style={{ background: "#ffffff" }}>
      <div
        style={{
          position: "absolute",
          top: `calc(12% + ${drift1}px)`,
          left: "8%",
          width: "45%",
          height: "45%",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0,0,0,0.04) 0%, transparent 65%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: `calc(8% + ${drift2}px)`,
          right: "6%",
          width: "50%",
          height: "50%",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0,0,0,0.03) 0%, transparent 65%)",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.08) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
