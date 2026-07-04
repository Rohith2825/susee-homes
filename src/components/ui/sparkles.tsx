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
  /** Twinkle speed multiplier. */
  speed?: number;
}

interface P {
  x: number;
  y: number;
  r: number;
  baseA: number;
  tw: number;
  ph: number;
  dx: number;
  dy: number;
}

function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '').trim();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/**
 * Sparkles — a hand-rolled canvas starfield (no particle library), so it
 * stays in the codebase's GSAP/canvas idiom and carries zero bundle weight.
 * Tiny points twinkle (and drift a hair) over a transparent stage; feed it the
 * brand palette. Respects reduced motion with a single static paint.
 */
export function Sparkles({
  className,
  background = 'transparent',
  minSize = 0.5,
  maxSize = 1.3,
  particleDensity = 1200,
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
    let raf = 0;
    let start = 0;

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w === 0 || h === 0) return;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      const count = Math.max(10, Math.round(((canvas.width * canvas.height) / (700 * dpr * dpr)) * (particleDensity / 1000)));
      particles = new Array(count).fill(0).map(() => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: (minSize + Math.random() * (maxSize - minSize)) * dpr,
        baseA: 0.2 + Math.random() * 0.8,
        tw: 0.5 + Math.random() * 1.6,
        ph: Math.random() * Math.PI * 2,
        dx: (Math.random() - 0.5) * 0.05 * dpr,
        dy: (Math.random() - 0.5) * 0.05 * dpr,
      }));
    };

    const clear = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (background !== 'transparent') {
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    };

    const dot = (p: P, a: number) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${pr},${pg},${pb},${a})`;
      ctx.fill();
    };

    const frame = (t: number) => {
      if (!start) start = t;
      const el = (t - start) / 1000;
      clear();
      for (const p of particles) {
        const a = p.baseA * (0.3 + 0.7 * (0.5 + 0.5 * Math.sin(el * p.tw * speed + p.ph)));
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0) p.x += canvas.width;
        else if (p.x > canvas.width) p.x -= canvas.width;
        if (p.y < 0) p.y += canvas.height;
        else if (p.y > canvas.height) p.y -= canvas.height;
        dot(p, a);
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
