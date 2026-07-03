'use client';

import { useRef, type ReactNode, type CSSProperties } from 'react';

interface SpotlightProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/** Card wrapper — a faint brass light follows the cursor (desktop only). */
export default function Spotlight({ children, className, style }: SpotlightProps) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    el.style.setProperty('--my', `${e.clientY - rect.top}px`);
  };

  return (
    <div ref={ref} onMouseMove={onMove} className={`spotlight ${className ?? ''}`} style={style}>
      {children}
    </div>
  );
}
