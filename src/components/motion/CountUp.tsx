'use client';

import { useEffect, useRef, useState } from 'react';

interface CountUpProps {
  /** Numeric string — supports floats ("6.72") and ints ("181", "2016"). */
  value: string;
  suffix?: string;
  duration?: number;
  className?: string;
}

/** Eased count-up that starts when scrolled into view. */
export default function CountUp({ value, suffix = '', duration = 1700, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState('0');
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(value);
      return;
    }

    let raf = 0;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;
        obs.disconnect();

        const target = parseFloat(value);
        const decimals = value.includes('.') ? value.split('.')[1].length : 0;
        let startTime: number | undefined;

        const step = (ts: number) => {
          if (startTime === undefined) startTime = ts;
          const progress = Math.min((ts - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay((eased * target).toFixed(decimals));
          if (progress < 1) raf = requestAnimationFrame(step);
          else setDisplay(value);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {display}
      {suffix}
    </span>
  );
}
