'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ── Procedural plat map ─────────────────────────────────────
   Deterministic layout: four quadrants around a road cross, a
   central park, and survey-numbered plots. Purely illustrative
   of the ALIGHT plan language (181 plots · 40% open space). */

interface Plot {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  sold: boolean;
  dot: boolean;
}

function buildPlots(): Plot[] {
  const plots: Plot[] = [];
  let id = 1;

  const quads: Array<{ x: number; y: number; w: number; h: number; cols: number; rows: number; skip?: number[] }> = [
    { x: 22, y: 22, w: 168, h: 118, cols: 4, rows: 3 },
    { x: 210, y: 22, w: 168, h: 118, cols: 4, rows: 3 },
    { x: 22, y: 160, w: 168, h: 118, cols: 4, rows: 3 },
    // south-east quadrant hosts the park — only a single row of plots
    { x: 210, y: 160, w: 168, h: 118, cols: 4, rows: 3, skip: [4, 5, 6, 7, 8, 9, 10, 11] },
  ];

  quads.forEach((q) => {
    const cw = q.w / q.cols;
    const rh = q.h / q.rows;
    for (let r = 0; r < q.rows; r++) {
      for (let c = 0; c < q.cols; c++) {
        const cell = r * q.cols + c;
        if (q.skip?.includes(cell)) continue;
        plots.push({
          id,
          x: q.x + c * cw + 1.5,
          y: q.y + r * rh + 1.5,
          w: cw - 3,
          h: rh - 3,
          sold: id % 5 === 0,
          dot: id % 7 === 0 && id % 5 !== 0,
        });
        id++;
      }
    }
  });

  return plots;
}

const PLOTS = buildPlots();
const MIN_AREA = Math.min(...PLOTS.map((p) => p.w * p.h));
const MAX_AREA = Math.max(...PLOTS.map((p) => p.w * p.h));

/** Map drawn plot area onto the real ALIGHT range (627–2,259 sq ft). */
function plotSqft(p: Plot): number {
  const t = (p.w * p.h - MIN_AREA) / (MAX_AREA - MIN_AREA || 1);
  return Math.round((627 + t * (2259 - 627)) / 10) * 10;
}

interface MasterplanProps {
  label: string;
}

