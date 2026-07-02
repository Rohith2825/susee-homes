import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// ── Simple NLP parser ─────────────────────────────────────────
function parseBrief(text) {
  const t = text.toLowerCase();
  const result = {};

  // Bedrooms
  const bm = t.match(/(\d+)\s*(?:bed(?:room)?s?|bhk|படுக்கை)/i);
  if (bm) result.bedrooms = parseInt(bm[1], 10);

  // Bathrooms
  const bathrm = t.match(/(\d+)\s*(?:bath(?:room)?s?|toilet)/i);
  if (bathrm) result.bathrooms = parseInt(bathrm[1], 10);

  // Area in sqft
  const sqm = t.match(/(\d[\d,]*)\s*(?:sq(?:uare)?\.?\s*f(?:ee|oo)?t|sqft|sft)/i);
  if (sqm) result.sqft = parseInt(sqm[1].replace(/,/g, ''), 10);

  // Style
  if (/modern|contemporary|minimalist/i.test(t)) result.style = 'Modern';
  else if (/tradit|classic|heritage|old/i.test(t)) result.style = 'Traditional';
  else if (/villa|luxury|premium/i.test(t)) result.style = 'Luxury Villa';
  else if (/duplex|double.*storey|two.*floor/i.test(t)) result.style = 'Duplex';

  // Floors
  const fm = t.match(/(\d+)\s*(?:floor|storey|story|level)/i);
  if (fm) result.floors = parseInt(fm[1], 10);

  // Ground floor only
  if (/ground\s+floor\s+only|single\s+floor|one\s+floor/i.test(t) && !fm) result.floors = 1;

  return result;
}

function estimateCost({ sqft, bedrooms, style }) {
  if (!sqft && !bedrooms) return null;
  const area = sqft || (bedrooms ? bedrooms * 450 : 0);
  let ratePerSqft = 2200; // base rate ₹/sqft
  if (style === 'Luxury Villa') ratePerSqft = 3200;
  else if (style === 'Traditional') ratePerSqft = 2000;
  else if (style === 'Modern') ratePerSqft = 2500;
  const low  = Math.round((area * ratePerSqft * 0.9) / 100000);
  const high = Math.round((area * ratePerSqft * 1.1) / 100000);
  return { low, high, area };
}

const EXAMPLE_PROMPTS = [
  '3 BHK modern home, 1800 sqft, ground floor',
  '4 bedroom duplex villa with 2400 sqft',
  'Traditional 2 bhk house, 1200 sqft',
];

function Tag({ label, value }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '.4rem',
      padding: '.3rem .75rem', borderRadius: 999,
      fontSize: '.8rem', fontWeight: 600,
      background: '#f0faf2', border: '1.5px solid #d8f3dc', color: '#1b4332',
    }}>
      <span style={{ color: '#6b7280', fontWeight: 400 }}>{label}:</span>
      {value}
    </span>
  );
}

