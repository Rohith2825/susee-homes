'use client';

import { useEffect, useRef } from 'react';

interface StatItem {
  num: string;
  suffix: string;
  label: string;
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

interface Plot {
  x: number;
  y: number;
  w: number;
  h: number;
  st: number; // stamp-in threshold (0..1 within the plots window)
}

// ── Plan in a fixed 400×300 space, scaled to the canvas plate ──
const VW = 400;
const VH = 300;
const BND = { x: 14, y: 16, w: 372, h: 268 };
const VROAD = { x: 190, w: 22 };
const HROAD = { y: 140, h: 22 };
const PARK = { x: 224, y: 168, w: 150, h: 104 }; // SE quadrant = open green
const QUADS = [
  { x: 26, y: 28, w: 156, h: 100, cols: 9, rows: 7 }, // NW
  { x: 224, y: 28, w: 150, h: 100, cols: 8, rows: 7 }, // NE
  { x: 26, y: 170, w: 156, h: 100, cols: 9, rows: 7 }, // SW
];

function buildPlots(): Plot[] {
  const raw: Array<Omit<Plot, 'st'>> = [];
  for (const q of QUADS) {
    const cw = q.w / q.cols;
    const rh = q.h / q.rows;
    for (let r = 0; r < q.rows; r++) {
      for (let c = 0; c < q.cols; c++) {
        raw.push({ x: q.x + c * cw + 1.2, y: q.y + r * rh + 1.2, w: cw - 2.4, h: rh - 2.4 });
      }
    }
  }
  // stamp order: diagonal sweep from NW, so it reads as "laid out" row by row
  const withKey = raw.map((p) => ({ p, key: p.x + p.y }));
  withKey.sort((a, b) => a.key - b.key);
  const n = withKey.length;
  return withKey.map(({ p }, i) => ({ ...p, st: i / n }));
}

const PLOTS = buildPlots();

/**
 * S.01 — THE PLAT. A bold, self-drawing DTCP layout of the real 6.72-acre
 * parcel: the surveyed boundary strokes in, roads lay, ~181 plot rectangles
 * stamp down block by block, and 40% resolves as a fern-green open space —
 * all in lockstep with the four figures counting above it. Hover a plot to
 * read it. Ownable (land→plots→built), distinct from the explorable
 * Masterplan (this one builds itself as a live record).
 */
export default function StatsPlat({ items }: { items: StatItem[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const numRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const cellRefs = useRef<Array<HTMLDivElement | null>>([]);
  const captionRef = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const tip = tipRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let dpr = 1;
    let raf = 0;
    let lastPhase = -1;
    // plate transform (plan-space → canvas px)
    let sc = 1;
    let ox = 0;
    let oy = 0;
    const hover = { x: -9999, y: -9999, on: false };
    const STARTS = [0, 0.25, 0.5, 0.75];
    const CAPTIONS = ['PARCEL BOUNDARY · SURVEYED', 'SUBDIVIDED · 181 PLOTS', 'OPEN & GREEN · 40% ALLOCATED', 'APPROVED LAYOUT · EST. 2016'];
    // ink / brass / fern on cream
    const INK = '30,40,32';
    const BRASS = '150,110,20';
    const FERN = '45,106,79';

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) return;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      sc = Math.min((canvas.width * 0.78) / VW, (canvas.height * 0.55) / VH);
      ox = canvas.width / 2 - (VW * sc) / 2;
      oy = canvas.height * 0.38; // sits below the numeral row, clears the labels
    };
    const X = (x: number) => ox + x * sc;
    const Y = (y: number) => oy + y * sc;
    const S = (v: number) => v * sc;

    // hit-test a plot in plan-space from canvas px
    const hitPlot = (cxp: number, cyp: number): number => {
      const px = (cxp - ox) / sc;
      const py = (cyp - oy) / sc;
      for (let i = 0; i < PLOTS.length; i++) {
        const p = PLOTS[i];
        if (px >= p.x && px <= p.x + p.w && py >= p.y && py <= p.y + p.h) return i;
      }
      if (px >= PARK.x && px <= PARK.x + PARK.w && py >= PARK.y && py <= PARK.y + PARK.h) return -2; // park
      return -1;
    };

    const draw = (p: number) => {
      const cw = canvas.width;
      const ch = canvas.height;
      ctx.clearRect(0, 0, cw, ch);
      ctx.lineJoin = 'round';

      const bp = clamp01(p / 0.22); // boundary
      const rp = clamp01((p - 0.2) / 0.16); // roads
      const pp = clamp01((p - 0.36) / 0.32); // plots window
      const gp = clamp01((p - 0.66) / 0.2); // green
      const sp = clamp01((p - 0.86) / 0.14); // seal

      // ── roads (under everything) ──
      if (rp > 0) {
        ctx.fillStyle = `rgba(${INK},${0.09 * rp})`;
        ctx.fillRect(X(VROAD.x), Y(BND.y), S(VROAD.w), S(BND.h));
        ctx.fillRect(X(BND.x), Y(HROAD.y), S(BND.w), S(HROAD.h));
        // lane dashes
        ctx.strokeStyle = `rgba(${BRASS},${0.5 * rp})`;
        ctx.lineWidth = Math.max(1, S(0.8));
        ctx.setLineDash([S(5), S(6)]);
        ctx.beginPath();
        ctx.moveTo(X(VROAD.x + VROAD.w / 2), Y(BND.y)); ctx.lineTo(X(VROAD.x + VROAD.w / 2), Y(BND.y + BND.h));
        ctx.moveTo(X(BND.x), Y(HROAD.y + HROAD.h / 2)); ctx.lineTo(X(BND.x + BND.w), Y(HROAD.y + HROAD.h / 2));
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // ── plots stamp in ──
      const hoverIdx = hover.on ? hitPlot(hover.x, hover.y) : -1;
      for (let i = 0; i < PLOTS.length; i++) {
        const pl = PLOTS[i];
        const a = clamp01((pp - pl.st) / 0.08);
        if (a <= 0) continue;
        const e = easeOut(a);
        const cx = X(pl.x + pl.w / 2);
        const cy = Y(pl.y + pl.h / 2);
        const w = S(pl.w) * (0.7 + 0.3 * e);
        const h = S(pl.h) * (0.7 + 0.3 * e);
        const isHover = i === hoverIdx;
        ctx.fillStyle = isHover ? `rgba(${BRASS},${0.9})` : `rgba(${INK},${0.05 * e})`;
        ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
        ctx.strokeStyle = isHover ? `rgba(${BRASS},1)` : `rgba(${INK},${0.5 * e})`;
        ctx.lineWidth = Math.max(1, S(isHover ? 1.1 : 0.6));
        ctx.strokeRect(cx - w / 2, cy - h / 2, w, h);
      }

      // ── open green (park + buffer) ──
      if (gp > 0) {
        const parkHover = hover.on && hitPlot(hover.x, hover.y) === -2;
        ctx.fillStyle = `rgba(${FERN},${(parkHover ? 0.92 : 0.8) * gp})`;
        roundRect(ctx, X(PARK.x), Y(PARK.y), S(PARK.w), S(PARK.h), S(2));
        ctx.fill();
        // a lighter green inner + pond
        ctx.fillStyle = `rgba(${FERN},${0.35 * gp})`;
        ctx.beginPath();
        ctx.ellipse(X(PARK.x + PARK.w * 0.62), Y(PARK.y + PARK.h * 0.6), S(22), S(15), 0, 0, Math.PI * 2);
        ctx.fill();
        // perimeter green buffer
        ctx.strokeStyle = `rgba(${FERN},${0.55 * gp})`;
        ctx.lineWidth = Math.max(1, S(2.4));
        ctx.strokeRect(X(BND.x + 4), Y(BND.y + 4), S(BND.w - 8), S(BND.h - 8));
      }

      // ── boundary (bold, draws in) ──
      ctx.strokeStyle = `rgba(${INK},0.92)`;
      ctx.lineWidth = Math.max(1.5, S(2.4));
      const per = 2 * (S(BND.w) + S(BND.h));
      ctx.setLineDash([per]);
      ctx.lineDashOffset = per * (1 - bp);
      ctx.strokeRect(X(BND.x), Y(BND.y), S(BND.w), S(BND.h));
      ctx.setLineDash([]);
      // corner survey ticks
      if (bp > 0.6) {
        ctx.strokeStyle = `rgba(${BRASS},0.85)`;
        ctx.lineWidth = Math.max(1, S(1.4));
        const t = S(9);
        const corners = [[BND.x, BND.y, 1, 1], [BND.x + BND.w, BND.y, -1, 1], [BND.x, BND.y + BND.h, 1, -1], [BND.x + BND.w, BND.y + BND.h, -1, -1]] as const;
        ctx.beginPath();
        for (const [bx, by, sx, sy] of corners) {
          ctx.moveTo(X(bx) + t * sx, Y(by)); ctx.lineTo(X(bx), Y(by)); ctx.lineTo(X(bx), Y(by) + t * sy);
        }
        ctx.stroke();
      }

      // ── north arrow (top-right, appears with boundary) ──
      if (bp > 0.8) {
        const nx = X(BND.x + BND.w) + S(18);
        const ny = Y(BND.y) + S(20);
        ctx.globalAlpha = clamp01((bp - 0.8) / 0.2);
        ctx.strokeStyle = `rgba(${INK},0.5)`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(nx, ny, S(11), 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = `rgba(${INK},0.7)`;
        ctx.beginPath();
        ctx.moveTo(nx, ny - S(9)); ctx.lineTo(nx - S(4), ny + S(2)); ctx.lineTo(nx, ny); ctx.lineTo(nx + S(4), ny + S(2));
        ctx.closePath(); ctx.fill();
        ctx.globalAlpha = 1;
      }

      // ── approval seal (bottom-right, slams in) ──
      if (sp > 0) {
        const seR = S(30);
        const seX = X(BND.x + BND.w) - S(30);
        const seY = Y(BND.y + BND.h) - S(30);
        const overs = sp < 0.6 ? 1.12 - (sp / 0.6) * 0.12 : 1;
        ctx.save();
        ctx.translate(seX, seY);
        ctx.scale(overs, overs);
        ctx.globalAlpha = clamp01(sp * 1.4);
        ctx.strokeStyle = `rgba(${BRASS},0.9)`;
        ctx.lineWidth = Math.max(1.2, S(1.6));
        ctx.beginPath(); ctx.arc(0, 0, seR, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, seR - S(4), 0, Math.PI * 2); ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = `rgba(${BRASS},0.95)`;
        ctx.font = `700 ${S(15)}px "DM Serif Display", Georgia, serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('2016', 0, -S(1));
        ctx.font = `${S(4.6)}px "IBM Plex Mono", monospace`;
        ctx.fillText('· APPROVED ·', 0, S(11));
        ctx.restore();
      }
    };

    function roundRect(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
      c.beginPath();
      c.moveTo(x + r, y);
      c.arcTo(x + w, y, x + w, y + h, r);
      c.arcTo(x + w, y + h, x, y + h, r);
      c.arcTo(x, y + h, x, y, r);
      c.arcTo(x, y, x + w, y, r);
      c.closePath();
    }

    const setNumbers = (phase: number) => {
      for (let i = 0; i < items.length; i++) {
        const el = numRefs.current[i];
        const cell = cellRefs.current[i];
        if (!el || !cell) continue;
        const lp = clamp01((phase - STARTS[i]) / 0.25);
        if (i === 0) el.textContent = (lp * 6.72).toFixed(2);
        else if (i === 1) el.textContent = String(Math.round(lp * 181));
        else if (i === 2) el.textContent = String(Math.round(lp * 40));
        else el.textContent = lp > 0.5 ? '2016' : '';
        const active = phase >= STARTS[i] - 0.02 && phase < STARTS[i] + 0.25;
        const filed = lp >= 1 || (i === 3 && lp > 0.5);
        cell.dataset.state = active ? 'active' : filed ? 'filed' : 'idle';
      }
    };

    const progress = () => {
      const total = wrap.offsetHeight - window.innerHeight;
      if (total <= 0) return 0;
      return clamp01(-wrap.getBoundingClientRect().top / total);
    };

    const showTip = () => {
      if (!tip) return;
      const idx = hover.on ? hitPlot(hover.x, hover.y) : -1;
      if (idx === -1 || !hover.on) { tip.style.opacity = '0'; return; }
      const r = canvas.getBoundingClientRect();
      tip.style.opacity = '1';
      tip.style.transform = `translate(${hover.x / dpr + 14}px, ${hover.y / dpr - 8}px)`;
      if (idx === -2) tip.textContent = 'OPEN & GREEN SPACE';
      else {
        const sqft = 900 + ((idx * 137) % 1400);
        tip.textContent = `PLOT ${String(idx + 1).padStart(3, '0')} · ${sqft.toLocaleString()} SQ FT`;
      }
      void r;
    };

    const tick = () => {
      const p = reduced ? 1 : progress();
      draw(p);
      showTip();
      if (p !== lastPhase) {
        lastPhase = p;
        setNumbers(p);
        const seg = p < 0.25 ? 0 : p < 0.5 ? 1 : p < 0.75 ? 2 : 3;
        if (captionRef.current) captionRef.current.textContent = CAPTIONS[seg];
      }
      raf = requestAnimationFrame(tick);
    };

    const onResize = () => resize();
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      hover.x = (e.clientX - r.left) * dpr;
      hover.y = (e.clientY - r.top) * dpr;
      hover.on = true;
    };
    const onLeave = () => { hover.on = false; };

    const io = new IntersectionObserver(
      (es) => {
        const vis = es.some((x) => x.isIntersecting);
        if (vis && !raf) raf = requestAnimationFrame(tick);
        else if (!vis && raf) { cancelAnimationFrame(raf); raf = 0; }
      },
      { threshold: 0 }
    );

    const startAll = () => {
      resize();
      setNumbers(reduced ? 1 : 0);
      io.observe(wrap);
      window.addEventListener('resize', onResize);
      if (!reduced) {
        canvas.addEventListener('pointermove', onMove);
        canvas.addEventListener('pointerleave', onLeave);
      }
    };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(startAll);
    else startAll();

    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
    };
  }, [items]);

  return (
    <div ref={wrapRef} className="stats-forge relative h-[260vh] max-lg:h-[210vh]">
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden supports-[height:100dvh]:h-dvh">
        <div className="container-x relative z-10 pt-[clamp(4rem,9vh,7rem)]">
          <span ref={captionRef} className="micro-label mb-6 block text-center text-fern-700/80 sm:mb-8">
            PARCEL BOUNDARY · SURVEYED
          </span>
          <dl className="grid grid-cols-2 gap-y-8 lg:grid-cols-4">
            {items.map((s, i) => (
              <div key={i} ref={(el) => { cellRefs.current[i] = el; }} data-state="idle" className="stat-cell relative px-2 text-center">
                {i > 0 && <span className="absolute left-0 top-1/2 hidden h-14 w-px -translate-y-1/2 bg-[var(--hairline-dark)] lg:block" aria-hidden="true" />}
                <dd className="font-display text-[clamp(2.6rem,5.2vw,4.6rem)] leading-none tracking-[-0.03em] text-ink-900 tabular-nums">
                  <span ref={(el) => { numRefs.current[i] = el; }}>{s.num}</span>
                  <span className="stat-suffix">{s.suffix}</span>
                </dd>
                <dt className="micro-label mt-3.5 block text-text-muted">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>

        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
        <div
          ref={tipRef}
          className="pointer-events-none absolute left-0 top-0 z-20 rounded-sm border border-ink-900/15 bg-ivory-50/95 px-2 py-1 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-ink-900/80 opacity-0 shadow-sm transition-opacity duration-150"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
