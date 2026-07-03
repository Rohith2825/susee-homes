'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Max tilt, degrees. */
  max?: number;
}

/**
 * Gyro-style 3D tilt card — the card leans toward the pointer (mouse or
 * finger) with a lerped follow so it feels weighted, lifts while engaged,
 * and springs back on release. The brass spotlight (--mx/--my) rides along
 * on the same event. All motion is written straight to the DOM inside one
 * rAF loop that kills itself at rest — React never re-renders for it.
 */
export default function TiltCard({ children, className, style, max = 6.5 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    let engaged = false;
    // current → target, lerped each frame (degrees / 0..1 lift)
    let rx = 0;
    let ry = 0;
    let tRx = 0;
    let tRy = 0;
    let lift = 0;
    let tLift = 0;

    const tick = () => {
      rx += (tRx - rx) * 0.14;
      ry += (tRy - ry) * 0.14;
      lift += (tLift - lift) * 0.14;
      if (!engaged && Math.abs(rx) < 0.02 && Math.abs(ry) < 0.02 && lift < 0.01) {
        el.style.transform = '';
        el.style.willChange = '';
        raf = 0;
        return;
      }
      el.style.transform = `perspective(1050px) rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg) translateY(${(-6 * lift).toFixed(2)}px) scale(${(1 + 0.012 * lift).toFixed(4)})`;
      raf = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const aim = (clientX: number, clientY: number) => {
      const r = el.getBoundingClientRect();
      const px = (clientX - r.left) / r.width; // 0..1
      const py = (clientY - r.top) / r.height;
      tRx = (0.5 - py) * 2 * max; // lean back at the top edge
      tRy = (px - 0.5) * 2 * max; // lean right at the right edge
      el.style.setProperty('--mx', `${(clientX - r.left).toFixed(1)}px`);
      el.style.setProperty('--my', `${(clientY - r.top).toFixed(1)}px`);
    };

    const engage = (e: PointerEvent) => {
      engaged = true;
      tLift = 1;
      el.style.willChange = 'transform';
      aim(e.clientX, e.clientY);
      wake();
    };
    const release = () => {
      engaged = false;
      tRx = 0;
      tRy = 0;
      tLift = 0;
      wake();
    };

    el.addEventListener('pointerenter', engage);
    el.addEventListener('pointermove', engage, { passive: true });
    // Touch: the browser fires pointercancel when scrolling claims the
    // gesture, pointerup/leave on lift — all spring the card back.
    el.addEventListener('pointerleave', release);
    el.addEventListener('pointerup', release);
    el.addEventListener('pointercancel', release);

    return () => {
      el.removeEventListener('pointerenter', engage);
      el.removeEventListener('pointermove', engage);
      el.removeEventListener('pointerleave', release);
      el.removeEventListener('pointerup', release);
      el.removeEventListener('pointercancel', release);
      if (raf) cancelAnimationFrame(raf);
      el.style.transform = '';
      el.style.willChange = '';
    };
  }, [max]);

  return (
    <div ref={ref} className={`spotlight ${className ?? ''}`} style={style}>
      {children}
    </div>
  );
}
