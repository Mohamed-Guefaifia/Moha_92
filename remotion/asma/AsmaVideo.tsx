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
import { Background } from "../components/Background";
import { theme } from "../theme";
import { ASMA_UL_HUSNA, type DivineName } from "./names";

export type AsmaVideoProps = {
  /** URL de la piste audio (récitation / nasheed), ou null si absente */
  audioSrc: string | null;
};

/** Durées fixes de l'intro et de l'outro, en millisecondes */
export const ASMA_INTRO_MS = 6000;
export const ASMA_OUTRO_MS = 8000;
/** Durée par nom quand il n'y a pas d'audio (≈ 5 min 30 au total) */
export const ASMA_MS_PER_NAME_FALLBACK = 3200;

const arabicFont = "'Amiri', 'Noto Naskh Arabic', 'Traditional Arabic', serif";

/** Écran d'introduction : basmala + titre */
const AsmaIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 16, mass: 0.9 } });
  const titleEnter = spring({
    frame: frame - Math.round(fps * 0.5),
    fps,
    config: { damping: 16 },
  });
  const exit = interpolate(
    frame,
    [durationInFrames - Math.round(fps * 0.5), durationInFrames - 1],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

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
          fontSize: Math.round(width * 0.05),
          color: theme.colors.text,
          opacity: enter,
          transform: `translateY(${interpolate(enter, [0, 1], [50, 0])}px)`,
          textShadow: "0 8px 40px rgba(0,0,0,0.5)",
          direction: "rtl",
        }}
      >
        بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
      </div>
      <div
        style={{
          fontFamily: theme.fonts.heading,
          fontWeight: 800,
          fontSize: Math.round(width * 0.032),
          color: theme.colors.captionActiveWord,
          marginTop: 48,
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
          fontSize: Math.round(width * 0.018),
          color: theme.colors.textMuted,
          marginTop: 18,
          opacity: titleEnter,
          textAlign: "center",
        }}
      >
        Asma&apos;ul Husna — أسماء الله الحسنى
      </div>
    </AbsoluteFill>
  );
};

/** Carte d'un nom : numéro, calligraphie arabe, translittération, sens */
const NameCard: React.FC<{
  name: DivineName;
  index: number;
  orientation: "landscape" | "portrait";
}> = ({ name, index, orientation }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width } = useVideoConfig();
  const isPortrait = orientation === "portrait";

  const enter = spring({ frame, fps, config: { damping: 15, mass: 0.7 } });
  const subEnter = spring({
    frame: frame - Math.round(fps * 0.18),
    fps,
    config: { damping: 17 },
  });
  const exit = interpolate(
    frame,
    [durationInFrames - Math.round(fps * 0.3), durationInFrames - 1],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // La calligraphie arabe est la vedette : très grande, dorée
  const arabicSize = Math.round(width * (isPortrait ? 0.17 : 0.085));
  const isLongName = name.arabic.length > 12;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: exit,
        padding: "0 6%",
      }}
    >
      {/* Numéro du nom */}
      <div
        style={{
          fontFamily: theme.fonts.heading,
          fontWeight: 600,
          fontSize: Math.round(width * (isPortrait ? 0.035 : 0.016)),
          letterSpacing: "0.2em",
          color: theme.colors.textMuted,
          padding: "10px 26px",
          borderRadius: 999,
          border: `2px solid ${theme.colors.accentSoft}`,
          background: "rgba(10, 13, 22, 0.5)",
          opacity: enter,
          transform: `translateY(${interpolate(enter, [0, 1], [-30, 0])}px)`,
        }}
      >
        {index + 1} / 99
      </div>

      {/* Nom en arabe */}
      <div
        style={{
          fontFamily: arabicFont,
          fontWeight: 700,
          fontSize: isLongName ? Math.round(arabicSize * 0.62) : arabicSize,
          lineHeight: 1.7,
          color: theme.colors.captionActiveWord,
          textShadow: `0 0 80px ${theme.colors.accentSoft}, 0 10px 50px rgba(0,0,0,0.55)`,
          marginTop: isPortrait ? 60 : 30,
          opacity: enter,
          transform: `scale(${interpolate(enter, [0, 1], [0.85, 1])})`,
          direction: "rtl",
          textAlign: "center",
        }}
      >
        {name.arabic}
      </div>

      {/* Translittération */}
      <div
        style={{
          fontFamily: theme.fonts.heading,
          fontWeight: 800,
          fontSize: Math.round(width * (isPortrait ? 0.06 : 0.03)),
          color: theme.colors.text,
          marginTop: isPortrait ? 56 : 28,
          opacity: subEnter,
          transform: `translateY(${interpolate(subEnter, [0, 1], [30, 0])}px)`,
          textAlign: "center",
        }}
      >
        {name.translit}
      </div>

      {/* Signification en français */}
      <div
        style={{
          fontFamily: theme.fonts.body,
          fontWeight: 500,
          fontSize: Math.round(width * (isPortrait ? 0.04 : 0.019)),
          color: theme.colors.textMuted,
          marginTop: isPortrait ? 26 : 14,
          opacity: subEnter,
          transform: `translateY(${interpolate(subEnter, [0, 1], [24, 0])}px)`,
          textAlign: "center",
          maxWidth: "82%",
          lineHeight: 1.4,
        }}
      >
        {name.fr}
      </div>
    </AbsoluteFill>
  );
};

/** Écran de conclusion */
const AsmaOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 16 } });
  const subEnter = spring({
    frame: frame - Math.round(fps * 0.4),
    fps,
    config: { damping: 16 },
  });

  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", padding: "0 8%" }}
    >
      <div
        style={{
          fontFamily: arabicFont,
          fontWeight: 700,
          fontSize: Math.round(width * 0.09),
          color: theme.colors.captionActiveWord,
          textShadow: `0 0 90px ${theme.colors.accentSoft}`,
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
          fontSize: Math.round(width * 0.02),
          color: theme.colors.textMuted,
          marginTop: 40,
          opacity: subEnter,
          textAlign: "center",
          lineHeight: 1.6,
        }}
      >
        « C&apos;est à Allah qu&apos;appartiennent les plus beaux noms.
        Invoquez-Le par ces noms. » — Coran 7:180
      </div>
    </AbsoluteFill>
  );
};

const msToFrames = (ms: number, fps: number) => Math.round((ms / 1000) * fps);

/**
 * Composition « Asma'ul Husna » : intro (basmala) → les 99 noms un par un →
 * outro. Les noms se répartissent uniformément sur la durée disponible :
 * s'il y a un audio (public/asma-audio.mp3), la vidéo dure exactement comme
 * lui ; sinon elle dure ≈ 5 min 30.
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
    <AbsoluteFill style={{ backgroundColor: theme.colors.backgroundTop }}>
      <Background />

      {audioSrc ? <Audio src={audioSrc} /> : null}

      <Sequence durationInFrames={introFrames} name="Intro — Basmala">
        <AsmaIntro />
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
        <AsmaOutro />
      </Sequence>

      {/* Barre de progression */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: Math.round(height * 0.008),
          width: `${progress * 100}%`,
          background: `linear-gradient(90deg, ${theme.colors.glowPrimary}, ${theme.colors.glowSecondary})`,
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
            color: theme.colors.textMuted,
            opacity: 0.8,
          }}
        >
          {theme.branding.watermark}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
