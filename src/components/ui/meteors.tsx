'use client';

/**
 * Meteors — Aceternity's shooting-star field, ported off framer-motion and
 * re-inked for ivory paper: each meteor is a fine drafting-pen stroke (fern
 * head, brass-fading tail) rather than a white-on-dark comet. Rendered on
 * the server too, so every "random" value comes from a seeded PRNG — the
 * markup must be byte-identical between server and client (no hydration
 * drift from Math.random()).
 */

/** mulberry32 — tiny deterministic PRNG, one stream per meteor index. */
function mulberry32(seed: number) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface MeteorsProps {
  number?: number;
  className?: string;
}

export function Meteors({ number = 14, className = '' }: MeteorsProps) {
  return (
    <>
      {Array.from({ length: number }, (_, i) => {
        const rand = mulberry32(i * 1013 + 7);
        // Full-width spread, biased slightly left so streaks (which travel
        // down-right at 215deg) cross the card instead of exiting instantly.
        const left = rand() * 105 - 12; // -12% .. 93%
        const delay = 0.2 + rand() * 4.6; // staggered launches, s
        const duration = 3.5 + rand() * 5.5; // 3.5s .. 9s
        return (
          <span
            key={i}
            className={`meteor animate-meteor ${className}`}
            style={{
              left: `${left.toFixed(2)}%`,
              top: '-6px',
              animationDelay: `${delay.toFixed(2)}s`,
              animationDuration: `${duration.toFixed(2)}s`,
            }}
          />
        );
      })}
    </>
  );
}
