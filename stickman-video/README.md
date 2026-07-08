# Stickman Video

Remotion project that produces stickman doodle videos in the style of the
reference: paper-texture background, one consistent hand-drawn stickman
character, Arabic voiceover, and **word-by-word captions synced exactly to
the audio** (Baloo Bhaijaan 2 font, Amiri for Quran verse cards).

Driven by the Claude Code skill in `.claude/skills/stickman-video/` — ask
Claude for a stickman video on any topic and it runs the whole pipeline:
script → AI images → AI voiceover → Whisper word timestamps → render.

## Manual usage

```bash
npm install
npm run studio                          # live preview
npm run transcribe -- public/audio.mp3  # word timestamps -> src/data/words.json
npm run render                          # 16:9 -> out/video.mp4
npm run render:short                    # 9:16 -> out/short.mp4
```

Edit `src/data/video.json` (scenes, audio, quote cards) and
`src/data/words.json` (word timings). Assets live in `public/`.
