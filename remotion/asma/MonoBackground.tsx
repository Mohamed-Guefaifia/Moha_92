import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

/**
 * Fond strictement noir et blanc : noir profond, deux halos gris très
 * doux qui dérivent lentement, et un léger vignettage.
 */
export const MonoBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const drift1 = interpolate(frame % 900, [0, 450, 900], [0, 60, 0]);
  const drift2 = interpolate(frame % 1100, [0, 550, 1100], [0, -70, 0]);

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <div
        style={{
          position: "absolute",
          top: `calc(12% + ${drift1}px)`,
          left: "8%",
          width: "45%",
          height: "45%",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 65%)",
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
            "radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 65%)",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.7) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
