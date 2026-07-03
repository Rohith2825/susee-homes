import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { ANCHORS, SITE, waLink } from '@/lib/site';
import { ArrowUpRight, PhoneIcon, WhatsAppIcon } from '@/components/ui/icons';
import YearStamp from '@/components/chrome/YearStamp';

const LINKS = [
  { key: 'project', anchor: ANCHORS.project },
  { key: 'estimator', anchor: ANCHORS.estimator },
  { key: 'process', anchor: ANCHORS.process },
  { key: 'founder', anchor: ANCHORS.founder },
  { key: 'faq', anchor: ANCHORS.faq },
  { key: 'contact', anchor: ANCHORS.contact },
] as const;

export default async function Footer() {
  const t = await getTranslations('footer');
  const tc = await getTranslations('cta');
  const year = new Date().getFullYear();

  return (
    <footer className="on-dark grain relative overflow-hidden bg-ink-950 text-ivory-50">
      <div className="blueprint-grid blueprint-grid-dark pointer-events-none absolute inset-0" />

      <div className="container-x relative">
        {/* ── Top: brand + link columns ── */}
        <div className="grid gap-10 py-[clamp(2.5rem,5vw,4rem)] md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            {/* One-colour ivory rendition of the mark — no white card on ink */}
            <Image
              src="/images/logo-alpha.png"
              alt="Susee Homes"
              width={132}
              height={38}
              className="h-[36px] w-auto opacity-90 brightness-0 invert"
            />
            <p className="font-display-italic mt-5 text-[1.35rem] text-brass-200/95">{t('tagline')}</p>
            <p className="mt-3 max-w-sm text-[0.9rem] leading-relaxed text-ivory-50/55">{t('blurb')}</p>
          </div>

          <nav aria-label={t('explore')}>
            <p className="micro-label mb-5 text-brass-300/80">{t('explore')}</p>
            <ul className="flex flex-col gap-2.5">
              {LINKS.map((l) => (
                <li key={l.key}>
                  <a
                    href={`#${l.anchor}`}
                    className="group inline-flex items-center gap-2 text-[0.92rem] text-ivory-50/75 transition-colors hover:text-ivory-50"
                  >
                    {t(`links.${l.key}`)}
                    <ArrowUpRight
                      size={11}
                      className="opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-60"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="micro-label mb-5 text-brass-300/80">{t('reach')}</p>
            <div className="flex flex-col gap-3 text-[0.92rem]">
              <a
                href={`tel:${SITE.phone}`}
                className="inline-flex items-center gap-3 text-ivory-50/75 transition-colors hover:text-ivory-50"
              >
                <PhoneIcon size={15} />
                {t('phone')}
              </a>
              <a
                href={waLink(SITE.phone, tc('waMessage'))}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 text-ivory-50/75 transition-colors hover:text-ivory-50"
              >
                <WhatsAppIcon size={15} />
                {t('whatsapp')}
              </a>
              <p className="text-ivory-50/55">{t('location')}</p>
              <p className="text-ivory-50/40">{t('visitNote')}</p>
            </div>
          </div>
        </div>

        {/* ── Signature mark — the site's own display serif (not a generic
             bold sans stencil), hairline outline that fills brass→mint→fern
             on hover. Sized in container-query units so it always fits
             container-x's own rendered width instead of guessing against
             the viewport. ── */}
        <div
          aria-hidden="true"
          className="border-t border-ivory-50/10 py-[clamp(0.4rem,1.4vw,1.1rem)] [container-type:inline-size]"
        >
          <div
            className="footer-mark group relative select-none text-center leading-none"
            style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 600 }}
          >
            {/* pt keeps the tall caps' stroke from clipping; -mb trims the
                serif's unused descender whitespace so the band isn't empty.
                Both layers share the exact box so they stay aligned. */}
            <span className="footer-mark-outline block whitespace-nowrap pt-[0.08em] -mb-[0.16em] text-[clamp(2.4rem,13.5cqw,9rem)] tracking-[-0.01em]">
              Susee Homes
            </span>
            <span className="footer-mark-fill pointer-events-none absolute inset-0 block whitespace-nowrap pt-[0.08em] text-[clamp(2.4rem,13.5cqw,9rem)] tracking-[-0.01em] opacity-0 transition-opacity duration-700 ease-out group-hover:opacity-100 group-active:opacity-100">
              Susee Homes
            </span>
          </div>
        </div>

        {/* ── Legal ── */}
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 border-t border-ivory-50/10 py-6 text-center text-[0.8rem] text-ivory-50/45">
          <span>
            © <YearStamp initial={year} /> {t('rights')}
          </span>
          <span className="text-ivory-50/20">·</span>
          <span>{t('certified')}</span>
          <span className="text-ivory-50/20">·</span>
          <span>{t('place')}</span>
        </div>
      </div>
    </footer>
  );
}
