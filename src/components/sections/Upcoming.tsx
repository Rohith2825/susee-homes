import { getTranslations } from 'next-intl/server';
import Eyebrow from '@/components/ui/Eyebrow';
import SplitLines from '@/components/motion/SplitLines';
import UpcomingShowcase, { type UpcomingCard } from '@/components/sections/UpcomingShowcase';
import { ANCHORS } from '@/lib/site';

/** S.NO 06 — pipeline of future records, dealt as a live survey-plate deck. */
export default async function Upcoming() {
  const t = await getTranslations('upcoming');
  const ta = await getTranslations('alight');
  const cards = t.raw('cards') as UpcomingCard[];

  return (
    <section id={ANCHORS.upcoming} className="section-pad overflow-hidden bg-ivory-50">
      <div className="container-x">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-8">
          {/* Left — the record header + a survey-style project index */}
          <div className="max-w-xl">
            <Eyebrow index="06" className="text-fern-700">
              {t('eyebrow')}
            </Eyebrow>
            <SplitLines as="h2" text={t('heading')} className="font-display text-h2 mt-6 text-ink-900" />
            <p data-reveal="" className="mt-6 max-w-md leading-relaxed text-text-muted">
              {t('intro')}
            </p>

            <ul data-reveal="" className="mt-10 max-w-md border-t border-[var(--hairline-dark)]">
              {cards.map((c, i) => (
                <li
                  key={i}
                  className="flex items-baseline gap-4 border-b border-[var(--hairline-dark)] py-3.5"
                >
                  <span className="font-mono text-[0.72rem] tabular-nums text-fern-700/60">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="font-display flex-1 text-[1.1rem] text-ink-900">{c.name}</span>
                  <span className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-text-muted">
                    {c.loc.split(',')[0]}
                  </span>
                </li>
              ))}
            </ul>
            <p data-reveal="" className="mt-5 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-fern-700/70">
              {t('hint')}
            </p>
          </div>

          {/* Right — the dealing deck */}
          <div data-reveal="" className="relative">
            <UpcomingShowcase
              cards={cards}
              comingSoon={t('comingSoon')}
              ctaLabel={ta('cta')}
              ctaHref={`#${ANCHORS.contact}`}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
