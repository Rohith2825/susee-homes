'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

declare global {
  interface Window {
    /** Set once the intro curtain is done (or skipped) — lets late listeners catch up. */
    __suseeIntroDone?: boolean;
  }
}

function announceDone() {
  window.__suseeIntroDone = true;
  window.dispatchEvent(new CustomEvent('susee:preloader-done'));
}

/** Module-scoped, so it resets on every full document load (fresh visit or
 *  refresh) but PERSISTS across client-side navigations (e.g. an en↔ta locale
 *  switch remounts this component within the same document). The curtain
 *  therefore replays on every refresh, and is skipped only on locale switches. */
let splashConsumed = false;

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

interface Grain {
  sx: number; // start (plot-grid)
  sy: number;
  tx: number; // target (logo pixel)
  ty: number;
  d: number; // per-grain delay
  w: number; // stroke width
}

/**
 * THE FORGE — the SUSEE mark is surveyed out of the land itself.
 *
 * Thousands of gold survey-points ignite as an ordered PLOT GRID (a layout,
 * the thing this company actually does to raw land), then stream — as light
 * trails — and lock, point by point, into the exact silhouette of the SUSEE
 * mark, sampled live from the real logo. As the dust settles the crisp mark
 * resolves over it on a struck foundation line, a gold sheen crosses, the
 * counter hits 100, one held beat, then the plate wipes up to the film.
 * Ownable, land→mark, never generic. Canvas + transform/opacity/clip only.
 */
