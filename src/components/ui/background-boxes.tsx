'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * Background Boxes (Aceternity) — the skewed isometric tile plane where
 * cells light up under the cursor and fade back out, leaving a painted
 * trail. Ported without framer-motion: one delegated pointer listener and
 * CSS transitions instead of 15,000 motion.divs — same look, a fraction of
 * the cost. Colors come from the site palette (mint · fern · brass).
 */

const COLORS = [
  '#74d4a0', // mint-400
  '#d8f3dc', // mint-100
  '#40916c', // fern-500
  '#2d6a4f', // fern-600
  '#ecd39c', // brass-200
  '#d9bc7a', // brass-300
  '#a18856', // bronze-500
  '#d6cdb2', // ivory-300
];

// Sized so the sheared parallelogram still covers a tall full-width
// section — the skew displaces the plane by ±1.1×height horizontally.
const ROWS = 72;
const COLS = 66;

// Inserting all ROWS*COLS (~4,752) cells in one synchronous commit is a
// ~150-300ms main-thread stall (measured) the instant this mounts — and it
// mounts on an IntersectionObserver trigger, i.e. while the user may still
// be actively scrolling. Build the columns incrementally across a handful
// of animation frames instead: same final DOM/visual grid, just never more
// than one small slice of it inserted in a single frame. The whole build
// finishes in ~10 frames (well under 200ms), which — given the section
// isn't mounted until it's already ~400px from view — is done long before
// a normal scroll gesture brings it on screen.
const COLUMNS_PER_FRAME = 6;

export const BoxesCore = ({ className = '' }: { className?: string }) => {
  const planeRef = useRef<HTMLDivElement>(null);
  const [visibleColumns, setVisibleColumns] = useState(0);

  useEffect(() => {
    let raf = 0;
    let built = 0;
    const grow = () => {
      built = Math.min(ROWS, built + COLUMNS_PER_FRAME);
      setVisibleColumns(built);
      if (built < ROWS) {
        raf = requestAnimationFrame(grow);
      }
    };
    raf = requestAnimationFrame(grow);
    return () => cancelAnimationFrame(raf);
  }, []);

  const onPointerOver = (e: React.PointerEvent) => {
    const cell = (e.target as HTMLElement).closest<HTMLElement>('[data-cell]');
    if (!cell) return;
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    cell.style.transition = 'none';
    cell.style.backgroundColor = color;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        cell.style.transition = 'background-color 1.9s ease';
        cell.style.backgroundColor = 'transparent';
      });
    });
  };

  return (
    <div
      ref={planeRef}
      onPointerOver={onPointerOver}
      style={{
        // Centered on the host section (the original recipe assumed a short
        // demo box and threw the plane offscreen on tall sections), then
        // sheared into the isometric drift. Explicit size — an absolutely
        // positioned flex row otherwise shrinks to the section width and
        // crushes the tiles.
        width: ROWS * 64,
        height: COLS * 32,
        transform: 'translate(-50%,-50%) skewX(-48deg) skewY(14deg) scale(0.675) translateZ(0)',
      }}
      className={`absolute left-1/2 top-1/2 z-0 flex ${className}`}
      aria-hidden="true"
    >
      {Array.from({ length: visibleColumns }, (_, i) => (
        <div key={`row-${i}`} className="relative h-8 w-16 shrink-0 border-l border-fern-600/25">
          {Array.from({ length: COLS }, (_, j) => (
            <div key={`col-${j}`} data-cell className="relative h-8 w-16 border-r border-t border-fern-600/25">
              {j % 4 === 0 && i % 4 === 0 ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="pointer-events-none absolute -left-[22px] -top-[14px] h-6 w-10 stroke-[1px] text-fern-600/35"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12M6 12h12" />
                </svg>
              ) : null}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export const Boxes = React.memo(BoxesCore);
