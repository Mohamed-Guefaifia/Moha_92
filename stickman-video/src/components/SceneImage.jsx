import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

// One scene illustration. White backgrounds of AI-generated images melt into
// the paper texture thanks to mix-blend-mode: multiply.
// Animation: springy slide-in entrance (direction alternates per scene),
// slow Ken Burns zoom, a gentle sway, and a hand-drawn "boil" jitter that
// keeps the sketch alive.
export const SceneImage = ({src, durationInFrames, portrait, index = 0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const enter = spring({
    frame,
    fps,
    config: {damping: 14, stiffness: 120},
    durationInFrames: Math.round(fps * 0.7),
  });
  const opacity = interpolate(frame, [0, fps * 0.25], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const direction = index % 2 === 0 ? 1 : -1;
  const slide = (1 - enter) * 90 * direction;

  const drift = interpolate(frame, [0, durationInFrames], [1.0, 1.06]);
  const scale = (0.94 + enter * 0.06) * drift;

  // hand-drawn boil: tiny jitter refreshed ~7x per second
  const seed = Math.floor((frame / fps) * 7);
  const jx = (random(`bx-${index}-${seed}`) - 0.5) * 5;
  const jy = (random(`by-${index}-${seed}`) - 0.5) * 5;

  const sway = Math.sin((frame / fps) * 1.1 + index) * 0.7;

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        // Reserve room for the captions. Portrait mirrors the approved 16:9
        // look: artwork spans the full width in the upper half, captions
        // sit right below it.
        padding: portrait ? '16% 2% 46% 2%' : '4% 6% 20% 6%',
      }}
    >
      <Img
        src={staticFile(src)}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
          mixBlendMode: 'multiply',
          opacity,
          transform: `translate(${slide + jx}px, ${jy}px) rotate(${sway}deg) scale(${scale})`,
        }}
      />
    </AbsoluteFill>
  );
};
