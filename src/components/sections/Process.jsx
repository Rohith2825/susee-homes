const STEPS_EN = [
  { n: '01', title: 'Choose Your Plot', body: 'Browse available plots with clear pricing, documentation, and site visit appointments.' },
  { n: '02', title: 'Design Your Home', body: 'Work with our architects to design a home that fits your lifestyle and plot dimensions.' },
  { n: '03', title: 'We Build It',       body: 'Our construction team handles everything — materials, labour, timelines, and quality checks.' },
  { n: '04', title: 'Move In',           body: 'Receive your keys. We hand over a fully finished home with all utilities connected.' },
];
const STEPS_TA = [
  { n: '01', title: 'உங்கள் மனையை தேர்வுசெய்',   body: 'கிடைக்கக்கூடிய மனைகளை தெளிவான விலை மற்றும் ஆவணங்களுடன் பார்க்கவும்.' },
  { n: '02', title: 'வீட்டை வடிவமைக்கவும்',      body: 'உங்கள் வாழ்க்கை முறைக்கு ஏற்ற வீட்டை நமது கட்டிட நிபுணர்களுடன் வடிவமைக்கவும்.' },
  { n: '03', title: 'நாங்கள் கட்டுகிறோம்',         body: 'பொருட்கள், கூலி, காலக்கெடு, தர சோதனை அனைத்தும் நாங்கள் கவனிக்கிறோம்.' },
  { n: '04', title: 'குடிவரவும்',                body: 'முடிந்த வீட்டின் சாவியை பெறுங்கள். அனைத்து வசதிகளும் இணைக்கப்பட்டிருக்கும்.' },
];

export default function Process({ lang }) {
  const steps = lang === 'ta' ? STEPS_TA : STEPS_EN;
  return (
    <section className="section" id="process">
      <div className="container">
        <p className="eyebrow" data-reveal style={{ marginBottom: '.75rem' }}>
          {lang === 'ta' ? 'எப்படி வேலை செய்கிறோம்' : 'How It Works'}
        </p>
        <h2 data-reveal style={{ marginBottom: 0 }}>
          {lang === 'ta' ? 'நான்கு படிகளில்\nவீடு தயார்.' : 'Four steps to\nyour new home.'}
        </h2>
        <div className="process-steps" id="process" style={{ marginTop: '3.5rem' }}>
          {steps.map((s, i) => (
            <div key={i} className="process-step" data-reveal style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className="step-num">{s.n}</div>
              <h4>{s.title}</h4>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
