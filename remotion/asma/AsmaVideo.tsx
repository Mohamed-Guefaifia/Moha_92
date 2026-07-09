import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { MonoBackground } from "./MonoBackground";
import { theme } from "../theme";
import { ASMA_UL_HUSNA, type DivineName } from "./names";
import { Stickman, POSES, EXPRESSIONS, OUTFITS } from "./Stickman";

export type AsmaVideoProps = {
  /** URL de la piste audio (récitation / nasheed), ou null si absente */
  audioSrc: string | null;
};

/** Durées fixes de l'intro et de l'outro, en millisecondes */
export const ASMA_INTRO_MS = 6000;
export const ASMA_OUTRO_MS = 8000;
/** Durée par nom quand il n'y a pas d'audio (≈ 5 min 30 au total) */
export const ASMA_MS_PER_NAME_FALLBACK = 3200;

/* Palette strictement noir et blanc : encre noire sur fond blanc,
   comme le personnage dessiné au trait */
const INK = "#0d0d0d";
const GREY = "#5a5a5a";

const arabicFont = "'Amiri', 'Noto Naskh Arabic', 'Traditional Arabic', serif";

/**
 * Casting du présentateur : pour chaque nom, une combinaison différente
 * de pose, expression, tenue, côté de l'écran et animation du nom.
 * Les pas (3, 5, 7…) sont premiers entre eux avec les tailles des
 * tableaux, donc les combinaisons ne se répètent presque jamais.
 */
const castFor = (i: number) => ({
  pose: POSES[i % POSES.length],
  expression: EXPRESSIONS[(i * 3 + 1) % EXPRESSIONS.length],
  outfit: OUTFITS[(i * 5 + 2) % OUTFITS.length],
  side: i % 2 === 0 ? ("left" as const) : ("right" as const),
  anim: i % 6,
});

/** Animation d'apparition du nom, différente selon la variante */
const nameAnimStyle = (
  variant: number,
  r: number,
  side: "left" | "right",
): React.CSSProperties => {
  const dir = side === "left" ? 1 : -1;
  switch (variant % 6) {
    case 0: // pop avec rebond
      return { opacity: r, transform: `scale(${interpolate(r, [0, 1], [0.3, 1])})` };
    case 1: // glisse depuis le stickman
      return {
        opacity: r,
        transform: `translateX(${interpolate(r, [0, 1], [dir * -140, 0])}px)`,
      };
    case 2: // monte avec flou qui se dissipe
      return {
        opacity: r,
        transform: `translateY(${interpolate(r, [0, 1], [90, 0])}px)`,
        filter: `blur(${interpolate(r, [0, 1], [10, 0])}px)`,
      };
    case 3: // tombe du haut
      return {
        opacity: Math.min(1, r * 1.6),
        transform: `translateY(${interpolate(r, [0, 1], [-120, 0])}px)`,
      };
    case 4: // zoom arrière
      return { opacity: r, transform: `scale(${interpolate(r, [0, 1], [1.7, 1])})` };
    default: // bascule
      return {
        opacity: r,
        transform: `rotate(${interpolate(r, [0, 1], [dir * -10, 0])}deg) scale(${interpolate(r, [0, 1], [0.7, 1])})`,
      };
  }
};

/** Écran d'introduction : le stickman salue et présente le titre */
const AsmaIntro: React.FC<{ orientation: "landscape" | "portrait" }> = ({
  orientation,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width } = useVideoConfig();
  const isPortrait = orientation === "portrait";

  const enter = spring({ frame, fps, config: { damping: 14, mass: 0.8 } });
  const titleEnter = spring({
    frame: frame - Math.round(fps * 0.6),
    fps,
    config: { damping: 16 },
  });
  const exit = interpolate(
    frame,
    [durationInFrames - Math.round(fps * 0.5), durationInFrames - 1],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const talk = frame > fps * 0.5 && frame < fps * 1.6 ? 0.5 + 0.5 * Math.sin(frame * 0.9) : 0;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: exit,
        padding: "0 6%",
      }}
    >
      <div
        style={{
          fontFamily: arabicFont,
          fontWeight: 700,
          fontSize: Math.round(width * (isPortrait ? 0.06 : 0.04)),
          color: INK,
          opacity: enter,
          transform: `translateY(${interpolate(enter, [0, 1], [50, 0])}px)`,
          direction: "rtl",
          textAlign: "center",
        }}
      >
        بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
      </div>
      <div
        style={{
          fontFamily: theme.fonts.heading,
          fontWeight: 800,
          fontSize: Math.round(width * (isPortrait ? 0.055 : 0.03)),
          color: INK,
          marginTop: 36,
          opacity: titleEnter,
          transform: `translateY(${interpolate(titleEnter, [0, 1], [40, 0])}px)`,
          textAlign: "center",
        }}
      >
        Les 99 Noms d&apos;Allah
      </div>
      <div
        style={{
          fontFamily: theme.fonts.body,
          fontWeight: 500,
          fontSize: Math.round(width * (isPortrait ? 0.032 : 0.016)),
          color: GREY,
          marginTop: 14,
          opacity: titleEnter,
          textAlign: "center",
        }}
      >
        Asma&apos;ul Husna — أسماء الله الحسنى
      </div>
      <div style={{ marginTop: isPortrait ? 60 : 30 }}>
        <Stickman
          pose={POSES[5]}
          expression="grin"
          outfit={{ hat: "tophat", neck: "bowtie" }}
          enter={enter}
          talk={talk}
          bubbleText="Bismillah !"
          bubbleIn={titleEnter}
          width={Math.round(width * (isPortrait ? 0.3 : 0.12))}
        />
      </div>
    </AbsoluteFill>
  );
};

