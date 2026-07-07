import React, {useMemo} from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {CAPTION_FONT, QUOTE_FONT} from '../fonts.js';

const PAGE_GAP_SECONDS = 0.55; // silence longer than this starts a new page
const PAGE_HANG_SECONDS = 0.6; // keep the page on screen a bit after the last word

// Split the word list into caption "pages". A page ends on a long pause or
// when it reaches maxWords, so lines stay short and readable like the sample.
const paginate = (words, maxWords) => {
  const pages = [];
  let current = [];
  for (const word of words) {
    const prev = current[current.length - 1];
    if (
      current.length >= maxWords ||
      (prev && word.start - prev.end > PAGE_GAP_SECONDS)
    ) {
      pages.push(current);
      current = [];
    }
    current.push(word);
  }
  if (current.length > 0) pages.push(current);
  return pages;
};

// Word-by-word captions: each word pops in exactly when it is spoken.
// The word being spoken appears in light grey and darkens to full black,
// reproducing the write-on feel of the reference video.
export const WordCaptions = ({words, portrait}) => {
  const frame = useCurrentFrame();
  const {fps, width} = useVideoConfig();
  const t = frame / fps;

  const maxWords = 5; // same paging in both formats (approved template)
  const pages = useMemo(() => paginate(words, maxWords), [words, maxWords]);

  const page = pages.find((p, i) => {
    const start = p[0].start;
    const next = pages[i + 1];
    const end = Math.min(
      next ? next[0].start : Infinity,
      p[p.length - 1].end + PAGE_HANG_SECONDS
    );
    return t >= start && t < end;
  });

  if (!page) return null;

  const fontSize = portrait ? width * 0.064 : width * 0.052;

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        // Portrait: captions directly below the artwork (like the approved
        // 16:9 look); landscape: near the bottom edge.
        justifyContent: portrait ? 'flex-start' : 'flex-end',
        paddingTop: portrait ? '102%' : 0,
        paddingBottom: portrait ? 0 : '5.5%',
        paddingLeft: '5%',
        paddingRight: '5%',
      }}
    >
      <div
        dir="rtl"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          columnGap: '0.35em',
          rowGap: '0.05em',
          fontFamily: `'${CAPTION_FONT}', '${QUOTE_FONT}'`,
          fontWeight: 800,
          fontSize,
          lineHeight: 1.55,
          textAlign: 'center',
        }}
      >
        {page.map((word, i) => {
          if (t < word.start) return null;
          const progress = interpolate(
            t,
            [word.start, word.start + 0.25],
            [0, 1],
            {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
          );
          const grey = Math.round(interpolate(progress, [0, 1], [176, 17]));
          const rise = interpolate(progress, [0, 1], [0.12, 0]);
          return (
            <span
              key={`${i}-${word.start}`}
              style={{
                color: `rgb(${grey}, ${grey}, ${grey})`,
                transform: `translateY(${rise}em)`,
                textShadow: '0 2px 3px rgba(0,0,0,0.06)',
              }}
            >
              {word.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