export default function Masterplan({ label }: MasterplanProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{ plot: Plot; x: number; y: number } | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      const boundary = root.querySelector<SVGPathElement>('.mp-boundary');
      const len = boundary?.getTotalLength() ?? 0;
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: 'top 75%', once: true },
      });

      if (boundary && len) {
        gsap.set(boundary, { strokeDasharray: `${len}`, strokeDashoffset: len });
        tl.to(boundary, { strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut' }, 0)
          // settle into the plat-map dash grammar after the draw
          .set(boundary, { strokeDasharray: '6 4', strokeDashoffset: 0 });
      }

      tl.fromTo(
        root.querySelectorAll('.mp-road'),
        { scaleX: 0, scaleY: 0 },
        { scaleX: 1, scaleY: 1, duration: 0.9, ease: 'power3.inOut', stagger: 0.12 },
        0.55
      )
        .fromTo(
          root.querySelectorAll('.mp-plot'),
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.5, ease: 'power1.out', stagger: { each: 0.018, from: 'start' } },
          1.05
        )
        .fromTo(
          root.querySelectorAll('.mp-extra'),
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.7, ease: 'power2.out', stagger: 0.08 },
          1.7
        );
    }, root);
    return () => ctx.revert();
  }, []);

  const onPlotMove = (plot: Plot) => (e: React.MouseEvent) => {
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect) return;
    setHover({ plot, x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div ref={rootRef} className="relative">
      <div className="survey-frame relative rounded-sm border border-ivory-50/14 bg-ink-950/50 p-4 text-ivory-50 sm:p-6">
        <span className="tick-b" aria-hidden="true" />

        <div className="mb-4 flex items-center justify-between gap-4">
          <span className="micro-label text-ivory-50/55">{label}</span>
          <span className="micro-label text-brass-300/70">S.NO 04</span>
        </div>

        <svg viewBox="0 0 400 300" className="w-full" role="img" aria-label={label}>
          {/* sub-grid */}
          <defs>
            <pattern id="mp-grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M10 0H0V10" fill="none" stroke="rgba(116,212,160,0.06)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="400" height="300" fill="url(#mp-grid)" />

          {/* outer boundary */}
          <path
            className="mp-boundary"
            d="M14 20 L386 14 L390 240 L330 292 L18 286 Z"
            fill="none"
            stroke="rgba(236,211,156,0.8)"
            strokeWidth="1.2"
          />

          {/* roads */}
          <g stroke="rgba(247,244,236,0.28)" strokeWidth="7" strokeLinecap="square">
            <line className="mp-road origin-center" x1="200" y1="18" x2="200" y2="284" />
            <line className="mp-road origin-center" x1="18" y1="150" x2="386" y2="150" />
          </g>

          {/* plots */}
          <g>
            {PLOTS.map((p) => (
              <g key={p.id} className="mp-plot">
                <rect
                  x={p.x}
                  y={p.y}
                  width={p.w}
                  height={p.h}
                  rx="1"
                  fill={p.sold ? 'rgba(247,244,236,0.13)' : 'rgba(116,212,160,0.045)'}
                  stroke={hover?.plot.id === p.id ? 'rgba(236,211,156,0.95)' : 'rgba(116,212,160,0.4)'}
                  strokeWidth={hover?.plot.id === p.id ? 1.1 : 0.55}
                  className="cursor-pointer transition-[fill] duration-300"
                  style={hover?.plot.id === p.id ? { fill: 'rgba(236,211,156,0.16)' } : undefined}
                  onMouseMove={onPlotMove(p)}
                  onMouseLeave={() => setHover(null)}
                />
                {p.dot && !p.sold && (
                  <circle cx={p.x + p.w / 2} cy={p.y + p.h / 2} r="1.6" fill="#c96a4a" pointerEvents="none" />
                )}
              </g>
            ))}
          </g>

          {/* park — the 40% open space */}
          <g className="mp-extra">
            <rect x="252" y="160" width="126" height="118" rx="2" fill="rgba(116,212,160,0.09)" stroke="rgba(116,212,160,0.45)" strokeWidth="0.7" strokeDasharray="3 3" />
            <circle cx="315" cy="219" r="24" fill="none" stroke="rgba(116,212,160,0.35)" strokeWidth="0.6" />
            <circle cx="315" cy="219" r="14" fill="none" stroke="rgba(116,212,160,0.28)" strokeWidth="0.6" strokeDasharray="2 3" />
            <text x="315" y="256" textAnchor="middle" fontSize="7" fill="rgba(247,244,236,0.6)" fontFamily="var(--mono)" letterSpacing="1.5">
              PARK · 40%
            </text>
          </g>

          {/* road labels */}
          <g className="mp-extra" fontFamily="var(--mono)" fontSize="6.4" fill="rgba(247,244,236,0.5)" letterSpacing="1.2">
            <text x="196" y="90" transform="rotate(-90 196 90)" textAnchor="middle" dominantBaseline="text-after-edge">
              30 FT ROAD
            </text>
            <text x="100" y="147" textAnchor="middle">40 FT ROAD</text>
          </g>

          {/* entry gate mark */}
          <g className="mp-extra">
            <path d="M192 286 h16" stroke="rgba(236,211,156,0.9)" strokeWidth="2.4" />
            <text x="200" y="298" textAnchor="middle" fontSize="6.4" fill="rgba(236,211,156,0.75)" fontFamily="var(--mono)" letterSpacing="1.2">
              ENTRY
            </text>
          </g>
        </svg>

        {/* legend — the plat map's three states */}
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-ivory-50/10 pt-4">
          <span className="flex items-center gap-2">
            <span className="h-[7px] w-[7px] rounded-full bg-[#c96a4a]" aria-hidden="true" />
            <span className="micro-label text-ivory-50/60">Available</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="h-[7px] w-[7px] rounded-[1px] bg-ivory-50/25" aria-hidden="true" />
            <span className="micro-label text-ivory-50/60">Allotted</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="h-[7px] w-[7px] rounded-[1px] border border-dashed border-mint-400/70" aria-hidden="true" />
            <span className="micro-label text-ivory-50/60">Open space</span>
          </span>
        </div>

        {/* survey furniture */}
        <div className="mt-3 flex items-center justify-between border-t border-ivory-50/10 pt-4">
          <div className="flex items-center gap-2.5" aria-hidden="true">
            <svg width="86" height="7" viewBox="0 0 86 7" className="text-ivory-50/60">
              <path d="M0 0v7M21.5 2.5v4.5M43 0v7M64.5 2.5v4.5M86 0v7" stroke="currentColor" strokeWidth="1" />
              <path d="M0 6.5h86" stroke="currentColor" strokeWidth="1" />
              <rect x="0" y="4.5" width="21.5" height="2" fill="currentColor" />
              <rect x="43" y="4.5" width="21.5" height="2" fill="currentColor" />
            </svg>
            <span className="micro-label text-ivory-50/60">0 — 60M</span>
          </div>
          <span className="micro-label text-ivory-50/60">13.0480° N · 80.0966° E</span>
        </div>

        {/* hover tooltip */}
        {hover && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[130%] whitespace-nowrap rounded-sm border border-brass-200/30 bg-ink-950/95 px-3 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-brass-200 shadow-lg"
            style={{ left: hover.x, top: hover.y }}
          >
            Plot {String(hover.plot.id).padStart(2, '0')} · ~{plotSqft(hover.plot).toLocaleString()} sq ft
          </div>
        )}
      </div>
    </div>
  );
}
