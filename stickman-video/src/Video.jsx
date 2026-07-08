import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useVideoConfig,
} from 'remotion';
import {PaperBackground} from './components/PaperBackground.jsx';
import {SceneImage} from './components/SceneImage.jsx';
import {QuoteCard} from './components/QuoteCard.jsx';
import {WordCaptions} from './components/WordCaptions.jsx';

// Assembles the whole video from data props:
//   data.audio  — narration file inside public/ (optional)
//   data.scenes — [{type: "image"|"quote", start, end, ...}] times in seconds
//   words       — [{text, start, end}] word-level timestamps in seconds
export const StickmanVideo = ({data, words}) => {
  const {fps, width, height} = useVideoConfig();
  const portrait = height > width;

  // Quote cards display their own text full-screen — hide the bottom
  // captions while one is on screen (matches the reference video).
  const quoteRanges = data.scenes.filter((s) => s.type === 'quote');
  const visibleWords = words.filter(
    (w) => !quoteRanges.some((q) => w.start >= q.start && w.start < q.end)
  );

  return (
    <AbsoluteFill>
      <PaperBackground />
      {data.scenes.map((scene, i) => {
        const from = Math.round(scene.start * fps);
        const durationInFrames = Math.max(
          1,
          Math.round((scene.end - scene.start) * fps)
        );
        return (
          <Sequence key={i} from={from} durationInFrames={durationInFrames}>
            {scene.type === 'quote' ? (
              <QuoteCard
                variant={scene.variant}
                title={scene.title}
                segments={scene.segments}
                portrait={portrait}
              />
            ) : (
              <SceneImage
                src={scene.src}
                durationInFrames={durationInFrames}
                portrait={portrait}
                index={i}
              />
            )}
          </Sequence>
        );
      })}
      <WordCaptions words={visibleWords} portrait={portrait} />
      {data.audio ? <Audio src={staticFile(data.audio)} /> : null}
    </AbsoluteFill>
  );
};