export default function AIBuilder({ lang }) {
  const [text, setText]       = useState('');
  const [parsed, setParsed]   = useState(null);
  const [estimate, setEstimate] = useState(null);
  const [typing, setTyping]   = useState(false);
  const sectionRef = useRef();
  const resultRef  = useRef();
  const isTa = lang === 'ta';

  // Reveal animation
  useEffect(() => {
    const id = setTimeout(() => {
      if (!sectionRef.current) return;
      gsap.fromTo(sectionRef.current.querySelectorAll('[data-reveal]'),
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 82%' },
        }
      );
    }, 300);
    return () => clearTimeout(id);
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setText(val);
    setTyping(true);
    if (val.trim().length > 8) {
      const p = parseBrief(val);
      setParsed(Object.keys(p).length ? p : null);
      setEstimate(estimateCost(p));
    } else {
      setParsed(null);
      setEstimate(null);
    }
  };

  const handleExample = (ex) => {
    setText(ex);
    const p = parseBrief(ex);
    setParsed(Object.keys(p).length ? p : null);
    setEstimate(estimateCost(p));
  };

  const waLink = () => {
    const summary = [
      parsed?.bedrooms ? `${parsed.bedrooms} BHK` : '',
      parsed?.sqft     ? `${parsed.sqft} sqft`     : '',
      parsed?.style    || '',
    ].filter(Boolean).join(', ');
    const msg = encodeURIComponent(
      `Hi Susee Homes! I'm interested in building a home.\n\nDetails: ${summary || text}\n\nPlease share more info about Project ALIGHT.`
    );
    return `https://wa.me/919894071222?text=${msg}`;
  };

  return (
    <section
      ref={sectionRef}
      id="ai-builder"
      className="section"
      style={{ background: '#f8f5f0' }}
    >
      <div className="container">
        <div style={{ maxWidth: 760, margin: '0 auto' }}>

          {/* Header */}
          <p className="eyebrow" data-reveal style={{ marginBottom: '.5rem' }}>
            {isTa ? 'வீடு வடிவமைப்பு கருவி' : 'Home Cost Estimator'}
          </p>
          <h2 data-reveal style={{ marginBottom: '.75rem' }}>
            {isTa ? 'உங்கள் கனவு வீட்டை விவரியுங்கள்' : 'Describe your\ndream home.'}
          </h2>
          <p data-reveal style={{ color: '#6b7280', marginBottom: '2rem', lineHeight: 1.7 }}>
            {isTa
              ? 'வீடு எப்படி இருக்க வேண்டும் என்று தமிழிலோ ஆங்கிலத்திலோ எழுதுங்கள். உடனடி மதிப்பீடு பெறுங்கள்.'
              : 'Type what you want — bedrooms, size, style, floors — in plain English (or Tamil). We\'ll parse it instantly and give you a ball-park build estimate.'}
          </p>

          {/* Example chips */}
          <div data-reveal style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '.78rem', color: '#9ca3af', alignSelf: 'center' }}>Try:</span>
            {EXAMPLE_PROMPTS.map((ex, i) => (
              <button key={i} onClick={() => handleExample(ex)} style={{
                padding: '.3rem .85rem', borderRadius: 999, fontSize: '.78rem', fontWeight: 500,
                background: '#fff', border: '1.5px solid rgba(45,106,79,.25)',
                color: '#2d6a4f', cursor: 'pointer', transition: 'all .18s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#2d6a4f'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#2d6a4f'; }}
              >
                {ex}
              </button>
            ))}
          </div>

          {/* Textarea */}
          <div data-reveal style={{ position: 'relative', marginBottom: '1.5rem' }}>
            <textarea
              value={text}
              onChange={handleChange}
              placeholder={isTa
                ? '3 BHK வீடு, 1800 sqft, நவீன பாணி...'
                : 'e.g. I want a 3 BHK modern home, around 1800 sqft, ground floor only, with an open kitchen...'}
              rows={4}
              style={{
                width: '100%', padding: '1rem 1.2rem',
                border: '2px solid rgba(45,106,79,.2)',
                borderRadius: 14, fontSize: '.96rem',
                fontFamily: "'DM Sans', system-ui, sans-serif",
                color: '#1a1a1a', background: '#fff',
                resize: 'vertical', outline: 'none',
                lineHeight: 1.7,
                transition: 'border-color .2s',
                boxSizing: 'border-box',
              }}
              onFocus={e => { e.target.style.borderColor = '#2d6a4f'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(45,106,79,.2)'; }}
            />
          </div>

          {/* Parsed tags */}
          {parsed && (
            <div ref={resultRef} style={{
              background: '#fff', border: '1.5px solid rgba(45,106,79,.18)',
              borderRadius: 16, padding: '1.4rem 1.6rem', marginBottom: '1.5rem',
              boxShadow: '0 4px 20px rgba(45,106,79,.06)',
            }}>
              <p style={{ fontSize: '.75rem', fontWeight: 700, color: '#2d6a4f', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>
                {isTa ? 'நான் புரிந்துகொண்டது:' : 'Details found:'}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', marginBottom: estimate ? '1.2rem' : 0 }}>
                {parsed.bedrooms  && <Tag label="Bedrooms" value={`${parsed.bedrooms} BHK`} />}
                {parsed.bathrooms && <Tag label="Bathrooms" value={parsed.bathrooms} />}
                {parsed.sqft      && <Tag label="Area" value={`${parsed.sqft.toLocaleString()} sqft`} />}
                {parsed.floors    && <Tag label="Floors" value={parsed.floors} />}
                {parsed.style     && <Tag label="Style" value={parsed.style} />}
              </div>

              {estimate && (
                <div style={{
                  background: 'linear-gradient(135deg, #1b4332, #2d6a4f)',
                  borderRadius: 12, padding: '1.1rem 1.4rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  flexWrap: 'wrap', gap: '.75rem',
                }}>
                  <div>
                    <p style={{ color: 'rgba(255,255,255,.65)', fontSize: '.72rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '.25rem' }}>
                      {isTa ? 'கட்டுமான மதிப்பீடு' : 'Estimated Build Cost'}
                    </p>
                    <p style={{
                      fontFamily: "'DM Serif Display', Georgia, serif",
                      fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 400,
                      color: '#f3d58e', lineHeight: 1,
                    }}>
                      ₹{estimate.low}L – ₹{estimate.high}L
                    </p>
                    <p style={{ color: 'rgba(255,255,255,.55)', fontSize: '.72rem', marginTop: '.3rem' }}>
                      {isTa
                        ? `~${estimate.area.toLocaleString()} sqft · கட்டுமான மட்டும்`
                        : `~${estimate.area.toLocaleString()} sqft · construction only, excl. land`}
                    </p>
                  </div>
                  <a
                    href={waLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '.5rem',
                      padding: '.65rem 1.4rem', borderRadius: 999,
                      background: '#25d366', color: '#fff',
                      fontWeight: 700, fontSize: '.88rem',
                      textDecoration: 'none', transition: 'transform .15s',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.534 5.856L.057 23.998l6.304-1.654A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.013-1.376l-.36-.213-3.723.977.993-3.63-.234-.373A9.818 9.818 0 1112 21.818z"/>
                    </svg>
                    {isTa ? 'விவரம் கேளுங்கள்' : 'Get exact quote'}
                  </a>
                </div>
              )}
            </div>
          )}

          {/* CTA when no input */}
          {!parsed && text.trim().length === 0 && (
            <div data-reveal style={{
              textAlign: 'center', padding: '1.5rem',
              background: '#fff', borderRadius: 16,
              border: '1.5px dashed rgba(45,106,79,.2)',
            }}>
              <p style={{ color: '#9ca3af', fontSize: '.9rem' }}>
                {isTa
                  ? 'மேலே உங்கள் வீட்டை விவரியுங்கள் — உடனடி மதிப்பீடு தோன்றும்.'
                  : 'Start typing above and your instant estimate will appear here.'}
              </p>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
