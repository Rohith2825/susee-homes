'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { ANCHORS, SITE, waLink } from '@/lib/site';
import { GlobeIcon, PhoneIcon, WhatsAppIcon } from '@/components/ui/icons';
import './navbar.css';

const NAV_ITEMS = [
  { key: 'project', anchor: ANCHORS.project },
  { key: 'buildCost', anchor: ANCHORS.estimator },
  { key: 'process', anchor: ANCHORS.process },
  { key: 'founder', anchor: ANCHORS.founder },
  { key: 'contact', anchor: ANCHORS.contact },
] as const;

type Tone = 'dark' | 'light';

/* ── iOS 26 liquid glass — the polished droplet ────────────────
   No noise, no turbulence: a SMOOTH gradient displacement map (the
   capsule as a lens) bends the backdrop hard at the curved edges and
   leaves the centre optically calm, exactly like Apple's material.
   Scroll velocity deepens the refraction (liquid drag). Chromium
   renders it through backdrop-filter: url(#nav-liquid); Safari and
   Firefox keep the frosted fallback with the same gloss chrome. */

const LIQUID_SCALE = -120; // distortion at rest (negative pulls inward)
const LIQUID_MAX_BOOST = 55; // extra distortion under fast scroll
const LIQUID_OFFSETS = [0, 5, 10] as const; // chromatic split per channel

/** Smooth droplet map: horizontal red ramp × vertical blue ramp
 *  (difference-blended) with a blurred neutral core — the capsule
 *  becomes a lens whose refraction hugs the curved rim. */