/** Carte d'un nom : le stickman le présente, le nom apparaît quand il « parle » */
const NameCard: React.FC<{
  name: DivineName;
  index: number;
  orientation: "landscape" | "portrait";
}> = ({ name, index, orientation }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width } = useVideoConfig();
  const isPortrait = orientation === "portrait";
  const cast = castFor(index);

  // 1. Le stickman entre et prend sa pose
  const enter = spring({ frame, fps, config: { damping: 13, mass: 0.7 } });
  // 2. Il « annonce » le nom (bouche animée) pendant ~0,9 s
  const talking = frame > fps * 0.15 && frame < fps * 1.05;
  const talk = talking ? (0.5 + 0.5 * Math.sin(frame * 0.95)) * enter : 0;
  // 3. Dès qu'il parle, le nom s'affiche avec son animation
  const reveal = spring({
    frame: frame - Math.round(fps * 0.35),
    fps,
    config: { damping: 14, mass: 0.8 },
  });
  const subReveal = spring({
    frame: frame - Math.round(fps * 0.55),
    fps,
    config: { damping: 17 },
  });
  const exit = interpolate(
    frame,
    [durationInFrames - Math.round(fps * 0.3), durationInFrames - 1],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Petit balancement pendant qu'il présente
  const bob = Math.sin(frame / 9) * 4 * enter;

  const arabicSize = Math.round(width * (isPortrait ? 0.15 : 0.08));
  const isLongName = name.arabic.length > 12;
  const stickWidth = Math.round(width * (isPortrait ? 0.34 : 0.15));
  const onLeft = cast.side === "left";

  const stickman = (
    <div style={{ transform: `translateY(${bob}px)` }}>
      <Stickman
        pose={cast.pose}
        expression={cast.expression}
        outfit={cast.outfit}
        enter={enter}
        talk={talk}
        flip={!onLeft}
        bubbleText={`${index + 1} / 99`}
        bubbleIn={enter}
        width={stickWidth}
      />
    </div>
  );

  const textBlock = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontFamily: arabicFont,
          fontWeight: 700,
          fontSize: isLongName ? Math.round(arabicSize * 0.62) : arabicSize,
          lineHeight: 1.7,
          color: INK,
          direction: "rtl",
          textAlign: "center",
          ...nameAnimStyle(cast.anim, reveal, cast.side),
        }}
      >
        {name.arabic}
      </div>
      <div
        style={{
          fontFamily: theme.fonts.heading,
          fontWeight: 800,
          fontSize: Math.round(width * (isPortrait ? 0.055 : 0.028)),
          color: INK,
          marginTop: isPortrait ? 40 : 24,
          opacity: subReveal,
          transform: `translateY(${interpolate(subReveal, [0, 1], [30, 0])}px)`,
          textAlign: "center",
        }}
      >
        {name.translit}
      </div>
      <div
        style={{
          fontFamily: theme.fonts.body,
          fontWeight: 500,
          fontSize: Math.round(width * (isPortrait ? 0.037 : 0.018)),
          color: GREY,
          marginTop: isPortrait ? 20 : 12,
          opacity: subReveal,
          transform: `translateY(${interpolate(subReveal, [0, 1], [24, 0])}px)`,
          textAlign: "center",
          maxWidth: "88%",
          lineHeight: 1.4,
        }}
      >
        {name.fr}
      </div>
    </div>
  );

  if (isPortrait) {
    // Vertical : texte au centre, stickman en bas, côté alterné
    return (
      <AbsoluteFill style={{ opacity: exit, padding: "10% 6%" }}>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {textBlock}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: onLeft ? "flex-start" : "flex-end",
            padding: "0 6%",
            marginBottom: "4%",
          }}
        >
          {stickman}
        </div>
      </AbsoluteFill>
    );
  }

  // Paysage : stickman d'un côté, texte de l'autre
  return (
    <AbsoluteFill
      style={{
        opacity: exit,
        flexDirection: onLeft ? "row" : "row-reverse",
        alignItems: "center",
        padding: "0 5%",
        gap: "3%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          width: "22%",
          height: "70%",
        }}
      >
        {stickman}
      </div>
      {textBlock}
    </AbsoluteFill>
  );
};

