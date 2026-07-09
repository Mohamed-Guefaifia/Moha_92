import React from "react";
import { Composition, staticFile, type CalculateMetadataFunction } from "remotion";
import type { Caption } from "@remotion/captions";
import { getAudioDurationInSeconds } from "@remotion/media-utils";
import { MainVideo, type VideoProps } from "./Video";
import { videoContent } from "./content";

const FPS = 30;

/** Fichiers audio acceptés dans public/, par ordre de priorité */
const AUDIO_CANDIDATES = ["audio.mp3", "audio.wav", "audio.m4a"];

/**
 * Calcule dynamiquement la durée de la vidéo et charge les sous-titres :
 * - la durée = durée du fichier audio (public/audio.mp3) s'il existe ;
 * - sinon, la fin du dernier sous-titre ;
 * - sinon, une durée de secours pour la prévisualisation.
 */
const calculateMetadata: CalculateMetadataFunction<VideoProps> = async () => {
  let captions: Caption[] = [];
  try {
    const res = await fetch(staticFile("captions.json"));
    if (res.ok) {
      captions = (await res.json()) as Caption[];
    }
  } catch {
    // Pas de sous-titres : la vidéo reste rendable sans eux.
  }

  let audioSrc: string | null = null;
  let durationMs: number | null = null;
  for (const candidate of AUDIO_CANDIDATES) {
    try {
      const src = staticFile(candidate);
      const seconds = await getAudioDurationInSeconds(src);
      audioSrc = src;
      durationMs = seconds * 1000;
      break;
    } catch {
      // Fichier absent : on essaie le suivant.
    }
  }

  if (durationMs === null) {
    const lastCaptionEnd = captions.at(-1)?.endMs ?? 0;
    durationMs = Math.max(
      lastCaptionEnd + 1000,
      videoContent.introDurationMs + 5000,
    );
  }

  return {
    durationInFrames: Math.max(1, Math.round((durationMs / 1000) * FPS)),
    props: { captions, audioSrc },
  };
};

const defaultProps: VideoProps = { captions: [], audioSrc: null };

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Format paysage (YouTube classique) */}
      <Composition
        id="Video"
        component={(props: VideoProps) => (
          <MainVideo {...props} orientation="landscape" />
        )}
        durationInFrames={30 * FPS}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={defaultProps}
        calculateMetadata={calculateMetadata}
      />
      {/* Format vertical (Shorts / Reels / TikTok) */}
      <Composition
        id="Short"
        component={(props: VideoProps) => (
          <MainVideo {...props} orientation="portrait" />
        )}
        durationInFrames={30 * FPS}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={defaultProps}
        calculateMetadata={calculateMetadata}
      />
    </>
  );
};
