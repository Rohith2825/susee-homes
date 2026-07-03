'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Eyebrow from '@/components/ui/Eyebrow';
import SplitLines from '@/components/motion/SplitLines';
import { PlotIcon, HomeIcon, BuildIcon, KeyIcon } from '@/components/ui/icons';
import { ANCHORS } from '@/lib/site';

gsap.registerPlugin(ScrollTrigger);

interface Step {
  n: string;
  title: string;
  body: string;
}

const STEP_ICONS = [PlotIcon, HomeIcon, BuildIcon, KeyIcon] as const;

/** Chapter stills from the client's own film — land, layout, build,
 *  arrival — so every sheet's imagery is already in the site's palette. */
const STEP_STILLS = [
  '/hero-frames/hq/ch-0.jpg',
  '/hero-frames/hq/ch-1.jpg',
  '/hero-frames/hq/ch-2.jpg',
  '/hero-frames/hq/final.jpg',
] as const;

/** Per-tone grade laid over each still so it melts into the sheet. */
const STILL_GRADE = [
  'linear-gradient(to left, rgba(247,244,236,0.14), rgba(247,244,236,0.62))',
  'linear-gradient(to left, rgba(241,236,223,0.16), rgba(241,236,223,0.66))',
  'linear-gradient(to left, rgba(27,67,50,0.34), rgba(27,67,50,0.78))',
  'linear-gradient(to left, rgba(10,16,13,0.3), rgba(14,23,19,0.78))',
] as const;

/** Per-sheet material — the journey darkens from paper plan to built home:
 *  survey paper → warm paper → fern (the build) → ink & brass (the keys). */
const SHEET = [
  {
    card: 'bg-ivory-50 border border-[var(--hairline-dark)] text-ink-900',
    icon: 'border-fern-600/25 text-fern-600',
    body: 'text-text-muted',
    label: 'text-bronze-700',
    rule: 'border-[var(--hairline-dark)]',
    dot: 'border-fern-600',
    dotDone: 'bg-fern-600 border-fern-600',
    dark: false,
  },
  {
    card: 'blueprint-grid bg-ivory-100 border border-[var(--hairline-dark)] text-ink-900',
    icon: 'border-fern-600/25 text-fern-600',
    body: 'text-text-muted',
    label: 'text-bronze-700',
    rule: 'border-[var(--hairline-dark)]',
    dot: 'border-fern-600',
    dotDone: 'bg-fern-600 border-fern-600',
    dark: false,
  },
  {
    card: 'on-dark grain bg-fern-700 text-ivory-50',
    icon: 'border-ivory-50/20 text-mint-400',
    body: 'text-ivory-50/75',
    label: 'text-brass-200/90',
    rule: 'border-ivory-50/15',
    dot: 'border-ivory-50/50',
    dotDone: 'bg-brass-200 border-brass-200',
    dark: true,
  },
  {
    card: 'on-dark grain blueprint-grid blueprint-grid-dark bg-ink-900 text-ivory-50',
    icon: 'border-brass-200/30 text-brass-200',
    body: 'text-ivory-50/75',
    label: 'text-brass-200/90',
    rule: 'border-ivory-50/15',
    dot: 'border-ivory-50/50',
    dotDone: 'bg-brass-200 border-brass-200',
    dark: true,
  },
] as const;

/**
 * S.03 — the deed stack. Each step is a survey sheet that pins under the
 * nav; the next numbered sheet slides up and covers it, and covered sheets
 * recede — scale down and dim — like deeds being filed in order.
 * Sticky stacking is pure CSS; GSAP only drives the recede (scrubbed).
 */
export default function Process() {
  const t = useTranslations('process');
  const steps = t.raw('steps') as Step[];
  const rootRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>('.process-card', root);
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        if (!next) return;
        const inner = card.querySelector('.process-card-inner');
        const dim = card.querySelector('.process-card-dim');
        // As the next sheet rises over this one, this sheet recedes.
        const trig = {
          trigger: next,
          start: 'top bottom',
          end: 'top top+=140',
          scrub: true,
        };
        gsap.fromTo(inner, { scale: 1 }, { scale: 0.95 - (cards.length - 1 - i) * 0.006, ease: 'none', scrollTrigger: trig });
        gsap.fromTo(dim, { opacity: 0 }, { opacity: SHEET[i].dark ? 0.42 : 0.16, ease: 'none', scrollTrigger: trig });
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section id={ANCHORS.process} className="section-pad bg-ivory-50">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow index="03" className="text-fern-700">
              {t('eyebrow')}
            </Eyebrow>
            <SplitLines as="h2" text={t('heading')} className="font-display text-h2 mt-6 text-ink-900" />
          </div>
          <span data-reveal="" className="micro-label mb-2 hidden text-text-muted md:block">
            01 — 04
          </span>
        </div>

        {/* ── The deed stack ── */}
        <ol ref={rootRef} className="process-stack mt-16">
          {steps.map((s, i) => {
            const sheet = SHEET[i] ?? SHEET[0];
            const Icon = STEP_ICONS[i] ?? PlotIcon;
            return (
              <li
                key={i}
                className={`process-card ${sheet.dark ? 'process-card-dark' : ''}`}
                style={{ '--stack-i': i } as React.CSSProperties}
              >
                <div
                  className={`process-card-inner shadow-[0_24px_70px_-30px_rgba(10,16,13,0.35)] ${sheet.card}`}
                >
                  {/* Sheet media — the step's chapter still, masked into the tone */}
                  <div className="process-card-media" aria-hidden="true">
                    <Image
                      src={STEP_STILLS[i] ?? STEP_STILLS[0]}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 42vw, 90vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0" style={{ background: STILL_GRADE[i] }} />
                  </div>

                  {/* Sheet numeral */}
                  <span aria-hidden="true" className="process-num">
                    {s.n}
                  </span>
                  <span className="process-card-dim" aria-hidden="true" />

                  {/* Instrument head */}
                  <div className="relative flex items-start justify-between">
                    <span
                      className={`inline-flex h-14 w-14 items-center justify-center rounded-sm border ${sheet.icon}`}
                    >
                      <Icon />
                    </span>
                    <span className={`micro-label ${sheet.label}`}>
                      {t('eyebrow')} · {s.n} / 04
                    </span>
                  </div>

                  <div className="relative mt-auto pt-10">
                    <h3 className="font-display max-w-2xl text-[clamp(1.7rem,3.4vw,2.7rem)] leading-[1.08]">
                      {s.title}
                    </h3>
                    <p className={`mt-4 max-w-xl text-[0.98rem] leading-[1.8] ${sheet.body}`}>{s.body}</p>

                    {/* Filing rail — how deep in the stack we are */}
                    <div className={`mt-9 flex items-center gap-4 border-t pt-6 ${sheet.rule}`}>
                      <div className="flex items-center gap-2.5" aria-hidden="true">
                        {steps.map((_, j) => (
                          <span
                            key={j}
                            className={`h-[9px] w-[9px] rounded-full border-[1.5px] ${
                              j <= i ? sheet.dotDone : sheet.dot
                            }`}
                          />
                        ))}
                      </div>
                      <span className={`plot-dash flex-1 ${sheet.dark ? 'text-ivory-50' : 'text-ink-900'}`} />
                      <span className={`micro-label ${sheet.label}`}>
                        {s.n} — 04
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
