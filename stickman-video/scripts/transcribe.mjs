// Word-level transcription of the narration with whisper.cpp.
// Usage: node scripts/transcribe.mjs public/audio.mp3 [language]
// Writes src/data/words.json ([{text, start, end}] in seconds).
// Model via WHISPER_MODEL env var (default "medium"; "small" is faster).
import {execSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  downloadWhisperModel,
  installWhisperCpp,
  transcribe,
  toCaptions,
} from '@remotion/install-whisper-cpp';

const input = process.argv[2] ?? 'public/audio.mp3';
const language = process.argv[3] ?? 'ar';
const model = process.env.WHISPER_MODEL ?? 'medium';
const whisperDir = path.join(process.cwd(), '.whisper');

if (!fs.existsSync(input)) {
  console.error(`Audio file not found: ${input}`);
  process.exit(1);
}

await installWhisperCpp({to: whisperDir, version: '1.5.5'});
await downloadWhisperModel({model, folder: whisperDir});

// whisper.cpp requires 16 kHz 16-bit mono WAV.
const wav = path.join(os.tmpdir(), `stickman-whisper-${Date.now()}.wav`);
execSync(`ffmpeg -y -v error -i "${input}" -ar 16000 -ac 1 -c:a pcm_s16le "${wav}"`);

const whisperCppOutput = await transcribe({
  inputPath: wav,
  whisperPath: whisperDir,
  model,
  language,
  tokenLevelTimestamps: true,
});
fs.unlinkSync(wav);

const {captions} = toCaptions({whisperCppOutput});
const words = captions
  .map((c) => ({
    text: c.text.trim(),
    start: Number((c.startMs / 1000).toFixed(3)),
    end: Number((c.endMs / 1000).toFixed(3)),
  }))
  .filter((w) => w.text.length > 0);

const outPath = path.join('src', 'data', 'words.json');
fs.writeFileSync(outPath, JSON.stringify(words, null, 2) + '\n');
console.log(`Wrote ${words.length} words to ${outPath}`);
console.log(
  'IMPORTANT: proofread the "text" fields against the original script (keep the timings).'
);
