'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Sparkles } from '@/components/ui/sparkles';

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

/**
 * THE GRAND OPENING — a cinematic, once-per-session overture.
 *
 * On a deep-ink stage: a breathing survey grid and dual glow settle in,
 * four corner survey ticks strike, a coordinate stamp registers, the
 * monochrome brand lockup fades up and catches a single gold sheen, the
 * name "Susee Homes" rises line-by-line behind masks, the tagline spaces
 * open, and a surveyor's baseline draws under it while a counter runs
 * 000 → 100. Then the whole plate wipes up and away to unveil the film.
 * Transform / opacity / clip-path only, so it never janks.
 */
export default function Preloader() {
  const [mounted, setMounted] = useState(false);
  // On a client-side remount (locale switch) the curtain has already played
  // this document, so start `gone` — no flash. SSR / fresh load starts false.
  const [gone, setGone] = useState(() => typeof window !== 'undefined' && splashConsumed);
  const rootRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Skip only for reduced motion, or when this is a client-side remount
    // within the same document (locale switch) — never on a real refresh.
    if (reduced || splashConsumed) {
      setGone(true);
      // Defer past this commit's effect flush so sibling listeners (Hero) exist
      const id = setTimeout(announceDone, 0);
      return () => clearTimeout(id);
    }
    splashConsumed = true;
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = rootRef.current;
    if (!root) return;

    window.__lenis?.stop();

    const q = gsap.utils.selector(root);
    const counter = { v: 0 };

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => {
        window.__lenis?.start();
        setGone(true);
        announceDone();
      },
    });

    // ── Stage settles in ──
    tl.fromTo(q('.pl-grid'), { opacity: 0, scale: 1.09 }, { opacity: 1, scale: 1, duration: 1.5, ease: 'power2.out' }, 0)
      .fromTo(q('.pl-glow'), { opacity: 0 }, { opacity: 1, duration: 1.6, ease: 'sine.out' }, 0)
      // corner survey ticks strike in
      .fromTo(
        q('.pl-tick'),
        { opacity: 0, scale: 0.4 },
        { opacity: 1, scale: 1, duration: 0.6, stagger: 0.08, ease: 'back.out(2)' },
        0.25
      )
      // registration marks (coordinates / est.) fade in
      .fromTo(q('.pl-reg'), { opacity: 0, y: -6 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 }, 0.4)
      // brand lockup rises
      .fromTo(q('.pl-lockup'), { opacity: 0, y: 18, filter: 'blur(6px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9, ease: 'power3.out' }, 0.55)
      // gold sheen sweeps across the lockup once
      .fromTo(q('.pl-sheen'), { xPercent: -140, opacity: 0 }, { xPercent: 140, opacity: 1, duration: 1.05, ease: 'power2.inOut' }, 0.85)
      .to(q('.pl-sheen'), { opacity: 0, duration: 0.3 }, 1.7)
      // the name rises, word by word, from behind masks. `y: 0` explicitly
      // zeroes GSAP's pixel-y channel so it doesn't inherit the CSS
      // translateY(120%) pre-hydration hide as a leftover pixel offset —
      // otherwise the two stack and the name never fully rises into view.
      .fromTo(
        q('.pl-word-inner'),
        { yPercent: 120, y: 0 },
        { yPercent: 0, y: 0, duration: 1, stagger: 0.12, ease: 'power4.out' },
        0.95
      )
      // glowing baseline draws in under the name
      .fromTo(q('.pl-spark-line'), { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: 'power2.inOut' }, 1.1)
      // the sparks bloom up
      .fromTo(q('.pl-spark'), { opacity: 0 }, { opacity: 1, duration: 1.1, ease: 'power2.out' }, 1.35)
      // counter + bottom progress run together
      .to(
        counter,
        {
          v: 100,
          duration: 1.6,
          ease: 'power1.inOut',
          onUpdate: () => {
            if (countRef.current) countRef.current.textContent = String(Math.round(counter.v)).padStart(3, '0');
          },
        },
        0.45
      )
      .fromTo(q('.pl-progress'), { scaleX: 0 }, { scaleX: 1, duration: 1.6, ease: 'power1.inOut' }, 0.45)
      // ── hold a cinematic beat ──
      .to({}, { duration: 0.35 })
      // ── GRAND EXIT ──
      // a gold flare crosses the baseline, the content lifts and dissolves,
      // then the ink plate wipes up to reveal the film beneath
      .to(q('.pl-progress'), { backgroundColor: 'rgba(236,211,156,0.95)', duration: 0.25 }, 'exit')
      .to(q('.pl-content'), { y: -34, opacity: 0, duration: 0.8, ease: 'power3.in' }, 'exit+=0.12')
      .to(q('.pl-grid'), { opacity: 0, duration: 0.7 }, 'exit+=0.1')
      .to(q('.pl-glow'), { opacity: 0, scale: 1.2, duration: 0.9 }, 'exit+=0.1')
      .to(
        root,
        { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.0, ease: 'power4.inOut' },
        'exit+=0.35'
      );

    return () => {
      tl.kill();
      window.__lenis?.start();
    };
  }, [mounted]);

  if (gone) return null;

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      // Rendered unconditionally (SSR included) so the very first paint —
      // before hydration decides anything — already has the hero covered.
      // `.intro-skip` (set by a synchronous pre-paint script for repeat
      // visits this session) hides it via CSS with zero flash either way.
      className="preloader-root fixed inset-0 z-[999] flex items-center justify-center overflow-hidden"
      style={{ clipPath: 'inset(0% 0% 0% 0%)' }}
    >
      {/* Stage layers */}
      <div className="pl-grid absolute inset-0" />
      <div className="pl-glow absolute inset-0" />
      <div className="grain absolute inset-0 opacity-[0.5]" />

      {/* Corner survey ticks */}
      <div className="pointer-events-none absolute inset-0 px-[clamp(1.5rem,5vw,4.5rem)] py-[clamp(1.5rem,5vw,4rem)]">
        {(
          [
            'left-[clamp(1.5rem,5vw,4.5rem)] top-[clamp(1.5rem,5vw,4rem)]',
            'right-[clamp(1.5rem,5vw,4.5rem)] top-[clamp(1.5rem,5vw,4rem)] rotate-90',
            'left-[clamp(1.5rem,5vw,4.5rem)] bottom-[clamp(1.5rem,5vw,4rem)] -rotate-90',
            'right-[clamp(1.5rem,5vw,4.5rem)] bottom-[clamp(1.5rem,5vw,4rem)] rotate-180',
          ] as const
        ).map((pos, i) => (
          <svg
            key={i}
            className={`pl-tick absolute h-5 w-5 text-brass-300/70 ${pos}`}
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path d="M1 1h7M1 1v7" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        ))}
      </div>

      {/* Registration marks — the survey stamp */}
      <div className="pointer-events-none absolute inset-x-0 top-[clamp(1.5rem,5vw,4rem)] flex justify-between px-[clamp(2.2rem,7vw,6rem)]">
        <span className="pl-reg micro-label text-ivory-50/45">13.0480° N · 80.0966° E</span>
        <span className="pl-reg micro-label text-ivory-50/45">EST. 2016</span>
      </div>

      {/* Centre stage */}
      <div className="pl-content relative flex flex-col items-center px-6 text-center">
        {/* Brand lockup — monochrome ivory on ink, with a gold sheen pass */}
        <div className="pl-lockup relative mb-9">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo-alpha.png"
            alt="Susee Homes"
            width={150}
            height={43}
            className="h-[clamp(34px,5vw,46px)] w-auto opacity-95 brightness-0 invert"
          />
          <div className="pl-sheen absolute inset-0" />
        </div>

        {/* The name — rises line by line from behind masks */}
        <h1 className="font-display text-ivory-50 leading-[0.94]">
          <span className="pl-word text-[clamp(3rem,11vw,8.5rem)]">
            <span className="pl-word-inner">Susee</span>
          </span>
          <span className="pl-word text-[clamp(3rem,11vw,8.5rem)]">
            <span className="pl-word-inner italic text-brass-200">Homes</span>
          </span>
        </h1>

        {/* Sparkle baseline — the surveyor's line catches light and scatters
            into gold dust, in the brand palette (replaces the wordy tagline). */}
        <div className="pl-spark relative mt-9 flex h-28 w-[min(84vw,580px)] flex-col items-center">
          {/* glowing baseline — brass core with a fern spark; draws in */}
          <div className="pl-spark-line relative h-[3px] w-full">
            <div className="absolute inset-x-[14%] top-1/2 h-[2px] w-[72%] -translate-y-1/2 bg-gradient-to-r from-transparent via-brass-300 to-transparent blur-[2px]" />
            <div className="absolute inset-x-[14%] top-1/2 h-px w-[72%] -translate-y-1/2 bg-gradient-to-r from-transparent via-brass-100 to-transparent" />
            <div className="absolute inset-x-[36%] top-1/2 h-[3px] w-[28%] -translate-y-1/2 bg-gradient-to-r from-transparent via-fern-400 to-transparent blur-[2px]" />
            <div className="absolute inset-x-[36%] top-1/2 h-px w-[28%] -translate-y-1/2 bg-gradient-to-r from-transparent via-fern-300 to-transparent" />
          </div>
          {/* the sparks scattering below the line, faded into the ink stage */}
          <div className="relative w-full flex-1 [mask-image:radial-gradient(74%_100%_at_50%_0%,#000_14%,transparent_78%)]">
            <Sparkles className="h-full w-full" particleColor="#ECD8AE" particleDensity={1300} minSize={0.5} maxSize={1.35} />
          </div>
        </div>
      </div>

      {/* Bottom furniture — counter + progress baseline */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[clamp(1.6rem,5vw,3.5rem)] flex items-center gap-4 px-[clamp(2.2rem,7vw,6rem)]">
        <div className="h-px flex-1 overflow-hidden bg-ivory-50/12">
          <div className="pl-progress h-full w-full origin-left bg-brass-300/60" />
        </div>
        <span ref={countRef} className="font-mono text-[0.78rem] tabular-nums text-ivory-50/70">
          000
        </span>
      </div>
    </div>
  );
}
