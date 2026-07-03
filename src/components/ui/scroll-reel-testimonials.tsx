'use client';

import * as React from 'react';
import Image from 'next/image';

/* ----------------------------------------------------------------
 * ScrollReelTestimonials — counter-rotating scroll reel + per-
 * character text rise (21st.dev), retoned for the Susee palette:
 * ivory paper, ink type, brass/mint sheen. The middle column is a
 * real vertical list of portraits that translates by one "pitch"
 * per step; the outer columns counter-rotate the opposite way.
 * ---------------------------------------------------------------- */

export interface ScrollReelTestimonial {
  quote: string;
  author: string;
  role?: string;
  image: string;
  alt?: string;
}

export interface ScrollReelTestimonialsProps {
  testimonials: ScrollReelTestimonial[];
  /** Per-character stagger in ms (default 6) */
  charStaggerMs?: number;
  className?: string;
}

/* Geometry — middle column pitch between portrait centers */
const CELL = 121.33;
const GAP = 8;
const STEP = 3 * (CELL + GAP);

const EXIT_MS = 240;
const SLIDE_MS = 800;
const EASE_INOUT = 'cubic-bezier(0.65,0,0.35,1)';

const QUOTE_CLASSES =
  'm-0 font-display-italic text-[1.05rem] leading-[1.5] text-ink-900 sm:text-[1.3rem]';
const AUTHOR_CLASSES =
  'm-0 font-mono text-[0.68rem] font-medium uppercase leading-[1.6] tracking-[0.16em] text-fern-700';

const FEATURED_SHADOW =
  '0 1.008px 0.705px -0.563px rgba(10,16,13,0.18), 0 2.389px 1.672px -1.125px rgba(10,16,13,0.17), 0 4.357px 3.05px -1.688px rgba(10,16,13,0.17), 0 7.244px 5.07px -2.25px rgba(10,16,13,0.16), 0 11.698px 8.188px -2.813px rgba(10,16,13,0.15), 0 19.148px 13.404px -3.375px rgba(10,16,13,0.13), 0 32.972px 23.08px -3.938px rgba(10,16,13,0.09), 0 60px 42px -4.5px rgba(10,16,13,0.02), inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -1px 0 rgba(10,16,13,0.5)';

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

/* Grapheme-cluster segmentation — plain Array.from() splits by code point,
 * which tears Tamil (and other Indic) combining vowel signs away from their
 * base consonant into separate inline-block boxes and breaks shaping into
 * dotted-circle placeholders. Intl.Segmenter groups each base + its
 * combining marks into one cluster so the animated spans stay shapeable. */
const graphemeSegmenter =
  typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function'
    ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    : null;

function splitGraphemes(text: string): string[] {
  if (graphemeSegmenter) {
    return Array.from(graphemeSegmenter.segment(text), (s) => s.segment);
  }
  return Array.from(text);
}

/* Blurred placeholder cell — limestone paper */
function Cell() {
  return (
    <div
      aria-hidden="true"
      className="shrink-0 rounded-xl border border-[var(--hairline-dark)] bg-gradient-to-b from-ivory-200 to-ivory-50 blur-[1px] shadow-[0_1px_2px_rgba(10,16,13,0.05),inset_0_2px_0_rgba(255,255,255,1)]"
      style={{ width: CELL, height: CELL }}
    />
  );
}

/* Featured portrait tile — desaturated into the survey-document look,
 * with a brass/mint sheen sweep */
function Featured({ src, alt }: { src: string; alt?: string }) {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-xl bg-ivory-200"
      style={{ width: CELL, height: CELL, boxShadow: FEATURED_SHADOW }}
    >
      <Image
        src={src}
        alt={alt ?? ''}
        fill
        loading="lazy"
        sizes="122px"
        className="object-cover object-[center_30%]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[2] bg-white mix-blend-saturation"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[3] blur-[6px] mix-blend-overlay"
        style={{
          background:
            'linear-gradient(220.99deg, rgba(217,188,122,0) 32%, rgb(217,188,122) 41%, rgb(236,211,156) 47%, rgba(116,212,160,0.5) 54%, rgba(116,212,160,0) 65%)',
        }}
      />
    </div>
  );
}

