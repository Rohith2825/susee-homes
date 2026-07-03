'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import Eyebrow from '@/components/ui/Eyebrow';
import SplitLines from '@/components/motion/SplitLines';
import { Boxes } from '@/components/ui/background-boxes';
import { ScrollReelTestimonials } from '@/components/ui/scroll-reel-testimonials';
import { ANCHORS } from '@/lib/site';

interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

/** Self-hosted portraits for the reel tiles. */
const PORTRAITS = [
  '/images/people/karthikeyan-2.jpg',
  '/images/people/priya-2.jpg',
  '/images/people/anand-revathi.jpg',
  '/images/people/ilangovan-2.jpg',
] as const;

/**
 * S.NO 08 — words of record. Counter-rotating portrait reel with
 * per-character text rise, on the living survey-grid backdrop.
 */
export default function Testimonials() {
  const t = useTranslations('testimonials');
  const items = t.raw('items') as Testimonial[];
  const sectionRef = useRef<HTMLElement>(null);
  // Boxes is a ~5,500-node grid; mount it only once the section nears the
  // viewport (same pattern as CtaScene's Hyperspeed gate) so it never
  // weighs down the initial hydration payload for a below-the-fold section.
  const [nearViewport, setNearViewport] = useState(false);

  useEffect(() => {
    const host = sectionRef.current;
    if (!host) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNearViewport(true); // mount once, never unmount
          observer.disconnect();
        }
      },
      { rootMargin: '400px 0px 400px 0px' }
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  const testimonials = items.map((item, i) => ({
    quote: `“${item.quote}”`,
    author: item.name,
    role: item.role,
    image: PORTRAITS[i % PORTRAITS.length],
    alt: item.name,
  }));

  return (
    <section
      ref={sectionRef}
      id={ANCHORS.testimonials}
      className="section-pad relative overflow-hidden bg-ivory-100"
    >
      {/* Living survey grid — tiles light up in the palette under the cursor */}
      {nearViewport ? <Boxes /> : null}
      {/* Vignette: quiet ivory at the edges, live tiles in the middle */}
      <div
        className="pointer-events-none absolute inset-0 z-10 bg-ivory-100 [mask-image:radial-gradient(transparent,white)]"
        aria-hidden="true"
      />
      {/* pointer-events fall through the layout boxes so the tiles stay
          hoverable everywhere except the actual content */}
      <div className="container-x pointer-events-none relative z-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="pointer-events-auto">
            <Eyebrow index="08" className="text-fern-700">
              {t('eyebrow')}
            </Eyebrow>
            <SplitLines as="h2" text={t('heading')} className="font-display text-h2 mt-6 text-ink-900" />
          </div>
        </div>

        <div data-reveal="" className="pointer-events-auto mx-auto mt-16 flex justify-center">
          <ScrollReelTestimonials testimonials={testimonials} />
        </div>
      </div>
    </section>
  );
}
