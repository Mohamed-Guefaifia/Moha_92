import React from "react";
import { Composition, staticFile, type CalculateMetadataFunction } from "remotion";
import type { Caption } from "@remotion/captions";
import { getAudioDurationInSeconds } from "@remotion/media-utils";
import { MainVideo, type VideoProps } from "./Video";
import {
  AsmaVideo,
  type AsmaVideoProps,
  ASMA_INTRO_MS,
  ASMA_OUTRO_MS,
  ASMA_MS_PER_NAME_FALLBACK,
} from "./asma/AsmaVideo";
import { ASMA_UL_HUSNA } from "./asma/names";
import { videoContent } from "./content";
import { loadFonts } from "./fonts";

loadFonts();

const FPS = 30;

/** Trouve le premier fichier audio existant dans public/ et donne sa durée. */
const findAudio = async (
  candidates: string[],
): Promise<{ src: string; durationMs: number } | null> => {
  for (const candidate of candidates) {
    try {
      const src = staticFile(candidate);
      const seconds = await getAudioDurationInSeconds(src);
      return { src, durationMs: seconds * 1000 };
    } catch {
      // Fichier absent : on essaie le suivant.
    }
  }
  return null;
};

/**
 * Composition principale : durée = durée de l'audio (public/audio.mp3),
 * sinon fin du dernier sous-titre, sinon durée de secours.
 */
const calculateMainMetadata: CalculateMetadataFunction<VideoProps> = async () => {
  let captions: Caption[] = [];
  try {
    const res = await fetch(staticFile("captions.json"));
    if (res.ok) {
      captions = (await res.json()) as Caption[];
    }
  } catch {
    // Pas de sous-titres : la vidéo reste rendable sans eux.
  }

  const audio = await findAudio(["audio.mp3", "audio.wav", "audio.m4a"]);
  const durationMs =
    audio?.durationMs ??
    Math.max(
      (captions.at(-1)?.endMs ?? 0) + 1000,
      videoContent.introDurationMs + 5000,
    );

  return {
    durationInFrames: Math.max(1, Math.round((durationMs / 1000) * FPS)),
    props: { captions, audioSrc: audio?.src ?? null },
  };
};

/**
 * Composition Asma'ul Husna : durée = durée de l'audio
 * (public/asma-audio.mp3) s'il existe, sinon ≈ 5 min 30
 * (intro + 99 noms + outro).
 */
const calculateAsmaMetadata: CalculateMetadataFunction<
  AsmaVideoProps
> = async () => {
  const audio = await findAudio([
    "asma-audio.mp3",
    "asma-audio.wav",
    "asma-audio.m4a",
  ]);
  const durationMs =
    audio?.durationMs ??
    ASMA_INTRO_MS +
      ASMA_UL_HUSNA.length * ASMA_MS_PER_NAME_FALLBACK +
      ASMA_OUTRO_MS;

  return {
    durationInFrames: Math.max(1, Math.round((durationMs / 1000) * FPS)),
    props: { audioSrc: audio?.src ?? null },
  };
};

const defaultMainProps: VideoProps = { captions: [], audioSrc: null };
const defaultAsmaProps: AsmaVideoProps = { audioSrc: null };

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
        defaultProps={defaultMainProps}
        calculateMetadata={calculateMainMetadata}
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
        defaultProps={defaultMainProps}
        calculateMetadata={calculateMainMetadata}
      />
      {/* Asma'ul Husna — Les 99 Noms d'Allah (paysage) */}
      <Composition
        id="AsmaVideo"
        component={(props: AsmaVideoProps) => (
          <AsmaVideo {...props} orientation="landscape" />
        )}
        durationInFrames={330 * FPS}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={defaultAsmaProps}
        calculateMetadata={calculateAsmaMetadata}
      />
      {/* Asma'ul Husna — format vertical */}
      <Composition
        id="AsmaShort"
        component={(props: AsmaVideoProps) => (
          <AsmaVideo {...props} orientation="portrait" />
        )}
        durationInFrames={330 * FPS}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={defaultAsmaProps}
        calculateMetadata={calculateAsmaMetadata}
      />
    </>
  );
};
