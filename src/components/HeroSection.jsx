import { useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// ── Stage captions ────────────────────────────────────────────
const FIXED_TAGLINE = 'Built on trust. Designed for life.';

const STAGES = [
  {
    range: [0, 0.20],
    headline: 'Every Susee home\nbegins with the land.',
    sub: '6.72 acres of DTCP-approved, RERA-certified land in Poonamallee, Chennai.',
  },
  {
    range: [0.20, 0.45],
    headline: 'We develop it —\nroads, plots, open spaces.',
    sub: '181 individual plots · Full infrastructure · 40% open green space.',
  },
  {
    range: [0.45, 0.78],
    headline: 'Then we raise your home,\nbrick by brick.',
    sub: 'Our in-house construction arm handles design, build, and handover — one team, zero compromise.',
  },
  {
    range: [0.78, 1.0],
    headline: 'ALIGHT —\nyour next chapter\nin Poonamallee.',
    sub: '2 min from Kuthambakkam · Metro-ready corridor · Book your site visit today.',
  },
];

const STAGES_TA = [
  {
    headline: 'ஒவ்வொரு சுஸீ வீடும்\nநிலத்திலிருந்து தொடங்குகிறது.',
    sub: 'பூனமல்லியில் 6.72 ஏக்கர் DTCP அங்கீகாரம் பெற்ற நிலம்.',
  },
  {
    headline: 'சாலைகள், மனைகள்,\nபசுமையான வெளிகளை நாம் உருவாக்குகிறோம்.',
    sub: '181 மனைகள் · முழு உள்கட்டமைப்பு · 40% திறந்த வெளி.',
  },
  {
    headline: 'செங்கல் செங்கலாக\nவீட்டை கட்டுகிறோம்.',
    sub: 'வடிவமைப்பு முதல் வழங்கல் வரை ஒரே குழு.',
  },
  {
    headline: 'ALIGHT —\nபூனமல்லியில் உங்கள்\nபுதிய அத்தியாயம்.',
    sub: 'குதாம்பாக்கம் 2 நிமிடம் · மெட்ரோ தயார் · தள வருகை பதிவு செய்யுங்கள்.',
  },
];

// ── Scroll progress 0→1 over the full pinned section ─────────
function useScrollProgress(sectionRef) {
  const progress = useRef(0);
  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => { progress.current = self.progress; },
      onLeaveBack: () => { progress.current = 0; },
    });
    return () => st.kill();
  }, []);
  return progress;
}

// ── Scroll-scrubbed video ─────────────────────────────────────
// Seeks video.currentTime = progress × duration on every rAF tick.
// Works on both desktop (mouse scroll) and mobile (touch scroll).
function VideoScrub({ progress }) {
  const videoRef = useRef();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.load(); // ensure mobile browsers start buffering immediately
    let raf;
    const tick = () => {
      if (video.readyState >= 2 && video.duration > 0) {
        video.currentTime = progress.current * video.duration;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [progress]);

  return (
    <video
      ref={videoRef}
      src="/images/building.mp4"
      muted
      playsInline
      preload="auto"
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        objectFit: 'cover',
        pointerEvents: 'none',
      }}
    />
  );
}

