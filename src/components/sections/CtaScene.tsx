'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import type { HyperspeedOptions } from '@/components/ui/hyperspeed';

const Hyperspeed = dynamic(() => import('@/components/ui/hyperspeed'), { ssr: false });

/**
 * Themed Hyperspeed options — an ink-green dusk road: brass tail lights
 * flowing away on the left, mint headlights approaching on the right,
 * fern shoulder lines and bronze lane dashes on ink tarmac. Module-level
 * constant so the effect never re-runs.
 */
const EFFECT_OPTIONS: Partial<HyperspeedOptions> = {
  distortion: 'turbulentDistortion',
  length: 400,
  roadWidth: 10,
  islandWidth: 2,
  lanesPerRoad: 3,
  fov: 90,
  fovSpeedUp: 150,
  speedUp: 2,
  carLightsFade: 0.4,
  totalSideLightSticks: 20,
  lightPairsPerRoadWay: 40,
  colors: {
    roadColor: 0x0a100d, // ink-950 tarmac
    islandColor: 0x0e1713, // ink-900 median
    background: 0x0e1713, // = section bg-ink-900, canvas melts into it
    shoulderLines: 0x1b4332, // fern-700
    brokenLines: 0x79643a, // bronze-700
    leftCars: [0xb5830a, 0x96762e, 0xd9bc7a], // brass tail-light streams
    rightCars: [0x74d4a0, 0x40916c, 0xd8f3dc], // mint headlight streams
    sticks: 0xd9bc7a, // brass-300 roadside posts
  },
};

/**
 * CtaScene — the animated back layer of the contact section. Mounts the
 * heavy three.js scene only when the section approaches the viewport,
 * and renders nothing at all under prefers-reduced-motion.
 */
export default function CtaScene() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Live-tracked, not sampled once: a user who toggles the OS setting
    // mid-session should gain or lose the scene, same as the meteors'
    // CSS media query does.
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mql.addEventListener('change', onChange);

    const host = hostRef.current;
    let observer: IntersectionObserver | null = null;
    if (host) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            setNear(true); // mount once, never unmount
            observer?.disconnect();
          }
        },
        { rootMargin: '400px 0px 400px 0px' }
      );
      observer.observe(host);
    }

    return () => {
      mql.removeEventListener('change', onChange);
      observer?.disconnect();
    };
  }, []);

  return (
    <div ref={hostRef} className="absolute inset-0 z-0" aria-hidden="true">
      {near && !reducedMotion ? <Hyperspeed effectOptions={EFFECT_OPTIONS} /> : null}
    </div>
  );
}
