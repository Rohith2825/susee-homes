'use client';

import { useCallback, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { gsap } from 'gsap';
import Eyebrow from '@/components/ui/Eyebrow';
import SplitLines from '@/components/motion/SplitLines';
import { Boxes } from '@/components/ui/background-boxes';
import { ANCHORS } from '@/lib/site';

interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

/**
 * S.NO 08 — words of record. One pull-quote at a time, manually advanced,
 * 550ms crossfade. No autoplay, no stars, no avatars — just testimony.
 */
export default function Testimonials() {
  const t = useTranslations('testimonials');
  const items = t.raw('items') as Testimonial[];

  const [idx, setIdx] = useState(0);
  const quoteRef = useRef<HTMLDivElement>(null);
  const busy = useRef(false);

  const go = useCallback(
    (dir: 1 | -1) => {
      if (busy.current) return;
      const el = quoteRef.current;
      const next = (idx + dir + items.length) % items.length;

      if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setIdx(next);
        return;
      }
      busy.current = true;
      gsap.to(el, {
        autoAlpha: 0,
        y: -14,
        duration: 0.26,
        ease: 'power2.in',
        onComplete: () => {
          setIdx(next);
          gsap.fromTo(
            el,
            { autoAlpha: 0, y: 16 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.34,
              ease: 'power2.out',
              onComplete: () => {
                busy.current = false;
              },
            }
          );
        },
      });
    },
    [idx, items.length]
  );

  const item = items[idx];

  return (
    <section id={ANCHORS.testimonials} className="section-pad relative overflow-hidden bg-ivory-100">
      {/* Living survey grid — tiles light up in the palette under the cursor */}
      <Boxes />
      {/* Vignette: quiet ivory at the edges, live tiles in the middle */}
      <div
        className="pointer-events-none absolute inset-0 z-10 bg-ivory-100 [mask-image:radial-gradient(transparent,white)]"
        aria-hidden="true"
      />
      {/* pointer-events fall through the layout boxes so the tiles stay
          hoverable everywhere except the actual content */}
      <div className="container-x pointer-events-none relative z-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="pointer-events-auto">
            <Eyebrow index="08" className="text-fern-700">
              {t('eyebrow')}
            </Eyebrow>
            <SplitLines as="h2" text={t('heading')} className="font-display text-h2 mt-6 text-ink-900" />
          </div>
        </div>

        <div data-reveal="" className="survey-frame pointer-events-auto relative mx-auto mt-16 max-w-3xl text-ink-900/60">
          <span className="tick-b" aria-hidden="true" />
          <div className="border border-[var(--hairline-dark)] bg-ivory-50 px-[clamp(1.6rem,4vw,3.5rem)] py-[clamp(2.2rem,4vw,3.5rem)]">
            <div ref={quoteRef} aria-live="polite">
              <blockquote className="font-display-italic min-h-[9rem] text-[clamp(1.25rem,2.2vw,1.7rem)] leading-[1.6] text-ink-900 sm:min-h-[10rem]">
                “{item.quote}”
              </blockquote>
              <p className="mt-8 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-fern-700">
                {item.name}
              </p>
              <p className="mt-1 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-text-muted">
                {item.role}
              </p>
            </div>

            {/* controls */}
            <div className="mt-9 flex items-center justify-between border-t border-[var(--hairline-dark)] pt-6">
              <span className="font-mono text-[0.7rem] tracking-[0.2em] text-text-muted tabular-nums">
                {String(idx + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
              </span>
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Previous testimonial"
                  className="flex h-10 w-10 items-center justify-center rounded-sm border border-ink-900/20 text-ink-900/70 transition-colors duration-300 hover:border-fern-600 hover:bg-fern-600 hover:text-ivory-50"
                >
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path d="M14.5 8h-13M6.5 3l-5 5 5 5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Next testimonial"
                  className="flex h-10 w-10 items-center justify-center rounded-sm border border-ink-900/20 text-ink-900/70 transition-colors duration-300 hover:border-fern-600 hover:bg-fern-600 hover:text-ivory-50"
                >
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path d="M1.5 8h13M9.5 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
