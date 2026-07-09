/**
 * Génère public/captions.json à partir de la voix de la vidéo.
 *
 * Usage :
 *   1. Placez la piste audio de votre vidéo dans public/audio.mp3
 *      (ou audio.wav / audio.m4a)
 *   2. npm run captions
 *
 * Le script :
 *   - installe whisper.cpp localement (dossier .whisper/, ignoré par git)
 *   - télécharge le modèle de transcription (une seule fois)
 *   - convertit l'audio en WAV 16 kHz avec le ffmpeg fourni par Remotion
 *   - transcrit avec des timestamps AU MOT PRÈS
 *   - écrit public/captions.json, lu automatiquement par la composition
 *
 * Options (variables d'environnement) :
 *   WHISPER_MODEL    modèle whisper (tiny|base|small|medium|large-v3),
 *                    défaut : "medium" (le plus précis pour le français)
 *   WHISPER_LANG     langue de l'audio, défaut : "fr"
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  downloadWhisperModel,
  installWhisperCpp,
  toCaptions,
  transcribe,
} from "@remotion/install-whisper-cpp";

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, "public");
const WHISPER_DIR = path.join(ROOT, ".whisper");
const WHISPER_VERSION = "1.5.5";
const MODEL = process.env.WHISPER_MODEL ?? "medium";
const LANGUAGE = process.env.WHISPER_LANG ?? "fr";

const audioCandidates = ["audio.mp3", "audio.wav", "audio.m4a"].map((f) =>
  path.join(PUBLIC_DIR, f),
);
const audioFile = audioCandidates.find((f) => existsSync(f));

if (!audioFile) {
  console.error(
    [
      "❌ Aucun fichier audio trouvé.",
      "",
      "Placez la piste audio de votre vidéo (la voix originale) dans :",
      "  public/audio.mp3  (ou audio.wav / audio.m4a)",
      "",
      "Puis relancez : npm run captions",
    ].join("\n"),
  );
  process.exit(1);
}

console.log(`🎙  Audio détecté : ${path.relative(ROOT, audioFile)}`);

// 1. Installer whisper.cpp + modèle (idempotent, mis en cache dans .whisper/)
console.log(`⬇️  Installation de whisper.cpp ${WHISPER_VERSION}…`);
await installWhisperCpp({ to: WHISPER_DIR, version: WHISPER_VERSION });

console.log(`⬇️  Téléchargement du modèle "${MODEL}" (une seule fois)…`);
await downloadWhisperModel({ model: MODEL, folder: WHISPER_DIR });

// 2. Convertir l'audio en WAV 16 kHz mono (format requis par whisper.cpp)
const wav16 = path.join(WHISPER_DIR, "audio-16khz.wav");
mkdirSync(WHISPER_DIR, { recursive: true });
console.log("🔄 Conversion de l'audio en WAV 16 kHz…");
execSync(
  `npx remotion ffmpeg -hide_banner -loglevel error -y -i "${audioFile}" -ar 16000 -ac 1 "${wav16}"`,
  { stdio: "inherit" },
);

// 3. Transcrire avec timestamps au mot près
console.log(`📝 Transcription (langue : ${LANGUAGE})… cela peut prendre quelques minutes.`);
const whisperOutput = await transcribe({
  inputPath: wav16,
  whisperPath: WHISPER_DIR,
  whisperCppVersion: WHISPER_VERSION,
  model: MODEL,
  tokenLevelTimestamps: true,
  language: LANGUAGE,
});

// 4. Convertir au format Caption de @remotion/captions et sauvegarder
const { captions } = toCaptions({ whisperCppOutput: whisperOutput });
const outFile = path.join(PUBLIC_DIR, "captions.json");
writeFileSync(outFile, JSON.stringify(captions, null, 2));

console.log(
  `✅ ${captions.length} segments écrits dans ${path.relative(ROOT, outFile)}`,
);
console.log("👉 Lancez maintenant : npm run video:studio");