function buildGlassMap(w: number, h: number): string {
  const edge = Math.min(w, h) * 0.07;
  const r = h / 2;
  const svg = `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="gx" x1="100%" y1="0%" x2="0%" y2="0%"><stop offset="0%" stop-color="#0000"/><stop offset="100%" stop-color="red"/></linearGradient><linearGradient id="gy" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#0000"/><stop offset="100%" stop-color="blue"/></linearGradient></defs><rect width="${w}" height="${h}" fill="black"/><rect width="${w}" height="${h}" rx="${r}" fill="url(#gx)"/><rect width="${w}" height="${h}" rx="${r}" fill="url(#gy)" style="mix-blend-mode:difference"/><rect x="${edge}" y="${edge}" width="${w - edge * 2}" height="${h - edge * 2}" rx="${r}" fill="hsl(0 0% 50% / 0.93)" style="filter:blur(5px)"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

type LiquidRefs = {
  sheenRef: React.RefObject<HTMLSpanElement | null>;
  navRef: React.RefObject<HTMLElement | null>;
  dispRefs: React.RefObject<Array<SVGFEDisplacementMapElement | null>>;
};

/**
 * Scroll-derived nav state, all computed in ONE rAF-coalesced pass:
 * — tone: 'dark' over the hero and `.on-dark` sections, 'light' elsewhere
 *   (iOS glass adapts to its backdrop) — ±16px hysteresis at boundaries
 * — condensed: capsule compacts after ~28px of downward travel, relaxes on
 *   upward travel or near the top (the iOS 26 scroll-morph)
 * — liquid dynamics: scroll velocity squashes the capsule (jelly) and deepens
 *   the rim refraction (liquid drag), both settling on a smoothed decay;
 *   sheen/squash/lens are written straight to the DOM as GPU transforms and
 *   SVG attributes — they never touch React
 * setState is ref-guarded, so scrolling itself never re-renders the navbar;
 * bands re-measure on resize/body growth and when scrolling comes to rest.
 */
function useNavScrollState({ sheenRef, navRef, dispRefs }: LiquidRefs) {
  const [tone, setTone] = useState<Tone>('dark');
  const [condensed, setCondensed] = useState(false);

  useEffect(() => {
    const PILL_MID = 40;
    const HYSTERESIS = 16;
    const DIR_TRAVEL = 28;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let ranges: Array<[number, number]> = [];
    let maxScroll = 1;
    let currentTone: Tone = 'dark';
    let currentCond = false;
    let prevY = window.scrollY;
    let accDown = 0;
    let accUp = 0;
    let vel = 0; // smoothed scroll velocity, px/frame
    let lastBoost = 0;
    let raf = 0;
    let idle: ReturnType<typeof setTimeout> | undefined;

    const measure = () => {
      const next: Array<[number, number]> = [];
      // Hero band — dark until the hero's in-flow footprint passes the pill.
      // When GSAP pins the hero its own rect collapses to one viewport; the
      // .pin-spacer wrapper carries the real scroll distance.
      const hero = document.querySelector<HTMLElement>('[data-hero]');
      if (hero) {
        const flow = hero.parentElement?.classList.contains('pin-spacer')
          ? hero.parentElement
          : hero;
        const r = flow.getBoundingClientRect();
        next.push([-Infinity, Math.max(r.top + window.scrollY + r.height - PILL_MID, 48)]);
      } else {
        next.push([-Infinity, 64]);
      }
      // Dark sections — tone flips while the pill's midline is inside one
      document
        .querySelectorAll<HTMLElement>('section.on-dark, footer.on-dark')
        .forEach((el) => {
          const r = el.getBoundingClientRect();
          const top = r.top + window.scrollY;
          next.push([top - PILL_MID, top + r.height - PILL_MID]);
        });
      ranges = next;
      maxScroll = Math.max(document.body.scrollHeight - window.innerHeight, 1);
    };

    const update = () => {
      raf = 0;
      const y = window.scrollY;

      // Tone — bands grow by the hysteresis while dark and shrink while
      // light, so jitter at a boundary can't flip the tone back and forth.
      const pad = currentTone === 'dark' ? HYSTERESIS : -HYSTERESIS;
      const nextTone: Tone = ranges.some(([a, b]) => y > a - pad && y < b + pad)
        ? 'dark'
        : 'light';
      if (nextTone !== currentTone) {
        currentTone = nextTone;
        setTone(nextTone);
      }

      // Condense — accumulate directional travel so micro-jitter is ignored
      const dy = y - prevY;
      prevY = y;
      if (dy > 0) {
        accDown += dy;
        accUp = 0;
      } else if (dy < 0) {
        accUp -= dy;
        accDown = 0;
      }
      let nextCond = currentCond;
      if (y < 200 || accUp > DIR_TRAVEL) nextCond = false;
      else if (accDown > DIR_TRAVEL) nextCond = true;
      if (nextCond !== currentCond) {
        currentCond = nextCond;
        setCondensed(nextCond);
      }

      if (!reduced) {
        // Sheen — the glint drifts across the capsule as the page scrolls
        if (sheenRef.current) {
          const x = ((y / maxScroll - 0.5) * 220).toFixed(1);
          sheenRef.current.style.transform = `translate3d(${x}px,0,0) rotate(14deg)`;
        }

        // Liquid dynamics — velocity squashes the capsule and deepens the
        // rim refraction; both relax as motion settles. dy is capped so
        // anchor teleports don't detonate the spring.
        vel += (Math.max(-120, Math.min(120, dy)) - vel) * 0.25;
        const speed = Math.abs(vel);
        const settling = speed <= 0.15;
        if (settling) vel = 0;
        if (navRef.current) {
          const squash = Math.min(speed * 0.0011, 0.045);
          navRef.current.style.transform =
            squash > 0.001
              ? `scaleX(${(1 - squash * 0.35).toFixed(4)}) scaleY(${(1 + squash).toFixed(4)})`
              : '';
        }
        const boost = Math.min(speed * 0.75, LIQUID_MAX_BOOST);
        // Skip sub-pixel churn, but always land the final rest value
        if (Math.abs(boost - lastBoost) > 0.75 || (settling && lastBoost !== 0)) {
          lastBoost = settling ? 0 : boost;
          dispRefs.current?.forEach((el, i) => {
            el?.setAttribute('scale', (LIQUID_SCALE - lastBoost + LIQUID_OFFSETS[i]).toFixed(1));
          });
        }
        // Keep the frame chain alive until the liquid comes to rest
        if (!settling) raf = requestAnimationFrame(update);
      }
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onScroll = () => {
      schedule();
      // Self-heal: bands measured during a transient layout (mid-pin setup,
      // HMR, teleport) get corrected once scrolling comes to rest —
      // measurement stays off the hot path.
      clearTimeout(idle);
      idle = setTimeout(() => {
        measure();
        schedule();
      }, 250);
    };
    const onLayout = () => {
      measure();
      schedule();
    };

    onLayout();
    update();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onLayout);
    // Body growth covers everything that shifts section offsets: images,
    // fonts, GSAP pin spacers, locale swaps.
    let ro: ResizeObserver | undefined;
    if ('ResizeObserver' in window) {
      ro = new ResizeObserver(onLayout);
      ro.observe(document.body);
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onLayout);
      ro?.disconnect();
      clearTimeout(idle);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [sheenRef]);

  return { tone, condensed };
}

export default function Navbar() {
  const t = useTranslations('nav');
  const tc = useTranslations('cta');
  const tf = useTranslations('footer');
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lens, setLens] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const filterRef = useRef<SVGFilterElement>(null);
  const feImageRef = useRef<SVGFEImageElement>(null);
  const dispRefs = useRef<Array<SVGFEDisplacementMapElement | null>>([]);
  const sheenRef = useRef<HTMLSpanElement>(null);
  const glowRef = useRef<HTMLSpanElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  // Whether *we* stopped Lenis — the hero premiere also stops it, and
  // start/stop is a plain toggle, so we must never restart what we didn't stop.
  const weStoppedLenis = useRef(false);

  const { tone: backdrop, condensed } = useNavScrollState({ sheenRef, navRef, dispRefs });

  // Specular glow that trails the pointer across the glass (fine pointers only)
  useEffect(() => {
    const nav = navRef.current;
    const dot = glowRef.current;
    if (!nav || !dot || !window.matchMedia('(pointer: fine)').matches) return;
    const move = (e: PointerEvent) => {
      const r = nav.getBoundingClientRect();
      dot.style.transform = `translate3d(${(e.clientX - r.left - 90).toFixed(1)}px, ${(
        e.clientY - r.top - 90
      ).toFixed(1)}px, 0)`;
    };
    nav.addEventListener('pointermove', move, { passive: true });
    return () => nav.removeEventListener('pointermove', move);
  }, []);

  // Smoky glass over dark content (hero, dark sections, the open sheet),
  // ivory frost over light content.
  const tone: Tone = open ? 'dark' : backdrop;
  const dark = tone === 'dark';

  // Language switch: tap goes straight to the OTHER language (only two exist).
  const otherLocale = locale === 'en' ? 'ta' : 'en';

  // Bake the droplet map to the pill's exact geometry; rebuild (debounced)
  // when the capsule resizes. Chromium-only — url() backdrop filters
  // silently fail elsewhere, so other engines keep the frost.
  useEffect(() => {
    const nav = navRef.current;
    const filter = filterRef.current;
    const feImage = feImageRef.current;
    if (!nav || !filter || !feImage) return;
    const chromium = 'chrome' in window || /Chrom(e|ium)|CriOS|Edg\//.test(navigator.userAgent);
    if (!chromium) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    const build = () => {
      const w = Math.round(nav.offsetWidth);
      const h = Math.round(nav.offsetHeight);
      if (!w || !h) return;
      filter.setAttribute('x', '0');
      filter.setAttribute('y', '0');
      filter.setAttribute('width', String(w));
      filter.setAttribute('height', String(h));
      feImage.setAttribute('width', String(w));
      feImage.setAttribute('height', String(h));
      feImage.setAttribute('href', buildGlassMap(w, h));
      setLens(true);
    };

    build();
    const ro = new ResizeObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(build, 160);
    });
    ro.observe(nav);
    return () => {
      ro.disconnect();
      clearTimeout(timer);
    };
  }, []);

  // Menu-open side effects: scroll lock (Lenis + native/keyboard), background
  // inert, focus into the dialog, Escape closes, breakpoint-cross closes.
  useEffect(() => {
    if (!open) return;

    const lenis = window.__lenis;
    if (lenis && !lenis.isStopped) {
      lenis.stop();
      weStoppedLenis.current = true;
    }
    document.documentElement.style.overflow = 'hidden';

    // The pill (z-200) stays interactive above the sheet — only the page
    // behind them leaves the tab order and the a11y tree.
    const page = [document.querySelector('main'), document.querySelector('footer')];
    page.forEach((el) => el?.setAttribute('inert', ''));
    sheetRef.current?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);

    // The hamburger and sheet are lg:hidden — release the lock if the
    // viewport crosses the breakpoint while open.
    const mq = window.matchMedia('(min-width: 64rem)');
    const onMq = (e: MediaQueryListEvent) => {
      if (e.matches) setOpen(false);
    };
    mq.addEventListener('change', onMq);

    return () => {
      window.removeEventListener('keydown', onKey);
      mq.removeEventListener('change', onMq);
      page.forEach((el) => el?.removeAttribute('inert'));
      document.documentElement.style.overflow = '';
      if (weStoppedLenis.current) {
        window.__lenis?.start();
        weStoppedLenis.current = false;
      }
      burgerRef.current?.focus({ preventScroll: true });
    };
  }, [open]);

  // SiteMotion's document-level click handler runs in the same dispatch as
  // this one and calls lenis.scrollTo, which silently no-ops while Lenis is
  // stopped — so restart it synchronously here, not in the [open] effect.
  const onMenuLink = () => {
    if (weStoppedLenis.current) {
      window.__lenis?.start();
      weStoppedLenis.current = false;
    }
    setOpen(false);
  };

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-[200] pt-2.5 sm:pt-3">
        <div className="container-x">
          <nav
            ref={navRef}
            data-tone={tone}
            data-condensed={condensed && !open ? 'true' : 'false'}
            aria-label="Primary"
            className={`nav-pill pointer-events-auto h-[50px] sm:h-[54px] lg:mx-auto lg:w-fit ${lens ? 'nav-lens' : ''}`}
          >
            {/* The droplet — a smooth gradient map turns the capsule into a
                lens: hard clean refraction at the curved rim, calm centre;
                R/G/B refract at slightly different depths (chromatic split),
                then screen-blend back into full colour. */}
            <svg aria-hidden className="absolute h-0 w-0">
              <filter
                id="nav-liquid"
                ref={filterRef}
                filterUnits="userSpaceOnUse"
                primitiveUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feImage ref={feImageRef} result="map" preserveAspectRatio="none" />
                {(['red', 'green', 'blue'] as const).map((ch, i) => (
                  <Fragment key={ch}>
                    <feDisplacementMap
                      ref={(el) => {
                        dispRefs.current[i] = el;
                      }}
                      in="SourceGraphic"
                      in2="map"
                      scale={LIQUID_SCALE + LIQUID_OFFSETS[i]}
                      xChannelSelector="R"
                      yChannelSelector="G"
                      result={`d-${ch}`}
                    />
                    <feColorMatrix
                      in={`d-${ch}`}
                      type="matrix"
                      values={
                        i === 0
                          ? '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0'
                          : i === 1
                            ? '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0'
                            : '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0'
                      }
                      result={`c-${ch}`}
                    />
                  </Fragment>
                ))}
                <feBlend in="c-red" in2="c-green" mode="screen" result="rg" />
                <feBlend in="rg" in2="c-blue" mode="screen" />
              </filter>
            </svg>

            {/* Glass tint layers — crossfaded via opacity only (see navbar.css) */}
            <span aria-hidden className="nav-glass nav-glass-dark" />
            <span aria-hidden className="nav-glass nav-glass-light" />
            {/* Scroll-reactive specular streak (GPU transform, written outside React) */}
            <span aria-hidden className="nav-sheen">
              <span ref={sheenRef} className="nav-sheen-streak" />
            </span>
            {/* Pointer-tracking glint */}
            <span aria-hidden className="nav-glow">
              <span ref={glowRef} className="nav-glow-dot" />
            </span>

            <div className="relative flex h-full items-center justify-between gap-4 pl-2 pr-2 sm:pl-2.5 sm:pr-2.5 lg:gap-12">
              {/* Logo — ivory chip over dark glass, bare mark on ivory frost */}
              <a href="#top" className="flex items-center" aria-label="Susee Homes — home">
                <span
                  className={`flex items-center rounded-full px-3 py-1.5 transition-[background-color,box-shadow] duration-500 ${
                    dark ? 'bg-ivory-50/95 shadow-[0_2px_14px_rgba(0,0,0,0.2)]' : 'bg-transparent'
                  }`}
                >
                  <Image
                    src="/images/logo-alpha.png"
                    alt="Susee Homes"
                    width={404}
                    height={118}
                    priority
                    className="h-[25px] w-auto sm:h-[27px]"
                  />
                </span>
              </a>

              {/* Desktop links */}
              <div className="hidden items-center gap-9 lg:flex">
                {NAV_ITEMS.map((item) => (
                  <a
                    key={item.key}
                    href={`#${item.anchor}`}
                    className={`group relative text-[0.86rem] font-medium tracking-wide transition-colors duration-300 ${
                      dark
                        ? 'text-ivory-50 hover:text-white'
                        : 'text-text-strong/90 hover:text-fern-700'
                    }`}
                  >
                    {t(item.key)}
                    <span
                      className={`absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 transition-transform duration-500 [transition-timing-function:var(--ease-expo)] group-hover:scale-x-100 ${
                        dark ? 'bg-brass-200' : 'bg-brass-500'
                      }`}
                    />
                  </a>
                ))}
              </div>

              {/* Right cluster */}
              <div className="flex items-center gap-2.5">
                {/* Language switch — one tap to the OTHER language, named in
                    its own script. The globe turns and the name underlines on
                    hover; on English pages the Tamil word loads Noto Tamil. */}
                <Link
                  href={pathname}
                  locale={otherLocale}
                  hrefLang={otherLocale}
                  aria-label={otherLocale === 'ta' ? 'Switch to Tamil' : 'Switch to English'}
                  className={`lang-flip group relative inline-flex items-center gap-[0.4rem] rounded-full border py-[0.4rem] pl-2 pr-2.5 text-[0.8rem] font-medium leading-none transition-colors duration-300 ${
                    dark
                      ? 'border-ivory-50/25 text-ivory-50/80 hover:border-ivory-50/55 hover:text-white'
                      : 'border-fern-600/30 text-fern-800/85 hover:border-fern-600/60 hover:text-fern-800'
                  }`}
                >
                  <GlobeIcon
                    size={15}
                    className="shrink-0 transition-transform duration-[650ms] [transition-timing-function:var(--ease-expo)] group-hover:rotate-[360deg]"
                  />
                  <span
                    lang={otherLocale}
                    style={{
                      fontFamily:
                        otherLocale === 'ta'
                          ? 'var(--font-noto-tamil), var(--font-dm-sans), sans-serif'
                          : 'var(--font-dm-sans), sans-serif',
                    }}
                    className="relative whitespace-nowrap"
                  >
                    {otherLocale === 'ta' ? 'தமிழ்' : 'English'}
                    <span
                      aria-hidden
                      className={`absolute -bottom-[3px] left-0 h-px w-full origin-left scale-x-0 transition-transform duration-500 [transition-timing-function:var(--ease-expo)] group-hover:scale-x-100 ${
                        dark ? 'bg-brass-200' : 'bg-brass-500'
                      }`}
                    />
                  </span>
                </Link>

                {/* Book visit CTA — desktop. Border on both tones so the box
                    never changes size mid-crossfade. */}
                <a
                  href={`#${ANCHORS.contact}`}
                  className={`hidden rounded-full border px-5 py-[0.45rem] text-[0.85rem] font-semibold transition-colors duration-300 sm:inline-flex ${
                    dark
                      ? 'border-ivory-50/35 bg-ivory-50/12 text-white hover:bg-ivory-50/25'
                      : 'border-transparent bg-fern-600 text-white hover:bg-fern-700'
                  }`}
                >
                  {t('bookVisit')}
                </a>

                {/* Hamburger */}
                <button
                  ref={burgerRef}
                  type="button"
                  aria-label={t('menuLabel')}
                  aria-expanded={open}
                  aria-controls="mobile-menu"
                  onClick={() => setOpen((o) => !o)}
                  className="relative flex h-10 w-10 flex-col items-center justify-center gap-[6px] lg:hidden"
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className={`block h-[1.5px] w-[22px] rounded transition-all duration-400 [transition-timing-function:var(--ease-expo)] ${
                        dark ? 'bg-ivory-50' : 'bg-ink-900'
                      } ${
                        open && i === 0 ? 'translate-y-[7.5px] rotate-45' : ''
                      } ${open && i === 1 ? 'scale-x-0 opacity-0' : ''} ${
                        open && i === 2 ? '-translate-y-[7.5px] -rotate-45' : ''
                      }`}
                    />
                  ))}
                </button>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* ── Full-screen mobile menu — the glass materializes (blur ramps in),
             it never pops (see .nav-menu-glass) ── */}
      <div
        ref={sheetRef}
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label={t('menuLabel')}
        aria-hidden={!open}
        tabIndex={-1}
        data-open={open}
        data-lenis-prevent
        className="nav-menu-glass fixed inset-0 z-[190] flex flex-col lg:hidden"
      >
        <div
          className={`blueprint-grid blueprint-grid-dark pointer-events-none absolute inset-0 transition-opacity duration-500 ${
            open ? 'opacity-100' : 'opacity-0'
          }`}
        />
        {/* Scrolls when the links don't fit (short/landscape viewports) */}
        <div className="relative flex-1 overflow-y-auto overscroll-contain">
          <div className="container-x flex min-h-full flex-col justify-center gap-1 pb-6 pt-[calc(var(--nav-h)+8px)]">
            {NAV_ITEMS.map((item, i) => (
              <a
                key={item.key}
                href={`#${item.anchor}`}
                onClick={onMenuLink}
                className={`nav-stagger group flex items-baseline gap-4 border-b border-ivory-50/8 py-4 transition-all duration-500 [transition-timing-function:var(--ease-expo)] ${
                  open ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                }`}
                style={{ '--stagger': open ? `${120 + i * 60}ms` : '0ms' } as React.CSSProperties}
              >
                <span className="font-mono text-[0.65rem] text-brass-300/70">0{i + 1}</span>
                <span className="font-display text-[clamp(1.7rem,6vw,2.6rem)] text-ivory-50 transition-colors group-hover:text-brass-200">
                  {t(item.key)}
                </span>
              </a>
            ))}

            <div
              className={`nav-stagger mt-8 flex flex-wrap gap-3 transition-all duration-500 ${
                open ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
              }`}
              style={{ '--stagger': open ? '480ms' : '0ms' } as React.CSSProperties}
            >
              <a
                href={waLink(SITE.phone, tc('waMessage'))}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp !py-3 text-sm"
              >
                <WhatsAppIcon size={16} />
                {tc('whatsapp')}
              </a>
              <a href={`tel:${SITE.phone}`} className="btn btn-ghost-light !py-3 text-sm">
                <PhoneIcon size={15} />
                {SITE.phoneDisplay}
              </a>
            </div>
          </div>
        </div>

        <div
          className={`nav-stagger container-x relative flex items-center justify-between pb-7 transition-opacity duration-500 ${
            open ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ '--stagger': open ? '520ms' : '0ms' } as React.CSSProperties}
        >
          <span className="micro-label text-ivory-50/45">{tf('coordinates')}</span>
          <span className="micro-label text-ivory-50/45">Poonamallee · Chennai</span>
        </div>
      </div>
    </>
  );
}
