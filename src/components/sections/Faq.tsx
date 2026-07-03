'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Eyebrow from '@/components/ui/Eyebrow';
import SplitLines from '@/components/motion/SplitLines';
import { ANCHORS } from '@/lib/site';

interface FaqItem {
  q: string;
  a: string;
}

/**
 * S.NO 09 — questions of record. Sticky serif head left, trust-document
 * accordion right (patta/DTCP/RERA first). 0fr→1fr grid animation.
 */
export default function Faq() {
  const t = useTranslations('faq');
  const items = t.raw('items') as FaqItem[];
  // All questions rest closed — the reader opens what they care about
  const [open, setOpen] = useState<number>(-1);

  return (
    <section id={ANCHORS.faq} className="section-pad bg-ivory-50">
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.4fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Eyebrow index="09" className="text-fern-700">
              {t('eyebrow')}
            </Eyebrow>
            <SplitLines as="h2" text={t('heading')} className="font-display text-h2 mt-6 text-ink-900" />
          </div>

          <div data-stagger="">
            {items.map((item, i) => {
              const isOpen = open === i;
              return (
                <div key={i} className="faq-item border-b border-[var(--hairline-dark)] first:border-t" data-open={isOpen}>
                  <button
                    type="button"
                    id={`faq-question-${i}`}
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    className="flex w-full items-center justify-between gap-6 py-6 text-left"
                  >
                    <span className="flex items-baseline gap-4">
                      <span className="micro-label shrink-0 text-bronze-700 tabular-nums">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span
                        className={`text-[1.02rem] font-medium leading-snug transition-colors duration-300 ${
                          isOpen ? 'text-fern-700' : 'text-ink-900'
                        }`}
                      >
                        {item.q}
                      </span>
                    </span>
                    <span
                      className={`faq-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border transition-colors duration-300 ${
                        isOpen ? 'border-fern-600 text-fern-600' : 'border-ink-900/20 text-ink-900/60'
                      }`}
                      aria-hidden="true"
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4">
                        <path d="M6 1v10M1 6h10" strokeLinecap="round" />
                      </svg>
                    </span>
                  </button>
                  <div className="faq-answer" id={`faq-panel-${i}`} role="region" aria-labelledby={`faq-question-${i}`}>
                    <div>
                      <p className="max-w-2xl pb-7 pl-10 pr-4 text-[0.92rem] leading-[1.8] text-text-muted">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
