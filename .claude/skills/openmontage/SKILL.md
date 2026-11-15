---
name: openmontage
description: "Produce a video with OpenMontage, the open-source agentic video production system (github.com/calesthio/OpenMontage): explainers, cinematic trailers, documentary montages, clip factories, talking heads, animation, localization and dubbing. Use when the user asks to make a video with OpenMontage, or wants a full production pipeline (research, script, assets, edit, compose) rather than the hand-built HTML compositions in brand/video-*."
---

# OpenMontage

OpenMontage is a separate project (about 165 MB, AGPL-3.0 license), so it is **not copied into this repository**. Clone it next to the repo and work inside that clone.

## Setup (once per machine or session)
```bash
git clone https://github.com/calesthio/OpenMontage.git ~/OpenMontage
```
```bash
cd ~/OpenMontage && make setup
```
- Needs Python 3.10+, FFmpeg and Node.js 22.23.4+ (or 24.22.1+ / 26.12.1+).
- Tested against commit `fecb9a1`.
- Its provider keys (image/video/voice generators) go in its own config, never in this repo.

## Use
1. Read `~/OpenMontage/AGENT_GUIDE.md` first. It is the agent contract: onboarding, the reference-video entry point, and Rule Zero.
2. Pick a pipeline from `~/OpenMontage/skills/pipelines/` (for example `cinematic`, `explainer`, `clip-factory`, `documentary-montage`) and follow its director files in order.
3. Write outputs into `~/OpenMontage`, then copy only the finished MP4 (and its README) into `brand/video-<name>/` in this repo.

## Rules for Munasabati videos
- Arabic text and Saudi dialect captions. Check that letters join and nothing overflows the 9:16 frame.
- Final encode must play on phones: H.264 Main 4.1, about 7 Mbps, AAC 48 kHz, `-movflags +faststart`.
- Label AI-generated footage and fictional stories on screen ("قصة تمثيلية · مشاهد مولّدة بالذكاء الاصطناعي").
- Don't fabricate testimonials, real customers, prices or platform features.
- Respect the AGPL: don't copy OpenMontage source code into this repo or into the platform apps.
