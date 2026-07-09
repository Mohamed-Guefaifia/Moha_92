import React from "react";
import { theme } from "../theme";

/**
 * Stickman paramétrique en noir et blanc : le personnage qui présente
 * les noms. Chaque membre est une polyline dont les points glissent de
 * la pose neutre vers la pose cible (piloté par `enter`, un spring),
 * ce qui anime le geste. `talk` > 0 ouvre/ferme la bouche (il parle).
 */

type Pt = [number, number];
type Limb = [Pt, Pt, Pt];

export type Pose = {
  armL: Limb;
  armR: Limb;
  legL: Limb;
  legR: Limb;
  lean?: number;
  headTilt?: number;
};

const NEUTRAL: Pose = {
  armL: [[100, 95], [85, 125], [80, 155]],
  armR: [[100, 95], [115, 125], [120, 155]],
  legL: [[100, 170], [90, 215], [85, 260]],
  legR: [[100, 170], [110, 215], [115, 260]],
  lean: 0,
  headTilt: 0,
};

/** Poses : il pointe, présente, célèbre, réfléchit, salue, s'incline… */
export const POSES: Pose[] = [
  // pointe vers le haut
  {
    armL: [[100, 95], [80, 120], [95, 140]],
    armR: [[100, 95], [125, 70], [142, 32]],
    legL: NEUTRAL.legL,
    legR: NEUTRAL.legR,
    headTilt: -6,
  },
  // présente sur le côté, paume ouverte
  {
    armL: [[100, 95], [85, 125], [80, 155]],
    armR: [[100, 95], [132, 102], [168, 92]],
    legL: NEUTRAL.legL,
    legR: [[100, 170], [115, 212], [125, 258]],
    headTilt: 4,
  },
  // les deux bras levés (célébration)
  {
    armL: [[100, 95], [74, 66], [58, 34]],
    armR: [[100, 95], [126, 66], [142, 34]],
    legL: [[100, 170], [85, 214], [78, 260]],
    legR: [[100, 170], [115, 214], [122, 260]],
  },
  // réfléchit, main au menton
  {
    armL: [[100, 95], [85, 128], [93, 152]],
    armR: [[100, 95], [122, 82], [108, 62]],
    legL: NEUTRAL.legL,
    legR: NEUTRAL.legR,
    headTilt: 9,
  },
  // mains sur les hanches
  {
    armL: [[100, 95], [74, 116], [88, 136]],
    armR: [[100, 95], [126, 116], [112, 136]],
    legL: NEUTRAL.legL,
    legR: NEUTRAL.legR,
    headTilt: -4,
  },
  // salue de la main
  {
    armL: [[100, 95], [85, 125], [80, 155]],
    armR: [[100, 95], [132, 76], [126, 42]],
    legL: NEUTRAL.legL,
    legR: NEUTRAL.legR,
    headTilt: 6,
  },
  // saut d'enthousiasme, genoux fléchis
  {
    armL: [[100, 95], [72, 74], [56, 48]],
    armR: [[100, 95], [128, 74], [144, 48]],
    legL: [[100, 170], [82, 198], [68, 228]],
    legR: [[100, 170], [118, 198], [132, 228]],
    headTilt: -5,
  },
  // présente des deux mains, paumes vers le ciel
  {
    armL: [[100, 95], [70, 112], [44, 100]],
    armR: [[100, 95], [130, 112], [156, 100]],
    legL: NEUTRAL.legL,
    legR: NEUTRAL.legR,
  },
  // mains jointes devant (respect)
  {
    armL: [[100, 95], [84, 122], [100, 138]],
    armR: [[100, 95], [116, 122], [100, 138]],
    legL: NEUTRAL.legL,
    legR: NEUTRAL.legR,
    headTilt: 5,
  },
  // s'incline
  {
    armL: [[100, 95], [88, 128], [106, 148]],
    armR: [[100, 95], [112, 128], [124, 150]],
    legL: NEUTRAL.legL,
    legR: NEUTRAL.legR,
    lean: 24,
    headTilt: 12,
  },
];

export type Expression =
  | "happy"
  | "grin"
  | "wink"
  | "calm"
  | "surprised";

export const EXPRESSIONS: Expression[] = [
  "happy",
  "grin",
  "wink",
  "calm",
  "surprised",
];

export type Outfit = {
  hat?: "tophat" | "cap" | "beanie" | "bowler";
  neck?: "bowtie" | "scarf" | "tie";
  glasses?: boolean;
};