/** Écran de conclusion : le stickman s'incline */
const AsmaOutro: React.FC<{ orientation: "landscape" | "portrait" }> = ({
  orientation,
}) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const isPortrait = orientation === "portrait";
  const enter = spring({ frame, fps, config: { damping: 16 } });
  const subEnter = spring({
    frame: frame - Math.round(fps * 0.4),
    fps,
    config: { damping: 16 },
  });
  const bow = spring({
    frame: frame - Math.round(fps * 1.2),
    fps,
    config: { damping: 15 },
  });

  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", padding: "0 8%" }}
    >
      <div
        style={{
          fontFamily: arabicFont,
          fontWeight: 700,
          fontSize: Math.round(width * (isPortrait ? 0.14 : 0.08)),
          color: INK,
          opacity: enter,
          transform: `scale(${interpolate(enter, [0, 1], [0.85, 1])})`,
          direction: "rtl",
        }}
      >
        اللَّهُ
      </div>
      <div
        style={{
          fontFamily: theme.fonts.body,
          fontWeight: 500,
          fontSize: Math.round(width * (isPortrait ? 0.035 : 0.018)),
          color: GREY,
          marginTop: 36,
          opacity: subEnter,
          textAlign: "center",
          lineHeight: 1.6,
        }}
      >
        « C&apos;est à Allah qu&apos;appartiennent les plus beaux noms.
        Invoquez-Le par ces noms. » — Coran 7:180
      </div>
      <div style={{ marginTop: isPortrait ? 60 : 30 }}>
        <Stickman
          pose={POSES[9]}
          expression="calm"
          outfit={{ hat: "tophat", neck: "bowtie" }}
          enter={bow}
          talk={0}
          width={Math.round(width * (isPortrait ? 0.28 : 0.11))}
        />
      </div>
    </AbsoluteFill>
  );
};

const msToFrames = (ms: number, fps: number) => Math.round((ms / 1000) * fps);

/**
 * Composition « Asma'ul Husna », noir et blanc : le stickman présente
 * chaque nom (pose, réaction, tenue et côté différents à chaque fois) ;
 * dès qu'il « le dit », le nom apparaît avec une animation qui varie.
 * S'il y a un audio (public/asma-audio.mp3), la vidéo dure exactement
 * comme lui ; sinon elle dure ≈ 5 min 30.
 */
export const AsmaVideo: React.FC<
  AsmaVideoProps & { orientation: "landscape" | "portrait" }
> = ({ audioSrc, orientation }) => {
  const { fps, durationInFrames, width, height } = useVideoConfig();

  const introFrames = msToFrames(ASMA_INTRO_MS, fps);
  const outroFrames = msToFrames(ASMA_OUTRO_MS, fps);
  const namesTotalFrames = Math.max(
    ASMA_UL_HUSNA.length,
    durationInFrames - introFrames - outroFrames,
  );
  const framesPerName = namesTotalFrames / ASMA_UL_HUSNA.length;

  const frame = useCurrentFrame();
  const progress = Math.min(1, Math.max(0, (frame - introFrames) / namesTotalFrames));

  return (
    <AbsoluteFill style={{ backgroundColor: "#fff" }}>
      <MonoBackground />

      {audioSrc ? <Audio src={audioSrc} /> : null}

      <Sequence durationInFrames={introFrames} name="Intro — Basmala">
        <AsmaIntro orientation={orientation} />
      </Sequence>

      {ASMA_UL_HUSNA.map((name, i) => {
        const from = introFrames + Math.round(i * framesPerName);
        const until = introFrames + Math.round((i + 1) * framesPerName);
        return (
          <Sequence
            key={name.translit}
            from={from}
            durationInFrames={Math.max(1, until - from)}
            name={`${i + 1}. ${name.translit}`}
          >
            <NameCard name={name} index={i} orientation={orientation} />
          </Sequence>
        );
      })}

      <Sequence
        from={introFrames + namesTotalFrames}
        durationInFrames={outroFrames}
        name="Outro"
      >
        <AsmaOutro orientation={orientation} />
      </Sequence>

      {/* Barre de progression */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: Math.round(height * 0.008),
          width: `${progress * 100}%`,
          background: INK,
        }}
      />

      {theme.branding.watermark ? (
        <div
          style={{
            position: "absolute",
            top: Math.round(height * 0.04),
            right: Math.round(width * 0.035),
            fontFamily: theme.fonts.heading,
            fontWeight: 800,
            fontSize: Math.round(width * 0.016),
            letterSpacing: "0.25em",
            color: GREY,
            opacity: 0.8,
          }}
        >
          {theme.branding.watermark}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
