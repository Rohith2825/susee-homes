'use client';

import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/**
 * Global motion orchestrator:
 * — Lenis smooth scrolling, synced to the GSAP ticker
 * — scroll-reveal system for [data-reveal] / [data-lines] / [data-stagger]
 * — smooth anchor navigation for all in-page links
 */
export default function SiteMotion() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Client-side locale navigation replaces <html> className — restore the
    // JS marker so reveal initial states keep applying after a remount.
    document.documentElement.classList.add('js');

    // ── Lenis ────────────────────────────────────────────────
    let lenis: Lenis | undefined;
    let tickerCb: ((time: number) => void) | undefined;
    let scrollIdle: ReturnType<typeof setTimeout> | undefined;
    if (!reduced) {
      lenis = new Lenis({
        autoRaf: false,
        lerp: 0.115,
        wheelMultiplier: 1,
      });
      window.__lenis = lenis;
      // Flag active scroll so paint-only idle animations (the film grain
      // drift) can pause while the page moves — imperceptible in motion,
      // but it keeps their re-raster hitches off scroll frames. The class
      // mutates only on the first scroll and ~160ms after motion settles.
      const root = document.documentElement;
      const onLenisScroll = () => {
        ScrollTrigger.update();
        root.classList.add('is-scrolling');
        clearTimeout(scrollIdle);
        scrollIdle = setTimeout(() => root.classList.remove('is-scrolling'), 160);
      };
      lenis.on('scroll', onLenisScroll);
      tickerCb = (time: number) => lenis!.raf(time * 1000);
      gsap.ticker.add(tickerCb);
      gsap.ticker.lagSmoothing(0);
    }

    // ── Anchor navigation ────────────────────────────────────
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href*="#"]');
      if (!a) return;
      const hash = a.hash;
      if (!hash || hash === '#') return;
      const target = document.querySelector(hash);
      if (!target) return;
      e.preventDefault();
      if (lenis) {
        lenis.scrollTo(target as HTMLElement, {
          offset: hash === '#top' ? 0 : -20,
          duration: 1.6,
          easing: (t: number) => 1 - Math.pow(1 - t, 4),
        });
      } else {
        (target as HTMLElement).scrollIntoView({ behavior: 'auto' });
      }
    };
    document.addEventListener('click', onClick);

    // ── Reveal system ────────────────────────────────────────
    const ctx = gsap.context(() => {
      if (reduced) return;

      document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
        const dir = el.dataset.reveal;
        const xFrom = dir === 'left' ? -56 : dir === 'right' ? 56 : 0;
        const yFrom = dir === 'left' || dir === 'right' ? 0 : 44;
        const scale = dir === 'scale' ? 0.92 : 1;

        gsap.fromTo(
          el,
          { autoAlpha: 0, x: xFrom, y: yFrom, scale },
          {
            autoAlpha: 1,
            x: 0,
            y: 0,
            scale: 1,
            duration: 1.05,
            ease: 'power3.out',
            delay: parseFloat(el.dataset.delay ?? '0'),
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          }
        );
      });

      document.querySelectorAll<HTMLElement>('[data-lines]').forEach((el) => {
        // Skip hero — it choreographs its own lines
        if (el.closest('[data-hero]')) return;
        gsap.to(el.querySelectorAll('.line-inner'), {
          y: 0,
          duration: 1.15,
          ease: 'power4.out',
          stagger: 0.09,
          scrollTrigger: { trigger: el, start: 'top 87%', once: true },
        });
      });

      document.querySelectorAll<HTMLElement>('[data-stagger]').forEach((parent) => {
        gsap.fromTo(
          parent.children,
          { autoAlpha: 0, y: 40 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.85,
            ease: 'power3.out',
            stagger: 0.09,
            scrollTrigger: { trigger: parent, start: 'top 86%', once: true },
          }
        );
      });
    });

    // Recalculate trigger positions once fonts/media settle
    const refresh = () => ScrollTrigger.refresh();
    if (document.fonts?.ready) document.fonts.ready.then(refresh);
    window.addEventListener('load', refresh);

    return () => {
      document.removeEventListener('click', onClick);
      window.removeEventListener('load', refresh);
      ctx.revert();
      if (tickerCb) gsap.ticker.remove(tickerCb);
      gsap.ticker.lagSmoothing(500, 33); // restore GSAP default
      clearTimeout(scrollIdle);
      document.documentElement.classList.remove('is-scrolling');
      lenis?.destroy();
      window.__lenis = undefined;
    };
  }, []);

  return null;
}