export const OUTFITS: Outfit[] = [
  { hat: "tophat", neck: "bowtie" },
  { hat: "cap" },
  { hat: "beanie", neck: "scarf" },
  { neck: "tie", glasses: true },
  { hat: "bowler" },
  { glasses: true, neck: "bowtie" },
  { neck: "scarf" },
  { hat: "beanie", glasses: true },
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpPt = (a: Pt, b: Pt, t: number): Pt => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
];
const lerpLimb = (a: Limb, b: Limb, t: number): Limb => [
  lerpPt(a[0], b[0], t),
  lerpPt(a[1], b[1], t),
  lerpPt(a[2], b[2], t),
];
const limbPoints = (l: Limb) => l.map((p) => p.join(",")).join(" ");

const STROKE = "#ffffff";
const FILL_DARK = "#000000";
const LINE = 7;

const Face: React.FC<{ expression: Expression; talk: number }> = ({
  expression,
  talk,
}) => {
  const eyes = (() => {
    switch (expression) {
      case "wink":
        return (
          <>
            <line x1={87} y1={45} x2={96} y2={45} stroke={STROKE} strokeWidth={4} strokeLinecap="round" />
            <circle cx={109} cy={45} r={3.4} fill={STROKE} />
          </>
        );
      case "surprised":
        return (
          <>
            <circle cx={91} cy={44} r={4.5} fill="none" stroke={STROKE} strokeWidth={3} />
            <circle cx={109} cy={44} r={4.5} fill="none" stroke={STROKE} strokeWidth={3} />
          </>
        );
      case "calm":
        return (
          <>
            <path d="M 86 46 Q 91 41 96 46" fill="none" stroke={STROKE} strokeWidth={3.5} strokeLinecap="round" />
            <path d="M 104 46 Q 109 41 114 46" fill="none" stroke={STROKE} strokeWidth={3.5} strokeLinecap="round" />
          </>
        );
      default:
        return (
          <>
            <circle cx={91} cy={45} r={3.4} fill={STROKE} />
            <circle cx={109} cy={45} r={3.4} fill={STROKE} />
          </>
        );
    }
  })();

  // Bouche : ouverte et animée quand il parle, sinon selon l'expression
  const mouth =
    talk > 0.05 ? (
      <ellipse
        cx={100}
        cy={60}
        rx={5.5}
        ry={2 + 5 * talk}
        fill={FILL_DARK}
        stroke={STROKE}
        strokeWidth={3}
      />
    ) : expression === "grin" ? (
      <path d="M 88 56 Q 100 70 112 56 Z" fill={STROKE} />
    ) : expression === "surprised" ? (
      <circle cx={100} cy={60} r={4.5} fill="none" stroke={STROKE} strokeWidth={3} />
    ) : (
      <path d="M 90 57 Q 100 66 110 57" fill="none" stroke={STROKE} strokeWidth={3.5} strokeLinecap="round" />
    );

  return (
    <>
      {eyes}
      {mouth}
    </>
  );
};

const Hat: React.FC<{ hat: NonNullable<Outfit["hat"]> }> = ({ hat }) => {
  switch (hat) {
    case "tophat":
      return (
        <>
          <rect x={84} y={2} width={32} height={26} fill={FILL_DARK} stroke={STROKE} strokeWidth={4} />
          <line x1={72} y1={29} x2={128} y2={29} stroke={STROKE} strokeWidth={5} strokeLinecap="round" />
        </>
      );
    case "cap":
      return (
        <>
          <path d="M 79 34 A 21 21 0 0 1 121 34 Z" fill={FILL_DARK} stroke={STROKE} strokeWidth={4} />
          <line x1={100} y1={33} x2={138} y2={33} stroke={STROKE} strokeWidth={5} strokeLinecap="round" />
        </>
      );
    case "beanie":
      return (
        <>
          <path d="M 79 36 A 21 21 0 0 1 121 36 Z" fill={STROKE} />
          <circle cx={100} cy={12} r={5} fill={STROKE} />
        </>
      );
    case "bowler":
      return (
        <>
          <path d="M 82 30 A 18 18 0 0 1 118 30 Z" fill={FILL_DARK} stroke={STROKE} strokeWidth={4} />
          <line x1={74} y1={31} x2={126} y2={31} stroke={STROKE} strokeWidth={5} strokeLinecap="round" />
        </>
      );
  }
};

const Neckwear: React.FC<{ neck: NonNullable<Outfit["neck"]> }> = ({ neck }) => {
  switch (neck) {
    case "bowtie":
      return (
        <>
          <path d="M 100 80 L 86 73 L 86 87 Z" fill={STROKE} />
          <path d="M 100 80 L 114 73 L 114 87 Z" fill={STROKE} />
        </>
      );
    case "scarf":
      return (
        <>
          <line x1={88} y1={79} x2={112} y2={79} stroke={STROKE} strokeWidth={9} strokeLinecap="round" />
          <line x1={92} y1={82} x2={88} y2={106} stroke={STROKE} strokeWidth={8} strokeLinecap="round" />
        </>
      );
    case "tie":
      return (
        <path d="M 100 78 L 94 88 L 100 116 L 106 88 Z" fill={STROKE} />
      );
  }
};

