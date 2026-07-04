'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { gsap } from 'gsap';
import { ANCHORS } from '@/lib/site';

/**
 * THE SCROLL FILM — a scroll-scrubbed 4K frame sequence.
 *
 * The client's 15s master (land → survey lines → streets → homes → dusk
 * arrival at the fountain plaza) is pre-rendered to a 361-frame sequence — the
 * film's every native 24fps frame — and painted, one crisp frame at a time,
 * onto a canvas driven purely by scroll position. The hero is a tall section
 * whose inner container is pinned (sticky) while the film scrubs: scroll down
 * runs the film forward, scroll up rewinds it — exactly to your gesture.
 *
 * Smoothness comes from DENSITY, never from blending two frames (this client
 * detects a single 50/50 dissolve as a double-exposure ghost). ~6px of scroll
 * per frame reads as continuous motion; the canvas only ever holds ONE
 * decoded still, so there is no ghost at any rest position. Frames stream in
 * coarse-then-dense so the scrub is usable in ~6MB and silently sharpens.
 *
 * At the very end the film parks on the fountain plaza and the water keeps
 * flowing forever: the last still is pixel-identical to the looping fountain
 * video's first frame, so the swap to live video is a HARD CUT on a matched
 * pose — invisible, and never a dissolve. Four chapter captions cross-fade in
 * sync; a live rail, timecode and compass sit on top. Reduced motion collapses
 * the section to one screen and rests on the final still.
 */

/** Every native frame of the 15.04s / 24fps master (1920px, ~212KB each). */
const FRAME_COUNT = 361;
const frameSrc = (i: number) => `/hero-frames/scrub/f_${String(i + 1).padStart(3, '0')}.jpg`;
/** Coarse pass loads every Nth frame first (full-range scrub in ~6MB), then
 *  the gaps fill in outward for full density. */
const COARSE_STEP = 6;
/** The film reaches its final frame at this progress and holds it to 1.0, so
 *  the water-loop hand-off always lands on the matched last still. */
const SCRUB_END = 0.985;
/** Park zone (hysteresis): flow the fountain video in past ENTER, cut back to
 *  the still below EXIT. Both sit inside the final-frame hold. */
const PARK_ENTER = 0.988;
const PARK_EXIT = 0.972;
/** The seam-perfected fountain loop (locked camera, flowing water) lives on
 *  the CDN; its frame 0 is the exact image of the final still f_361. */
const MEDIA_CDN = 'https://pub-3c0b0885a612406288a53205b2de790a.r2.dev';
const LOOP_SRC = `${MEDIA_CDN}/fountain-loop-3.mp4`;
/** Scroll-progress (0–1) at which each chapter's caption begins. Matches the
 *  film's own chapter beats: land · layout · build · arrival. */
const STAGE_STARTS = [0, 0.17, 0.42, 0.61];
/** Max-quality 4K stills for the rail's hover previews. */
const PV_STILL = ['/hero-frames/hq/pv-0.jpg', '/hero-frames/hq/pv-1.jpg', '/hero-frames/hq/pv-2.jpg', '/hero-frames/hq/pv-3.jpg'];

interface Stage {
  headline: string;
  sub: string;
}
interface Chapter {
  index: string;
  label: string;
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Which chapter a given scroll progress falls in. */
function stageForProgress(p: number): number {
  let s = 0;
  for (let i = 0; i < STAGE_STARTS.length; i++) if (p >= STAGE_STARTS[i] - 0.0001) s = i;
  return s;
}

export default function Hero() {
  const t = useTranslations('hero');
  const stages = t.raw('stages') as Stage[];
  const chapters = t.raw('chapters') as Chapter[];

  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loopRef = useRef<HTMLVideoElement>(null);
  const framesRef = useRef<Array<HTMLImageElement | undefined>>([]);
  const stageBoxRef = useRef<HTMLDivElement>(null);
  const nudgeRef = useRef<HTMLDivElement>(null);
  const railFillRefs = useRef<Array<HTMLDivElement | null>>([]);
  const rafRef = useRef(0);
  const lastFrameRef = useRef(-1);
  const activeIdxRef = useRef(0);

  const [activeIdx, setActiveIdx] = useState(0);
  const [introReady, setIntroReady] = useState(false);

  // ── Wait for the preloader curtain before the opening reveal ──
  useEffect(() => {
    if (window.__suseeIntroDone) {
      setIntroReady(true);
      return;
    }
    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      setIntroReady(true);
    };
    window.addEventListener('susee:preloader-done', go);
    const fallback = setTimeout(go, 3000);
    return () => {
      window.removeEventListener('susee:preloader-done', go);
      clearTimeout(fallback);
    };
  }, []);

