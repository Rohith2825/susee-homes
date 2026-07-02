const AMENITIES_EN = [
  'Landscaped parks', "Children\'s play area", 'CCTV security',
  'Gated entrance', 'Street lighting', 'Underground drainage',
  'Electricity infrastructure', 'Tar roads inside layout',
  '40% open space', 'Vastu-compliant plots',
];
const AMENITIES_TA = [
  'பூங்காக்கள்', 'குழந்தைகள் விளையாட்டு மையம்', 'CCTV பாதுகாப்பு',
  'வாயில் நுழைவு', 'தெரு விளக்குகள்', 'நிலத்தடி வடிகால்',
  'மின்சார உள்கட்டமைப்பு', 'தாரோடு', '40% திறந்த வெளி', 'வாஸ்து மனைகள்',
];

export default function ProjectAlight({ lang }) {
  const amenities = lang === 'ta' ? AMENITIES_TA : AMENITIES_EN;

  return (
    <section className="section alight-section" id="alight">
      <div className="container">
        <p className="eyebrow" data-reveal style={{ color: '#74d4a0', marginBottom: '.75rem' }}>
          {lang === 'ta' ? 'நமது திட்டம்' : 'Flagship Project'}
        </p>
        <h2 data-reveal style={{ color: '#fff', marginBottom: 0 }}>
          {lang === 'ta' ? 'ALIGHT — பூனமல்லி' : 'Project ALIGHT\nPoonamallee, Chennai'}
        </h2>

        <div className="alight-grid" style={{ marginTop: '3rem' }}>
          {/* Left: description */}
          <div data-reveal="left">
            <div className="alight-tags">
              <span className="alight-tag gold">DTCP Approved</span>
              <span className="alight-tag gold">RERA Certified</span>
              <span className="alight-tag">Poonamallee, Chennai</span>
              <span className="alight-tag">6.72 Acres</span>
              <span className="alight-tag">181 Plots</span>
            </div>

            <p style={{ color: 'rgba(255,255,255,.75)', lineHeight: 1.75, marginBottom: '1.5rem' }}>
              {lang === 'ta'
                ? 'ALIGHT என்பது சென்னையின் மிகவேகமாக வளரும் தொடர்இடத்தில் ஒரு சிறந்த அடுக்கு மனை திட்டமாகும். குதாம்பாக்கம், நசரத்பேட்டை மெட்ரோ மற்றும் பூனமல்லி ஆகியவற்றுக்கு அடுத்ததாக அமைந்துள்ளது.'
                : 'ALIGHT is a premium plotted development at the heart of Chennai\'s fastest-growing corridor. Located moments from Kuthambakkam, Nazarathpet Metro, and Poonamallee, it offers the ideal combination of connectivity, serenity, and strong investment potential.'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem', marginBottom: '2rem' }}>
              {[
                lang === 'ta' ? '2 நிமிடம் — குதாம்பாக்கம்' : '2 min — Kuthambakkam',
                lang === 'ta' ? '8 நிமிடம் — நசரத்பேட்டை மெட்ரோ' : '8 min — Nazarathpet Metro Station',
                lang === 'ta' ? '10 நிமிடம் — பூனமல்லி'  : '10 min — Poonamallee Town Centre',
                lang === 'ta' ? '25 நிமிடம் — சென்னை சென்ட்ரல்' : '25 min — Chennai Central',
              ].map((c, i) => (
                <div key={i} className="amenity-item">
                  <span className="amenity-dot" style={{ background: '#f3d58e' }}/>
                  <span style={{ fontSize: '.9rem' }}>{c}</span>
                </div>
              ))}
            </div>

            <p className="eyebrow" style={{ color: '#74d4a0', marginBottom: '.75rem' }}>
              {lang === 'ta' ? 'வசதிகள்' : 'Amenities'}
            </p>
            <div className="alight-amenities" id="amenities">
              {amenities.map((a, i) => (
                <div key={i} className="amenity-item">
                  <span className="amenity-dot"/>
                  <span>{a}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: stat cards */}
          <div className="alight-stats" data-reveal="right">
            {[
              { num: '627–2,259', label: lang === 'ta' ? 'சதுர அடி மனை அளவு' : 'sq ft plot sizes available' },
              { num: '181',       label: lang === 'ta' ? 'மொத்த மனைகள்'       : 'total registered plots' },
              { num: '6.72',      label: lang === 'ta' ? 'ஏக்கர் மொத்த பரப்பு' : 'acres total project area' },
            ].map((s, i) => (
              <div key={i} className="alight-stat-card">
                <div className="num">{s.num}</div>
                <div className="label">{s.label}</div>
              </div>
            ))}
            <a href="#cta" className="btn btn-outline" style={{ borderColor: 'rgba(255,255,255,.4)', color: '#fff', marginTop: '.5rem', pointerEvents: 'auto' }}>
              {lang === 'ta' ? 'தள வருகை பதிவு செய்' : 'Book a Site Visit →'}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
