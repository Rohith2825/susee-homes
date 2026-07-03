import { getTranslations } from 'next-intl/server';
import Eyebrow from '@/components/ui/Eyebrow';
import SplitLines from '@/components/motion/SplitLines';
import CtaScene from '@/components/sections/CtaScene';
import { ANCHORS, SITE, waLink } from '@/lib/site';
import { PhoneIcon, WhatsAppIcon } from '@/components/ui/icons';

/**
 * S.NO 10 — record of contact. The single conversion moment:
 * deep-ink panel, one headline, two honest actions — over a Hyperspeed
 * night-road scene (brass tail lights out, mint headlights in). Press
 * and hold the empty background to speed up.
 */
export default async function Cta() {
  const t = await getTranslations('cta');

  return (
    <section
      id={ANCHORS.contact}
      className="on-dark grain blueprint-grid blueprint-grid-dark relative overflow-hidden bg-ink-900 py-[clamp(5rem,11vw,9rem)] text-ivory-50"
    >
      {/* hyperspeed road scene — keeps pointer events so press-and-hold speeds up */}
      <CtaScene />

      {/* warm horizon glow blending the road into the horizon */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(60% 55% at 50% 100%, rgba(45,106,79,0.35), transparent 70%)' }}
        aria-hidden="true"
      />

      {/* legibility overlay — edge fades melt the canvas into the section,
          plus a subtle center scrim so copy stays readable when the road
          sweeps up behind it */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(55% 62% at 50% 40%, rgba(14,23,19,0.6) 0%, rgba(14,23,19,0.28) 48%, rgba(14,23,19,0) 74%), linear-gradient(to bottom, #0e1713 0%, rgba(14,23,19,0) 30%, rgba(14,23,19,0) 72%, #0e1713 100%)',
        }}
        aria-hidden="true"
      />

      <div className="container-x relative z-10 text-center">
        <Eyebrow index="10" className="justify-center text-brass-300" reveal={false}>
          {t('eyebrow')}
        </Eyebrow>
        <SplitLines
          as="h2"
          text={t('heading')}
          className="font-display mx-auto mt-7 text-[clamp(2.3rem,4.6vw,4.2rem)] text-ivory-50"
        />
        <p data-reveal="" className="mx-auto mt-6 max-w-md text-[0.98rem] leading-relaxed text-ivory-50/60">
          {t('sub')}
        </p>

        <div data-reveal="" className="mt-11 flex flex-wrap items-center justify-center gap-4">
          <a
            href={waLink(SITE.phone, t('waMessage'))}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp !px-8 !py-4"
          >
            <WhatsAppIcon />
            {t('whatsapp')}
          </a>
          <a href={`tel:${SITE.phone}`} className="btn btn-ghost-light !px-8 !py-4">
            <PhoneIcon size={16} />
            {t('call')}
          </a>
        </div>

        <p className="micro-label mt-14 text-ivory-50/35">13.0480° N · 80.0966° E · POONAMALLEE</p>
      </div>
    </section>
  );
}
