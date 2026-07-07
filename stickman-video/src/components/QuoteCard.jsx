import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {CAPTION_FONT, QUOTE_FONT} from '../fonts.js';

const Highlightable = ({segments, highlightColor}) =>
  segments.map((seg, i) =>
    seg.highlight ? (
      <mark
        key={i}
        style={{
          backgroundColor: highlightColor,
          color: 'inherit',
          padding: '0.05em 0.15em',
          borderRadius: '0.12em',
          boxDecorationBreak: 'clone',
          WebkitBoxDecorationBreak: 'clone',
        }}
      >
        {seg.text}
      </mark>
    ) : (
      <React.Fragment key={i}>{seg.text}</React.Fragment>
    )
  );

const Tape = ({style}) => (
  <div
    style={{
      position: 'absolute',
      width: '18%',
      height: '9%',
      backgroundColor: '#d9c49a',
      opacity: 0.85,
      boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
      ...style,
    }}
  />
);

// Full-screen text card. Two variants:
//  - "ornate": Quran verse style — ornamental framed title + Amiri text with
//    a warm yellow highlight, like the sample video's verse cards.
//  - "note": hadith / quote on a taped paper note with a teal highlight.
export const QuoteCard = ({
  variant = 'ornate',
  title,
  segments = [],
  portrait,
}) => {
  const frame = useCurrentFrame();
  const {fps, width} = useVideoConfig();

  const enter = spring({
    frame,
    fps,
    config: {damping: 200},
    durationInFrames: Math.round(fps * 0.5),
  });
  const opacity = interpolate(frame, [0, fps * 0.25], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const base = width / (portrait ? 22 : 36); // responsive type scale

  if (variant === 'note') {
    return (
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6%',
          opacity,
          transform: `scale(${0.96 + enter * 0.04})`,
        }}
      >
        <div
          style={{
            position: 'relative',
            backgroundColor: '#f6ecd8',
            borderRadius: 6,
            boxShadow: '0 10px 30px rgba(0,0,0,0.10)',
            padding: portrait ? '14% 8%' : '5% 6%',
            maxWidth: '92%',
            transform: 'rotate(-0.6deg)',
          }}
        >
          <Tape style={{top: '-4%', left: '-6%', transform: 'rotate(-35deg)'}} />
          <Tape style={{top: '-4%', right: '-6%', transform: 'rotate(35deg)'}} />
          <div
            dir="rtl"
            style={{
              // Amiri fallback covers glyphs Baloo lacks (e.g. the ﷺ ligature)
              fontFamily: `'${CAPTION_FONT}', '${QUOTE_FONT}'`,
              fontWeight: 800,
              fontSize: base * 1.5,
              lineHeight: 1.9,
              color: '#141414',
              textAlign: 'center',
            }}
          >
            {title ? <div style={{marginBottom: '0.2em'}}>{title}</div> : null}
            <Highlightable segments={segments} highlightColor="#8fdcda" />
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6%',
        opacity,
        transform: `scale(${0.96 + enter * 0.04})`,
      }}
    >
      {title ? (
        <div
          style={{
            border: '3px solid #b08d57',
            outline: '1px solid #b08d57',
            outlineOffset: 6,
            borderRadius: 10,
            padding: '0.35em 1.6em',
            marginBottom: '1.2em',
            fontFamily: QUOTE_FONT,
            fontWeight: 700,
            fontSize: base * 1.15,
            color: '#4a3b28',
            backgroundColor: 'rgba(255,255,255,0.5)',
          }}
          dir="rtl"
        >
          ❁ {title} ❁
        </div>
      ) : null}
      <div
        dir="rtl"
        style={{
          fontFamily: QUOTE_FONT,
          fontWeight: 700,
          fontSize: base * 1.7,
          lineHeight: 2.1,
          color: '#1c1c1c',
          textAlign: 'center',
          maxWidth: '90%',
        }}
      >
        <Highlightable segments={segments} highlightColor="#f7d372" />
      </div>
    </AbsoluteFill>
  );
};