// ── Caption card ──────────────────────────────────────────────
function Caption({ progress, lang }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const prevIdx  = useRef(0);
  const stageRef = useRef();

  useEffect(() => {
    let raf;
    const tick = () => {
      const p = progress.current;
      let idx = 0;
      STAGES.forEach((s, i) => { if (p >= s.range[0]) idx = i; });
      if (idx !== prevIdx.current) {
        prevIdx.current = idx;
        if (stageRef.current) {
          gsap.fromTo(stageRef.current,
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.48, ease: 'power2.out' }
          );
        }
        setActiveIdx(idx);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const stages = lang === 'ta' ? STAGES_TA : STAGES;
  const active  = stages[activeIdx] || stages[0];

  return (
    <div className="hero-caption-wrap" style={{
      position: 'absolute', inset: 0, zIndex: 10,
      display: 'flex', alignItems: 'center',
      padding: '0 clamp(1.5rem, 6vw, 5rem)',
      pointerEvents: 'none',
    }}>
      <div style={{
        maxWidth: 520,
        background: 'rgba(10,18,12,.72)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRadius: 20,
        padding: 'clamp(1.6rem, 3.5vw, 2.6rem)',
        border: '1px solid rgba(255,255,255,.10)',
        boxShadow: '0 24px 72px rgba(0,0,0,.35)',
      }}>
        {/* Tagline */}
        <p style={{
          fontSize: '.68rem', fontWeight: 600, letterSpacing: '.18em',
          textTransform: 'uppercase', color: '#74d4a0', marginBottom: '1rem',
          fontFamily: "'DM Sans', system-ui, sans-serif",
        }}>
          {FIXED_TAGLINE}
        </p>

        {/* Stage headline + sub — crossfades on change */}
        <div ref={stageRef}>
          <h1 style={{
            whiteSpace: 'pre-line',
            fontSize: 'clamp(1.8rem, 4.2vw, 3.2rem)',
            lineHeight: 1.1,
            marginBottom: '.85rem',
            color: '#f0ebe0',
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontWeight: 400,
            letterSpacing: '-.015em',
          }}>
            {active.headline}
          </h1>
          <p style={{
            fontSize: 'clamp(.82rem, 1.2vw, .94rem)',
            color: 'rgba(255,255,255,.65)',
            lineHeight: 1.72,
          }}>
            {active.sub}
          </p>
        </div>

        {/* Stage progress pills */}
        <div style={{ marginTop: '1.4rem', display: 'flex', gap: 6, alignItems: 'center' }}>
          {STAGES.map((_, i) => (
            <div key={i} style={{
              flex: i === activeIdx ? 2.8 : 1,
              height: i === activeIdx ? 4 : 3,
              borderRadius: 999,
              background: i === activeIdx ? '#74d4a0' : 'rgba(255,255,255,.20)',
              transition: 'flex .55s cubic-bezier(.16,1,.3,1), height .3s',
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────
export default function HeroSection({ lang }) {
  const sectionRef = useRef();
  const progress   = useScrollProgress(sectionRef);

  return (
    <section ref={sectionRef} style={{ height: '620vh', position: 'relative' }}>
      <div className="hero-sticky" style={{
        position: 'sticky', top: 0,
        width: '100%',
        overflow: 'hidden',
        background: '#0a120c',
      }}>
        {/* Scroll-scrubbed building video */}
        <VideoScrub progress={progress} />

        {/* Left-to-center gradient so caption card always has contrast */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2,
          background: 'linear-gradient(105deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,.15) 55%, transparent 100%)',
          pointerEvents: 'none',
        }} />

        {/* Bottom gradient for scroll nudge readability */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '22%', zIndex: 2,
          background: 'linear-gradient(to top, rgba(0,0,0,.45) 0%, transparent 100%)',
          pointerEvents: 'none',
        }} />

        <Caption progress={progress} lang={lang} />

        {/* Scroll nudge */}
        <div style={{
          position: 'absolute', bottom: '2rem', left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '.4rem', color: 'rgba(255,255,255,.6)',
          fontSize: '.7rem', fontWeight: 600,
          letterSpacing: '.12em', textTransform: 'uppercase',
          pointerEvents: 'none', zIndex: 10,
          animation: 'nudgeFade 2.4s ease-in-out infinite',
        }}>
          <span>Scroll</span>
          <svg width="14" height="20" viewBox="0 0 14 20" fill="none">
            <path d="M7 1v12M4 10l3 3 3-3"
              stroke="currentColor" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      <style>{`
        @keyframes nudgeFade {
          0%,100% { opacity:.35; transform:translateX(-50%) translateY(0); }
          50%      { opacity:.85; transform:translateX(-50%) translateY(7px); }
        }
      `}</style>
    </section>
  );
}
