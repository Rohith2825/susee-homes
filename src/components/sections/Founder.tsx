import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import Eyebrow from '@/components/ui/Eyebrow';
import SplitLines from '@/components/motion/SplitLines';
import { ANCHORS } from '@/lib/site';

interface Milestone {
  year: string;
  label: string;
  sub: string;
}

/**
 * S.NO 07 — the man of record. Deep-green panel with a faint brass wash;
 * portrait as a certified exhibit, conviction as the page's one editorial
 * statement, twenty years plotted like a survey chain.
 */
export default async function Founder() {
  const t = await getTranslations('founder');
  const chips = t.raw('chips') as string[];
  const milestones = t.raw('milestones') as Milestone[];

  return (
    <section
      id={ANCHORS.founder}
      className="on-dark grain section-pad relative overflow-hidden bg-fern-700 text-ivory-50"
    >
      {/* faint brass wash */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(90% 70% at 82% 8%, rgba(243,213,142,0.1), transparent 60%)' }}
        aria-hidden="true"
      />

      <div className="container-x relative">
        <Eyebrow index="07" className="text-brass-200/90">
          {t('eyebrow')}
        </Eyebrow>
        <SplitLines as="h2" text={t('heading')} className="font-display text-h2 mt-6 max-w-xl text-ivory-50" />

        <div className="mt-16 grid gap-14 lg:grid-cols-[300px_1fr] lg:gap-20">
          {/* ── Portrait exhibit ── */}
          <div data-reveal="left">
            <div className="survey-frame relative text-ivory-50/70">
              <span className="tick-b" aria-hidden="true" />
              <div className="relative aspect-[4/5] overflow-hidden rounded-sm border border-ivory-50/15">
                <Image
                  src="/images/founder.png"
                  alt={`${t('name')} — ${t('role')}`}
                  fill
                  sizes="(min-width: 1024px) 300px, 80vw"
                  className="object-cover object-top"
                />
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{ background: 'linear-gradient(to top, rgba(10,16,13,0.35), transparent 40%)' }}
                  aria-hidden="true"
                />
              </div>
            </div>
            <p className="mt-5 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-brass-200">
              {t('name')}
            </p>
            <p className="mt-1.5 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ivory-50/50">
              {t('role')}
            </p>

            {/* Credentials of record */}
            <ul className="mt-7 border-t border-ivory-50/12">
              {chips.map((chip, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 border-b border-ivory-50/12 py-2.5 text-[0.82rem] text-ivory-50/78"
                >
                  <span className="h-[6px] w-[6px] shrink-0 rounded-full border border-brass-200/80" aria-hidden="true" />
                  {chip}
                </li>
              ))}
            </ul>
          </div>

          {/* ── Statement + record ── */}
          <div data-reveal="">
            <blockquote className="font-display-italic relative text-[clamp(1.6rem,3vw,2.5rem)] leading-[1.4] text-ivory-50">
              <span className="absolute -left-6 -top-4 font-display text-[3.4rem] text-brass-200/35 select-none" aria-hidden="true">
                “
              </span>
              {t('quote')}
            </blockquote>

            <p className="mt-9 max-w-2xl text-[0.98rem] leading-[1.85] text-ivory-50/80">{t('bio1')}</p>
            <p className="mt-5 max-w-2xl text-[0.98rem] leading-[1.85] text-ivory-50/80">{t('bio2')}</p>

            {/* ── Journey chain ── */}
            <p className="micro-label mt-14 text-brass-200/85">{t('journeyEyebrow')}</p>
            <ol
              className="relative mt-8 grid gap-10 border-l border-dashed border-ivory-50/25 pl-7 sm:grid-cols-2 sm:gap-x-10 sm:border-l-0 sm:border-t sm:pl-0 sm:pt-8 lg:grid-cols-4"
              data-stagger=""
            >
              {milestones.map((m, i) => (
                <li key={i} className="relative">
                  <span
                    className="absolute -left-[32.5px] top-1 h-[11px] w-[11px] rounded-full border-[1.5px] border-brass-200 bg-fern-700 sm:-top-[13.5px] sm:left-0"
                    aria-hidden="true"
                  />
                  <span className="font-display text-[1.6rem] text-brass-200 tabular-nums">{m.year}</span>
                  <p className="mt-2 text-[0.92rem] font-semibold text-ivory-50/92">{m.label}</p>
                  <p className="mt-1.5 text-[0.8rem] leading-relaxed text-ivory-50/55">{m.sub}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
