import { getTranslations } from 'next-intl/server';
import Eyebrow from '@/components/ui/Eyebrow';
import StatsForge from '@/components/sections/StatsForge';

interface StatItem {
  num: string;
  suffix: string;
  label: string;
}

/**
 * S.01 — the record in numbers, forged from the land. A canvas grain field
 * (sibling to the splash) morphs through the real parcel: boundary → 181
 * plots → 40% open space → 2016, and the four figures read live off it.
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
      </div>

      <StatsForge items={items} />
    </section>
  );
}
