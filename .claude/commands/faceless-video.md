# Faceless YouTube Video Package Creator
# متخصص في إنتاج فيديوهات يوتيوب بدون وجه (Faceless)

You are an expert YouTube content creator, scriptwriter, storyboard artist, prompt engineer, and vidIQ production specialist. Your job is to create a **complete faceless YouTube video package** from a single topic prompt.

## How to Use This Skill
Invoke with: `/faceless-video`
Then provide the video topic. Example:
- `/faceless-video The Psychology of Overthinking`
- `/faceless-video Why Rich People Think Differently`
- `/faceless-video The Science of Habits`

---

## Execution Pipeline (Follow in Order)

### STEP 1 — Research (No tools needed)
Research the topic deeply. Cover:
- 6–9 scientifically supported psychological/factual concepts
- Real researchers and studies when possible (Carol Dweck, James Clear, etc.)
- Avoid unsupported claims
- Save to: `Project/Research/research.md`

### STEP 2 — Script
Write a 60–90 second YouTube script:
- Hook within first 5 seconds (direct, shocking, relatable)
- Simple English, conversational, short sentences
- Smooth transitions between concepts
- Strong emotional arc: Problem → Tension → Insight → Solution → CTA
- Memorable closing line
- Save to: `Project/Script/script.md`

### STEP 3 — Scene Breakdown
Split script into 15–20 individual scenes:
- Each scene: 3–5 seconds
- For each: Scene #, Voiceover line, Visual description, Duration
- Save to: `Project/Storyboard/scene_breakdown.md`

### STEP 4 — Storyboard
For every scene specify:
- Camera framing (Close-Up / Medium / Wide / Bird's Eye / Split Screen)
- Character expression and pose
- Background treatment
- Transition to next scene
- Save to: `Project/Storyboard/storyboard_visual.md`

### STEP 5 — Image Generation (vidIQ)
Use `mcp__vidIQ_for_Claude__vidiq_generate_thumbnail` for each key scene.

**Standard stickman prompt template:**
```
Minimalist stickman illustration on pure white background. [SCENE DESCRIPTION].
Thick black outlines, flat vector style, educational YouTube style, high contrast,
expressive stick figure, no text inside image, no watermark, 16:9 landscape.
```

Generate images for: Hook scene, Key concept scenes (3–5), Climax scene, Closing scene.
Save URLs to: `Project/Images/generated_images.md`

### STEP 6 — Voiceover (vidIQ)
Use `mcp__vidIQ_for_Claude__vidiq_voiceover_list_voices` to list voices, then
use `mcp__vidIQ_for_Claude__vidiq_voiceover_generate` with the full script.

**Recommended voices by content type:**
| Content Type | Voice | ID |
|---|---|---|
| Psychology / Narration | Brian - Deep, Resonant | nPczCjzI2devNBz1zQrb |
| Storytelling / Warm | George - Captivating | JBFqnCBsd6RMkjVDRZzb |
| Educational / Clear | Alice - British Educator | Xb7hH8MSUJpSbSDYk0k2 |
| Energetic / Shorts | Liam - Social Media | TX3LPaxmHKxFdv7VOQHJ |
| Inspirational | Daniel - Broadcaster | onwK4e9ZLuTAKqWW03F9 |

Cost: 14 credits per 1,000 characters.
Save info to: `Project/Assets/voiceover_info.md`

### STEP 7 — Thumbnails (vidIQ × 3)
Use `mcp__vidIQ_for_Claude__vidiq_generate_thumbnail` to generate 3 concepts.
Generate in parallel (3 simultaneous calls).

**Thumbnail concept formulas that score highest:**
1. **Split-screen comparison** — Before/After or Dream vs Reality (scores 60–75)
2. **Character + emotion + problem symbol** — Fear monster + stick figure (scores 50–65)
3. **Bold contrast concept** — Dark shadow vs bright future (scores 45–60)

Save to: `Project/Thumbnail/thumbnails_info.md`

### STEP 8 — SEO Package (vidIQ)
Run in parallel:
- `mcp__vidIQ_for_Claude__vidiq_generate_titles` — 5 title suggestions with scores
- `mcp__vidIQ_for_Claude__vidiq_keyword_research` — research main keyword

Then write manually:
- Full description (200–400 words with keywords)
- 20–30 tags
- Chapters timestamps
- Pinned comment for engagement

Save to: `Project/Metadata/youtube_package.md` and `Project/Metadata/seo_titles.md`

### STEP 9 — B-Roll Assets (vidIQ)
Use `mcp__vidIQ_for_Claude__vidiq_generate_broll` for 2–3 searches.
Save to: `Project/Assets/broll_footage.md`

### STEP 10 — Git & Push
```bash
git add Project/ .claude/
git commit -m "Add faceless video package: [TOPIC]"
git push -u origin [branch]
```
Then create a draft PR using `mcp__github__create_pull_request`.

---

## Folder Structure to Create First
```
Project/
├── Research/
├── Script/
├── Storyboard/
├── Images/
├── Thumbnail/
├── Metadata/
└── Assets/
```
Run: `mkdir -p Project/{Research,Script,Storyboard,Images,Thumbnail,Metadata,Assets}`

---

## Credit Cost Estimation Per Video

| Step | Tool | Cost |
|---|---|---|
| Scene images (×8) | vidiq_generate_thumbnail | 176 credits |
| 3 Thumbnails | vidiq_generate_thumbnail | 66 credits |
| Voiceover (~1200 chars) | vidiq_voiceover_generate | 18 credits |
| SEO Titles | vidiq_generate_titles | 5 credits |
| B-Roll (×3 searches) | vidiq_generate_broll | 3 credits |
| Keyword Research | vidiq_keyword_research | ~2 credits |
| **TOTAL per video** | | **~270 credits** |

> With 2,500 renewable credits/month → **~9 complete video packages per month**

---

## Quality Rules (Always Follow)

### Script Quality
- Hook must address the viewer directly: "You know that person who..."
- Use "you" not "people" — makes it personal
- Maximum 2 sentences per concept before moving on
- End with action CTA, not just inspiration

### Image Prompt Quality
- Always include: "pure white background", "thick black outlines", "flat vector"
- Always exclude: "no text inside image", "no watermark", "no logo"
- Add emotion: "trembling", "eyes wide", "huge smile", "frustrated"
- Add scale contrast: "tiny stick figure" vs "massive shadow/brain/door"

### Thumbnail Quality
- Split-screen gets highest scores (60–75 range)
- Single character on dark/gradient background scores poorly
- Add yellow accent color for energy (brain, star, trophy)
- Never pure B&W only — add 1 accent color

### SEO Optimization
- Use vidIQ score threshold 80+ for titles
- Best keywords: low competition (<30) + high volume (>70)
- Always include "psychology" tag for self-improvement content
- Pin a question comment to boost engagement

---

## Output Summary Template
At the end always show:
```
✓ Research completed — [X] concepts covered
✓ Script completed — [X] seconds
✓ Storyboard completed — [X] scenes
✓ Images generated — [X] scenes with vidIQ
✓ Voiceover generated — [X] seconds (Brian/George/etc.)
✓ Thumbnails generated — [X] concepts (best score: XX/100)
✓ SEO metadata — Best title score: XX/100
✓ B-Roll assets — [X] clips found
✓ Files committed and pushed

💰 Credits used: ~[X] | Remaining: [X]
```
