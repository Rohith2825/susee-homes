'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { gsap } from 'gsap';
import { ANCHORS } from '@/lib/site';
import { CompassRose } from '@/components/ui/icons';

/**
 * THE PREMIERE — a one-take 4K film with live chapter narration.
 *
 * The client's 15s master (land → survey lines → streets → homes → dusk
 * arrival at the fountain plaza) plays natively at full 4K — bit-identical,
 * never re-encoded, never downscaled. Captions narrate four chapters in sync
 * with playback. While the film is on stage the page is pinned: scrolling
 * dissolves between chapters in both directions (film → max-quality still →
 * film; the seek happens invisibly under full cover). The film ends on its
 * true final frame and holds it, rock-steady — the identical max-quality
 * still locks on top, so the ending never drifts or re-renders. A final
 * scroll releases the page; scrolling back up to the top re-enters the film
 * at the previous phase with the same dissolve. Locale switches resume the
 * film exactly where it left off.
 */

/** The full-quality 4K master is served from Cloudflare R2 (zero-egress CDN),
 *  not from the repo — it's far too large for git and static hosting. Swap
 *  this base for a custom domain (e.g. https://media.suseehomes.com) later and
 *  both URLs update at once. */
const MEDIA_CDN = 'https://pub-3c0b0885a612406288a53205b2de790a.r2.dev';
const VIDEO_SRC = `${MEDIA_CDN}/hero_final.mp4`;
/** Flowing ending — seam-aligned micro-crossfade loop from the film's locked
 *  tail: every blended pair is a measured near-match, luma-normalized per
 *  frame, so every transition (incl. the wrap) sits at or below the water's
 *  own frame-to-frame motion. 7 cycles per file so the element restart is
 *  rare. Auto-detected: if the file is missing the ending holds the static
 *  final frame instead. */
const LOOP_SRC = `${MEDIA_CDN}/fountain-loop-3.mp4`;
const FALLBACK_DURATION = 15.0417;
/** Chapter start times (s): land · layout · build · arrival. */
const CHAPTER_T = [0, 2.6, 6.3, 9.2];
/** Max-quality 4K stills, extracted straight from the film. */
const CH_STILL = ['/hero-frames/hq/ch-0.jpg', '/hero-frames/hq/ch-1.jpg', '/hero-frames/hq/ch-2.jpg', '/hero-frames/hq/ch-3.jpg'];
const PV_STILL = ['/hero-frames/hq/pv-0.jpg', '/hero-frames/hq/pv-1.jpg', '/hero-frames/hq/pv-2.jpg', '/hero-frames/hq/pv-3.jpg'];
const FINAL_STILL = '/hero-frames/hq/final.jpg';
/** One gesture = one chapter (paced to the dissolve). */
const COOLDOWN = 950;
const DISSOLVE_IN = 450;
const DISSOLVE_OUT = 700;
const SEEN_KEY = 'susee-premiere';
const CHECKPOINT_KEY = 'susee-premiere-t';

interface Stage {
  headline: string;
  sub: string;
}
interface Chapter {
  index: string;
  label: string;
}

