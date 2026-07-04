'use client';

import { useEffect, useRef } from 'react';

interface StatItem {
  num: string;
  suffix: string;
  label: string;
}

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
type P = [number, number];

interface Grain {
  a: P; // surveyed boundary
  b: P; // plot lattice
  c: P; // open-space (green blob) or hold on lattice
  d: P; // "2016" glyph
  delay: number;
  green: boolean;
}

/**
 * THE FORGE OF RECORD — the splash's survey-grain technique, now on the cream
 * paper, morphing through four dense formations of the real 6.72-acre parcel
 * as you scroll: the surveyed BOUNDARY → subdivided into a 181-PLOT lattice →
 * 40% peels off green as OPEN SPACE → all converge into "2016 ESTABLISHED".
 * The four figures read live off the same scroll phase; the cursor brushes
 * the grains. Ownable (land→plots→built), a sibling to the splash forge.
 */
export default function StatsForge({ items }: { items: StatItem[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const numRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const cellRefs = useRef<Array<HTMLDivElement | null>>([]);
  const captionRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const N = 2000;
    let grains: Grain[] = [];
    let cw = 0;
    let ch = 0;
    let dpr = 1;
    let raf = 0;
    let lastPhase = -1;
    const cursor = { x: -9999, y: -9999, active: false };
    const STARTS = [0, 0.25, 0.5, 0.75];
    const CAPTIONS = ['PARCEL BOUNDARY · SURVEYED', 'SUBDIVIDED · 181 PLOTS', 'OPEN & GREEN · 40% ALLOCATED', 'APPROVED LAYOUT · EST. 2016'];

    // ── samplers ──
    const shuffle = <T,>(arr: T[]) => {
      for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
      return arr;
    };
    const resample = (pts: P[], count: number): P[] => {
      if (!pts.length) return [];
      shuffle(pts);
      const out: P[] = [];
      for (let i = 0; i < count; i++) out.push(pts[i % pts.length]);
      return out;
    };

    const perimeterPts = (x0: number, y0: number, w: number, h: number, n: number): P[] => {
      const out: P[] = [];
      const per = 2 * (w + h);
      for (let i = 0; i < n; i++) {
        let d = (i / n) * per;
        if (d < w) out.push([x0 + d, y0]);
        else if ((d -= w) < h) out.push([x0 + w, y0 + d]);
        else if ((d -= h) < w) out.push([x0 + w - d, y0 + h]);
        else { d -= w; out.push([x0, y0 + h - d]); }
      }
      return out;
    };

    const gridPts = (x0: number, y0: number, w: number, h: number, cols: number, rows: number, n: number): P[] => {
      const segs: Array<[P, P]> = [];
      for (let c = 0; c <= cols; c++) segs.push([[x0 + (c / cols) * w, y0], [x0 + (c / cols) * w, y0 + h]]);
      for (let r = 0; r <= rows; r++) segs.push([[x0, y0 + (r / rows) * h], [x0 + w, y0 + (r / rows) * h]]);
      const total = segs.reduce((s, [a, b]) => s + Math.hypot(b[0] - a[0], b[1] - a[1]), 0);
      const out: P[] = [];
      for (let i = 0; i < n; i++) {
        let d = (i / n) * total;
        for (const [a, b] of segs) {
          const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
          if (d <= len) { const t = d / len; out.push([lerp(a[0], b[0], t), lerp(a[1], b[1], t)]); break; }
          d -= len;
        }
      }
      return out;
    };

    const blobPts = (cx: number, cy: number, rx: number, ry: number, n: number): P[] => {
      const out: P[] = [];
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random());
        out.push([cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r]);
      }
      return out;
    };

    const glyphPts = (text: string, count: number, cx: number, cy: number, maxW: number, maxH: number): P[] => {
      const oc = document.createElement('canvas');
      const H = 220;
      oc.width = 760;
      oc.height = H;
      const o = oc.getContext('2d');
      if (!o) return [];
      o.fillStyle = '#fff';
      o.textAlign = 'center';
      o.textBaseline = 'middle';
      o.font = '700 165px "DM Serif Display", Georgia, serif';
      o.fillText(text, oc.width / 2, H / 2 + 6);
      let data: Uint8ClampedArray;
      try { data = o.getImageData(0, 0, oc.width, oc.height).data; } catch { return []; }
      const pts: P[] = [];
      for (let y = 0; y < H; y += 2) for (let x = 0; x < oc.width; x += 2) if (data[(y * oc.width + x) * 4 + 3] > 130) pts.push([x, y]);
      const s = Math.min(maxW / oc.width, maxH / H);
      return resample(pts, count).map(([x, y]) => [cx + (x - oc.width / 2) * s, cy + (y - H / 2) * s] as P);
    };

    const build = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) return;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      cw = canvas.width;
      ch = canvas.height;

      const pw = Math.min(cw * 0.62, ch * 1.2);
      const ph = pw * 0.6;
      const x0 = cw / 2 - pw / 2;
      const y0 = ch * 0.58 - ph / 2;
      const cols = 16;
      const rows = 12;

      const boundary = perimeterPts(x0, y0, pw, ph, N);
      const grid = gridPts(x0, y0, pw, ph, cols, rows, N);
      const glyph = glyphPts('2016', N, x0 + pw / 2, y0 + ph / 2, pw * 0.74, ph * 0.66);
      // green park — an organic block ~40% of the parcel, upper-left
      const park = blobPts(x0 + pw * 0.3, y0 + ph * 0.36, pw * 0.24, ph * 0.34, N);

      const greenCount = Math.round(N * 0.4);
      const idx = shuffle([...Array(N).keys()]);
      const greenSet = new Set(idx.slice(0, greenCount));

      grains = new Array(N).fill(0).map((_, i): Grain => {
        const green = greenSet.has(i);
        return {
          a: boundary[i],
          b: grid[i],
          c: green ? park[i] : grid[i],
          d: glyph[i] ?? [x0 + pw / 2, y0 + ph / 2],
          delay: Math.random() * 0.26,
          green,
        };
      });
    };

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

    const draw = (p: number) => {
      ctx.clearRect(0, 0, cw, ch);
      const seg = p < 0.25 ? 0 : p < 0.5 ? 1 : p < 0.75 ? 2 : 3;
      const local = clamp01((p - STARTS[seg]) / 0.25);
      ctx.lineCap = 'round';
      ctx.lineWidth = 2 * dpr;
      const R = 92 * dpr;
      for (let pass = 0; pass < 2; pass++) {
        // pass 0 = brass grid/boundary/glyph; pass 1 = fern open-space grains (phase C only)
        const isGreenPass = pass === 1;
        ctx.strokeStyle = isGreenPass ? 'rgba(26,82,58,0.96)' : 'rgba(82,56,8,0.9)';
        ctx.beginPath();
        for (let i = 0; i < grains.length; i++) {
          const g = grains[i];
          const grainGreen = g.green && seg === 2;
          if (grainGreen !== isGreenPass) continue;
          const e = easeInOutCubic(clamp01((local - g.delay) / 0.74));
          const e0 = easeInOutCubic(clamp01((local - g.delay) / 0.74 - 0.02));
          const from = seg === 0 ? g.b : seg === 1 ? g.a : seg === 2 ? g.b : g.c;
          const to = seg === 0 ? g.a : seg === 1 ? g.b : seg === 2 ? g.c : g.d;
          let x = lerp(from[0], to[0], e);
          let y = lerp(from[1], to[1], e);
          const x0 = lerp(from[0], to[0], e0);
          const y0 = lerp(from[1], to[1], e0);
          if (cursor.active) {
            const dx = x - cursor.x;
            const dy = y - cursor.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < R * R) {
              const dist = Math.sqrt(d2) + 0.001;
              const f = (1 - dist / R) * 13 * dpr;
              x += (dx / dist) * f;
              y += (dy / dist) * f;
            }
          }
          ctx.moveTo(x0, y0);
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    };

    const progress = () => {
      const total = wrap.offsetHeight - window.innerHeight;
      if (total <= 0) return 0;
      return clamp01(-wrap.getBoundingClientRect().top / total);
    };

    const tick = () => {
      const p = reduced ? 1 : progress();
      draw(p);
      if (p !== lastPhase) {
        lastPhase = p;
        setNumbers(p);
        const seg = p < 0.25 ? 0 : p < 0.5 ? 1 : p < 0.75 ? 2 : 3;
        if (captionRef.current) captionRef.current.textContent = CAPTIONS[seg];
      }
      raf = requestAnimationFrame(tick);
    };

    const onResize = () => build();
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      cursor.x = (e.clientX - r.left) * dpr;
      cursor.y = (e.clientY - r.top) * dpr;
      cursor.active = true;
    };
    const onLeave = () => { cursor.active = false; };

    const io = new IntersectionObserver(
      (es) => {
        const vis = es.some((x) => x.isIntersecting);
        if (vis && !raf) raf = requestAnimationFrame(tick);
        else if (!vis && raf) { cancelAnimationFrame(raf); raf = 0; }
      },
      { threshold: 0 }
    );

    const start = () => {
      build();
      setNumbers(reduced ? 1 : 0);
      io.observe(wrap);
      window.addEventListener('resize', onResize);
      if (!reduced) {
        canvas.addEventListener('pointermove', onMove);
        canvas.addEventListener('pointerleave', onLeave);
      }
    };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(start);
    else start();

    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
    };
  }, [items]);

  return (
    <div ref={wrapRef} className="stats-forge relative h-[260vh] max-lg:h-[200vh]">
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden supports-[height:100dvh]:h-dvh">
        <div className="container-x relative z-10 pt-[clamp(4rem,9vh,7rem)]">
          <span ref={captionRef} className="micro-label mb-6 block text-center text-fern-700/80 sm:mb-8">
            PARCEL BOUNDARY · SURVEYED
          </span>
          <dl className="grid grid-cols-2 gap-y-8 lg:grid-cols-4">
            {items.map((s, i) => (
              <div
                key={i}
                ref={(el) => { cellRefs.current[i] = el; }}
                data-state="idle"
                className="stat-cell relative px-2 text-center"
              >
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
      </div>
    </div>
  );
}
