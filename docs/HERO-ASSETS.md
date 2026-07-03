# Hero Asset Generation Guide — Susee Homes

The hero is a **three-phase cinematic**, all driven by one engine
(`src/components/sections/Hero.tsx` + `useFrameSequence.ts`):

| Phase | Behaviour | Asset |
| --- | --- | --- |
| 1 · Intro | Plays by itself once per session (auto-tour; any input cancels) | First ~half of the frame sequence |
| 2 · Tour | User's scroll scrubs the camera through the community | Second half of the frame sequence |
| 3 · Finale | Camera rests at the fountain; water loops endlessly | `public/images/fountain-loop.mp4` (seamless loop) |

The currently shipped assets are **placeholders** derived from the client's
720p render. This guide is the spec for regenerating them properly with
Higgsfield Pro (keyframes KF1 and KF2 already exist — empty land + plotted
layout, both approved).

---

## 1. The five keyframes (Soul / Nano Banana, 16:9, max quality)

Camera descends across the story: aerial → mid-air → street → fountain.
Derive each keyframe **from the previous one** (image-to-image, strength
0.35–0.55) so geometry and light never drift.

- **KF1 — aerial empty land** ✅ done
- **KF2 — aerial plotted layout** ✅ done (grid roads, park right, gate center)

**KF3 — construction, camera lower** (derive from KF2):
> Same plotted layout seen from a lower drone altitude, camera moved closer
> toward the entrance gate side: individual villa homes under construction on
> many plots — brick walls, concrete columns, scaffolding, stacked materials,
> a few finished white-and-terracotta villas near the park, small trucks on
> the internal roads. Same light, same layout geometry. Photorealistic drone
> photography. No text, no high-rise buildings.

**KF4 — street-level avenue** (derive from KF3):
> Eye-level view standing on the main internal avenue of the finished
> community: elegant low-rise villas with white walls and terracotta roofs on
> both sides, tree-lined street with warm street lamps, the landscaped
> central park visible ahead at the end of the avenue, golden-hour light.
> Photorealistic architectural photography. No people, no text.

**KF5 — the fountain** (derive from KF4):
> Standing in the central park facing a beautiful circular stone fountain
> with multiple tiers, water arcing and flowing, surrounded by landscaped
> lawns and flowering shrubs, villas of the community softly visible behind
> the trees, warm golden-hour glow, gentle mist from the water.
> Photorealistic architectural photography, premium and serene. No people,
> no text.

Reject any keyframe where the road grid moves, towers appear, or the light
direction flips.

## 2. The four motion clips (Kling, **General preset**, start+end frame)

| Clip | Start → End | Length | Prompt |
| --- | --- | --- | --- |
| A | KF1 → KF2 | 5 s | Aerial timelapse, camera slowly drifting forward: surveying and road construction transforms the empty field into a plotted layout, roads appearing progressively. Smooth, no cuts, photorealistic. |
| B | KF2 → KF3 | 5–10 s | Camera slowly descends toward the entrance while villa homes rise plot by plot in construction timelapse — foundations, walls, roofs completing. Smooth continuous motion, no cuts, photorealistic. |
| C | KF3 → KF4 | 5–10 s | Camera descends to street level and glides forward down the main avenue as the last houses complete around it, trees leafing in, street lamps lighting up. Smooth dolly motion, no cuts, photorealistic. |
| D | KF4 → KF5 | 5 s | Camera glides forward along the avenue into the central park and comes to rest facing the fountain as its water begins to flow. Smooth dolly, gentle deceleration at the end, no cuts, photorealistic. |

**Clip E — the infinite fountain loop** (the finale):
Use the *perfect loop* trick — **same image as start AND end frame** (KF5):
> Static camera: fountain water flows continuously, arcs of water splashing
> and shimmering in golden-hour light, gentle mist drifting, leaves swaying
> slightly. Locked camera, seamless loop, photorealistic.

5 s, re-roll until the join is invisible when looped.

## 3. Upscale & QC

- Upscale every clip to 4K in [Higgsfield Upscale](https://higgsfield.ai/upscale)
  (deflicker + stabilize stack for AI clips; Theia/Rhea preset; 2× is enough).
- QC: no cuts, no morph-glitches, no towers, no watermarks/text, geometry
  consistent clip-to-clip, clip E loops seamlessly.

## 4. Hand-off & integration

Deliver: clips A–D (or stitched `hero-master.mp4`) + clip E as
`fountain-loop.mp4`.

Integration (done by the pipeline):

```bash
# frames for phases 1–2 (desktop 2560w with a 4K source, mobile 960w)
ffmpeg -i hero-master.mp4 -vf "scale=2560:-2:flags=lanczos,unsharp=5:5:0.35:5:5:0.1" png_d/f_%03d.png
ffmpeg -i hero-master.mp4 -vf "scale=960:-2:flags=lanczos,unsharp=5:5:0.4:5:5:0.1"  png_m/f_%03d.png
# thin to ~120–160 frames, then:
magick mogrify -format webp -quality 72 -path public/hero-frames/d png_d/*.png
magick mogrify -format webp -quality 66 -path public/hero-frames/m png_m/*.png

# poster
ffmpeg -ss 0 -i hero-master.mp4 -frames:v 1 -q:v 4 public/images/hero-poster.jpg

# finale loop (drop-in replacement)
ffmpeg -i clipE.mp4 -c:v libx264 -crf 21 -pix_fmt yuv420p -movflags +faststart -an public/images/fountain-loop.mp4
```

Then tune in code:
- `RANGES` chapter boundaries in `Hero.tsx` (match the 4 acts to the new timing)
- Auto-tour end point (`0.52 * scrollable`) — should land where clip B ends
- `FRAME_COUNT` / `PRIORITY` in `useFrameSequence.ts` if the count changes
- Raise the DPR cap from `1.5` → `2` for the 4K source

## Engine behaviours (already built & tested)

- Auto-tour: starts ~1.6 s after the opening reveal, glides 8 s to the
  mid-point; wheel/touch/pointer/key cancels instantly; once per tab session;
  skipped under reduced motion.
- Scrub: canvas frame sequence, damped, sub-frame crossfade, DPR-aware.
- Finale: fountain video fades in above the canvas at progress > 0.982,
  plays muted/looped, pauses + hides when scrolling back up.
