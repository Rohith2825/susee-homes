import { getTranslations } from 'next-intl/server';
import Eyebrow from '@/components/ui/Eyebrow';
import SplitLines from '@/components/motion/SplitLines';
import Masterplan from '@/components/sections/Masterplan';
import { ANCHORS } from '@/lib/site';
import { ArrowRight } from '@/components/ui/icons';

interface Connectivity {
  time: string;
  place: string;
}
interface Figure {
  num: string;
  label: string;
}

/** Circular certification mark — quiet, rotated, drawn like an ink stamp. */
function CertStamp() {
  return (
    <svg
      viewBox="0 0 120 120"
      className="h-24 w-24 -rotate-12 text-brass-300/70 sm:h-28 sm:w-28"
      aria-hidden="true"
    >
      <defs>
        <path id="stamp-circle" d="M60 12a48 48 0 110 96 48 48 0 010-96" />
      </defs>
      <circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" strokeWidth="1" opacity=".7" />
      <circle cx="60" cy="60" r="38" fill="none" stroke="currentColor" strokeWidth=".7" opacity=".5" />
      <text fontSize="10.5" fill="currentColor" fontFamily="var(--mono)" letterSpacing="2.6">
        <textPath href="#stamp-circle">DTCP APPROVED · RERA CERTIFIED ·</textPath>
      </text>
      <text x="60" y="57" textAnchor="middle" fontSize="11" fill="currentColor" fontFamily="var(--mono)" letterSpacing="2">
        SUSEE
      </text>
      <text x="60" y="71" textAnchor="middle" fontSize="11" fill="currentColor" fontFamily="var(--mono)" letterSpacing="2">
        ALIGHT
      </text>
    </svg>
  );
}

/**
 * S.NO 04 — the flagship record. Dark panel, document treatment:
 * survey chips, dotted leader lines, plat-map masterplan, figures schedule.
 */
export default async function Alight() {
  const t = await getTranslations('alight');
  const tags = t.raw('tags') as string[];
  const connectivity = t.raw('connectivity') as Connectivity[];
  const amenities = t.raw('amenities') as string[];
  const figures = t.raw('figures') as Figure[];

  return (
    <section
      id={ANCHORS.project}
      className="on-dark grain blueprint-grid blueprint-grid-dark section-pad relative overflow-hidden bg-ink-950 text-ivory-50"
    >
      <div className="container-x relative">
        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-8">
          <div>
            <Eyebrow index="04" className="text-brass-300">
              {t('eyebrow')}
            </Eyebrow>
            <SplitLines
              as="h2"
              text={t('heading')}
              className="font-display text-h2 mt-6 text-ivory-50"
            />
          </div>
          <div data-reveal="scale" className="hidden shrink-0 sm:block">
            <CertStamp />
          </div>
        </div>

        {/* ── Survey chips ── */}
        <div className="mt-8 flex flex-wrap gap-2.5" data-stagger="">
          {tags.map((tag, i) => (
            <span
              key={i}
              className={`rounded-sm border px-3.5 py-1.5 font-mono text-[0.66rem] uppercase tracking-[0.14em] ${
                i < 2
                  ? 'border-brass-300/40 bg-brass-300/8 text-brass-200'
                  : 'border-ivory-50/18 bg-ivory-50/4 text-ivory-50/75'
              }`}
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-14 grid gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
          {/* ── Left: narrative + data ── */}
          <div data-reveal="left">
            <p className="max-w-xl text-[1.02rem] leading-[1.85] text-ivory-50/70">{t('body')}</p>

            {/* Connectivity — dotted leader rows */}
            <p className="micro-label mt-12 text-brass-300/80">{t('connectivityEyebrow')}</p>
            <ul className="mt-5">
              {connectivity.map((c, i) => (
                <li key={i} className="flex items-baseline gap-4 border-b border-ivory-50/8 py-3.5">
                  <span className="w-24 shrink-0 font-mono text-[0.78rem] tracking-[0.08em] text-brass-200">
                    {c.time}
                  </span>
                  <span
                    className="h-px flex-1 self-center bg-[repeating-linear-gradient(to_right,rgba(247,244,236,0.25)_0_2px,transparent_2px_6px)]"
                    aria-hidden="true"
                  />
                  <span className="text-[0.92rem] text-ivory-50/85">{c.place}</span>
                </li>
              ))}
            </ul>

            {/* Amenities — survey checklist */}
            <p className="micro-label mt-12 text-brass-300/80">{t('amenitiesEyebrow')}</p>
            <ul className="mt-5 grid grid-cols-1 gap-x-8 gap-y-3 xs:grid-cols-2" data-stagger="">
              {amenities.map((a, i) => (
                <li key={i} className="flex items-center gap-3 text-[0.9rem] text-ivory-50/75">
                  <span className="h-[7px] w-[7px] shrink-0 rounded-full border border-mint-400/70" aria-hidden="true" />
                  {a}
                </li>
              ))}
            </ul>
          </div>

          {/* ── Right: masterplan + figures ── */}
          <div data-reveal="right" className="flex flex-col gap-10">
            <Masterplan label={t('masterplanLabel')} />

            {/* Figures schedule */}
            <dl>
              {figures.map((f, i) => (
                <div
                  key={i}
                  className="flex items-baseline justify-between gap-6 border-b border-ivory-50/10 py-5 first:border-t"
                >
                  <dd className="font-display text-[clamp(1.9rem,3vw,2.6rem)] leading-none text-brass-200 tabular-nums">
                    {f.num}
                  </dd>
                  <dt className="micro-label text-right text-ivory-50/55">{f.label}</dt>
                </div>
              ))}
            </dl>

            <div>
              <a href={`#${ANCHORS.contact}`} className="btn btn-brass">
                {t('cta')}
                <ArrowRight className="btn-arrow" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
