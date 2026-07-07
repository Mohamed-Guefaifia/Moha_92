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

## Step 2 — Character base prompt (NEVER change it between scenes)

Every image prompt MUST begin with this base, so the character stays
identical across all scenes and all videos:

> Simple black stickman character with a perfectly round head, drawn with
> clean smooth black ink lines, hand-drawn doodle style, consistent thick
> line weight, small dot eyes and a simple curved smile, a few short hair
> strokes on top of the head, minimalist flat illustration, no shading, no
> color, plain white background.

Then append: `Use the same stickman character as before.` + the scene
description + the aspect ratio (16:9 landscape or 9:16 portrait).

## Step 3 — Generate the scene images

Use the image-generation MCP tools available in the session (run `ToolSearch`
with "generate image" — e.g. Higgsfield). Generate one image per scene at the
target aspect ratio and save them as `stickman-video/public/scenes/scene-01.png`,
`scene-02.png`, … White backgrounds are fine: the composition uses
`mix-blend-mode: multiply` so white melts into the paper texture.
View each generated image to verify the character is consistent; regenerate
any scene that drifts off-model.

## Step 4 — Generate the voiceover

Use the TTS MCP tools available in the session (run `ToolSearch` with
"voiceover" — e.g. `vidiq_voiceover_generate`) with an Arabic voice, or use
the user's provided audio. Save as `stickman-video/public/audio.mp3`.

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