  // ── The scroll film — density, not blending. Paint one crisp frame per
  //    scroll position; stream frames coarse-then-dense; flow the fountain at
  //    the end via a matched-pose hard cut. ──
  useEffect(() => {
    if (!introReady) return;
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const LAST = FRAME_COUNT - 1;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const saveData = conn?.saveData === true;
    const slowNet = conn?.effectiveType ? /(^|-)2g/.test(conn.effectiveType) : false;
    // On Save-Data / very slow links keep only the coarse pass (full-range
    // scrub in ~6MB) and skip the 17MB fountain video.
    const coarseOnly = saveData || slowNet;

    // Sparse frame store — filled progressively. A hole just means the scrub
    // falls back to the nearest decoded frame (never a blend, never blank).
    const frames: Array<HTMLImageElement | undefined> = new Array(FRAME_COUNT);
    framesRef.current = frames;

    /** Nearest already-decoded frame to `index`. Only ONE frame is ever drawn,
     *  so there is no dissolve and no double-exposure ghost at any position. */
    const pickImg = (index: number): HTMLImageElement | null => {
      const c = index < 0 ? 0 : index > LAST ? LAST : index;
      const exact = frames[c];
      if (exact && exact.complete && exact.naturalWidth) return exact;
      for (let d = 1; d < FRAME_COUNT; d++) {
        const a = frames[c - d];
        if (a && a.complete && a.naturalWidth) return a;
        const b = frames[c + d];
        if (b && b.complete && b.naturalWidth) return b;
      }
      return null;
    };

    const draw = (index: number) => {
      const img = pickImg(index);
      if (!img) return;
      // Re-asserted each draw: setting canvas.width/height resets context
      // state, and 'high' gives the best scaler for any up/down-scale.
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      const cw = canvas.width;
      const ch = canvas.height;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const scale = Math.max(cw / iw, ch / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    };

    // Warm upcoming frames off the main thread so a fast scrub never blocks
    // on a synchronous decode. Larger 1920px frames make this worthwhile.
    const decoded = new Set<number>();
    let prevIdx = 0;
    const decodeAhead = (idx: number) => {
      const dir = idx >= prevIdx ? 1 : -1;
      for (let k = 1; k <= 10; k++) {
        const j = idx + dir * k;
        if (j < 0 || j >= FRAME_COUNT) break;
        const im = frames[j];
        if (im && im.complete && im.naturalWidth && !decoded.has(j)) {
          decoded.add(j);
          im.decode?.().catch(() => decoded.delete(j));
        }
      }
      prevIdx = idx;
    };

    const load = (i: number, prio: 'high' | 'low') => {
      if (frames[i]) return;
      const img = new Image();
      img.decoding = 'async';
      img.setAttribute('fetchpriority', prio);
      img.onload = () => {
        // Upgrade the fallback the instant the exact current frame lands.
        if (i === lastFrameRef.current) draw(i);
      };
      img.src = frameSrc(i);
      frames[i] = img;
    };

    // Scroll travel maps to [0, SCRUB_END]; the last stretch holds the final
    // frame so the water hand-off always lands on the matched still.
    const frameFor = (p: number) => Math.round(clamp01(p / SCRUB_END) * LAST);

    // 1920px source now has real detail to show, so honour the device pixel
    // ratio up to 2 — retina panels render the frames crisply instead of soft.
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(canvas.clientWidth * dpr);
      const h = Math.round(canvas.clientHeight * dpr);
      if (w === canvas.width && h === canvas.height) return;
      canvas.width = w;
      canvas.height = h;
      draw(lastFrameRef.current < 0 ? 0 : lastFrameRef.current);
    };

    const applyStage = (s: number) => {
      if (s !== activeIdxRef.current) {
        activeIdxRef.current = s;
        setActiveIdx(s);
      }
    };

    // ── Reduced motion: only the final still, one screen, free scroll ──
    if (reduced) {
      load(LAST, 'high');
      applyStage(3);
      lastFrameRef.current = LAST;
      resize();
      railFillRefs.current.forEach((el) => {
        if (el) el.style.transform = 'scaleY(1)';
      });
      if (nudgeRef.current) nudgeRef.current.style.opacity = '0';
      window.addEventListener('resize', resize);
      return () => window.removeEventListener('resize', resize);
    }

    // ── Coarse pass: full-range scrub in ~6MB, immediately ──
    for (let i = 0; i < FRAME_COUNT; i += COARSE_STEP) load(i, 'high');
    load(LAST, 'high');
    // ── Dense fill: the in-between frames, deferred + low priority ──
    if (!coarseOnly) {
      const fill = () => {
        for (let i = 0; i < FRAME_COUNT; i++) if (!frames[i]) load(i, 'low');
      };
      const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => void }).requestIdleCallback;
      if (ric) ric(fill, { timeout: 1500 });
      else setTimeout(fill, 500);
    }

