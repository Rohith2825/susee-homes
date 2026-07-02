// Procedural placeholder cards — no images
function PlotPattern({ seed }) {
  const cols = 5 + (seed % 3);
  const rows = 4 + (seed % 2);
  const rects = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const skip = (r + c + seed) % 7 === 0;
      if (!skip) rects.push({ r, c });
    }
  }
  const cw = 160 / cols;
  const rh = 100 / rows;
  return (
    <svg width="100%" height="100%" viewBox="0 0 160 120" style={{ position: 'absolute', inset: 0 }}>
      <rect width="160" height="120" fill="#d8f3dc" />
      {/* Roads */}
      <line x1="80" y1="0" x2="80" y2="120" stroke="#c9b99a" strokeWidth="4"/>
      <line x1="0" y1="60" x2="160" y2="60" stroke="#c9b99a" strokeWidth="4"/>
      {rects.map(({ r, c }) => (
        <rect
          key={`${r}-${c}`}
          x={c * cw + 2} y={r * rh + 2}
          width={cw - 4} height={rh - 4}
          rx="1" fill="#b7e4c7" stroke="#2d6a4f" strokeWidth=".8" opacity=".7"
        />
      ))}
    </svg>
  );
}

const CARDS_EN = [
  { name: 'Project SOLEIL',   loc: 'Oragadam, Chennai',       area: '~10 Acres',   status: 'Pre-launch' },
  { name: 'Project VERDANT',  loc: 'Tambaram, Chennai',       area: '~8 Acres',    status: 'Upcoming 2025' },
  { name: 'Project CREST',    loc: 'Sriperumbudur, Chennai',  area: '~12 Acres',   status: 'Upcoming 2025' },
];
const CARDS_TA = [
  { name: 'திட்டம் SOLEIL',   loc: 'ஒராகடம், சென்னை',        area: '~10 ஏக்கர்',  status: 'முன்-அறிவிப்பு' },
  { name: 'திட்டம் VERDANT',  loc: 'தாம்பரம், சென்னை',       area: '~8 ஏக்கர்',   status: 'வரவிருக்கிறது 2025' },
  { name: 'திட்டம் CREST',    loc: 'ஸ்ரீபெரும்புதூர்',        area: '~12 ஏக்கர்',  status: 'வரவிருக்கிறது 2025' },
];

export default function Upcoming({ lang }) {
  const cards = lang === 'ta' ? CARDS_TA : CARDS_EN;
  return (
    <section className="section" style={{ background: '#f8f5f0' }}>
      <div className="container">
        <p className="eyebrow" data-reveal style={{ marginBottom: '.75rem' }}>
          {lang === 'ta' ? 'வரவிருக்கும் திட்டங்கள்' : 'Upcoming Projects'}
        </p>
        <h2 data-reveal style={{ marginBottom: 0 }}>
          {lang === 'ta' ? 'இன்னும் அதிகம்\nவரவிருக்கிறது.' : 'More landmark\ndevelopments coming.'}
        </h2>
        <div className="upcoming-grid" style={{ marginTop: '3rem' }}>
          {cards.map((c, i) => (
            <div key={i} className="upcoming-card" data-reveal style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className="upcoming-card-visual">
                <PlotPattern seed={i + 1} />
                <div style={{
                  position: 'absolute', top: '1rem', right: '1rem',
                  background: '#2d6a4f', color: '#fff',
                  fontSize: '.72rem', fontWeight: 600, padding: '.28rem .7rem',
                  borderRadius: 999, letterSpacing: '.06em',
                }}>
                  {c.status}
                </div>
              </div>
              <div className="upcoming-card-body">
                <h4>{c.name}</h4>
                <p>{c.loc} · {c.area}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
