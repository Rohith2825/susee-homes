import { getTranslations } from 'next-intl/server';
import Eyebrow from '@/components/ui/Eyebrow';
import SplitLines from '@/components/motion/SplitLines';
import Spotlight from '@/components/motion/Spotlight';
import { ANCHORS } from '@/lib/site';

interface UpcomingCard {
  name: string;
  loc: string;
  area: string;
  status: string;
}

/** Procedural survey plate — each upcoming project gets a unique plat sketch. */
function PlotPlate({ seed }: { seed: number }) {
  const cols = 5 + (seed % 3);
  const rows = 4 + (seed % 2);
  const rects: Array<{ r: number; c: number }> = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if ((r + c + seed) % 7 === 0) continue; // leave open space
      rects.push({ r, c });
    }
  }
  const cw = 160 / cols;
  const rh = 104 / rows;

  return (
    <svg viewBox="0 0 160 120" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <rect width="160" height="120" fill="var(--color-ivory-100)" />
      {/* sub-grid */}
      <g stroke="rgba(45,106,79,0.08)" strokeWidth="0.4">
        {Array.from({ length: 15 }, (_, i) => (
          <line key={`v${i}`} x1={i * 11.5} y1="0" x2={i * 11.5} y2="120" />
        ))}
        {Array.from({ length: 11 }, (_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 11.5} x2="160" y2={i * 11.5} />
        ))}
      </g>
      {/* roads */}
      <line x1={80 + (seed % 2) * 10} y1="0" x2={80 + (seed % 2) * 10} y2="120" stroke="rgba(20,28,23,0.18)" strokeWidth="4" />
      <line x1="0" y1={58 + (seed % 3) * 6} x2="160" y2={58 + (seed % 3) * 6} stroke="rgba(20,28,23,0.18)" strokeWidth="4" />
      {/* plots */}
      {rects.map(({ r, c }) => (
        <rect
          key={`${r}-${c}`}
          x={c * cw + 2}
          y={r * rh + 6}
          width={cw - 4}
          height={rh - 4}
          rx="0.8"
          fill="rgba(45,106,79,0.06)"
          stroke="rgba(45,106,79,0.4)"
          strokeWidth="0.6"
          className="transition-[fill] duration-500 group-hover:fill-fern-600/14"
        />
      ))}
      {/* boundary */}
      <rect x="3" y="3" width="154" height="114" fill="none" stroke="rgba(161,136,86,0.65)" strokeWidth="0.9" strokeDasharray="5 3.5" />
    </svg>
  );
}

/** S.NO 06 — pipeline of future records. */
export default async function Upcoming() {
  const t = await getTranslations('upcoming');
  const cards = t.raw('cards') as UpcomingCard[];

  return (
    <section id={ANCHORS.upcoming} className="section-pad bg-ivory-50">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow index="06" className="text-fern-700">
              {t('eyebrow')}
            </Eyebrow>
            <SplitLines as="h2" text={t('heading')} className="font-display text-h2 mt-6 text-ink-900" />
          </div>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" data-stagger="">
          {cards.map((c, i) => (
            <Spotlight
              key={i}
              className="card-lift group relative overflow-hidden rounded-sm border border-[var(--hairline-dark)] bg-ivory-50"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <PlotPlate seed={i + 1} />
                {/* status chip */}
                <span className="absolute right-3.5 top-3.5 rounded-sm border border-fern-600/30 bg-ivory-50/90 px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-fern-700 backdrop-blur-sm">
                  {c.status}
                </span>
                <span className="font-display-italic absolute bottom-3.5 left-4 text-[0.95rem] text-fern-700/80">
                  {t('comingSoon')}
                </span>
              </div>
              <div className="border-t border-[var(--hairline-dark)] px-5 py-4">
                <h3 className="font-display text-[1.25rem] text-ink-900">{c.name}</h3>
                <p className="mt-1.5 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-text-muted">
                  {c.loc} · {c.area}
                </p>
              </div>
            </Spotlight>
          ))}
        </div>
      </div>
    </section>
  );
}