export default function Preloader() {
  const [mounted, setMounted] = useState(false);
  // On a client-side remount (locale switch) the curtain has already played
  // this document, so start `gone` — no flash. SSR / fresh load starts false.
  const [gone, setGone] = useState(() => typeof window !== 'undefined' && splashConsumed);
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || splashConsumed) {
      setGone(true);
      const id = setTimeout(announceDone, 0);
      return () => clearTimeout(id);
    }
    splashConsumed = true;
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    window.__lenis?.stop();
    const q = gsap.utils.selector(root);
    const counter = { v: 0 };
    let raf = 0;
    let tl: gsap.core.Timeline | null = null;

    const finish = () => {
      window.__lenis?.start();
      setGone(true);
      announceDone();
    };

    // The shared drivers the canvas reads each frame; GSAP tweens them.
    const drive = { assemble: 0, grain: 0 };

    const runSurroundings = () => {
      // GSAP owns the transform on these (it animates their scale/y), so centre
      // via xPercent/yPercent — a Tailwind % translate would be clobbered.
      gsap.set([q('.pl-logo-wrap'), q('.pl-bloom')], { xPercent: -50, yPercent: -50 });
      gsap.set(q('.pl-foundation'), { xPercent: -50 });
      tl = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: finish });
      tl
        .fromTo(q('.pl-tick'), { opacity: 0, scale: 0.4 }, { opacity: 0.6, scale: 1, duration: 0.3, stagger: 0.05, ease: 'power2.out' }, 0.1)
        .to(q('.pl-grid'), { opacity: 0.12, duration: 1.0, ease: 'power1.inOut' }, 0.2)
        .fromTo(q('.pl-glow'), { opacity: 0 }, { opacity: 0.4, duration: 1.4, ease: 'sine.out' }, 0.2)
        .fromTo([q('.pl-coord'), q('.pl-est')], { opacity: 0, y: -6 }, { opacity: 0.5, y: 0, duration: 0.6, stagger: 0.1 }, 0.4)
        .to(counter, {
          v: 100, duration: 2.5, ease: 'power1.inOut',
          onUpdate: () => { if (countRef.current) countRef.current.textContent = String(Math.round(counter.v)).padStart(3, '0'); },
        }, 0.35)
        .fromTo(q('.pl-progress'), { scaleX: 0 }, { scaleX: 1, duration: 2.5, ease: 'power1.inOut' }, 0.35)
        // grains ignite, then stream from the plot-grid into the mark
        .fromTo(drive, { grain: 0 }, { grain: 1, duration: 0.5, ease: 'power2.out' }, 0.35)
        .fromTo(drive, { assemble: 0 }, { assemble: 1, duration: 2.0, ease: 'power2.inOut' }, 0.5)
        // the foundation strikes + light swells as they lock
        .fromTo(q('.pl-bloom'), { opacity: 0, scale: 0.72 }, { opacity: 0.5, scale: 1, duration: 1.1, ease: 'power2.out' }, 1.6)
        .fromTo(q('.pl-foundation'), { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: 'power2.inOut' }, 1.9)
        // the crisp mark resolves over the dust; grains fade to nothing
        .fromTo(q('.pl-logo'), { opacity: 0, filter: 'blur(4px) drop-shadow(0 0 0px rgba(236,216,174,0))' }, { opacity: 1, filter: 'blur(0px) drop-shadow(0 0 24px rgba(236,216,174,0.42))', duration: 0.6, ease: 'power2.out' }, 2.2)
        .to(drive, { grain: 0, duration: 0.6, ease: 'power2.in' }, 2.25)
        // sheen confirms it
        .fromTo(q('.pl-sheen'), { xPercent: -120, opacity: 0 }, { xPercent: 120, opacity: 0.5, duration: 0.6, ease: 'power2.inOut' }, 2.55)
        .to(q('.pl-sheen'), { opacity: 0, duration: 0.2 }, 3.05)
        // held beat, then exit
        .to({}, { duration: 0.3 }, 3.15)
        .to(q('.pl-logo-wrap'), { y: -14, scale: 1.03, duration: 0.6, ease: 'power2.out' }, 3.45)
        .to([q('.pl-grid'), q('.pl-glow'), q('.pl-tick'), q('.pl-coord'), q('.pl-est'), q('.pl-foundation'), q('.pl-bloom'), q('.pl-progress')], { opacity: 0, duration: 0.45, ease: 'power2.in' }, 3.5)
        .to(root, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.7, ease: 'power4.in' }, 3.58);
    };

    // Fallback if the logo can't be sampled — a clean fade so we never break.
    const fallback = () => {
      gsap.set(q('.pl-logo'), { opacity: 0 });
      runSurroundings();
    };

    const img = new Image();
    img.onload = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = window.innerWidth;
      const H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      const cw = canvas.width;
      const ch = canvas.height;
      const cx = cw / 2;
      const cy = ch / 2;

      // Match the crisp <img>'s rendered box so the hand-off is pixel-aligned.
      const hCss = Math.max(66, Math.min(118, 0.105 * W));
      const lh = hCss * dpr;
      const lw = lh * (img.naturalWidth / img.naturalHeight);

      // Sample the real logo's alpha → target points.
      const ocw = Math.max(1, Math.round(lw));
      const och = Math.max(1, Math.round(lh));
      const oc = document.createElement('canvas');
      oc.width = ocw;
      oc.height = och;
      const octx = oc.getContext('2d');
      if (!octx) return fallback();
      octx.drawImage(img, 0, 0, ocw, och);
      let data: Uint8ClampedArray;
      try {
        data = octx.getImageData(0, 0, ocw, och).data;
      } catch {
        return fallback();
      }
      const step = Math.max(2, Math.round(dpr * 1.7));
      const targets: Array<[number, number]> = [];
      for (let y = 0; y < och; y += step) {
        for (let x = 0; x < ocw; x += step) {
          if (data[(y * ocw + x) * 4 + 3] > 130) targets.push([cx - lw / 2 + x, cy - lh / 2 + y]);
        }
      }
      if (targets.length < 40) return fallback();

      // Shuffle so a grid cell maps to a random mark-point (organic swirl).
      for (let i = targets.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const t = targets[i]; targets[i] = targets[j]; targets[j] = t;
      }

      // Start pose: an ordered PLOT GRID, centred, ~land-parcel proportion.
      const N = targets.length;
      const gw = cw * 0.72;
      const gh = ch * 0.5;
      const cols = Math.max(1, Math.round(Math.sqrt(N * (gw / gh))));
      const rows = Math.ceil(N / cols);
      const sxStep = gw / cols;
      const syStep = gh / rows;
      const gx0 = cx - gw / 2 + sxStep / 2;
      const gy0 = cy - gh / 2 + syStep / 2;

      const grains: Grain[] = targets.map((t, i): Grain => ({
        sx: gx0 + (i % cols) * sxStep,
        sy: gy0 + Math.floor(i / cols) * syStep,
        tx: t[0],
        ty: t[1],
        d: Math.random() * 0.34,
        w: (1.1 + Math.random() * 1.1) * dpr,
      }));
      const DENOM = 1 - 0.34;

      const gold = 'rgba(236,216,174,';
      const draw = () => {
        raf = requestAnimationFrame(draw);
        const p = drive.assemble;
        const gA = drive.grain;
        ctx.clearRect(0, 0, cw, ch);
        if (gA <= 0.001) return;
        ctx.strokeStyle = gold + (0.92 * gA).toFixed(3) + ')';
        ctx.lineCap = 'round';
        ctx.lineWidth = 1.55 * dpr;
        ctx.beginPath();
        for (let i = 0; i < grains.length; i++) {
          const g = grains[i];
          const local = clamp01((p - g.d) / DENOM);
          const e = easeInOutCubic(local);
          // a hair behind on the same eased path → a motion streak that
          // collapses to a round dot as the grain settles.
          const e0 = easeInOutCubic(clamp01(local - 0.05));
          const x = g.sx + (g.tx - g.sx) * e;
          const y = g.sy + (g.ty - g.sy) * e;
          const x0 = g.sx + (g.tx - g.sx) * e0;
          const y0 = g.sy + (g.ty - g.sy) * e0;
          ctx.moveTo(x0, y0);
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      };

      gsap.set(q('.pl-logo'), { opacity: 0 });
      raf = requestAnimationFrame(draw);
      runSurroundings();
    };
    img.onerror = fallback;
    img.src = '/images/logo-mark.png';

    return () => {
      if (raf) cancelAnimationFrame(raf);
      tl?.kill();
      window.__lenis?.start();
    };
  }, [mounted]);

  if (gone) return null;

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="preloader-root fixed inset-0 z-[999] overflow-hidden"
      style={{ clipPath: 'inset(0% 0% 0% 0%)' }}
    >
      {/* Stage layers */}
      <div className="pl-grid absolute inset-0" />
      <div className="pl-glow absolute inset-0" />
      <div className="grain absolute inset-0 opacity-[0.5]" />

      {/* Corner blueprint ticks */}
      <div className="pointer-events-none absolute inset-0 px-[clamp(1.5rem,5vw,4.5rem)] py-[clamp(1.5rem,5vw,4rem)]">
        {(
          [
            'left-[clamp(1.5rem,5vw,4.5rem)] top-[clamp(1.5rem,5vw,4rem)]',
            'right-[clamp(1.5rem,5vw,4.5rem)] top-[clamp(1.5rem,5vw,4rem)] rotate-90',
            'left-[clamp(1.5rem,5vw,4.5rem)] bottom-[clamp(1.5rem,5vw,4rem)] -rotate-90',
            'right-[clamp(1.5rem,5vw,4.5rem)] bottom-[clamp(1.5rem,5vw,4rem)] rotate-180',
          ] as const
        ).map((pos, i) => (
          <svg key={i} className={`pl-tick absolute h-5 w-5 text-brass-300/70 ${pos}`} viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M1 1h7M1 1v7" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        ))}
      </div>

      {/* Registration marks — the blueprint stamp */}
      <div className="pointer-events-none absolute inset-x-0 top-[clamp(1.5rem,5vw,4rem)] flex justify-between px-[clamp(2.2rem,7vw,6rem)]">
        <span className="pl-coord micro-label text-ivory-50/50 tabular-nums">13.0480° N · 80.0966° E</span>
        <span className="pl-est micro-label text-ivory-50/50">EST. 2016</span>
      </div>

      {/* soft architectural light behind the mark */}
      <div
        className="pl-bloom pointer-events-none absolute left-1/2 top-1/2 h-[min(70vh,640px)] w-[min(70vw,640px)]"
        style={{ background: 'radial-gradient(circle, rgba(236,216,174,0.20) 0%, rgba(45,106,79,0.10) 34%, transparent 66%)' }}
      />

      {/* the plot-grid → mark forge */}
      <canvas ref={canvasRef} className="pl-forge absolute inset-0 h-full w-full" aria-hidden="true" />

      {/* the foundation / datum line the mark locks onto */}
      <div
        className="pl-foundation pointer-events-none absolute left-1/2 top-[calc(50%_+_clamp(52px,7.5vw,86px))] h-px w-[min(64vw,520px)]"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(236,216,174,0.85) 20%, rgba(236,216,174,0.85) 80%, transparent)' }}
      />

      {/* ── THE MARK — resolves crisp over the assembled grains ── */}
      <div className="pl-logo-wrap absolute left-1/2 top-1/2">
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo-mark.png"
            alt="Susee Homes"
            width={866}
            height={288}
            className="pl-logo block h-[clamp(66px,10.5vw,118px)] w-auto"
          />
          <div className="pl-sheen absolute inset-0" />
        </div>
      </div>

      {/* Bottom furniture — counter + progress baseline */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[clamp(1.6rem,5vw,3.5rem)] flex items-center gap-4 px-[clamp(2.2rem,7vw,6rem)]">
        <div className="h-px flex-1 overflow-hidden bg-ivory-50/12">
          <div className="pl-progress h-full w-full origin-left bg-brass-300/60" />
        </div>
        <span ref={countRef} className="font-mono text-[0.78rem] tabular-nums text-ivory-50/70">000</span>
      </div>
    </div>
  );
}
