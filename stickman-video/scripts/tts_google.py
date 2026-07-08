#!/usr/bin/env python3
"""Free Arabic TTS + word-level timing via Google Translate TTS.

Fallback pipeline for environments where paid TTS and Whisper are
unavailable. Each clause (3-8 words) is synthesized as a separate MP3, so
clause boundaries are exact; word timings inside a clause are distributed
proportionally to word length.

Usage: python3 scripts/tts_google.py content/my-video.json

Env: TTS_PITCH_SEMITONES=-4  lowers the pitch (male voice) via rubberband,
duration is preserved so all word timings stay exact.

Input JSON: {"lang": "ar", "scenes": [{"id": "scene-01", "clauses": ["...", "..."]}]}
Outputs:
  public/audio.mp3        — full narration
  src/data/words.json     — [{text, start, end}] seconds
  content/<name>.timing.json — per-scene {id, start, end} for video.json
"""
import json
import os
import subprocess
import sys
import time
import urllib.parse
import urllib.request

LEAD_S = 0.4          # silence before the first clause
CLAUSE_GAP_S = 0.22   # pause between clauses of the same scene
SCENE_GAP_S = 0.55    # pause between scenes
TAIL_S = 1.0          # silence after the last clause
EDGE_TRIM_S = 0.10    # TTS clips carry ~this much silence at each edge

content_path = sys.argv[1]
with open(content_path, encoding="utf-8") as f:
    content = json.load(f)
lang = content.get("lang", "ar")

tmp = os.path.join(os.path.dirname(content_path) or ".", ".tts-tmp")
os.makedirs(tmp, exist_ok=True)


def tts(text, path):
    url = (
        "https://translate.googleapis.com/translate_tts?ie=UTF-8&client=gtx"
        f"&tl={lang}&q={urllib.parse.quote(text)}"
    )
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req) as r, open(path, "wb") as out:
        out.write(r.read())


def duration(path):
    out = subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "csv=p=0", path]
    )
    return float(out.strip())


words = []
scene_times = []
clips = []  # (kind, value): ("silence", secs) | ("file", path)
t = LEAD_S
clips.append(("silence", LEAD_S))
n = 0

for si, scene in enumerate(content["scenes"]):
    if si > 0:
        clips.append(("silence", SCENE_GAP_S))
        t += SCENE_GAP_S
    scene_start = t
    for ci, clause in enumerate(scene["clauses"]):
        if ci > 0:
            clips.append(("silence", CLAUSE_GAP_S))
            t += CLAUSE_GAP_S
        n += 1
        path = os.path.join(tmp, f"c{n:03d}.mp3")
        tts(clause, path)
        time.sleep(0.35)  # be polite to the endpoint
        d = duration(path)
        clips.append(("file", path))
        # distribute the clause window across its words by length
        speech_start = t + EDGE_TRIM_S
        speech_dur = max(0.2, d - 2 * EDGE_TRIM_S)
        ws = clause.split()
        weights = [len(w) + 1.4 for w in ws]
        total = sum(weights)
        cur = speech_start
        for w, wt in zip(ws, weights):
            wd = speech_dur * wt / total
            words.append({"text": w, "start": round(cur, 3),
                          "end": round(cur + wd, 3)})
            cur += wd
        t += d
        print(f"  {scene['id']} clause {ci + 1}: {d:.2f}s  «{clause}»")
    scene_times.append({"id": scene["id"], "start": round(scene_start, 3),
                        "end": round(t, 3)})

clips.append(("silence", TAIL_S))
t += TAIL_S

# stitch: render silences as real files, then concat everything
concat_list = os.path.join(tmp, "list.txt")
with open(concat_list, "w") as f:
    for i, (kind, val) in enumerate(clips):
        if kind == "silence":
            sp = os.path.join(tmp, f"s{i:03d}.mp3")
            subprocess.run(
                ["ffmpeg", "-y", "-v", "error", "-f", "lavfi",
                 "-i", "anullsrc=r=24000:cl=mono", "-t", str(val),
                 "-c:a", "libmp3lame", "-b:a", "64k", sp], check=True)
            f.write(f"file '{os.path.abspath(sp)}'\n")
        else:
            f.write(f"file '{os.path.abspath(val)}'\n")

pitch_semitones = float(os.environ.get("TTS_PITCH_SEMITONES", "0"))
audio_filters = []
if pitch_semitones:
    ratio = 2 ** (pitch_semitones / 12)
    audio_filters += ["-af", f"rubberband=pitch={ratio:.6f}"]
subprocess.run(
    ["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0",
     "-i", concat_list, *audio_filters, "-c:a", "libmp3lame", "-b:a", "128k",
     "-ar", "24000", "public/audio.mp3"], check=True)

with open("src/data/words.json", "w", encoding="utf-8") as f:
    json.dump(words, f, ensure_ascii=False, indent=2)
timing_path = content_path.rsplit(".json", 1)[0] + ".timing.json"
with open(timing_path, "w", encoding="utf-8") as f:
    json.dump(scene_times, f, ensure_ascii=False, indent=2)

print(f"\naudio: public/audio.mp3 ({t:.1f}s)")
print(f"words: src/data/words.json ({len(words)} words)")
print(f"scene timing: {timing_path}")
