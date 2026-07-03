'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
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

/**
 * Cinematic once-per-session opener: ivory curtain, counting index,
 * wordmark line-reveal, then the curtain lifts to unveil the hero.
 */
export default function Preloader() {
  const [mounted, setMounted] = useState(false);
  const [gone, setGone] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const t = useTranslations('preloader');

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || sessionStorage.getItem('susee-intro') === '1') {
      setGone(true);
      // Defer past this commit's effect flush so sibling listeners (Hero) exist
      const id = setTimeout(announceDone, 0);
      return () => clearTimeout(id);
    }
    sessionStorage.setItem('susee-intro', '1');
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = rootRef.current;
    if (!root) return;

    window.__lenis?.stop();

    const counter = { v: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        window.__lenis?.start();
        setGone(true);
        announceDone();
      },
    });

    tl.fromTo(
      root.querySelectorAll('.pl-line-inner'),
      { yPercent: 115 },
      { yPercent: 0, duration: 0.85, ease: 'power4.out', stagger: 0.1 },
      0.05
    )
      .fromTo(root.querySelector('.pl-tag'), { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.45)
      .to(
        counter,
        {
          v: 100,
          duration: 0.95,
          ease: 'power2.inOut',
          onUpdate: () => {
            if (countRef.current) {
              countRef.current.textContent = String(Math.round(counter.v)).padStart(3, '0');
            }
          },
        },
        0.1
      )
      .to(root.querySelector('.pl-rule'), { scaleX: 1, duration: 0.95, ease: 'power2.inOut' }, 0.1)
      .to(root, { yPercent: -100, duration: 0.85, ease: 'power4.inOut' }, '+=0.1');

    return () => {
      tl.kill();
      window.__lenis?.start();
    };
  }, [mounted]);

  if (gone || !mounted) return null;

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="fixed inset-0 z-[999] flex flex-col justify-between bg-ivory-50 px-[clamp(1.5rem,5vw,4.5rem)] py-8"
    >
      {/* top row */}
      <div className="flex items-center justify-between">
        <span className="micro-label text-text-muted">13.0480° N · 80.0966° E</span>
        <span className="micro-label text-text-muted">EST. 2016</span>
      </div>

      {/* center wordmark */}
      <div>
        <h2 className="font-display text-[clamp(2.6rem,7vw,5.5rem)] leading-[1.04] text-ink-900">
          <span className="block overflow-hidden pb-[0.12em] -mb-[0.12em]">
            <span className="pl-line-inner block">{t('brand')}</span>
          </span>
        </h2>
        <p className="pl-tag mt-4 font-mono text-[0.7rem] uppercase tracking-[0.24em] text-fern-600 opacity-0">
          {t('tagline')}
        </p>
      </div>

      {/* bottom row: progress rule + counter */}
      <div className="flex items-end justify-between gap-8">
        <div className="pl-rule h-px flex-1 origin-left scale-x-0 bg-ink-900/25" />
        <span ref={countRef} className="font-mono text-sm tabular-nums text-text-muted">
          000
        </span>
      </div>
    </div>
  );
}