export const Stickman: React.FC<{
  pose: Pose;
  expression: Expression;
  outfit: Outfit;
  /** 0 → pose neutre, 1 → pose cible (mettre un spring) */
  enter: number;
  /** 0 → bouche fermée, > 0 → bouche ouverte (il parle) */
  talk: number;
  /** Miroir horizontal, pour le placer à droite en regardant le texte */
  flip?: boolean;
  /** Texte de la bulle (ex. « 12 / 99 »), null pour aucune bulle */
  bubbleText?: string | null;
  /** Opacité/échelle de la bulle (0 à 1) */
  bubbleIn?: number;
  width: number;
}> = ({
  pose,
  expression,
  outfit,
  enter,
  talk,
  flip = false,
  bubbleText = null,
  bubbleIn = 0,
  width,
}) => {
  const t = Math.min(1, Math.max(0, enter));
  const armL = lerpLimb(NEUTRAL.armL, pose.armL, t);
  const armR = lerpLimb(NEUTRAL.armR, pose.armR, t);
  const legL = lerpLimb(NEUTRAL.legL, pose.legL, t);
  const legR = lerpLimb(NEUTRAL.legR, pose.legR, t);
  const lean = lerp(NEUTRAL.lean ?? 0, pose.lean ?? 0, t);
  const headTilt = lerp(NEUTRAL.headTilt ?? 0, pose.headTilt ?? 0, t);

  return (
    <div style={{ position: "relative", width, lineHeight: 0 }}>
      {bubbleText && bubbleIn > 0.01 ? (
        <div
          style={{
            position: "absolute",
            top: -Math.round(width * 0.16),
            [flip ? "right" : "left"]: "72%",
            transform: `scale(${bubbleIn})`,
            transformOrigin: flip ? "bottom right" : "bottom left",
            opacity: bubbleIn,
            background: "#000",
            border: "3px solid #fff",
            borderRadius: 16,
            padding: `${Math.round(width * 0.045)}px ${Math.round(width * 0.09)}px`,
            fontFamily: theme.fonts.heading,
            fontWeight: 800,
            fontSize: Math.round(width * 0.11),
            color: "#fff",
            whiteSpace: "nowrap",
          }}
        >
          {bubbleText}
          <div
            style={{
              position: "absolute",
              bottom: -8,
              [flip ? "right" : "left"]: 14,
              width: 14,
              height: 14,
              background: "#000",
              borderRight: "3px solid #fff",
              borderBottom: "3px solid #fff",
              transform: "rotate(45deg)",
            }}
          />
        </div>
      ) : null}

      <svg
        viewBox="0 0 200 300"
        style={{ width: "100%", transform: flip ? "scaleX(-1)" : undefined }}
      >
        <g transform={`rotate(${lean} 100 170)`}>
          {/* jambes puis bras puis tronc */}
          <polyline points={limbPoints(legL)} fill="none" stroke={STROKE} strokeWidth={LINE} strokeLinecap="round" strokeLinejoin="round" />
          <polyline points={limbPoints(legR)} fill="none" stroke={STROKE} strokeWidth={LINE} strokeLinecap="round" strokeLinejoin="round" />
          <line x1={100} y1={74} x2={100} y2={170} stroke={STROKE} strokeWidth={LINE} strokeLinecap="round" />
          <polyline points={limbPoints(armL)} fill="none" stroke={STROKE} strokeWidth={LINE} strokeLinecap="round" strokeLinejoin="round" />
          <polyline points={limbPoints(armR)} fill="none" stroke={STROKE} strokeWidth={LINE} strokeLinecap="round" strokeLinejoin="round" />

          {/* tête (remplie de noir pour masquer les traits derrière) */}
          <g transform={`rotate(${headTilt} 100 50)`}>
            <circle cx={100} cy={50} r={22} fill={FILL_DARK} stroke={STROKE} strokeWidth={LINE - 1} />
            <Face expression={expression} talk={talk} />
            {outfit.glasses ? (
              <>
                <circle cx={91} cy={45} r={8} fill="none" stroke={STROKE} strokeWidth={2.5} />
                <circle cx={109} cy={45} r={8} fill="none" stroke={STROKE} strokeWidth={2.5} />
                <line x1={99} y1={45} x2={101} y2={45} stroke={STROKE} strokeWidth={2.5} />
              </>
            ) : null}
            {outfit.hat ? <Hat hat={outfit.hat} /> : null}
          </g>

          {outfit.neck ? <Neckwear neck={outfit.neck} /> : null}
        </g>
      </svg>
    </div>
  );
};
