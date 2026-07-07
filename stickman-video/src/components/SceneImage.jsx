import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

// One scene illustration. White backgrounds of AI-generated images melt into
// the paper texture thanks to mix-blend-mode: multiply. Subtle fade-in and a
// slow Ken Burns zoom keep the shot alive without distracting from the story.
export const SceneImage = ({src, durationInFrames, portrait}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const enter = spring({
    frame,
    fps,
    config: {damping: 200},
    durationInFrames: Math.round(fps * 0.4),
  });
  const opacity = interpolate(frame, [0, fps * 0.3], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const drift = interpolate(frame, [0, durationInFrames], [1.0, 1.035]);
  const scale = (0.97 + enter * 0.03) * drift;

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        // Reserve room for the captions at the bottom.
        padding: portrait ? '8% 4% 30% 4%' : '4% 6% 20% 6%',
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
          transform: `scale(${scale})`,
        }}
      />
    </AbsoluteFill>
  );
};
