import { useState } from 'react';

const MILESTONES = [
  { year: '2004', label: 'Founded Susee Homes', sub: 'Started with a single plot layout in Koyambedu' },
  { year: '2010', label: '100 families housed', sub: 'Expanded to North Chennai and Poonamallee belt' },
  { year: '2017', label: 'Construction arm launched', sub: 'End-to-end home building added to the portfolio' },
  { year: '2024', label: 'Project ALIGHT', sub: '6.72-acre master-planned community in Poonamallee' },
];

export default function Founder({ lang }) {
  const [imgFailed, setImgFailed] = useState(false);
  const isTa = lang === 'ta';

  return (
    <section className="section founder-section" id="founder">
      <div className="container">

        {/* ── Header ──────────────────────────────────────────── */}
        <p className="eyebrow" data-reveal style={{ marginBottom: '0.5rem' }}>
          {isTa ? 'நிறுவனரிடமிருந்து' : 'The Man Behind Susee Homes'}
        </p>
        <h2 data-reveal style={{ marginBottom: '3.5rem', maxWidth: 560 }}>
          {isTa ? 'நம்பிக்கையுடன் கட்டப்பட்டது' : 'Two decades.\nOne promise.'}
        </h2>

        {/* ── Main bio grid ──────────────────────────────────── */}
        <div className="founder-inner" style={{ marginBottom: '4rem' }}>

          {/* Photo column */}
          <div className="founder-photo-wrap" data-reveal="left">
            {imgFailed ? (
              <div className="founder-initials">RB</div>
            ) : (
              <div className="founder-photo">
                <img
                  src="/images/founder.png"
                  alt="Mr. Rajesh BR — Founder & MD, Susee Homes"
                  onError={() => setImgFailed(true)}
                />
              </div>
            )}
            <p style={{ textAlign: 'center', fontWeight: 700, fontSize: '.92rem', color: '#1b4332' }}>
              Mr. Rajesh BR
            </p>
            <p style={{ textAlign: 'center', fontSize: '.78rem', color: '#6b7280', marginTop: '.15rem' }}>
              {isTa ? 'நிறுவனர் & MD, சுஸீ ஹோம்ஸ்' : 'Founder & Managing Director'}
            </p>

            {/* Credential chips */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.45rem', marginTop: '1.2rem', width: '100%' }}>
              {[
                isTa ? '20+ ஆண்டுகள் அனுபவம்'        : '20+ Years in Chennai Real Estate',
                isTa ? 'DTCP & RERA நிபுணர்'            : 'DTCP & RERA Specialist',
                isTa ? '500+ குடும்பங்களுக்கு வீடு'    : '500+ Families Housed',
                isTa ? 'பூஜ்ஜிய தவணை எண் தகராறு'       : 'Zero Payment Disputes',
              ].map((t, i) => (
                <span key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '.5rem',
                  padding: '.32rem .75rem', borderRadius: 999,
                  fontSize: '.75rem', fontWeight: 600,
                  background: '#f0faf2', border: '1.5px solid #d8f3dc', color: '#2d6a4f',
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2d6a4f', flexShrink: 0 }} />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Quote + bio column */}
          <div data-reveal>
            {/* Pull-quote */}
            <blockquote className="founder-quote" style={{ marginBottom: '1.4rem' }}>
              {isTa
                ? '"நான் நிலம் விற்கவில்லை — உங்கள் கனவுக்கு அடித்தளம் இடுகிறேன்."'
                : '"I don\'t sell land. I lay the foundation for someone\'s dream."'}
            </blockquote>

            <p style={{ color: '#4b5563', lineHeight: 1.82, marginBottom: '1.6rem', fontSize: '.96rem' }}>
              {isTa
                ? 'கடந்த இரண்டு தசாப்தங்களாக சென்னை ரியல் எஸ்டேட்டில் நம்பிக்கை மற்றும் வெளிப்படைத்தன்மையை மையமாக வைத்து சுஸீ ஹோம்ஸை கட்டி வந்திருக்கிறேன். ஒவ்வொரு மனையும், ஒவ்வொரு வீடும் ஒரு தனிப்பட்ட வாக்குறுதியை கொண்டுள்ளது.'
                : "I started Susee Homes in 2004 with one conviction: that a family's biggest financial decision deserves complete transparency. No hidden charges, no inflated promises — just clean title, full infrastructure, and a builder who answers your call. Twenty years later, that's still the only way I know how to do this."}
            </p>

            <p style={{ color: '#4b5563', lineHeight: 1.82, fontSize: '.96rem' }}>
              {isTa
                ? 'ALIGHT எங்கள் மிகவும் கவனமாக திட்டமிடப்பட்ட திட்டம். 6.72 ஏக்கரில் 181 குடும்பங்களுக்கான ஒரு முழுமையான சமூகம் — சாலைகள், பூங்காக்கள், பாதுகாப்பு, மற்றும் ஒரு வாழ்க்கை தரம்.'
                : "Project ALIGHT is the most carefully planned work of my career — a 6.72-acre master community where every detail, from the road widths to the open-space ratio, was decided with one question in mind: would I want my own family to live here?"}
            </p>
          </div>
        </div>

        {/* ── Timeline ──────────────────────────────────────── */}
        <div data-reveal style={{ marginTop: '1rem' }}>
          <p className="eyebrow" style={{ marginBottom: '2rem' }}>
            {isTa ? 'எங்கள் பயணம்' : 'Our Journey'}
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0',
            position: 'relative',
          }}>
            {/* Connecting line */}
            <div style={{
              position: 'absolute', top: 22, left: '12.5%', right: '12.5%',
              height: 2,
              background: 'linear-gradient(90deg, #2d6a4f22, #2d6a4f88, #2d6a4f22)',
              display: window.innerWidth < 640 ? 'none' : 'block',
            }} />

            {MILESTONES.map((m, i) => (
              <div key={i} style={{
                textAlign: 'center', padding: '0 1.2rem 0',
                position: 'relative',
              }}>
                {/* Circle */}
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: '#2d6a4f', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1rem',
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  fontSize: '1rem', fontWeight: 400,
                  position: 'relative', zIndex: 1,
                  boxShadow: '0 0 0 6px #f0ebe0',
                }}>
                  {m.year.slice(2)}
                </div>
                <div style={{
                  fontSize: '.68rem', fontWeight: 700, color: '#2d6a4f',
                  letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '.3rem',
                }}>
                  {m.year}
                </div>
                <p style={{ fontWeight: 600, fontSize: '.88rem', color: '#1b4332', marginBottom: '.3rem' }}>
                  {m.label}
                </p>
                <p style={{ fontSize: '.78rem', color: '#6b7280', lineHeight: 1.55 }}>
                  {m.sub}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
