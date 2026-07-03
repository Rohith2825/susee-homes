import { getTranslations } from 'next-intl/server';
import CountUp from '@/components/motion/CountUp';
import Eyebrow from '@/components/ui/Eyebrow';

interface StatItem {
  num: string;
  suffix: string;
  label: string;
}

/**
 * The record in numbers — oversized serif numerals over hairline dividers.
 * No cards, no icons: figures typeset like a survey schedule.
 */
export default async function Stats() {
  const t = await getTranslations('stats');
  const items = t.raw('items') as StatItem[];

  return (
    <section className="bg-ivory-100">
      <div className="container-x">
        <div className="hairline-b flex items-center justify-between pt-14 pb-6">
          <Eyebrow index="01" className="text-fern-700">
            {t('eyebrow')}
          </Eyebrow>
          <span className="micro-label hidden text-text-muted sm:block">13.0480° N · 80.0966° E</span>
        </div>

        <dl className="grid grid-cols-2 lg:grid-cols-4" data-stagger="">
          {items.map((s, i) => (
            <div
              key={i}
              className={`relative px-2 py-10 text-center sm:py-14 ${
                i % 2 === 1 ? 'border-l border-[var(--hairline-dark)]' : ''
              } ${i >= 2 ? 'border-t border-[var(--hairline-dark)] lg:border-t-0' : ''} ${
                i >= 2 ? 'lg:border-l lg:border-[var(--hairline-dark)]' : ''
              }`}
            >
              {/* vertex circle on the divider */}
              {i > 0 && (
                <span
                  className="absolute -left-[4.5px] top-1/2 hidden h-2 w-2 -translate-y-1/2 rounded-full border border-fern-600/50 bg-ivory-100 lg:block"
                  aria-hidden="true"
                />
              )}
              <dd className="font-display text-[clamp(3rem,6vw,5.2rem)] leading-none tracking-[-0.03em] text-ink-900 tabular-nums">
                <CountUp value={s.num} suffix={s.suffix} />
              </dd>
              <dt className="micro-label mt-4 block text-text-muted">{s.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