    // ── Fountain water — hard-cut to the looping video when parked at the end ──
    const loop = loopRef.current;
    const loopEnabled = !!loop && !saveData;
    let primed = false;
    let parked = false;
    const unpark = () => {
      if (!parked || !loop) return;
      parked = false;
      loop.style.opacity = '0';
      loop.pause();
    };

    const progress = () => {
      const total = section.offsetHeight - window.innerHeight;
      if (total <= 0) return 0;
      return clamp01(-section.getBoundingClientRect().top / total);
    };

    const tick = () => {
      const p = progress();

      const idx = frameFor(p);
      if (idx !== lastFrameRef.current) {
        lastFrameRef.current = idx;
        draw(idx);
        decodeAhead(idx);
      }

      applyStage(stageForProgress(p));

      for (let i = 0; i < railFillRefs.current.length; i++) {
        const el = railFillRefs.current[i];
        if (!el) continue;
        const start = STAGE_STARTS[i];
        const end = i + 1 < STAGE_STARTS.length ? STAGE_STARTS[i + 1] : 1;
        el.style.transform = `scaleY(${clamp01((p - start) / (end - start))})`;
      }

      if (nudgeRef.current) nudgeRef.current.style.opacity = p > 0.015 ? '0' : '';

      if (loopEnabled && loop) {
        // Warm the ~17MB loop before the user reaches the end.
        if (!primed && p > 0.55) {
          primed = true;
          loop.preload = 'auto';
          try {
            loop.load();
          } catch {
            /* ignore */
          }
        }
        if (!parked && p >= PARK_ENTER) {
          // Canvas is on f_361 == the loop's frame 0, so this is invisible.
          parked = true;
          try {
            loop.currentTime = 0;
          } catch {
            /* ignore */
          }
          loop.play().catch(() => {});
          loop.style.opacity = '1';
        } else if (parked && p < PARK_EXIT) {
          unpark();
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    // Run the scrub loop only while the hero is on screen.
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((e) => e.isIntersecting);
        if (visible && !rafRef.current) {
          rafRef.current = requestAnimationFrame(tick);
        } else if (!visible && rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = 0;
          if (loop) loop.pause(); // don't decode video off-screen
        }
      },
      { threshold: 0 }
    );

    resize();
    io.observe(section);
    window.addEventListener('resize', resize);

    return () => {
      io.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      window.removeEventListener('resize', resize);
      if (loop) {
        try {
          loop.pause();
        } catch {
          /* ignore */
        }
      }
    };
  }, [introReady]);

  // ── Opening reveal ──
  useEffect(() => {
    if (!introReady) return;
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      gsap.to(section.querySelectorAll('[data-hero-fade]'), {
        opacity: 1,
        duration: 1.1,
        ease: 'power2.out',
        stagger: 0.08,
        delay: 0.15,
      });
    }, section);
    return () => ctx.revert();
  }, [introReady]);

  // ── Caption line reveal on chapter change ──
  useEffect(() => {
    if (!introReady) return;
    const box = stageBoxRef.current;
    if (!box) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        box.querySelectorAll('.line-inner'),
        { yPercent: 115 },
        { yPercent: 0, duration: 0.9, ease: 'power4.out', stagger: 0.08 }
      );
      gsap.fromTo(
        box.querySelector('.stage-sub'),
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', delay: 0.22 }
      );
    }, box);
    return () => ctx.revert();
  }, [activeIdx, introReady]);

  // Chapter rail → scroll the film to that chapter's beat
  const jumpToChapter = useCallback((c: number) => {
    const section = sectionRef.current;
    if (!section) return;
    const total = section.offsetHeight - window.innerHeight;
    const y = section.offsetTop + STAGE_STARTS[c] * total + 2;
    if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1.1 });
    else window.scrollTo({ top: y, behavior: 'smooth' });
  }, []);

  const stage = stages[activeIdx] ?? stages[0];

  return (
    <section ref={sectionRef} data-hero="" className="hero-scrub relative bg-ink-950" aria-label={t('tagline')}>
      {/* Hide the native scrollbar site-wide — Lenis owns the scroll feel */}
      <style>{`html{scrollbar-width:none;-ms-overflow-style:none}html::-webkit-scrollbar{display:none;width:0;height:0}`}</style>
      <div className="grain sticky top-0 h-screen overflow-hidden supports-[height:100dvh]:h-dvh">
        {/* Poster — the film's first frame paints instantly, before the canvas
            takes over on the first draw */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={frameSrc(0)}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />

        {/* The scroll film — frame-accurate, painted from scroll position */}
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 block h-full w-full"
        />

        {/* Flowing ending — the seam-perfected fountain loop. Its frame 0 is
            pixel-identical to the final still f_361, so it hard-cuts in over
            the canvas the instant the scrub parks at the end (no dissolve),
            and the water then flows forever. Idle (opacity 0, paused) until
            then; lazy-loaded as the scrub passes the mid-point. */}
        <video
          ref={loopRef}
          src={LOOP_SRC}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-0"
        />

        {/* Cinematic grade — the film's golden light still leads, but the
            grade is deepened for legibility: a stronger wash down the caption
            side, firmer top/bottom bands behind the coordinate labels, chapter
            rail and timecode, and a light flat scrim over the whole frame so
            nothing is lost over bright sky. Tuned to stay cinematic, not muddy. */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              'linear-gradient(100deg, rgba(6,10,8,0.60) 0%, rgba(6,10,8,0.30) 40%, rgba(6,10,8,0.08) 66%, transparent 100%), linear-gradient(to top, rgba(6,10,8,0.52) 0%, transparent 26%), linear-gradient(to bottom, rgba(6,10,8,0.44) 0%, transparent 17%), linear-gradient(rgba(6,10,8,0.18), rgba(6,10,8,0.18))',
          }}
        />

        {/* ── Caption ── */}
        <div className="absolute inset-0 flex items-end pb-[15dvh] md:items-center md:pb-0">
          <div className="w-full px-[clamp(1.5rem,6vw,5rem)]">
            <div className="max-w-2xl">
              <p data-hero-fade="" className="eyebrow mb-6 text-brass-200">
                {t('tagline')}
              </p>

              <div ref={stageBoxRef}>
                <h1 className="font-display text-hero text-ivory-50 [text-shadow:0_2px_40px_rgba(6,10,8,0.5)]">
                  {stage.headline.split('\n').map((line, i) => (
                    <span key={`${activeIdx}-${i}`} className="line block overflow-hidden pb-[0.14em] -mb-[0.14em]">
                      <span className="line-inner block will-change-transform">{line}</span>
                    </span>
                  ))}
                </h1>
                <p className="stage-sub mt-5 max-w-md text-[clamp(0.88rem,1.2vw,1rem)] leading-relaxed text-ivory-50/78">
                  {stage.sub}
                </p>
              </div>

              {/* Arrival CTAs */}
              <div
                className={`mt-8 flex flex-wrap gap-3 transition-all duration-700 [transition-timing-function:var(--ease-expo)] ${
                  activeIdx === 3 ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
                }`}
              >
                <a href={`#${ANCHORS.contact}`} className="btn btn-brass">
                  {t('cta')}
                </a>
                <a href={`#${ANCHORS.project}`} className="btn btn-ghost-light">
                  {t('ctaSecondary')}
                </a>
              </div>

              {/* Mobile chapter pills */}
              <div data-hero-fade="" className="mt-8 flex items-center gap-1.5 md:hidden" aria-hidden="true">
                {chapters.map((_, i) => (
                  <div
                    key={i}
                    className={`h-[3px] rounded-full transition-all duration-500 [transition-timing-function:var(--ease-expo)] ${
                      i === activeIdx ? 'flex-[2.6] bg-brass-200' : 'flex-1 bg-ivory-50/25'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Chapter rail (desktop) — scroll-fill progress + still previews ── */}
        <div
          data-hero-fade=""
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-[340px] bg-gradient-to-l from-ink-950/78 via-ink-950/38 to-transparent md:block"
          aria-hidden="true"
        />
        <div
          data-hero-fade=""
          className="absolute right-[clamp(1.5rem,4vw,4rem)] top-1/2 hidden -translate-y-1/2 flex-col gap-7 [text-shadow:0_1px_12px_rgba(6,10,8,0.9)] md:flex"
        >
          {chapters.map((ch, i) => (
            <button
              key={ch.index}
              type="button"
              onClick={() => jumpToChapter(i)}
              className="group relative flex items-center gap-3 text-right"
              aria-label={`${ch.index} — ${ch.label}`}
            >
              {/* hover preview — the chapter's max-quality still */}
              <span
                className="pointer-events-none absolute right-full top-1/2 mr-5 hidden w-[190px] -translate-y-1/2 overflow-hidden rounded-sm border border-ivory-50/20 opacity-0 shadow-[0_18px_50px_rgba(6,10,8,0.6)] transition-all duration-300 [transition-timing-function:var(--ease-expo)] group-hover:opacity-100 group-hover:-translate-x-1 lg:block"
                aria-hidden="true"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={PV_STILL[i]} alt="" className="block aspect-video w-full object-cover" loading="lazy" />
                <span className="absolute bottom-1.5 left-2 font-mono text-[0.55rem] uppercase tracking-[0.14em] text-ivory-50/85">
                  {ch.index} — {ch.label}
                </span>
              </span>

              <span
                className={`micro-label whitespace-nowrap transition-colors duration-400 ${
                  i === activeIdx ? 'text-brass-200' : 'text-ivory-50/85 group-hover:text-ivory-50'
                }`}
              >
                <span className="mr-2 opacity-80">{ch.index}</span>
                {ch.label}
              </span>
              <span className="relative h-10 w-px overflow-hidden bg-ivory-50/30 shadow-[0_0_10px_rgba(6,10,8,0.5)]">
                <div
                  ref={(el) => {
                    railFillRefs.current[i] = el;
                  }}
                  className="absolute inset-0 origin-top scale-y-0 bg-brass-200"
                />
              </span>
            </button>
          ))}
        </div>

        <div
          ref={nudgeRef}
          data-hero-fade=""
          className="pointer-events-none absolute bottom-7 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-ivory-50/60 transition-opacity duration-700"
        >
          <span className="micro-label">{t('scroll')}</span>
          <span className="animate-[nudge-fade_2.4s_ease-in-out_infinite]">
            <svg width="12" height="18" viewBox="0 0 14 20" fill="none" aria-hidden="true">
              <path d="M7 1v12M4 10l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </div>
    </section>
  );
}
