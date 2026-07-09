/**
 * Design system de la vidéo — « notre style ».
 * Modifiez ce fichier pour adapter les couleurs, polices et le branding :
 * tout le rendu (fonds, titres, sous-titres) se met à jour automatiquement.
 */
export const theme = {
  colors: {
    // Fond principal (dégradé profond)
    backgroundTop: "#0b0f19",
    backgroundBottom: "#111827",
    // Blobs lumineux animés en arrière-plan
    glowPrimary: "#6c5ce7",
    glowSecondary: "#00d2ff",
    glowTertiary: "#ff6b9d",
    // Texte
    text: "#f8fafc",
    textMuted: "#94a3b8",
    // Sous-titres
    captionText: "#ffffff",
    captionActiveWord: "#ffc53d",
    captionBackground: "rgba(10, 13, 22, 0.72)",
    // Accents (titres de chapitres, barre de progression)
    accent: "#6c5ce7",
    accentSoft: "rgba(108, 92, 231, 0.35)",
  },
  fonts: {
    // Piles de polices système : aucun téléchargement requis au rendu.
    // Remplacez par vos polices locales via @remotion/fonts si besoin.
    heading:
      "'Poppins', 'Montserrat', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
    body: "'Inter', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
    captions:
      "'Poppins', 'Montserrat', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
  },
  branding: {
    // Nom affiché dans le coin de la vidéo (watermark). Mettre "" pour masquer.
    watermark: "MOHA",
  },
  captions: {
    // Nombre max de millisecondes pour regrouper les mots sur une même "page"
    combineTokensWithinMilliseconds: 1200,
    fontSizeLandscape: 58,
    fontSizePortrait: 68,
    // Distance depuis le bas de l'écran
    bottomOffsetLandscape: 90,
    bottomOffsetPortrait: 340,
  },
} as const;

export type Theme = typeof theme;
