import React from "react";
import { theme } from "../theme";

/**
 * Le personnage : stickman cartoon au trait noir sur fond blanc,
 * d'après le dessin de référence — grosse tête ronde blanche cerclée
 * de noir, sourcils expressifs, yeux avec pupilles, bouche ouverte
 * quand il parle, poings/doigt pointé, pieds dessinés et ombre au sol.
 *
 * Chaque membre est une polyline dont les points glissent de la pose
 * neutre vers la pose cible (piloté par `enter`, un spring), ce qui
 * anime le geste. `talk` > 0 ouvre/ferme la bouche.
 */

type Pt = [number, number];
type Limb = [Pt, Pt, Pt];
type Hand = "fist" | "point" | "open";

export type Pose = {
  armL: Limb;
  armR: Limb;
  legL: Limb;
  legR: Limb;
  handL?: Hand;
  handR?: Hand;
  lean?: number;
  headTilt?: number;
};

const NEUTRAL: Pose = {
  armL: [[100, 102], [86, 132], [82, 158]],
  armR: [[100, 102], [114, 132], [118, 158]],
  legL: [[100, 165], [91, 208], [87, 248]],
  legR: [[100, 165], [109, 208], [113, 248]],
  lean: 0,
  headTilt: 0,
};

/** Poses : il pointe, présente, célèbre, réfléchit, salue, s'incline… */
export const POSES: Pose[] = [
  // pointe vers le haut, l'autre poing serré (la pose de référence)
  {
    armL: [[100, 102], [84, 130], [82, 152]],
    armR: [[100, 102], [122, 80], [136, 46]],
    legL: NEUTRAL.legL,
    legR: NEUTRAL.legR,
    handR: "point",
    headTilt: -6,
  },
  // présente sur le côté, paume ouverte
  {
    armL: NEUTRAL.armL,
    armR: [[100, 102], [130, 110], [162, 100]],
    legL: NEUTRAL.legL,
    legR: [[100, 165], [112, 206], [122, 246]],
    handR: "open",
    headTilt: 4,
  },
  // les deux bras levés (célébration)
  {
    armL: [[100, 102], [68, 92], [50, 42]],
    armR: [[100, 102], [132, 92], [150, 42]],
    legL: [[100, 165], [86, 208], [80, 248]],
    legR: [[100, 165], [114, 208], [120, 248]],
    handL: "open",
    handR: "open",
  },
  // réfléchit, poing au menton
  {
    armL: [[100, 102], [86, 132], [92, 155]],
    armR: [[100, 102], [120, 88], [106, 70]],
    legL: NEUTRAL.legL,
    legR: NEUTRAL.legR,
    headTilt: 8,
  },
  // poings sur les hanches
  {
    armL: [[100, 102], [76, 122], [90, 140]],
    armR: [[100, 102], [124, 122], [110, 140]],
    legL: NEUTRAL.legL,
    legR: NEUTRAL.legR,
    headTilt: -4,
  },
  // salue de la main
  {
    armL: NEUTRAL.armL,
    armR: [[100, 102], [134, 86], [142, 48]],
    legL: NEUTRAL.legL,
    legR: NEUTRAL.legR,
    handR: "open",
    headTilt: 6,
  },
  // saut d'enthousiasme, genoux fléchis
  {
    armL: [[100, 102], [70, 94], [52, 58]],
    armR: [[100, 102], [130, 94], [148, 58]],
    legL: [[100, 165], [84, 194], [72, 222]],
    legR: [[100, 165], [116, 194], [128, 222]],
    handL: "open",
    handR: "open",
    headTilt: -5,
  },
  // présente des deux mains, paumes ouvertes
  {
    armL: [[100, 102], [72, 116], [46, 104]],
    armR: [[100, 102], [128, 116], [154, 104]],
    legL: NEUTRAL.legL,
    legR: NEUTRAL.legR,
    handL: "open",
    handR: "open",
  },
  // mains jointes devant (respect)
  {
    armL: [[100, 102], [86, 128], [100, 142]],
    armR: [[100, 102], [114, 128], [100, 142]],
    legL: NEUTRAL.legL,
    legR: NEUTRAL.legR,
    headTilt: 5,
  },
  // s'incline
  {
    armL: [[100, 102], [90, 134], [104, 152]],
    armR: [[100, 102], [110, 134], [122, 154]],
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
  | "surprised"
  | "determined";

export const EXPRESSIONS: Expression[] = [
  "happy",
  "grin",
  "wink",
  "calm",
  "surprised",
  "determined",
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

const INK = "#0d0d0d";
const PAPER = "#ffffff";
const LINE = 8;

/** Main au bout d'un bras : poing, doigt pointé ou paume ouverte */
const HandShape: React.FC<{ limb: Limb; kind: Hand }> = ({ limb, kind }) => {
  const [, elbow, hand] = limb;
  const dx = hand[0] - elbow[0];
  const dy = hand[1] - elbow[1];
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;

  if (kind === "point") {
    // Index tendu dans le prolongement de l'avant-bras
    return (
      <>
        <circle cx={hand[0]} cy={hand[1]} r={6} fill={PAPER} stroke={INK} strokeWidth={4.5} />
        <line
          x1={hand[0] + ux * 4}
          y1={hand[1] + uy * 4}
          x2={hand[0] + ux * 17}
          y2={hand[1] + uy * 17}
          stroke={INK}
          strokeWidth={5}
          strokeLinecap="round"
        />
      </>
    );
  }
  if (kind === "open") {
    // Paume ouverte : trois petits doigts en éventail
    const px = -uy;
    const py = ux;
    return (
      <>
        <circle cx={hand[0]} cy={hand[1]} r={5.5} fill={PAPER} stroke={INK} strokeWidth={4.5} />
        {[-1, 0, 1].map((k) => (
          <line
            key={k}
            x1={hand[0]}
            y1={hand[1]}
            x2={hand[0] + (ux + px * k * 0.55) * 11}
            y2={hand[1] + (uy + py * k * 0.55) * 11}
            stroke={INK}
            strokeWidth={4}
            strokeLinecap="round"
          />
        ))}
      </>
    );
  }
  // Poing serré (comme sur le dessin de référence)
  return <circle cx={hand[0]} cy={hand[1]} r={6.5} fill={PAPER} stroke={INK} strokeWidth={5} />;
};

/** Visage expressif : sourcils, yeux avec pupilles, bouche */
const Face: React.FC<{ expression: Expression; talk: number }> = ({
  expression,
  talk,
}) => {
  // Yeux : deux ellipses blanches cerclées de noir, pupilles vers le texte
  const eyeL: Pt = [90, 42];
  const eyeR: Pt = [108, 42];
  const pupilShift = 3;

  const brows = (() => {
    switch (expression) {
      case "determined": // sourcils froncés, comme sur le dessin
        return (
          <>
            <line x1={81} y1={29} x2={95} y2={34} stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
            <line x1={103} y1={34} x2={117} y2={27} stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
          </>
        );
      case "surprised": // sourcils très hauts
        return (
          <>
            <path d="M 82 24 Q 90 19 98 24" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />
            <path d="M 102 24 Q 110 19 118 24" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />
          </>
        );
      case "wink":
        return (
          <>
            <path d="M 83 28 Q 90 24 97 28" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />
            <line x1={103} y1={30} x2={115} y2={28} stroke={INK} strokeWidth={4} strokeLinecap="round" />
          </>
        );
      default:
        return (
          <>
            <path d="M 83 29 Q 90 25 97 29" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />
            <path d="M 103 29 Q 110 25 117 29" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />
          </>
        );
    }
  })();

  const eyes =
    expression === "wink" ? (
      <>
        <ellipse cx={eyeL[0]} cy={eyeL[1]} rx={6.5} ry={8} fill={PAPER} stroke={INK} strokeWidth={3} />
        <circle cx={eyeL[0] + pupilShift} cy={eyeL[1]} r={2.8} fill={INK} />
        <line x1={102} y1={42} x2={114} y2={42} stroke={INK} strokeWidth={4} strokeLinecap="round" />
      </>
    ) : (
      <>
        <ellipse cx={eyeL[0]} cy={eyeL[1]} rx={6.5} ry={expression === "surprised" ? 9.5 : 8} fill={PAPER} stroke={INK} strokeWidth={3} />
        <ellipse cx={eyeR[0]} cy={eyeR[1]} rx={6.5} ry={expression === "surprised" ? 9.5 : 8} fill={PAPER} stroke={INK} strokeWidth={3} />
        <circle cx={eyeL[0] + pupilShift} cy={eyeL[1]} r={2.8} fill={INK} />
        <circle cx={eyeR[0] + pupilShift} cy={eyeR[1]} r={2.8} fill={INK} />
      </>
    );

  // Bouche : ouverte et animée quand il parle (intérieur noir, comme
  // le dessin), sinon selon l'expression, décalée sur le côté
  const mouth =
    talk > 0.05 ? (
      <ellipse cx={105} cy={62} rx={6.5} ry={2.5 + 5.5 * talk} fill={INK} />
    ) : expression === "grin" ? (
      <path d="M 92 58 Q 104 72 116 56 Q 105 62 92 58 Z" fill={INK} />
    ) : expression === "surprised" ? (
      <ellipse cx={104} cy={63} rx={5} ry={6.5} fill={INK} />
    ) : expression === "determined" ? (
      <path d="M 94 62 Q 104 58 113 63" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />
    ) : (
      <path d="M 93 59 Q 104 68 114 58" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />
    );

  return (
    <>
      {brows}
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
          <rect x={80} y={-18} width={40} height={32} fill={INK} stroke={INK} strokeWidth={3} />
          <line x1={68} y1={16} x2={132} y2={16} stroke={INK} strokeWidth={6} strokeLinecap="round" />
        </>
      );
    case "cap":
      return (
        <>
          <path d="M 74 22 A 26 26 0 0 1 126 22 Z" fill={INK} />
          <line x1={100} y1={21} x2={144} y2={21} stroke={INK} strokeWidth={6} strokeLinecap="round" />
        </>
      );
    case "beanie":
      return (
        <>
          <path d="M 74 24 A 26 26 0 0 1 126 24 Z" fill={INK} />
          <circle cx={100} cy={-6} r={6} fill={PAPER} stroke={INK} strokeWidth={3.5} />
        </>
      );
    case "bowler":
      return (
        <>
          <path d="M 78 18 A 22 22 0 0 1 122 18 Z" fill={INK} />
          <line x1={70} y1={19} x2={130} y2={19} stroke={INK} strokeWidth={6} strokeLinecap="round" />
        </>
      );
  }
};

const Neckwear: React.FC<{ neck: NonNullable<Outfit["neck"]> }> = ({ neck }) => {
  switch (neck) {
    case "bowtie":
      return (
        <>
          <path d="M 100 88 L 85 80 L 85 96 Z" fill={INK} />
          <path d="M 100 88 L 115 80 L 115 96 Z" fill={INK} />
        </>
      );
    case "scarf":
      return (
        <>
          <line x1={87} y1={86} x2={113} y2={86} stroke={INK} strokeWidth={10} strokeLinecap="round" />
          <line x1={92} y1={90} x2={87} y2={116} stroke={INK} strokeWidth={9} strokeLinecap="round" />
        </>
      );
    case "tie":
      return <path d="M 100 86 L 93 96 L 100 126 L 107 96 Z" fill={INK} />;
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
  const handL: Hand = t > 0.4 ? pose.handL ?? "fist" : "fist";
  const handR: Hand = t > 0.4 ? pose.handR ?? "fist" : "fist";

  return (
    <div style={{ position: "relative", width, lineHeight: 0 }}>
      {bubbleText && bubbleIn > 0.01 ? (
        <div
          style={{
            position: "absolute",
            top: -Math.round(width * 0.14),
            [flip ? "right" : "left"]: "74%",
            transform: `scale(${bubbleIn})`,
            transformOrigin: flip ? "bottom right" : "bottom left",
            opacity: bubbleIn,
            background: PAPER,
            border: `3.5px solid ${INK}`,
            borderRadius: 16,
            padding: `${Math.round(width * 0.045)}px ${Math.round(width * 0.09)}px`,
            fontFamily: theme.fonts.heading,
            fontWeight: 800,
            fontSize: Math.round(width * 0.11),
            color: INK,
            whiteSpace: "nowrap",
          }}
        >
          {bubbleText}
          <div
            style={{
              position: "absolute",
              bottom: -9,
              [flip ? "right" : "left"]: 14,
              width: 14,
              height: 14,
              background: PAPER,
              borderRight: `3.5px solid ${INK}`,
              borderBottom: `3.5px solid ${INK}`,
              transform: "rotate(45deg)",
            }}
          />
        </div>
      ) : null}

      <svg
        viewBox="0 -25 200 305"
        style={{ width: "100%", transform: flip ? "scaleX(-1)" : undefined }}
      >
        {/* ombre au sol */}
        <ellipse cx={100} cy={262} rx={52} ry={8} fill="rgba(0,0,0,0.15)" />

        <g transform={`rotate(${lean} 100 165)`}>
          {/* jambes, tronc, bras */}
          <polyline points={limbPoints(legL)} fill="none" stroke={INK} strokeWidth={LINE} strokeLinecap="round" strokeLinejoin="round" />
          <polyline points={limbPoints(legR)} fill="none" stroke={INK} strokeWidth={LINE} strokeLinecap="round" strokeLinejoin="round" />
          {/* pieds */}
          <ellipse cx={legL[2][0] - 5} cy={legL[2][1] + 2} rx={10} ry={5} fill={PAPER} stroke={INK} strokeWidth={4} />
          <ellipse cx={legR[2][0] + 5} cy={legR[2][1] + 2} rx={10} ry={5} fill={PAPER} stroke={INK} strokeWidth={4} />
          <line x1={100} y1={80} x2={100} y2={165} stroke={INK} strokeWidth={LINE} strokeLinecap="round" />
          <polyline points={limbPoints(armL)} fill="none" stroke={INK} strokeWidth={LINE} strokeLinecap="round" strokeLinejoin="round" />
          <polyline points={limbPoints(armR)} fill="none" stroke={INK} strokeWidth={LINE} strokeLinecap="round" strokeLinejoin="round" />
          <HandShape limb={armL} kind={handL} />
          <HandShape limb={armR} kind={handR} />

          {/* grosse tête ronde blanche cerclée de noir */}
          <g transform={`rotate(${headTilt} 100 48)`}>
            <circle cx={100} cy={48} r={34} fill={PAPER} stroke={INK} strokeWidth={6} />
            <Face expression={expression} talk={talk} />
            {outfit.glasses ? (
              <>
                <circle cx={90} cy={42} r={10.5} fill="none" stroke={INK} strokeWidth={3} />
                <circle cx={108} cy={42} r={10.5} fill="none" stroke={INK} strokeWidth={3} />
                <line x1={100} y1={42} x2={98} y2={42} stroke={INK} strokeWidth={3} />
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
