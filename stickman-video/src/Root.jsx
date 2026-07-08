import React from 'react';
import {Composition, staticFile} from 'remotion';
import {getAudioDurationInSeconds} from '@remotion/media-utils';
import {StickmanVideo} from './Video.jsx';
import videoData from './data/video.json';
import words from './data/words.json';
import './fonts.js';

const FPS = 30;

// Duration comes from the narration audio when present; otherwise from the
// last scene/word so the demo works without an audio file.
const calculateMetadata = async ({props}) => {
  let seconds = props.data.durationInSeconds ?? 0;
  if (props.data.audio) {
    seconds = await getAudioDurationInSeconds(staticFile(props.data.audio));
  } else {
    for (const scene of props.data.scenes) {
      seconds = Math.max(seconds, scene.end);
    }
    const last = props.words[props.words.length - 1];
    if (last) seconds = Math.max(seconds, last.end + 0.5);
  }
  return {durationInFrames: Math.max(1, Math.ceil(seconds * FPS))};
};

export const Root = () => {
  return (
    <>
      <Composition
        id="Video"
        component={StickmanVideo}
        width={1920}
        height={1080}
        fps={FPS}
        durationInFrames={FPS * 10}
        defaultProps={{data: videoData, words}}
        calculateMetadata={calculateMetadata}
      />
      <Composition
        id="Short"
        component={StickmanVideo}
        width={1080}
        height={1920}
        fps={FPS}
        durationInFrames={FPS * 10}
        defaultProps={{data: videoData, words}}
        calculateMetadata={calculateMetadata}
      />
    </>
  );
};