function formatTC(s: number): string {
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60);
  return `${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

/** Flips true once this module has completed one Hero mount's session-entry
 *  effect. A locale switch remounts Hero client-side (same JS execution —
 *  this stays true), so the resumed chapter can be computed as the FIRST
 *  render's initial state, with no "phase 1, then jump" flash. A real page
 *  reload re-evaluates the module (this resets to false), which keeps the
 *  initial render matching the server-rendered HTML — no hydration mismatch. */
let heroBooted = false;
/** Consumed once per document. On a real refresh the module re-evaluates and
 *  this resets, so the premiere replays from the top; it persists across a
 *  client-side locale switch, which keeps the resume-from-checkpoint path. */
let heroDocConsumed = false;

function computeInitialChapter(): number {
  if (!heroBooted || typeof window === 'undefined') return 0;
  try {
    if (sessionStorage.getItem(SEEN_KEY) === '1') return 3;
    const resumeT = parseFloat(sessionStorage.getItem(CHECKPOINT_KEY) ?? '');
    if (Number.isFinite(resumeT) && resumeT > 0.2) {
      let c = 0;
      for (let i = 0; i < CHAPTER_T.length; i++) if (resumeT >= CHAPTER_T[i] - 0.02) c = i;
      return c;
    }
  } catch {
    /* sessionStorage unavailable */
  }
  return 0;
}

function computeInitialArrived(): boolean {
  if (!heroBooted || typeof window === 'undefined') return false;
  try {
    return sessionStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

export default function Hero() {
  const t = useTranslations('hero');
  const stages = t.raw('stages') as Stage[];
  const chapters = t.raw('chapters') as Chapter[];

  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const endRef = useRef<HTMLImageElement>(null);
  const loopRef = useRef<HTMLVideoElement>(null);
  const loopOkRef = useRef(false);
  const coverRef = useRef<HTMLImageElement>(null);
  const posterRef = useRef<HTMLImageElement>(null);
  const stageBoxRef = useRef<HTMLDivElement>(null);
  const nudgeRef = useRef<HTMLDivElement>(null);
  const tcRef = useRef<HTMLSpanElement>(null);
  const railFillRefs = useRef<Array<HTMLDivElement | null>>([]);

  const [activeIdx, setActiveIdx] = useState(computeInitialChapter);
  const [introReady, setIntroReady] = useState(false);
  const [arrived, setArrived] = useState(computeInitialArrived);
  const activeIdxRef = useRef(activeIdx);
  const releasedRef = useRef(false);

  // Mark this module as booted once — only after mount, so the FIRST
  // render (SSR or fresh hydration) always still matches computeInitial*'s
  // pre-boot default. Only a later remount (locale switch) sees `true`.
  useEffect(() => {
    heroBooted = true;
  }, []);

  // On a fresh document load / refresh, wipe the premiere's saved state so the
  // film restarts from chapter 0. A client-side locale switch skips this (flag
  // persists) and keeps its resume-from-checkpoint behaviour. Runs before the
  // premiere effect below, which only fires once introReady flips after the
  // curtain — so the cleared state is what it reads.
  useEffect(() => {
    if (heroDocConsumed) return;
    heroDocConsumed = true;
    try {
      sessionStorage.removeItem(SEEN_KEY);
      sessionStorage.removeItem(CHECKPOINT_KEY);
    } catch {
      /* sessionStorage unavailable */
    }
  }, []);

  // ── Wait for the preloader curtain before the opening reveal ──
  useEffect(() => {
    if (window.__suseeIntroDone) {
      setIntroReady(true);
      return;
    }
    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      setIntroReady(true);
    };
    window.addEventListener('susee:preloader-done', go);
    const fallback = setTimeout(go, 3000);
    return () => {
      window.removeEventListener('susee:preloader-done', go);
      clearTimeout(fallback);
    };
  }, []);

  // ── Warm the chapter stills (seek covers + rail previews) ──
  useEffect(() => {
    const idle = (cb: () => void) =>
      'requestIdleCallback' in window ? (window as Window & typeof globalThis).requestIdleCallback(cb) : setTimeout(cb, 800);
    idle(() =>
      [...CH_STILL, ...PV_STILL, FINAL_STILL].forEach((src) => {
        const img = new Image();
        img.src = src;
      })
    );
  }, []);

  // ── The premiere machine ──
  useEffect(() => {
    if (!introReady) return;
    const section = sectionRef.current;
    const video = videoRef.current;
    const endStill = endRef.current;
    if (!section || !video || !endStill) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const saveData = (navigator as { connection?: { saveData?: boolean } }).connection?.saveData === true;
    const seen = sessionStorage.getItem(SEEN_KEY) === '1';
    const lenis = window.__lenis;

    // Reduced motion / data-saver: rest on the final still, free scroll, no film
    if (reduced || saveData) {
      releasedRef.current = true;
      setArrived(true);
      activeIdxRef.current = 3;
      setActiveIdx(3);
      if (posterRef.current) posterRef.current.src = FINAL_STILL;
      return;
    }

    let chapter = 0;
    let cooldownUntil = 0;
    let seeking = false;
    let completed = false;
    let released = false;

    const dur = () => (video.duration && !Number.isNaN(video.duration) ? video.duration : FALLBACK_DURATION);

    const setChapter = (i: number) => {
      chapter = i;
      if (activeIdxRef.current !== i) {
        activeIdxRef.current = i;
        setActiveIdx(i);
      }
    };

    const setReleased = (v: boolean) => {
      released = v;
      releasedRef.current = v;
    };

    /** The ending. With the generated loop available: the fountain flows on a
     *  locked camera, forever. Otherwise: the film holds its true final frame,
     *  the identical max-quality still locked on top — rock steady. */
    const loop = loopRef.current;
    const showEnding = (instant = false) => {
      completed = true;
      setArrived(true);
      sessionStorage.setItem(SEEN_KEY, '1');
      sessionStorage.removeItem(CHECKPOINT_KEY);
      video.pause();
      const ease = instant ? 'none' : 'opacity 500ms cubic-bezier(0.4,0,0.2,1)';
      if (loopOkRef.current && loop) {
        loop.currentTime = 0;
        loop.play().catch(() => {});
        loop.style.transition = ease;
        loop.style.opacity = '1';
        endStill.style.opacity = '0';
      } else {
        endStill.style.transition = ease;
        endStill.style.opacity = '1';
      }
      if (tcRef.current) tcRef.current.textContent = `T+${formatTC(dur())} · ${formatTC(dur())}`;
    };

    const hideEnding = () => {
      completed = false;
      endStill.style.transition = `opacity ${DISSOLVE_IN}ms cubic-bezier(0.4,0,0.2,1)`;
      endStill.style.opacity = '0';
      if (loop) {
        loop.style.transition = `opacity ${DISSOLVE_IN}ms cubic-bezier(0.4,0,0.2,1)`;
        loop.style.opacity = '0';
        window.setTimeout(() => loop.pause(), DISSOLVE_IN + 50);
      }
    };

    // If the flowing-loop asset exists, upgrade the ending live (even if we
    // are already resting on the static frame when it finishes loading).
    if (loop) {
      const onLoopReady = () => {
        loopOkRef.current = true;
        if (completed) showEnding(true);
      };
      if (loop.readyState >= 2) onLoopReady();
      else loop.addEventListener('loadeddata', onLoopReady, { once: true });
    }

    // ── Session entry state ──
    if (seen) {
      // Already premiered (revisit / language switch after finishing):
      // rest on the flowing ending, page free — but the film stays one
      // scroll-up away.
      setReleased(true);
      setChapter(3);
      if (posterRef.current) posterRef.current.src = FINAL_STILL;
      showEnding(true);
    } else {
      // Mid-film checkpoint from a locale switch — resume, don't restart
      const resumeT = parseFloat(sessionStorage.getItem(CHECKPOINT_KEY) ?? '');
      const resuming = Number.isFinite(resumeT) && resumeT > 0.2;
      if (resuming) {
        let c = 0;
        for (let i = 0; i < CHAPTER_T.length; i++) if (resumeT >= CHAPTER_T[i] - 0.02) c = i;
        setChapter(c);
        if (posterRef.current) posterRef.current.src = CH_STILL[c];
      }
      lenis?.stop();
      window.scrollTo(0, 0);
      const startFilm = () => {
        if (resuming) {
          try {
            video.currentTime = resumeT;
          } catch {
            /* not seekable yet */
          }
        }
        video.play().catch(() => {});
      };
      if (video.readyState >= 2) setTimeout(startFilm, resuming ? 0 : 350);
      else {
        const once = () => {
          video.removeEventListener('canplay', once);
          startFilm();
        };
        video.addEventListener('canplay', once);
      }
    }

    // ── Live narration + ending handoff + rail fills (rAF) ──
    let raf = 0;
    const tick = () => {
      const d = dur();
      const now = video.currentTime;

      if (!seeking && !completed) {
        let c = 0;
        for (let i = 0; i < CHAPTER_T.length; i++) if (now >= CHAPTER_T[i] - 0.02) c = i;
        if (c !== chapter) setChapter(c);
      }

      // the film reaches its true final frame — hold it, rock-steady
      if (!completed && !seeking && (video.ended || now >= d - 0.05)) {
        showEnding();
      }

      // rail fills
      const ends = [...CHAPTER_T.slice(1), d];
      railFillRefs.current.forEach((el, i) => {
        if (!el) return;
        const f = completed
          ? i <= 3
            ? 1
            : 0
          : Math.max(0, Math.min(1, (now - CHAPTER_T[i]) / (ends[i] - CHAPTER_T[i])));
        el.style.transform = `scaleY(${f})`;
      });

      // survey timecode
      if (!completed && tcRef.current) tcRef.current.textContent = `T+${formatTC(now)} · ${formatTC(d)}`;

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // ── Chapter transitions: a true film dissolve, both directions ──
    let dissolveTimer = 0;
    const seekChapter = (i: number) => {
      const cover = coverRef.current;
      setChapter(i);
      seeking = true;
      if (completed) hideEnding();
      if (cover) {
        cover.src = CH_STILL[i];
        cover.style.transition = `opacity ${DISSOLVE_IN}ms cubic-bezier(0.4,0,0.2,1)`;
        cover.style.opacity = '1';
      }
      window.clearTimeout(dissolveTimer);
      dissolveTimer = window.setTimeout(() => {
        const onSeeked = () => {
          video.removeEventListener('seeked', onSeeked);
          video.play().catch(() => {});
          seeking = false;
          if (cover) {
            requestAnimationFrame(() => {
              cover.style.transition = `opacity ${DISSOLVE_OUT}ms cubic-bezier(0.4,0,0.2,1)`;
              cover.style.opacity = '0';
            });
          }
        };
        video.addEventListener('seeked', onSeeked);
        try {
          video.currentTime = CHAPTER_T[i] + 0.01;
        } catch {
          video.removeEventListener('seeked', onSeeked);
          seeking = false;
        }
      }, DISSOLVE_IN + 30);
    };

    // ── Release into the site ──
    const release = (scrollPast = true) => {
      if (released) return;
      setReleased(true);
      sessionStorage.setItem(SEEN_KEY, '1');
      sessionStorage.removeItem(CHECKPOINT_KEY);
      lenis?.start();
      if (scrollPast) {
        const y = section.offsetTop + section.offsetHeight;
        if (lenis) lenis.scrollTo(y, { duration: 1.25, easing: (x: number) => 1 - Math.pow(1 - x, 3) });
        else window.scrollTo({ top: y, behavior: 'smooth' });
      }
    };

    /** Scroll-up at the very top re-enters the film at the previous phase. */
    const reengage = () => {
      setReleased(false);
      lenis?.stop();
      if (completed) {
        // from the resting ending, the previous phase is the arrival itself
        seekChapter(3);
      } else {
        seekChapter(Math.max(0, chapter - 1));
      }
    };

    const advance = (dirn: 1 | -1) => {
      const nowMs = performance.now();
      if (nowMs < cooldownUntil) return;
      // From the resting ending, the previous phase is the arrival itself
      if (completed && dirn === -1) {
        cooldownUntil = nowMs + COOLDOWN;
        seekChapter(3);
        return;
      }
      const next = chapter + dirn;
      if (next < 0) return;
      cooldownUntil = nowMs + COOLDOWN;
      if (next > CHAPTER_T.length - 1) {
        release();
        return;
      }
      seekChapter(next);
    };

    const atTop = () => window.scrollY <= 4;

    // ── Input grammar ──
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 6) return;
      if (!released) {
        e.preventDefault();
        advance(e.deltaY > 0 ? 1 : -1);
        return;
      }
      // released: page scrolls freely — but scrolling up at the top re-enters
      if (e.deltaY < 0 && atTop()) {
        e.preventDefault();
        const nowMs = performance.now();
        if (nowMs < cooldownUntil) return;
        cooldownUntil = nowMs + COOLDOWN;
        reengage();
      }
    };
    let touchY: number | null = null;
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? null;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!released) e.preventDefault();
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (touchY == null) return;
      const dy = touchY - (e.changedTouches[0]?.clientY ?? touchY);
      touchY = null;
      if (Math.abs(dy) < 36) return;
      if (!released) {
        advance(dy > 0 ? 1 : -1);
      } else if (dy < 0 && atTop()) {
        const nowMs = performance.now();
        if (nowMs < cooldownUntil) return;
        cooldownUntil = nowMs + COOLDOWN;
        reengage();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (released) return;
      if (['ArrowDown', 'PageDown', ' '].includes(e.key)) {
        e.preventDefault();
        advance(1);
      } else if (['ArrowUp', 'PageUp'].includes(e.key)) {
        e.preventDefault();
        advance(-1);
      }
    };
    const onGoto = (e: Event) => {
      const c = (e as CustomEvent<number>).detail;
      if (typeof c !== 'number') return;
      if (released) {
        if (!atTop()) return;
        setReleased(false);
        lenis?.stop();
      }
      cooldownUntil = performance.now() + COOLDOWN;
      seekChapter(Math.max(0, Math.min(CHAPTER_T.length - 1, c)));
    };
    const onVisibility = () => {
      if (!document.hidden && !released && !completed && video.paused && !seeking) video.play().catch(() => {});
    };
    // Navbar anchor clicks must escape the pin
    const onDocClick = (e: MouseEvent) => {
      if (released) return;
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href*="#"]');
      if (!a || !a.hash || a.hash === '#top') return;
      const targetEl = document.querySelector(a.hash);
      if (targetEl && sectionRef.current && !sectionRef.current.contains(targetEl)) {
        release(false);
      }
    };

    const opts: AddEventListenerOptions = { passive: false };
    window.addEventListener('wheel', onWheel, opts);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, opts);
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('keydown', onKey, opts);
    window.addEventListener('susee:hero-goto', onGoto);
    document.addEventListener('visibilitychange', onVisibility);
    document.addEventListener('click', onDocClick, true);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(dissolveTimer);
      // Locale switch mid-film: checkpoint the playhead so the next mount resumes
      if (!released && !completed && video.currentTime > 0.2) {
        sessionStorage.setItem(CHECKPOINT_KEY, String(video.currentTime));
      }
      window.removeEventListener('wheel', onWheel, opts);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove, opts);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKey, opts);
      window.removeEventListener('susee:hero-goto', onGoto);
      document.removeEventListener('visibilitychange', onVisibility);
      document.removeEventListener('click', onDocClick, true);
      lenis?.start();
    };
  }, [introReady]);

  // ── Opening reveal ──
  useEffect(() => {
    if (!introReady) return;
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      gsap.to(section.querySelectorAll('[data-hero-fade]'), {
        opacity: 1,
        duration: 1.1,
        ease: 'power2.out',
        stagger: 0.08,
        delay: 0.15,
      });
    }, section);
    return () => ctx.revert();
  }, [introReady]);

  // ── Caption line reveal on chapter change ──
  useEffect(() => {
    if (!introReady) return;
    const box = stageBoxRef.current;
    if (!box) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        box.querySelectorAll('.line-inner'),
        { yPercent: 115 },
        { yPercent: 0, duration: 0.9, ease: 'power4.out', stagger: 0.08 }
      );
      gsap.fromTo(
        box.querySelector('.stage-sub'),
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', delay: 0.22 }
      );
    }, box);
    return () => ctx.revert();
  }, [activeIdx, introReady]);

  const jumpToChapter = useCallback((c: number) => {
    window.dispatchEvent(new CustomEvent('susee:hero-goto', { detail: c }));
  }, []);

  const stage = stages[activeIdx] ?? stages[0];

  return (
    <section ref={sectionRef} data-hero="" className="relative h-screen bg-ink-950" aria-label={t('tagline')}>
      {/* Hide the native scrollbar site-wide — Lenis owns the scroll feel */}
      <style>{`html{scrollbar-width:none;-ms-overflow-style:none}html::-webkit-scrollbar{display:none;width:0;height:0}`}</style>
      <div className="grain sticky top-0 h-screen overflow-hidden supports-[height:100dvh]:h-dvh">
        {/* Opening still paints instantly (max-quality 4K frame from the film) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={posterRef}
          src={arrived ? FINAL_STILL : (CH_STILL[activeIdx] ?? CH_STILL[0])}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />

        {/* The film — native 4K playback, exactly as delivered */}
        <video
          ref={videoRef}
          src={VIDEO_SRC}
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />

        {/* The ending — the film's true final frame, locked and motionless */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={endRef}
          src={FINAL_STILL}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-0"
        />

        {/* Flowing ending (auto-detected): seamless natural-seam loop cut
            from the film's locked fountain tail. preload="metadata" (not
            "auto") so this ~48MB file doesn't eagerly buffer on page load and
            fight the main film for bandwidth — it upgrades in once loadeddata
            fires or when showEnding calls loop.play(); until then the ending
            rests on the identical static frame. Pure load-timing win, the
            ending looks the same. */}
        <video
          ref={loopRef}
          src={LOOP_SRC}
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-0"
        />

        {/* Seek cover — the matching max-quality still hides every chapter jump */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={coverRef}
          src={CH_STILL[0]}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-0"
        />

        {/* Cinematic grade — the film's golden light still leads, but the
            grade is deepened for legibility: a stronger wash down the caption
            side, firmer top/bottom bands behind the coordinate labels, chapter
            rail and timecode, and a light flat scrim over the whole frame so
            nothing is lost over bright sky. Tuned to stay cinematic, not muddy. */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              'linear-gradient(100deg, rgba(6,10,8,0.60) 0%, rgba(6,10,8,0.30) 40%, rgba(6,10,8,0.08) 66%, transparent 100%), linear-gradient(to top, rgba(6,10,8,0.52) 0%, transparent 26%), linear-gradient(to bottom, rgba(6,10,8,0.44) 0%, transparent 17%), linear-gradient(rgba(6,10,8,0.18), rgba(6,10,8,0.18))',
          }}
        />

        {/* ── Survey micro-labels (top) ── */}
        <div
          data-hero-fade=""
          className="pointer-events-none absolute inset-x-0 top-[calc(var(--nav-h)+18px)] hidden justify-between px-[clamp(1.5rem,5vw,4.5rem)] md:flex"
        >
          <span className="micro-label text-ivory-50/85 [text-shadow:0_1px_10px_rgba(6,10,8,0.85)]">{t('coordinates')}</span>
          <span className="micro-label text-ivory-50/85 [text-shadow:0_1px_10px_rgba(6,10,8,0.85)]">{t('location')}</span>
        </div>

        {/* ── Caption ── */}
        <div className="absolute inset-0 flex items-end pb-[15dvh] md:items-center md:pb-0">
          <div className="w-full px-[clamp(1.5rem,6vw,5rem)]">
            <div className="max-w-2xl">
              <p data-hero-fade="" className="eyebrow mb-6 text-brass-200">
                {t('tagline')}
              </p>

              <div ref={stageBoxRef}>
                <h1 className="font-display text-hero text-ivory-50 [text-shadow:0_2px_40px_rgba(6,10,8,0.5)]">
                  {stage.headline.split('\n').map((line, i) => (
                    <span key={`${activeIdx}-${i}`} className="line block overflow-hidden pb-[0.14em] -mb-[0.14em]">
                      <span className="line-inner block will-change-transform">{line}</span>
                    </span>
                  ))}
                </h1>
                <p className="stage-sub mt-5 max-w-md text-[clamp(0.88rem,1.2vw,1rem)] leading-relaxed text-ivory-50/78">
                  {stage.sub}
                </p>
              </div>

              {/* Arrival CTAs */}
              <div
                className={`mt-8 flex flex-wrap gap-3 transition-all duration-700 [transition-timing-function:var(--ease-expo)] ${
                  activeIdx === 3 ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
                }`}
              >
                <a href={`#${ANCHORS.contact}`} className="btn btn-brass">
                  {t('cta')}
                </a>
                <a href={`#${ANCHORS.project}`} className="btn btn-ghost-light">
                  {t('ctaSecondary')}
                </a>
              </div>

              {/* Mobile chapter pills */}
              <div data-hero-fade="" className="mt-8 flex items-center gap-1.5 md:hidden" aria-hidden="true">
                {chapters.map((_, i) => (
                  <div
                    key={i}
                    className={`h-[3px] rounded-full transition-all duration-500 [transition-timing-function:var(--ease-expo)] ${
                      i === activeIdx ? 'flex-[2.6] bg-brass-200' : 'flex-1 bg-ivory-50/25'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Chapter rail (desktop) — live playback fill + still previews ── */}
        <div
          data-hero-fade=""
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-[340px] bg-gradient-to-l from-ink-950/78 via-ink-950/38 to-transparent md:block"
          aria-hidden="true"
        />
        <div
          data-hero-fade=""
          className="absolute right-[clamp(1.5rem,4vw,4rem)] top-1/2 hidden -translate-y-1/2 flex-col gap-7 [text-shadow:0_1px_12px_rgba(6,10,8,0.9)] md:flex"
        >
          {chapters.map((ch, i) => (
            <button
              key={ch.index}
              type="button"
              onClick={() => jumpToChapter(i)}
              className="group relative flex items-center gap-3 text-right"
              aria-label={`${ch.index} — ${ch.label}`}
            >
              {/* hover preview — the chapter's max-quality still */}
              <span
                className="pointer-events-none absolute right-full top-1/2 mr-5 hidden w-[190px] -translate-y-1/2 overflow-hidden rounded-sm border border-ivory-50/20 opacity-0 shadow-[0_18px_50px_rgba(6,10,8,0.6)] transition-all duration-300 [transition-timing-function:var(--ease-expo)] group-hover:opacity-100 group-hover:-translate-x-1 lg:block"
                aria-hidden="true"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={PV_STILL[i]} alt="" className="block aspect-video w-full object-cover" loading="lazy" />
                <span className="absolute bottom-1.5 left-2 font-mono text-[0.55rem] uppercase tracking-[0.14em] text-ivory-50/85">
                  {ch.index} — {ch.label}
                </span>
              </span>

              <span
                className={`micro-label whitespace-nowrap transition-colors duration-400 ${
                  i === activeIdx ? 'text-brass-200' : 'text-ivory-50/85 group-hover:text-ivory-50'
                }`}
              >
                <span className="mr-2 opacity-80">{ch.index}</span>
                {ch.label}
              </span>
              <span className="relative h-10 w-px overflow-hidden bg-ivory-50/30 shadow-[0_0_10px_rgba(6,10,8,0.5)]">
                <div
                  ref={(el) => {
                    railFillRefs.current[i] = el;
                  }}
                  className="absolute inset-0 origin-top scale-y-0 bg-brass-200"
                />
              </span>
            </button>
          ))}
        </div>

        {/* ── Bottom furniture ── */}
        <div
          data-hero-fade=""
          className="pointer-events-none absolute bottom-7 left-[clamp(1.5rem,6vw,5rem)] hidden items-baseline gap-5 [text-shadow:0_1px_10px_rgba(6,10,8,0.8)] md:flex"
        >
          <span className="font-mono text-[0.72rem] tracking-[0.2em] text-ivory-50/78 tabular-nums">
            {chapters[activeIdx]?.index ?? '01'} / 04
          </span>
          <span ref={tcRef} className="font-mono text-[0.62rem] tracking-[0.16em] text-ivory-50/60 tabular-nums">
            T+00:00 · 00:15
          </span>
        </div>

        <div
          ref={nudgeRef}
          data-hero-fade=""
          className={`pointer-events-none absolute bottom-7 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-ivory-50/60 transition-opacity duration-700 ${
            activeIdx > 0 && !arrived ? 'opacity-0' : ''
          }`}
        >
          <span className="micro-label">{t('scroll')}</span>
          <span className="animate-[nudge-fade_2.4s_ease-in-out_infinite]">
            <svg width="12" height="18" viewBox="0 0 14 20" fill="none" aria-hidden="true">
              <path d="M7 1v12M4 10l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>

        <div
          data-hero-fade=""
          className="pointer-events-none absolute bottom-6 right-[clamp(1.5rem,4vw,4rem)] hidden text-ivory-50/70 drop-shadow-[0_1px_10px_rgba(6,10,8,0.6)] md:block"
        >
          <CompassRose size={46} />
        </div>
      </div>
    </section>
  );
}