/* Per-character split — spaces live between word spans as plain text
 * nodes so natural line-wrapping is preserved. */
function Chars({
  text,
  startIndex,
  staggerMs,
}: {
  text: string;
  startIndex: number;
  staggerMs: number;
}) {
  let idx = startIndex;
  const words = text.split(' ');
  return (
    <>
      {words.map((word, wi) => {
        const wordSpan = (
          <span className="inline-block whitespace-nowrap">
            {splitGraphemes(word).map((ch, ci) => {
              const delay = idx * staggerMs;
              idx++;
              return (
                <span key={ci} className="scroll-reel-char" style={{ animationDelay: `${delay}ms` }}>
                  {ch}
                </span>
              );
            })}
          </span>
        );
        if (wi < words.length - 1) idx++;
        return (
          <React.Fragment key={wi}>
            {wordSpan}
            {wi < words.length - 1 ? ' ' : null}
          </React.Fragment>
        );
      })}
    </>
  );
}

export function ScrollReelTestimonials({
  testimonials,
  charStaggerMs = 6,
  className,
}: ScrollReelTestimonialsProps) {
  const [index, setIndex] = React.useState(0);
  const [displayIndex, setDisplayIndex] = React.useState(0);
  const [exiting, setExiting] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const animating = React.useRef(false);
  const timeouts = React.useRef<ReturnType<typeof setTimeout>[]>([]);

  const count = testimonials.length;

  React.useEffect(() => {
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setMounted(true)));
    const pending = timeouts.current;
    return () => {
      cancelAnimationFrame(raf);
      pending.forEach(clearTimeout);
    };
  }, []);

  const paginate = React.useCallback(
    (dir: 1 | -1) => {
      if (animating.current) return;
      const next = index + dir;
      if (next < 0 || next >= count) return;
      animating.current = true;

      setIndex(next);
      setExiting(true);

      timeouts.current.push(
        setTimeout(() => {
          setDisplayIndex(next);
          setExiting(false);
        }, EXIT_MS)
      );
      timeouts.current.push(
        setTimeout(() => {
          animating.current = false;
        }, SLIDE_MS)
      );
    },
    [index, count]
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      paginate(1);
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      paginate(-1);
    }
  };

  const middleItems = React.useMemo(() => {
    const items: Array<{ type: 'cell' } | { type: 'featured'; i: number }> = [];
    for (let i = 0; i < 3; i++) items.push({ type: 'cell' });
    testimonials.forEach((_, i) => {
      items.push({ type: 'featured', i });
      if (i < count - 1) {
        items.push({ type: 'cell' }, { type: 'cell' });
      }
    });
    for (let i = 0; i < 3; i++) items.push({ type: 'cell' });
    return items;
  }, [testimonials, count]);

  const sideCellCount = 4 + 2 * count;
  const centerIdx = (count - 1) / 2;
  const middleY = (centerIdx - index) * STEP;
  const sideY = -middleY;

  const colStyle = (y: number): React.CSSProperties => ({
    transform: `translateY(${y}px)`,
    transition: mounted ? `transform ${SLIDE_MS}ms ${EASE_INOUT}` : 'none',
  });

  const current = testimonials[displayIndex];
  const authorLine = current.role ? `${current.author} · ${current.role}` : current.author;

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Testimonials"
      tabIndex={0}
      onKeyDown={onKeyDown}
      className={cn(
        'relative flex w-full max-w-[1060px] flex-col items-stretch gap-2.5 overflow-hidden rounded-xl border border-[var(--hairline-dark)] bg-ivory-100 shadow-[inset_0_2px_0_rgba(255,255,255,1),0_24px_70px_-30px_rgba(10,16,13,0.25)] outline-none focus-visible:ring-2 focus-visible:ring-brass-300 md:min-h-[320px] md:flex-row',
        className
      )}
    >
      {/* Reel section */}
      <div
        aria-hidden="true"
        className="relative h-56 w-full shrink-0 self-stretch overflow-hidden md:h-auto md:w-[380px]"
        style={{
          WebkitMaskImage:
            'linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)',
          maskImage:
            'linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)',
          WebkitMaskComposite: 'source-in',
          maskComposite: 'intersect',
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center gap-2">
          <div
            className="flex shrink-0 flex-col gap-2 will-change-transform motion-reduce:[transition:none!important]"
            style={colStyle(sideY)}
          >
            {Array.from({ length: sideCellCount }).map((_, i) => (
              <Cell key={i} />
            ))}
          </div>

          <div
            className="flex shrink-0 flex-col gap-2 will-change-transform motion-reduce:[transition:none!important]"
            style={colStyle(middleY)}
          >
            {middleItems.map((item, i) =>
              item.type === 'featured' ? (
                <Featured key={i} src={testimonials[item.i].image} alt={testimonials[item.i].alt} />
              ) : (
                <Cell key={i} />
              )
            )}
          </div>

          <div
            className="flex shrink-0 flex-col gap-2 will-change-transform motion-reduce:[transition:none!important]"
            style={colStyle(sideY)}
          >
            {Array.from({ length: sideCellCount }).map((_, i) => (
              <Cell key={i} />
            ))}
          </div>
        </div>
      </div>

      {/* Content section */}
      <div className="flex min-w-0 flex-1 flex-col justify-between self-stretch px-6 py-7 md:py-10">
        <div className="flex flex-col gap-[9px]">
          <svg
            className="block h-11 w-11 text-brass-300/50"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M4.58 17.32C3.55 16.23 3 15 3 13.01c0-3.5 2.46-6.64 6.03-8.19l.9 1.38c-3.34 1.8-4 4.15-4.25 5.62.54-.28 1.24-.38 1.93-.31 1.8.17 3.23 1.65 3.23 3.49a3.5 3.5 0 0 1-3.5 3.5c-1.07 0-2.1-.49-2.75-1.18zm10 0C13.55 16.23 13 15 13 13.01c0-3.5 2.46-6.64 6.03-8.19l.9 1.38c-3.34 1.8-4 4.15-4.25 5.62.54-.28 1.24-.38 1.93-.31 1.8.17 3.23 1.65 3.23 3.49a3.5 3.5 0 0 1-3.5 3.5c-1.07 0-2.1-.49-2.75-1.18z" />
          </svg>

          {/* Text stage */}
          <div className="relative w-full max-w-[420px] overflow-hidden" aria-live="polite">
            <div aria-hidden="true" className="invisible flex min-h-[150px] flex-col gap-[19px]">
              <p className={QUOTE_CLASSES}>{current.quote}</p>
              <p className={AUTHOR_CLASSES}>{authorLine}</p>
            </div>
            <div
              key={displayIndex}
              className={cn(
                'absolute inset-x-0 top-0 flex flex-col gap-[19px] will-change-[transform,opacity]',
                exiting && 'scroll-reel-exit'
              )}
            >
              <p className={QUOTE_CLASSES}>
                <Chars text={current.quote} startIndex={0} staggerMs={charStaggerMs} />
              </p>
              <p className={AUTHOR_CLASSES}>
                <Chars text={authorLine} startIndex={current.quote.length + 6} staggerMs={charStaggerMs} />
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 flex items-center justify-between md:mt-0">
          <span className="font-mono text-[0.7rem] tracking-[0.2em] text-text-muted tabular-nums">
            {String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => paginate(-1)}
              disabled={index === 0}
              aria-label="Previous testimonial"
              className="grid h-9 w-9 cursor-pointer place-items-center rounded-sm border border-ink-900/20 bg-transparent p-0 text-ink-900 transition-[opacity,transform,border-color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:enabled:scale-[1.08] hover:enabled:border-fern-600 active:enabled:scale-[0.94] disabled:cursor-default disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-300"
            >
              <svg
                className="h-3.5 w-3.5 opacity-70"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7.5 2.5 3.5 6l4 3.5" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => paginate(1)}
              disabled={index === count - 1}
              aria-label="Next testimonial"
              className="grid h-9 w-9 cursor-pointer place-items-center rounded-sm border border-ink-900/20 bg-transparent p-0 text-ink-900 transition-[opacity,transform,border-color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:enabled:scale-[1.08] hover:enabled:border-fern-600 active:enabled:scale-[0.94] disabled:cursor-default disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-300"
            >
              <svg
                className="h-3.5 w-3.5 opacity-70"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m4.5 2.5 4 3.5-4 3.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScrollReelTestimonials;
