'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import CardSwap, { Card } from '@/components/ui/card-swap';
import { ArrowUpRight, CompassRose } from '@/components/ui/icons';

export interface UpcomingCard {
  name: string;
  loc: string;
  area: string;
  status: string;
}

interface Props {
  cards: UpcomingCard[];
  comingSoon: string;
  ctaLabel: string;
  ctaHref: string;
}

type Cell = { r: number; c: number; kind: 'plot' | 'premium' | 'available' };

/** Dark procedural plat — a survey document rendered on ink, matching the
 *  ALIGHT masterplan's language: fern plots, brass boundary, a few available
 *  markers, a road cross and scale. Each project gets a deterministic layout. */
function PlotPlate({ seed }: { seed: number }) {
  const cols = 5 + (seed % 3);
  const rows = 4 + (seed % 2);
  const cells: Cell[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if ((r + c + seed) % 9 === 0) continue; // open space
      const kind: Cell['kind'] =
        (r * cols + c + seed) % 11 === 0 ? 'available' : (r + c * 2 + seed) % 6 === 0 ? 'premium' : 'plot';
      cells.push({ r, c, kind });
    }
  }
  const cw = 176 / cols;
  const rh = 120 / rows;
  const roadX = 84 + (seed % 3) * 8;
  const roadY = 60 + (seed % 3) * 6;

  return (
    <svg viewBox="0 0 200 150" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="200" height="150" fill="#0a100d" />
      {/* sub-grid */}
      <g stroke="rgba(116,212,160,0.06)" strokeWidth="0.4">
        {Array.from({ length: 21 }, (_, i) => (
          <line key={`v${i}`} x1={i * 10} y1="0" x2={i * 10} y2="150" />
        ))}
        {Array.from({ length: 16 }, (_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 10} x2="200" y2={i * 10} />
        ))}
      </g>
      <g transform="translate(12,16)">
        {/* roads */}
        <line x1={roadX} y1="-2" x2={roadX} y2="122" stroke="rgba(247,244,236,0.15)" strokeWidth="3.4" strokeLinecap="square" />
        <line x1="-2" y1={roadY} x2="178" y2={roadY} stroke="rgba(247,244,236,0.15)" strokeWidth="3.4" strokeLinecap="square" />
        {/* plots */}
        {cells.map((cell, i) => (
          <g key={i}>
            <rect
              x={cell.c * cw + 2}
              y={cell.r * rh + 2}
              width={cw - 4}
              height={rh - 4}
              rx="1"
              fill={
                cell.kind === 'premium'
                  ? 'rgba(217,188,122,0.13)'
                  : cell.kind === 'available'
                    ? 'rgba(201,106,74,0.10)'
                    : 'rgba(45,106,79,0.10)'
              }
              stroke={cell.kind === 'premium' ? 'rgba(217,188,122,0.5)' : 'rgba(116,212,160,0.34)'}
              strokeWidth="0.5"
            />
            {cell.kind === 'available' && (
              <circle cx={cell.c * cw + cw / 2} cy={cell.r * rh + rh / 2} r="1.5" fill="#c96a4a" />
            )}
          </g>
        ))}
        {/* boundary */}
        <rect x="-1" y="-1" width="178" height="122" fill="none" stroke="rgba(217,188,122,0.55)" strokeWidth="0.8" strokeDasharray="5 3.5" />
      </g>
    </svg>
  );
}

/** One project record — shared by the stack card and the expanded panel so
 *  the ghost morph is a true continuation. */
