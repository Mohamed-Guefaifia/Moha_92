/**
 * Contenu éditorial de la vidéo.
 *
 * - `title` / `subtitle` : affichés dans l'intro animée.
 * - `chapters` : cartes de chapitre affichées à des moments précis
 *   (en millisecondes depuis le début de l'audio).
 *
 * Adaptez ces valeurs au contenu de votre vidéo. Les sous-titres, eux,
 * sont générés automatiquement depuis l'audio (voir scripts/generate-captions.mjs)
 * et n'ont pas besoin d'être édités ici.
 */
export type Chapter = {
  /** Moment d'apparition, en ms depuis le début */
  startMs: number;
  /** Durée d'affichage de la carte, en ms */
  durationMs: number;
  title: string;
  subtitle?: string;
};

export const videoContent = {
  title: "Mon titre de vidéo",
  subtitle: "Remplacez ce texte dans remotion/content.ts",
  /** Durée de l'écran d'intro, en ms */
  introDurationMs: 2600,
  chapters: [
    {
      startMs: 4000,
      durationMs: 3000,
      title: "Chapitre 1",
      subtitle: "Ajoutez vos propres chapitres",
    },
  ] satisfies Chapter[],
};
