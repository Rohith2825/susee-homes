import { getTranslations } from 'next-intl/server';
import Marquee from '@/components/ui/Marquee';
import { SurveyStar } from '@/components/ui/icons';

/** Thin certification band — slow marquee of trust facts between hero and stats. */
export default async function Ticker() {
  const t = await getTranslations('ticker');
  const items = t.raw('items') as string[];

  return (
    <div className="relative border-y border-ivory-50/10 bg-ink-900 py-3.5 text-ivory-50/70">
      <Marquee duration={44} className="marquee-mask" ariaLabel={items.join(' · ')}>
        {items.map((item, i) => (
          <span key={i} className="flex items-center">
            <span className="micro-label whitespace-nowrap !tracking-[0.18em]">{item}</span>
            <SurveyStar size={9} className="mx-7 shrink-0 text-brass-300/60" />
          </span>
        ))}
      </Marquee>
    </div>
  );
}
