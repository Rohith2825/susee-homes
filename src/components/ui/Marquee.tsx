import type { ReactNode } from 'react';

interface MarqueeProps {
  children: ReactNode;
  /** Seconds per loop. */
  duration?: number;
  className?: string;
  ariaLabel?: string;
}

/** Infinite marquee — content is duplicated once; track translates -50%. */
export default function Marquee({ children, duration = 36, className = '', ariaLabel }: MarqueeProps) {
  return (
    <div
      className={`marquee overflow-hidden ${className}`}
      role={ariaLabel ? 'marquee' : undefined}
      aria-label={ariaLabel}
    >
      <div className="marquee-track" style={{ ['--marquee-dur' as string]: `${duration}s` }}>
        <div className="flex shrink-0 items-center" aria-hidden={false}>{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">{children}</div>
      </div>
    </div>
  );
}
