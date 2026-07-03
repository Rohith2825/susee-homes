'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import Eyebrow from '@/components/ui/Eyebrow';
import SplitLines from '@/components/motion/SplitLines';
import { parseBrief, estimateCost, hasDetails, type ParsedBrief } from '@/lib/estimator';
import { ANCHORS, SITE, waLink } from '@/lib/site';
import { WhatsAppIcon } from '@/components/ui/icons';

/**
 * S.NO 05 — the estimate desk. Plain-language brief in, mono specification
 * sheet out: parsed line items over dotted leaders, a serif ₹ range,
 * and a WhatsApp handoff for the exact quote.
 */
export default function Estimator() {
  const t = useTranslations('estimator');
  const examples = t.raw('examples') as string[];

  const [text, setText] = useState('');

  const parsed: ParsedBrief = useMemo(
    () => (text.trim().length > 8 ? parseBrief(text) : {}),
    [text]
  );
  const found = hasDetails(parsed);
  const estimate = found ? estimateCost(parsed) : null;

  const specRows: Array<{ label: string; value: string }> = [];
  if (parsed.bedrooms) specRows.push({ label: t('labels.bedrooms'), value: `${parsed.bedrooms} BHK` });
  if (parsed.bathrooms) specRows.push({ label: t('labels.bathrooms'), value: String(parsed.bathrooms) });
  if (parsed.sqft) specRows.push({ label: t('labels.area'), value: `${parsed.sqft.toLocaleString()} sq ft` });
  if (parsed.floors) specRows.push({ label: t('labels.floors'), value: String(parsed.floors) });
  if (parsed.style) specRows.push({ label: t('labels.style'), value: parsed.style });

  const summary = [
    parsed.bedrooms ? `${parsed.bedrooms} BHK` : '',
    parsed.sqft ? `${parsed.sqft} sqft` : '',
    parsed.style ?? '',
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <section id={ANCHORS.estimator} className="section-pad bg-ivory-100">
      <div className="container-x">
        <div className="mx-auto max-w-3xl">
          <Eyebrow index="05" className="text-fern-700">
            {t('eyebrow')}
          </Eyebrow>
          <SplitLines as="h2" text={t('heading')} className="font-display text-h2 mt-6 text-ink-900" />
          <p data-reveal="" className="mt-6 max-w-xl leading-relaxed text-text-muted">
            {t('sub')}
          </p>

          {/* Example briefs */}
          <div data-reveal="" className="mt-9 flex flex-wrap items-center gap-2.5">
            <span className="micro-label text-text-muted">{t('try')}</span>
            {examples.map((ex, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setText(ex)}
                className="rounded-sm border border-fern-600/25 bg-ivory-50 px-3.5 py-2 font-mono text-[0.7rem] tracking-wide text-fern-700 transition-colors duration-300 hover:border-fern-600 hover:bg-fern-600 hover:text-ivory-50"
              >
                {ex}
              </button>
            ))}
          </div>

          {/* Drafting field */}
          <div data-reveal="" className="survey-frame relative mt-8 text-ink-900">
            <span className="tick-b" aria-hidden="true" />
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t('placeholder')}
              rows={4}
              aria-label={t('eyebrow')}
              className="w-full resize-y rounded-sm border border-ink-900/20 bg-ivory-50 px-5 py-4 text-[0.95rem] leading-[1.75] text-ink-900 outline-none transition-colors duration-300 placeholder:text-text-muted/55 focus:border-fern-600"
            />
          </div>

          {/* Specification sheet */}
          {found ? (
            <div className="mt-8 rounded-sm border border-ink-900/12 bg-ivory-50 p-[clamp(1.4rem,3vw,2.2rem)] shadow-[0_24px_60px_-40px_rgba(20,28,23,0.35)]">
              <div className="flex items-center justify-between gap-4 border-b border-[var(--hairline-dark)] pb-4">
                <span className="micro-label text-fern-700">{t('detailsFound')}</span>
                <span className="micro-label text-text-muted/90">S.05 / SPEC</span>
              </div>

              <dl className="mt-2">
                {specRows.map((row, i) => (
                  <div key={i} className="flex items-baseline gap-4 py-2.5">
                    <dt className="shrink-0 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-text-muted">
                      {row.label}
                    </dt>
                    <span
                      className="h-px flex-1 self-center bg-[repeating-linear-gradient(to_right,rgba(20,28,23,0.25)_0_2px,transparent_2px_6px)]"
                      aria-hidden="true"
                    />
                    <dd className="font-mono text-[0.82rem] tracking-wide text-ink-900">{row.value}</dd>
                  </div>
                ))}
              </dl>

              {estimate && (
                <div className="on-dark mt-6 flex flex-wrap items-center justify-between gap-6 rounded-sm bg-ink-900 p-6 sm:p-7">
                  <div>
                    <p className="micro-label text-ivory-50/55">{t('estimateTitle')}</p>
                    <p className="font-display mt-2 text-[clamp(1.8rem,3.4vw,2.6rem)] leading-none text-brass-200">
                      ₹{estimate.low}L – ₹{estimate.high}L
                    </p>
                    <p className="mt-2.5 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-ivory-50/45">
                      {t('estimateNote', { area: estimate.area.toLocaleString() })}
                    </p>
                  </div>
                  <a
                    href={waLink(SITE.buildPhone, t('waMessage', { summary: summary || text }))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-whatsapp"
                  >
                    <WhatsAppIcon />
                    {t('quoteCta')}
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div
              data-reveal=""
              className="mt-8 rounded-sm border border-dashed border-fern-600/30 bg-ivory-50/60 px-6 py-8 text-center"
            >
              <p className="text-[0.9rem] text-text-muted">{t('empty')}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
