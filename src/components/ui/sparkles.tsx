'use client';

import { useEffect, useRef } from 'react';

interface SparklesProps {
  className?: string;
  /** Solid paint behind the particles, or 'transparent' (default). */
  background?: string;
  /** Particle radius range, in CSS px. */
  minSize?: number;
  maxSize?: number;
  /** Rough count knob — particles ≈ area(px²) / 700 × density/1000. */
  particleDensity?: number;
  /** Particle fill, any CSS-hex colour. */
  particleColor?: string;
  /** Overall motion speed multiplier. */
  speed?: number;
}

interface P {
  seedX: number; // drifting sway centre
  x: number;
  y: number;
  vy: number; // fall speed (device px/s)
  vx: number; // lateral drift of the sway centre
  amp: number; // sway amplitude
  freq: number; // sway frequency
  sph: number; // sway phase
  r: number;
  baseA: number;
  tw: number; // twinkle speed
  tph: number; // twinkle phase
  life: number;
  max: number; // lifetime (s)
}

function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '').trim();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/**
 * Sparkles — a hand-rolled canvas ember field (no particle library), so it
 * stays in the codebase's GSAP/canvas idiom and carries zero bundle weight.
 * Particles are emitted from the TOP edge (sit it under a glowing line), then
 * fall and sway outward, twinkling and fading over their lifetime before
 * respawning at the line — a continuous "coming out of the line" stream.
 * Feed it the brand palette. Respects reduced motion with a static scatter.
 */
export function Sparkles({
  className,
  background = 'transparent',
  minSize = 0.5,
  maxSize = 1.35,
  particleDensity = 1300,
  particleColor = '#ECD8AE',
  speed = 1,
}: SparklesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const [pr, pg, pb] = hexToRgb(particleColor);
    let particles: P[] = [];
    let cw = 0;
    let ch = 0;
    let dpr = 1;
    let raf = 0;
    let last = 0;
    let elapsed = 0;

    // Seed one particle. `init` scatters it through its life/height so the
    // field is already full on the first frame; otherwise it's (re)born at
    // the top line and begins its fall.
    const spawn = (p: P, init: boolean) => {
      p.seedX = cw * 0.1 + Math.random() * cw * 0.8;
      p.vy = (10 + Math.random() * 26) * dpr * speed;
      p.vx = (Math.random() - 0.5) * 16 * dpr * speed;
      p.amp = (3 + Math.random() * 12) * dpr;
      p.freq = (0.5 + Math.random() * 1.4) * speed;
      p.sph = Math.random() * Math.PI * 2;
      p.r = (minSize + Math.random() * (maxSize - minSize)) * dpr;
      p.baseA = 0.4 + Math.random() * 0.6;
      p.tw = (1 + Math.random() * 2.2) * speed;
      p.tph = Math.random() * Math.PI * 2;
      p.max = 2.2 + Math.random() * 2.8;
      p.life = init ? Math.random() * p.max : 0;
      p.y = init ? Math.random() * ch : Math.random() * ch * 0.05;
      p.x = p.seedX;
    };

    const build = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w === 0 || h === 0) return;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      cw = canvas.width;
      ch = canvas.height;
      const count = Math.max(12, Math.round((cw * ch) / (620 * dpr * dpr) * (particleDensity / 1000)));
      particles = new Array(count).fill(0).map(() => {
        const p = {} as P;
        spawn(p, true);
        return p;
      });
    };

    const clear = () => {
      ctx.clearRect(0, 0, cw, ch);
      if (background !== 'transparent') {
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, cw, ch);
      }
    };

    const dot = (p: P, a: number) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${pr},${pg},${pb},${a})`;
      ctx.fill();
    };

    const frame = (t: number) => {
      if (!last) last = t;
      const dt = Math.min((t - last) / 1000, 0.05);
      last = t;
      elapsed += dt;
      clear();
      for (const p of particles) {
        p.life += dt;
        p.seedX += p.vx * dt;
        p.y += p.vy * dt;
        p.x = p.seedX + Math.sin(elapsed * p.freq + p.sph) * p.amp;
        const lt = p.life / p.max;
        const fade = lt < 0.18 ? lt / 0.18 : lt > 0.72 ? Math.max(0, (1 - lt) / 0.28) : 1;
        const twk = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(elapsed * p.tw + p.tph));
        const a = p.baseA * fade * twk;
        if (a > 0.004) dot(p, a);
        if (p.life >= p.max || p.y > ch + p.r) spawn(p, false);
      }
      raf = requestAnimationFrame(frame);
    };

    build();
    if (reduce) {
      clear();
      for (const p of particles) dot(p, p.baseA * 0.85);
    } else {
      raf = requestAnimationFrame(frame);
    }

    const ro = new ResizeObserver(() => {
      last = 0;
      build();
      if (reduce) {
        clear();
        for (const p of particles) dot(p, p.baseA * 0.85);
      }
    });
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [background, minSize, maxSize, particleDensity, particleColor, speed]);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