function Record({ card, seed, comingSoon, expanded }: { card: UpcomingCard; seed: number; comingSoon: string; expanded?: boolean }) {
  return (
    <div className="flex h-full w-full flex-col bg-ink-900">
      <div className="relative flex-1 overflow-hidden">
        <PlotPlate seed={seed} />
        {/* top scrim for chip legibility + bottom fade into the footer */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-ink-950/85 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ink-900 to-transparent" />

        {/* survey furniture on the plate */}
        <span className="absolute left-4 top-3.5 font-mono text-[0.58rem] uppercase tracking-[0.16em] text-ivory-50/45">
          Survey · S.06
        </span>
        <span
          className={`absolute top-3.5 rounded-sm border border-brass-300/45 bg-ink-950/70 px-2.5 py-1 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-brass-200 backdrop-blur-sm ${
            expanded ? 'right-14' : 'right-4'
          }`}
        >
          {card.status}
        </span>
        <span className="pointer-events-none absolute bottom-3.5 right-4 text-brass-200/70">
          <CompassRose size={26} />
        </span>
        <span className="font-display-italic pointer-events-none absolute bottom-3 left-4 text-[0.95rem] text-brass-200/85">
          {comingSoon}
        </span>
      </div>

      <div className="border-t border-brass-300/15 px-5 py-4">
        <h3 className={`font-display text-ivory-50 ${expanded ? 'text-[1.9rem]' : 'text-[1.35rem]'}`}>{card.name}</h3>
        <div className="mt-2 flex items-center gap-2.5 font-mono text-[0.64rem] uppercase tracking-[0.14em] text-ivory-50/55">
          <span>{card.loc}</span>
          <span className="h-3 w-px bg-ivory-50/20" />
          <span className="text-mint-400/80">{card.area}</span>
        </div>
        {expanded && (
          <p className="mt-4 max-w-md text-[0.92rem] leading-relaxed text-ivory-50/70">
            Part of the Susee pipeline — DTCP-approved, RERA-ready plotted developments delivered with the same clear
            documentation and full infrastructure as Project ALIGHT.
          </p>
        )}
      </div>
    </div>
  );
}

const CARD_W = 340;
const CARD_H = 440;

export default function UpcomingShowcase({ cards, comingSoon, ctaLabel, ctaHref }: Props) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [inView, setInView] = useState(false);
  const deckRef = useRef<HTMLDivElement>(null);
  const originRef = useRef<DOMRect | null>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef(false);

  useEffect(() => setMounted(true), []);

  // Freeze the dealing deck while the section is off-screen.
  useEffect(() => {
    const el = deckRef.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => setInView(entries.some((e) => e.isIntersecting)), {
      rootMargin: '150px 0px',
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const targetRect = useCallback(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w = Math.min(560, vw * 0.92);
    const h = Math.min(660, vh * 0.88);
    return { left: (vw - w) / 2, top: (vh - h) / 2, width: w, height: h };
  }, []);

  const openCard = (idx: number, el: HTMLElement) => {
    if (expanded !== null) return;
    originRef.current = el.getBoundingClientRect();
    setExpanded(idx);
  };

  const closeCard = useCallback(() => {
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    const origin = originRef.current;
    if (!panel || !backdrop || !origin || closingRef.current) {
      setExpanded(null);
      return;
    }
    closingRef.current = true;
    const t = targetRect();
    const sx = origin.width / t.width;
    const sy = origin.height / t.height;
    gsap.to(backdrop, { opacity: 0, duration: 0.42, ease: 'power2.in' });
    gsap.to(panel, {
      x: origin.left - t.left,
      y: origin.top - t.top,
      scaleX: sx,
      scaleY: sy,
      opacity: 0.1,
      duration: 0.5,
      ease: 'power3.in',
      onComplete: () => {
        closingRef.current = false;
        setExpanded(null);
      },
    });
  }, [targetRect]);

  // FLIP grow-in — a MacBook-style ghost morph from the card's exact position
  useEffect(() => {
    if (expanded === null) return;
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    const origin = originRef.current;
    if (!panel || !backdrop || !origin) return;

    const t = targetRect();
    const sx = origin.width / t.width;
    const sy = origin.height / t.height;

    gsap.set(panel, {
      x: origin.left - t.left,
      y: origin.top - t.top,
      scaleX: sx,
      scaleY: sy,
      opacity: 0.55,
      transformOrigin: 'top left',
    });
    gsap.set(backdrop, { opacity: 0 });
    gsap.to(backdrop, { opacity: 1, duration: 0.55, ease: 'power2.out' });
    gsap.to(panel, { x: 0, y: 0, scaleX: 1, scaleY: 1, opacity: 1, duration: 0.72, ease: 'expo.out' });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCard();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [expanded, targetRect, closeCard]);

  const t = expanded !== null ? targetRect() : null;

  return (
    <>
      <div ref={deckRef} className="relative h-[440px] w-full sm:h-[500px]">
        <CardSwap
          width={CARD_W}
          height={CARD_H}
          cardDistance={54}
          verticalDistance={56}
          delay={4200}
          skewAmount={5}
          easing="elastic"
          pauseOnHover
          paused={expanded !== null || !inView}
        >
          {cards.map((c, i) => (
            <Card
              key={i}
              className="overflow-hidden rounded-[14px] border border-brass-300/25 shadow-[0_40px_90px_-45px_rgba(6,10,8,0.85)]"
              onClick={(e) => openCard(i, e.currentTarget)}
            >
              <Record card={c} seed={i + 1} comingSoon={comingSoon} />
            </Card>
          ))}
        </CardSwap>
      </div>

      {/* Ghost-expand overlay — portaled to <body> so `position: fixed`
          escapes the section's transformed / overflow-hidden ancestors. */}
      {mounted && expanded !== null && t &&
        createPortal(
          <div role="dialog" aria-modal="true" aria-label={cards[expanded].name}>
            <div ref={backdropRef} className="ghost-backdrop" onClick={closeCard} />
            <div
              ref={panelRef}
              className="ghost-panel overflow-hidden rounded-[16px] border border-brass-300/30 shadow-[0_70px_160px_-40px_rgba(6,10,8,0.95)]"
              style={{ left: t.left, top: t.top, width: t.width, height: t.height }}
            >
              <button
                type="button"
                onClick={closeCard}
                aria-label="Close"
                className="absolute right-3.5 top-3.5 z-10 grid h-9 w-9 place-items-center rounded-full border border-ivory-50/25 bg-ink-950/60 text-ivory-50/80 backdrop-blur-sm transition-colors hover:border-brass-300/70 hover:text-brass-200"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M2 2l10 10M12 2L2 12" />
                </svg>
              </button>
              <div className="flex h-full flex-col">
                <div className="min-h-0 flex-1">
                  <Record card={cards[expanded]} seed={expanded + 1} comingSoon={comingSoon} expanded />
                </div>
                <div className="border-t border-brass-300/15 bg-ink-900 px-5 py-4">
                  <a href={ctaHref} onClick={closeCard} className="btn btn-brass w-full justify-center">
                    {ctaLabel}
                    <ArrowUpRight className="btn-arrow" size={14} />
                  </a>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
