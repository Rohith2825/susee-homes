import { useEffect, useRef } from 'react';

function useReveal(selector) {
  useEffect(() => {
    const els = document.querySelectorAll(selector);
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); }),
      { threshold: 0.15 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [selector]);
}

const PILLARS_EN = [
  {
    icon: '⬛',
    title: 'Plotted Developments',
    body: 'DTCP-approved and RERA-certified layouts with clear documentation, full infrastructure — roads, drainage, electricity — and transparent pricing. Buy your land with complete legal confidence.',
    points: ['DTCP & RERA Certified', 'Clear title documentation', 'Full infrastructure ready', 'Transparent pricing'],
  },
  {
    icon: '🏠',
    title: 'Custom Home Construction',
    body: 'Our in-house construction team designs and builds your home on your plot, end-to-end. From architectural concept to handover, every detail is handled by a single trusted partner.',
    points: ['Architectural design included', 'Premium materials', 'Milestone-based payments', 'Dedicated project manager'],
  },
];
const PILLARS_TA = [
  {
    icon: '⬛',
    title: 'அடுக்கு மனை திட்டங்கள்',
    body: 'DTCP அங்கீகாரம் மற்றும் RERA சான்றிதழ் பெற்ற அமைவிடங்கள். சாலைகள், கழிவுநீர், மின்சாரம் - முழுமையான உள்கட்டமைப்பு.',
    points: ['DTCP & RERA சான்று', 'தெளிவான ஆவணங்கள்', 'முழு உள்கட்டமைப்பு', 'வெளிப்படையான விலை'],
  },
  {
    icon: '🏠',
    title: 'தனிப்பயன் வீடு கட்டுமானம்',
    body: 'உங்கள் மனையில் உங்கள் கனவு வீட்டை கட்டி தருகிறோம். வடிவமைப்பு முதல் வழங்கல் வரை அனைத்தும் நாங்கள் கவனிக்கிறோம்.',
    points: ['கட்டிட வடிவமைப்பு உட்பட', 'உயர்தர பொருட்கள்', 'கட்டம் கட்டம் கட்டணம்', 'அர்ப்பணிக்கப்பட்ட திட்ட மேலாளர்'],
  },
];

function PlotIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="2" y="6" width="24" height="16" rx="2" stroke="#2d6a4f" strokeWidth="2"/>
      <path d="M9 6v16M19 6v16M2 14h24" stroke="#2d6a4f" strokeWidth="1.5"/>
    </svg>
  );
}
function HomeIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M4 12L14 4l10 8v12a2 2 0 01-2 2H6a2 2 0 01-2-2V12z" stroke="#2d6a4f" strokeWidth="2"/>
      <path d="M10 26V18h8v8" stroke="#2d6a4f" strokeWidth="2"/>
    </svg>
  );
}

export default function Pillars({ lang }) {
  const pillars = lang === 'ta' ? PILLARS_TA : PILLARS_EN;

  return (
    <section className="section" style={{ background: '#f8f5f0' }}>
      <div className="container">
        <div style={{ marginBottom: '1rem' }}>
          <p className="eyebrow" data-reveal>{lang === 'ta' ? 'நாம் என்ன செய்கிறோம்' : 'What We Do'}</p>
        </div>
        <h2 data-reveal style={{ maxWidth: 560, marginBottom: '1rem' }}>
          {lang === 'ta' ? 'நிலம் மட்டுமல்ல —\nவீடும் நாங்கள் கட்டுகிறோம்.' : 'Not just the land —\nwe build the home too.'}
        </h2>
        <p data-reveal style={{ color: '#6b7280', maxWidth: 500, marginBottom: 0, lineHeight: 1.7 }}>
          {lang === 'ta'
            ? 'சுஸீ ஹோம்ஸ் இரண்டையும் ஒரே கூரையின் கீழ் வழங்குகிறது.'
            : 'Susee Homes delivers both under one roof — premium land and the expertise to build on it.'}
        </p>
        <div className="pillars-grid" style={{ marginTop: '3rem' }} data-stagger>
          {pillars.map((p, i) => (
            <div key={i} className="pillar-card" data-reveal style={{ transitionDelay: `${i * 0.12}s` }}>
              <div className="pillar-icon">
                {i === 0 ? <PlotIcon /> : <HomeIcon />}
              </div>
              <h3 style={{ marginBottom: '.75rem' }}>{p.title}</h3>
              <p style={{ color: '#6b7280', lineHeight: 1.7, marginBottom: '1.2rem' }}>{p.body}</p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                {p.points.map((pt, j) => (
                  <li key={j} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.875rem', color: '#374151' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2d6a4f', flexShrink: 0 }}/>
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
