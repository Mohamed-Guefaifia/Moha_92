import React from 'react';
import {AbsoluteFill} from 'remotion';

// Off-white paper with a subtle grain, matching the hand-drawn doodle style.
export const PaperBackground = () => {
  return (
    <AbsoluteFill style={{backgroundColor: '#f7f5f0'}}>
      <svg width="100%" height="100%" style={{display: 'block'}}>
        <filter id="paper-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect
          width="100%"
          height="100%"
          filter="url(#paper-grain)"
          opacity="0.14"
        />
      </svg>
    </AbsoluteFill>
  );
};
