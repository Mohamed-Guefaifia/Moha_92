---
name: stickman-video
description: إنشاء فيديو "رجل العيدان" (stickman doodle) بأسلوب الرسم على الورق، مع تعليق صوتي وترجمة كلمة-بكلمة متزامنة تماماً مع الصوت. Use when the user asks for a stickman / stick figure video, "فيديو ستيك مان", a whiteboard-doodle story video, or a video with word-by-word synced Arabic captions. Uses the Remotion project in stickman-video/.
---

# Stickman Video Creator

Produce a professional stickman doodle video (paper texture background, one
consistent hand-drawn stickman character, AI voiceover, word-by-word synced
captions in Baloo Bhaijaan 2) using the Remotion project in `stickman-video/`.

## Inputs to collect from the user

1. **Topic or full script** (Arabic by default). If only a topic is given,
   write the script yourself using the methodology below.
2. **Format(s)**: `Video` (1920×1080, 16:9) and/or `Short` (1080×1920, 9:16).
   Default: both if unspecified for short content, 16:9 for long content.
3. Optional: an audio file (skip TTS), pre-made images (skip image
   generation), Quran verses / hadiths to display as quote cards.

## Step 1 — Script and scene breakdown

Structure: clear **hook** → **problem/explanation** → **takeaway**.
Divide the narration into scenes of ~6 seconds each (a ~59s video ≈ 10
scenes; scale proportionally for longer videos). For each scene write:

- **Voiceover**: 1–2 short, conversational sentences.
- **Image prompt**: one paragraph starting with *"Use the same stickman
  character as before."* describing pose, action, facial expression, at
  least one prop (table, chair, clock, phone, book…), plain white background.
- **Optional quote card** instead of an image for Quran verses (`ornate`
  variant) or hadiths (`note` variant).

Show the full script to the user for approval before generating assets.

## Step 2 — The character (FIXED — never redesign it)

The user's official character is the reference image at
`stickman-video/public/character/reference.png`. It must look EXACTLY the
same in every scene of every video. Its description:

> Cartoon stickman with a large round white head outlined with a thick black
> line, two big oval white eyes with black pupils, expressive black
> eyebrows, a small confident smile, a solid black stick body with thick
> rounded limbs, simple black rounded hands and flat black feet, a soft grey
> shadow on the ground beneath him, clean white background, modern flat
> vector cartoon style with bold clean lines.

Rules for every scene image:

1. **Always pass the reference image** to the image tool as a
   character/image reference (image-to-image) when the tool supports it —
   this is the preferred way to keep the character identical.
2. Always start the text prompt with the base description above, then
   `Use the same stickman character as before.` + pose, action, facial
   expression, at least one prop + the aspect ratio (16:9 or 9:16).
3. Props: simple flat objects with black outlines and light grey fill
   (like the boxes in the reference image).
4. Only pose, expression and props may change — never the face, the head
   shape, the line style or the proportions.

## Step 3 — Generate the scene images

Use the image-generation MCP tools available in the session (run `ToolSearch`
with "generate image" — e.g. Higgsfield), with
`public/character/reference.png` as the character reference (Step 2).
**Free fallback (no credits / no image MCP):** hand-draw each scene as an
SVG in the character's exact style — copy the anatomy from
`public/scenes/munafiqin/*.svg` (head r≈66 stroke 8, big oval eyes with
pupils, expressive brows, body stroke 16, limbs 13-14, grey props
`#a8a8a8`, ground-shadow ellipse) and only change pose/expression/props.
Render a still of every scene to check it before the final render.
Generate one image per scene at the target aspect ratio and save them as
`stickman-video/public/scenes/scene-01.png`, `scene-02.png`, … White
backgrounds are fine: the composition uses `mix-blend-mode: multiply` so
white melts into the paper texture.
**View every generated image next to the reference** and regenerate any
scene where the face, proportions or line style drift off-model.

## Step 4 — Generate the voiceover

Use the TTS MCP tools available in the session (run `ToolSearch` with
"voiceover" — e.g. `vidiq_voiceover_generate`) with an Arabic voice, or use
the user's provided audio. Save as `stickman-video/public/audio.mp3`.

**Free fallback (no credits / no MCP TTS):** write the script as clauses in
`content/<name>.json` (see `content/sifat-almunafiqin.json`) and run
`python3 scripts/tts_google.py content/<name>.json`. It synthesizes each
clause via Google Translate TTS, stitches `public/audio.mp3`, and writes
**exact word timings** to `src/data/words.json` plus per-scene times to
`content/<name>.timing.json` — steps 5 and most of 6 are then already done.

## Step 5 — Word-level timestamps

```bash
cd stickman-video
npm install          # first time only
npm run transcribe -- public/audio.mp3 ar
```

This writes `src/data/words.json`. **Then proofread it**: compare every
`text` against the original script and fix any mis-transcribed word while
keeping the timings (Whisper timing is accurate; its Arabic spelling is not
always). Merge/split entries if Whisper split a word oddly. This step is what
makes the captions match the audio exactly — do not skip it.

## Step 6 — Assemble `src/data/video.json`

```json
{
  "audio": "audio.mp3",
  "scenes": [
    {"type": "image", "src": "scenes/scene-01.png", "start": 0, "end": 6.2},
    {"type": "quote", "variant": "ornate", "title": "سُورَةُ ...", "start": 6.2, "end": 12.0,
     "segments": [{"text": "…", "highlight": true}, {"text": " …"}]}
  ]
}
```

- Times are in **seconds**. Align each scene's `start` to the `start` of the
  first word of that scene's narration (from `words.json`); `end` = next
  scene's `start`. The last scene ends at the audio duration.
- `quote` variants: `ornate` (Quran verse, gold frame + yellow highlight,
  Amiri font) or `note` (hadith, taped paper note + teal highlight).

## Step 7 — Render and verify

```bash
npx remotion render Video out/video.mp4        # 16:9
npx remotion render Short out/short.mp4        # 9:16 (if requested)
```

Before the full render, spot-check stills at a few timestamps:
`npx remotion still Video out/check.png --frame=120`. Verify: captions match
the spoken words, the character is consistent, quote cards look right.
Then send the rendered file(s) to the user.

Notes:
- If Chrome download fails at render time, point Remotion at the
  pre-installed browser: `Config.setBrowserExecutable('/opt/pw-browsers/chromium')`
  in `remotion.config.js` (or `--browser-executable`).
- `WHISPER_MODEL=small` speeds up transcription at some accuracy cost.
