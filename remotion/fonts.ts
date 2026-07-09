import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

/**
 * Polices embarquées localement (public/fonts/) : aucun téléchargement
 * au moment du rendu, résultat identique sur toutes les machines.
 * - Amiri : calligraphie arabe (Asma'ul Husna)
 * - Poppins : titres et sous-titres
 * - Inter : textes secondaires
 */
export const loadFonts = (): Promise<unknown> => {
  return Promise.all([
    loadFont({
      family: "Amiri",
      url: staticFile("fonts/amiri-arabic-400-normal.woff2"),
      weight: "400",
    }),
    loadFont({
      family: "Amiri",
      url: staticFile("fonts/amiri-arabic-700-normal.woff2"),
      weight: "700",
    }),
    loadFont({
      family: "Amiri Latin",
      url: staticFile("fonts/amiri-latin-400-normal.woff2"),
      weight: "400",
    }),
    loadFont({
      family: "Amiri Latin",
      url: staticFile("fonts/amiri-latin-700-normal.woff2"),
      weight: "700",
    }),
    loadFont({
      family: "Poppins",
      url: staticFile("fonts/poppins-latin-500-normal.woff2"),
      weight: "500",
    }),
    loadFont({
      family: "Poppins",
      url: staticFile("fonts/poppins-latin-600-normal.woff2"),
      weight: "600",
    }),
    loadFont({
      family: "Poppins",
      url: staticFile("fonts/poppins-latin-800-normal.woff2"),
      weight: "800",
    }),
    loadFont({
      family: "Inter",
      url: staticFile("fonts/inter-latin-400-normal.woff2"),
      weight: "400",
    }),
    loadFont({
      family: "Inter",
      url: staticFile("fonts/inter-latin-500-normal.woff2"),
      weight: "500",
    }),
  ]);
};
