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

const TRUE_COORD = '13.0480° N · 80.0966° E';
const scrambleCoord = () => TRUE_COORD.replace(/\d/g, () => String(Math.floor(Math.random() * 10)));

/**
 * THE BENCHMARK LIGHT — a logo-only overture for a major institution.
 *
 * On a deep-ink survey stage the instrument powers on (corner ticks click,
 * grid breathes up), then a theodolite reticle HUNTS across the dark in three
 * decelerating hops and LOCKS dead-centre. The coordinate stamp rolls through
 * false readings and settles on the true value — measured, not assumed. A
 * shaft of gold light drops onto the locked point; it lands with a flash and a
 * single shock-ring while registration rulers converge and a brass hexagon
 * (echoing the monogram) traces itself closed. In that same instant the LOGO
 * irises into hard focus — certified into place, not faded in. A gold sheen
 * confirms it, dust settles, the counter hits 100, one held beat — then the
 * ink plate wipes up to unveil the film. Transform/opacity/clip-path/filter
 * only, so it never janks.
 */
export default function Preloader() {
  const [mounted, setMounted] = useState(false);
  // On a client-side remount (locale switch) the curtain has already played
  // this document, so start `gone` — no flash. SSR / fresh load starts false.
  const [gone, setGone] = useState(() => typeof window !== 'undefined' && splashConsumed);
  const rootRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const coordRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Skip only for reduced motion, or when this is a client-side remount
    // within the same document (locale switch) — never on a real refresh.
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
    if (!root) return;

    window.__lenis?.stop();

    const q = gsap.utils.selector(root);
    const counter = { v: 0 };
    const roll = { v: 0 };
    const W = window.innerWidth;
    const H = window.innerHeight;

    // Reticle hunt: appear off-centre, then big → medium → small hops onto the
    // lock point (dead-centre) — a surveyor bracketing a benchmark.
    const start = { x: -W * 0.3, y: -H * 0.2 };
    const wp1 = { x: W * 0.24, y: H * 0.15 };
    const wp2 = { x: -W * 0.11, y: -H * 0.06 };

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => {
        window.__lenis?.start();
        setGone(true);
        announceDone();
      },
    });

    // ── Centring — GSAP owns the transform on any element it animates with
    //    x/y/scale, so centre via xPercent/yPercent (Tailwind's % translate
    //    would be clobbered the moment GSAP writes transform). ──
    gsap.set(
      [q('.pl-reticle'), q('.pl-logo-wrap'), q('.pl-lock-ring'), q('.pl-impact-flash'), q('.pl-impact-ring'), q('.pl-ruler-h'), q('.pl-ruler-v')],
      { xPercent: -50, yPercent: -50 }
    );
    gsap.set(q('.pl-beam'), { xPercent: -50 });

    // ── Initial poses (belt-and-suspenders with the html.js CSS) ──
    gsap.set(q('.pl-reticle'), { x: start.x, y: start.y, opacity: 0 });
    gsap.set(q('.pl-logo'), {
      clipPath: 'inset(50% 50% 50% 50%)',
      filter: 'brightness(0) invert(1) blur(7px) drop-shadow(0 0 0px rgba(236,216,174,0))',
    });

    tl
      // ── INSTRUMENT POWERS ON ──
      .fromTo(q('.pl-tick'), { opacity: 0, scale: 0.4 }, { opacity: 0.65, scale: 1, duration: 0.28, stagger: 0.05, ease: 'power2.out' }, 0.1)
      .to(q('.pl-grid'), { opacity: 0.12, duration: 0.9, ease: 'power1.inOut' }, 0.25)
      .fromTo(q('.pl-glow'), { opacity: 0 }, { opacity: 0.42, duration: 1.3, ease: 'sine.out' }, 0.3)
      // counter + baseline — stage 1 (races to 92, lands with the lock)
      .to(counter, {
        v: 92, duration: 2.4, ease: 'power1.inOut',
        onUpdate: () => { if (countRef.current) countRef.current.textContent = String(Math.round(counter.v)).padStart(3, '0'); },
      }, 0.2)
      .fromTo(q('.pl-progress'), { scaleX: 0 }, { scaleX: 0.92, duration: 2.4, ease: 'power1.inOut' }, 0.2)

      // ── THE HUNT — reticle brackets the point in decelerating hops ──
      .to(q('.pl-reticle'), { opacity: 0.75, duration: 0.15 }, 0.45)
      .to(q('.pl-reticle'), { x: wp1.x, y: wp1.y, rotation: 3, duration: 0.35, ease: 'power3.out' }, 0.5)
      .to(q('.pl-reticle'), { x: wp2.x, y: wp2.y, rotation: -3, duration: 0.28, ease: 'power3.out' }, 0.85)
      .to(q('.pl-reticle'), { x: 0, y: 0, rotation: 0, duration: 0.22, ease: 'power2.out' }, 1.13)

      // ── LOCK — snap + a single confirming ping ──
      .to(q('.pl-reticle'), { scale: 1.15, duration: 0.08, ease: 'power4.out' }, 1.35)
      .to(q('.pl-reticle'), { scale: 1, duration: 0.18, ease: 'back.out(3)' }, 1.43)
      .fromTo(q('.pl-lock-ring'), { scale: 0, opacity: 0.8 }, { scale: 1.5, opacity: 0, duration: 0.45, ease: 'power2.out' }, 1.35)

      // ── COORDINATE ACQUIRED — false readings roll then settle true ──
      .fromTo(q('.pl-coord'), { opacity: 0 }, { opacity: 0.5, duration: 0.15 }, 1.4)
      .to(roll, {
        v: 1, duration: 0.5, ease: 'steps(9)',
        onUpdate: () => { if (coordRef.current) coordRef.current.textContent = roll.v < 0.8 ? scrambleCoord() : TRUE_COORD; },
        onComplete: () => { if (coordRef.current) coordRef.current.textContent = TRUE_COORD; },
      }, 1.4)
      .fromTo(q('.pl-coord'), { color: '#ECD8AE' }, { color: 'rgba(244,238,218,0.5)', duration: 0.6 }, 1.9)
      .fromTo(q('.pl-est'), { opacity: 0 }, { opacity: 0.5, duration: 0.25 }, 1.75)

      // ── THE LIGHT DROPS — a heavy gold shaft onto the locked point ──
      .fromTo(q('.pl-beam'), { scaleY: 0, opacity: 0, yPercent: -12 }, { scaleY: 1, opacity: 1, yPercent: 0, duration: 0.55, ease: 'power4.in' }, 1.8)
      // registration rulers extend through the point
      .fromTo(q('.pl-ruler-h'), { scaleX: 0 }, { scaleX: 1, duration: 0.35, ease: 'power2.inOut' }, 1.9)
      .fromTo(q('.pl-ruler-v'), { scaleY: 0 }, { scaleY: 1, duration: 0.35, ease: 'power2.inOut' }, 2.0)

      // ── IMPACT — flash + one shock ring; hex seal traces closed ──
      .fromTo(q('.pl-impact-flash'), { opacity: 0, scale: 0.6 }, { opacity: 0.9, scale: 1, duration: 0.07 }, 2.3)
      .to(q('.pl-impact-flash'), { opacity: 0, duration: 0.35, ease: 'power3.out' }, 2.37)
      .fromTo(q('.pl-impact-ring'), { scale: 0.2, opacity: 0.6 }, { scale: 2.4, opacity: 0, duration: 0.5, ease: 'power2.out' }, 2.3)
      .fromTo(q('.pl-hexring'), { strokeDashoffset: 1, opacity: 0 }, { strokeDashoffset: 0, opacity: 0.85, duration: 0.5, ease: 'power2.inOut' }, 2.3)
      .fromTo(q('.pl-hexring-echo'), { strokeDashoffset: 1, opacity: 0 }, { strokeDashoffset: 0, opacity: 0.16, duration: 0.5, ease: 'power2.inOut' }, 2.4)
      .to(q('.pl-beam'), { opacity: 0.18, duration: 0.5, ease: 'power2.out' }, 2.42)

      // counter — stage 2 races to 100 as the brand certifies
      .to(counter, {
        v: 100, duration: 0.28, ease: 'power2.out',
        onUpdate: () => { if (countRef.current) countRef.current.textContent = String(Math.round(counter.v)).padStart(3, '0'); },
      }, 2.6)
      .to(q('.pl-progress'), { scaleX: 1, backgroundColor: 'rgba(236,216,174,0.9)', duration: 0.28, ease: 'power2.out' }, 2.6)

      // ── SIGNATURE — the logo irises into hard focus, lit by the impact ──
      .to(q('.pl-logo'), {
        clipPath: 'inset(0% 0% 0% 0%)',
        filter: 'brightness(0) invert(1) blur(0px) drop-shadow(0 0 26px rgba(236,216,174,0.42))',
        duration: 0.5, ease: 'power4.out',
      }, 2.78)
      .to(q('.pl-reticle'), { scale: 1.06, duration: 0.12, ease: 'power2.out' }, 2.78)
      .to(q('.pl-reticle'), { scale: 1, opacity: 0.22, duration: 0.3, ease: 'power2.out' }, 2.9)
      // confirmation sheen + certified underline + settling dust
      .fromTo(q('.pl-sheen'), { xPercent: -120, opacity: 0 }, { xPercent: 120, opacity: 0.55, duration: 0.5, ease: 'power2.inOut' }, 2.85)
      .to(q('.pl-sheen'), { opacity: 0, duration: 0.2 }, 3.25)
      .fromTo(q('.pl-strap-underline'), { scaleX: 0 }, { scaleX: 1, duration: 0.35, ease: 'power2.out' }, 2.95)
      .fromTo(q('.pl-spark'), { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power2.out' }, 2.9)

      // ── HELD BEAT ──
      .to({}, { duration: 0.35 }, 3.15)

      // ── GRAND EXIT — the brand leads, the apparatus recedes, plate wipes up ──
      .to(q('.pl-logo-wrap'), { y: -12, scale: 1.035, duration: 0.6, ease: 'power2.out' }, 3.55)
      .to(
        [q('.pl-grid'), q('.pl-glow'), q('.pl-tick'), q('.pl-coord'), q('.pl-est'), q('.pl-ruler-h'), q('.pl-ruler-v'), q('.pl-hexring'), q('.pl-hexring-echo'), q('.pl-reticle'), q('.pl-beam'), q('.pl-spark'), q('.pl-progress')],
        { opacity: 0, duration: 0.45, ease: 'power2.in' },
        3.6
      )
      .to(root, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.7, ease: 'power4.in' }, 3.68);

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
      className="preloader-root fixed inset-0 z-[999] overflow-hidden"
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
          <svg key={i} className={`pl-tick absolute h-5 w-5 text-brass-300/70 ${pos}`} viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M1 1h7M1 1v7" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        ))}
      </div>

      {/* Registration marks — the survey stamp */}
      <div className="pointer-events-none absolute inset-x-0 top-[clamp(1.5rem,5vw,4rem)] flex justify-between px-[clamp(2.2rem,7vw,6rem)]">
        <span ref={coordRef} className="pl-coord micro-label text-ivory-50/50 tabular-nums">{TRUE_COORD}</span>
        <span className="pl-est micro-label text-ivory-50/50">EST. 2016</span>
      </div>

      {/* ── Benchmark-light apparatus, all centred on the lock point ── */}
      {/* the light shaft dropping onto the point */}
      <div
        className="pl-beam pointer-events-none absolute left-1/2 top-0 h-[54%] w-[min(15vw,150px)]"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, rgba(236,216,174,0.30) 42%, rgba(236,216,174,0.52) 66%, rgba(236,216,174,0.15) 88%, transparent 100%)',
          filter: 'blur(17px)',
          mixBlendMode: 'screen',
        }}
      />

      {/* registration rulers through the point */}
      <div
        className="pl-ruler-h pointer-events-none absolute left-1/2 top-1/2 h-px w-[min(88vw,780px)]"
        style={{ background: 'repeating-linear-gradient(90deg, rgba(236,216,174,0.5) 0 2px, transparent 2px 10px)', opacity: 0.35 }}
      />
      <div
        className="pl-ruler-v pointer-events-none absolute left-1/2 top-1/2 h-[min(64vh,520px)] w-px"
        style={{ background: 'repeating-linear-gradient(180deg, rgba(236,216,174,0.5) 0 2px, transparent 2px 10px)', opacity: 0.3 }}
      />

      {/* impact flash + shock ring where the light lands */}
      <div
        className="pl-impact-flash pointer-events-none absolute left-1/2 top-1/2 h-[460px] w-[460px]"
        style={{ background: 'radial-gradient(circle, rgba(236,216,174,0.6) 0%, rgba(236,216,174,0.12) 34%, transparent 62%)' }}
      />
      <div className="pl-impact-ring pointer-events-none absolute left-1/2 top-1/2 h-[130px] w-[130px] rounded-full border border-[#ECD8AE]" />

      {/* a single confirming ping at the reticle lock */}
      <div className="pl-lock-ring pointer-events-none absolute left-1/2 top-1/2 h-[92px] w-[92px] rounded-full border border-[#d9bc7a]" />

      {/* accent hexagon seal (echo of the monogram), plus a faint outer echo */}
      <svg className="pl-hexring pointer-events-none absolute left-1/2 top-1/2 h-[clamp(160px,27vw,270px)] w-[clamp(160px,27vw,270px)] -translate-x-1/2 -translate-y-1/2" viewBox="0 0 100 100" fill="none" aria-hidden="true">
        <polygon points="50,3 90,27 90,73 50,97 10,73 10,27" stroke="#b5830a" strokeWidth="0.7" pathLength={1} style={{ strokeDasharray: 1 }} />
      </svg>
      <svg className="pl-hexring-echo pointer-events-none absolute left-1/2 top-1/2 h-[clamp(230px,38vw,380px)] w-[clamp(230px,38vw,380px)] -translate-x-1/2 -translate-y-1/2" viewBox="0 0 100 100" fill="none" aria-hidden="true">
        <polygon points="50,3 90,27 90,73 50,97 10,73 10,27" stroke="#b5830a" strokeWidth="0.5" pathLength={1} style={{ strokeDasharray: 1 }} />
      </svg>

      {/* the theodolite reticle — hunts then locks, settles as a faint halo */}
      <svg className="pl-reticle pointer-events-none absolute left-1/2 top-1/2 h-[clamp(96px,15vw,132px)] w-[clamp(96px,15vw,132px)]" viewBox="0 0 100 100" fill="none" aria-hidden="true">
        <circle cx="50" cy="50" r="33" stroke="#d9bc7a" strokeWidth="1" opacity="0.9" />
        <circle cx="50" cy="50" r="43" stroke="#d9bc7a" strokeWidth="0.5" opacity="0.4" />
        <path d="M6 50h26M68 50h26M50 6v26M50 68v26" stroke="#d9bc7a" strokeWidth="0.9" />
        <path d="M50 0v6M50 94v6M0 50h6M94 50h6" stroke="#ECD8AE" strokeWidth="1.3" />
        <circle cx="50" cy="50" r="1.7" fill="#ECD8AE" />
      </svg>

      {/* ── THE LOGO — the hero, revealed by the light ── */}
      <div className="pl-logo-wrap absolute left-1/2 top-1/2">
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo-mark.svg"
            alt="Susee Homes"
            width={3232}
            height={944}
            className="pl-logo block h-[clamp(64px,10.5vw,116px)] w-auto"
          />
          <div className="pl-sheen absolute inset-0" />
        </div>
        {/* certified baseline under the lockup */}
        <div
          className="pl-strap-underline mx-auto mt-4 h-px w-[46%]"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(236,216,174,0.8), transparent)' }}
        />
      </div>

      {/* settling gold dust, just below the plaque */}
      <div className="pl-spark pointer-events-none absolute left-1/2 top-[calc(50%_+_clamp(64px,9vw,120px))] h-28 w-[min(80vw,520px)] -translate-x-1/2 [mask-image:radial-gradient(88%_120%_at_50%_0%,#000_12%,transparent_82%)]">
        <Sparkles className="h-full w-full" particleColor="#ECD8AE" particleDensity={1000} minSize={0.5} maxSize={1.35} speed={1} />
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
