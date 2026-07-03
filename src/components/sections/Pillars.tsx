import { getTranslations } from 'next-intl/server';
import Eyebrow from '@/components/ui/Eyebrow';
import SplitLines from '@/components/motion/SplitLines';
import TiltCard from '@/components/motion/TiltCard';
import { PixelCanvas } from '@/components/ui/pixel-canvas';
import { Meteors } from '@/components/ui/meteors';
import { PlotIcon, HomeIcon } from '@/components/ui/icons';

interface PillarCard {
  title: string;
  body: string;
  points: string[];
}

/**
 * The two pillars — an asymmetric ivory/ink pairing: land on paper,
 * construction on ink. One business, two instruments.
 */
export default async function Pillars() {
  const t = await getTranslations('pillars');
  const cards = t.raw('cards') as PillarCard[];

  return (
    <section className="blueprint-grid blueprint-grid-bold section-pad relative bg-ivory-50">
      <div className="container-x relative">
        <div className="max-w-2xl">
          <Eyebrow index="02" className="text-fern-700">
            {t('eyebrow')}
          </Eyebrow>
          <SplitLines as="h2" text={t('heading')} className="font-display text-h2 mt-6 text-ink-900" />
          <p data-reveal="" className="mt-6 max-w-lg leading-relaxed text-text-muted">
            {t('sub')}
          </p>
        </div>

        <div className="mt-16 grid gap-5 lg:grid-cols-2" data-stagger="">
          {cards.map((card, i) => {
            const dark = i === 1;
            return (
              <TiltCard
                key={i}
                className={`group relative flex flex-col rounded-sm p-[clamp(1.8rem,3.5vw,3.2rem)] [transform-style:preserve-3d] transition-[box-shadow,border-color] duration-500 ${
                  dark
                    ? 'on-dark border border-ivory-50/8 bg-ink-900 text-ivory-50 shadow-[0_30px_80px_-40px_rgba(10,16,13,0.5)] hover:border-brass-300/70 hover:shadow-[0_0_0_1px_rgba(217,188,122,0.3),0_0_36px_-4px_rgba(217,188,122,0.38),0_0_90px_-18px_rgba(217,188,122,0.26),0_44px_100px_-42px_rgba(10,16,13,0.65)]'
                    : 'survey-frame border border-[var(--hairline-dark)] bg-ivory-50 text-ink-900 shadow-[0_18px_50px_-40px_rgba(10,16,13,0.25)] hover:shadow-[0_34px_80px_-40px_rgba(10,16,13,0.35)]'
                }`}
              >
                {!dark && <span className="tick-b" aria-hidden="true" />}
                {/* Meteor field — fine fern/brass streaks drifting across the
                    paper, clipped here (the card itself must stay overflow-
                    visible for the preserve-3d tilt) */}
                {!dark && (
                  <div
                    className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
                    aria-hidden="true"
                  >
                    <Meteors number={14} />
                  </div>
                )}
                {/* Gold twinkle field — pixels glow in and out at random
                    places while hovered, never the full carpet */}
                {dark && (
                  <PixelCanvas
                    gap={10}
                    speed={30}
                    colors={['#ecd39c', '#d9bc7a', '#b5830a']}
                    variant="twinkle"
                    noFocus
                    aria-hidden="true"
                    style={{ borderRadius: 'inherit' }}
                  />
                )}

                {/* Instrument head — floats highest when the card tilts */}
                <div className="flex items-start justify-between [transform:translateZ(38px)]">
                  <span
                    className={`inline-flex h-14 w-14 items-center justify-center rounded-sm border ${
                      dark ? 'border-ivory-50/15 text-brass-200' : 'border-fern-600/25 text-fern-600'
                    }`}
                  >
                    {i === 0 ? <PlotIcon /> : <HomeIcon />}
                  </span>
                  <span className={`micro-label ${dark ? 'text-ivory-50/40' : 'text-text-muted'}`}>
                    S.02 / {i === 0 ? 'A' : 'B'}
                  </span>
                </div>

                <h3 className="font-display text-h3 mt-8 [transform:translateZ(30px)]">{card.title}</h3>
                <p
                  className={`mt-4 leading-relaxed [transform:translateZ(20px)] ${
                    dark ? 'text-ivory-50/62' : 'text-text-muted'
                  }`}
                >
                  {card.body}
                </p>

                {/* Survey checklist */}
                <ul
                  className={`mt-8 border-t pt-6 [transform:translateZ(14px)] ${
                    dark ? 'border-ivory-50/12' : 'border-[var(--hairline-dark)]'
                  }`}
                >
                  {card.points.map((pt, j) => (
                    <li
                      key={j}
                      className={`flex items-center gap-3 py-2 text-[0.9rem] ${
                        dark ? 'text-ivory-50/75' : 'text-ink-900/80'
                      }`}
                    >
                      <span
                        className={`h-[7px] w-[7px] shrink-0 rounded-full border ${
                          dark ? 'border-brass-200/80' : 'border-fern-600'
                        }`}
                        aria-hidden="true"
                      />
                      {pt}
                    </li>
                  ))}
                </ul>
              </TiltCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
