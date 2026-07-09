"use client";

import { useEffect, useState } from "react";
import { Player } from "@remotion/player";
import type { Caption } from "@remotion/captions";
import { MainVideo } from "../../remotion/Video";

const FPS = 30;

/**
 * Prévisualisation de la vidéo directement dans le site Next.js.
 * Pour l'édition avancée (timeline, props…), utilisez : npm run video:studio
 */
export default function VideoPage() {
  const [captions, setCaptions] = useState<Caption[] | null>(null);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [durationMs, setDurationMs] = useState(15000);

  useEffect(() => {
    fetch("/captions.json")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Caption[]) => {
        setCaptions(data);
        const lastEnd = data.at(-1)?.endMs ?? 0;
        setDurationMs((d) => Math.max(d, lastEnd + 1000));
      })
      .catch(() => setCaptions([]));

    const audio = document.createElement("audio");
    audio.src = "/audio.mp3";
    audio.addEventListener("loadedmetadata", () => {
      setAudioSrc("/audio.mp3");
      setDurationMs(audio.duration * 1000);
    });
  }, []);

  if (captions === null) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0b0f19] text-slate-400">
        Chargement de la vidéo…
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#0b0f19] p-8">
      <h1 className="text-2xl font-bold text-slate-100">
        Prévisualisation de la vidéo
      </h1>
      <div className="w-full max-w-5xl overflow-hidden rounded-2xl shadow-2xl">
        <Player
          component={MainVideo}
          inputProps={{ captions, audioSrc, orientation: "landscape" }}
          durationInFrames={Math.max(1, Math.round((durationMs / 1000) * FPS))}
          fps={FPS}
          compositionWidth={1920}
          compositionHeight={1080}
          controls
          style={{ width: "100%" }}
        />
      </div>
      <p className="max-w-2xl text-center text-sm text-slate-400">
        Déposez la voix de votre vidéo dans <code>public/audio.mp3</code>, puis
        lancez <code>npm run captions</code> pour générer des sous-titres
        synchronisés mot à mot. Éditez le style dans{" "}
        <code>remotion/theme.ts</code> et le contenu dans{" "}
        <code>remotion/content.ts</code>.
      </p>
    </main>
  );
}
