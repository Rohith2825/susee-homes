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
 * THE FOUNDATION — a grounded, architectural overture for a builder.
 *
 * On a deep-ink blueprint stage the corner ticks register and the grid
 * breathes up; a brass FOUNDATION line strikes across the centre — the datum
 * a build starts from. A soft light swells and the LOGO RISES up out of that
 * line into hard focus, the way a structure is raised from its base. A single
 * gold sheen crosses it, dust settles, the counter reaches 100 — one held
 * beat, then the plate wipes up to unveil the film. No scopes, no targets;
 * just a mark built up from the ground. Transform/opacity/clip-path/filter
 * only, so it never janks.
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

    // GSAP owns the transform on the centred, transform-animated elements —
    // centre via xPercent/yPercent so its matrix keeps the -50%/-50% offset.
    gsap.set([q('.pl-logo-wrap'), q('.pl-bloom')], { xPercent: -50, yPercent: -50 });
    gsap.set(q('.pl-logo'), {
      clipPath: 'inset(100% 0% 0% 0%)',
      filter: 'blur(9px) drop-shadow(0 0 0px rgba(236,216,174,0))',
    });

    tl
      // ── Blueprint stage registers ──
      .fromTo(q('.pl-tick'), { opacity: 0, scale: 0.4 }, { opacity: 0.6, scale: 1, duration: 0.3, stagger: 0.05, ease: 'power2.out' }, 0.15)
      .to(q('.pl-grid'), { opacity: 0.12, duration: 0.9, ease: 'power1.inOut' }, 0.3)
      .fromTo(q('.pl-glow'), { opacity: 0 }, { opacity: 0.4, duration: 1.3, ease: 'sine.out' }, 0.3)
      .fromTo([q('.pl-coord'), q('.pl-est')], { opacity: 0, y: -6 }, { opacity: 0.5, y: 0, duration: 0.6, stagger: 0.1 }, 0.5)
      // counter + baseline run through the build
      .to(counter, {
        v: 100, duration: 2.5, ease: 'power1.inOut',
        onUpdate: () => { if (countRef.current) countRef.current.textContent = String(Math.round(counter.v)).padStart(3, '0'); },
      }, 0.5)
      .fromTo(q('.pl-progress'), { scaleX: 0 }, { scaleX: 1, duration: 2.5, ease: 'power1.inOut' }, 0.5)

      // ── The FOUNDATION line strikes across ──
      .fromTo(q('.pl-foundation'), { scaleX: 0 }, { scaleX: 1, duration: 0.85, ease: 'power2.inOut' }, 0.9)

      // ── The light swells and the LOGO RISES from the line into focus ──
      .fromTo(q('.pl-bloom'), { opacity: 0, scale: 0.72 }, { opacity: 0.5, scale: 1, duration: 1.2, ease: 'power2.out' }, 1.35)
      .fromTo(
        q('.pl-logo'),
        { clipPath: 'inset(100% 0% 0% 0%)', y: 26, filter: 'blur(9px) drop-shadow(0 0 0px rgba(236,216,174,0))' },
        { clipPath: 'inset(0% 0% 0% 0%)', y: 0, filter: 'blur(0px) drop-shadow(0 0 22px rgba(236,216,174,0.4))', duration: 0.95, ease: 'power3.out' },
        1.5
      )

      // ── Sheen confirms it; dust settles off the base ──
      .fromTo(q('.pl-sheen'), { xPercent: -120, opacity: 0 }, { xPercent: 120, opacity: 0.5, duration: 0.6, ease: 'power2.inOut' }, 2.15)
      .to(q('.pl-sheen'), { opacity: 0, duration: 0.2 }, 2.6)
      .fromTo(q('.pl-spark'), { opacity: 0 }, { opacity: 1, duration: 0.7, ease: 'power2.out' }, 2.05)

      // ── Held beat ──
      .to({}, { duration: 0.3 }, 2.95)

      // ── Exit — the mark leads, the blueprint recedes, plate wipes up ──
      .to(q('.pl-logo-wrap'), { y: -14, scale: 1.03, duration: 0.6, ease: 'power2.out' }, 3.25)
      .to(
        [q('.pl-grid'), q('.pl-glow'), q('.pl-tick'), q('.pl-coord'), q('.pl-est'), q('.pl-foundation'), q('.pl-bloom'), q('.pl-spark'), q('.pl-progress')],
        { opacity: 0, duration: 0.45, ease: 'power2.in' },
        3.3
      )
      .to(root, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.7, ease: 'power4.in' }, 3.38);

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

      {/* ── THE MARK — rises from the foundation line ── */}
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
        {/* the foundation / datum line the mark is built up from */}
        <div
          className="pl-foundation mx-auto mt-5 h-px w-[min(64vw,520px)]"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(236,216,174,0.85) 20%, rgba(236,216,174,0.85) 80%, transparent)' }}
        />
      </div>

      {/* settling gold dust, just below the foundation */}
      <div className="pl-spark pointer-events-none absolute left-1/2 top-[calc(50%_+_clamp(70px,10vw,128px))] h-28 w-[min(80vw,520px)] -translate-x-1/2 [mask-image:radial-gradient(88%_120%_at_50%_0%,#000_12%,transparent_82%)]">
        <Sparkles className="h-full w-full" particleColor="#ECD8AE" particleDensity={900} minSize={0.5} maxSize={1.3} speed={1} />
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
