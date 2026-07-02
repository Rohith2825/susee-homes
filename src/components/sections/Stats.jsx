import { useRef, useEffect, useState } from 'react';

function useCountUp(target, duration = 1800, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime;
    const isFloat = String(target).includes('.');
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = isFloat
        ? (eased * parseFloat(target)).toFixed(2)
        : Math.round(eased * parseFloat(target));
      setValue(current);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return value;
}

function Stat({ num, label, suffix = '', lang }) {
  const ref = useRef();
  const [inView, setInView] = useState(false);
  const count = useCountUp(num, 1600, inView);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold: 0.4 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ textAlign: 'center' }}>
      <span className="stat-num">{count}{suffix}</span>
      <p className="stat-label">{label}</p>
    </div>
  );
}

const STATS_EN = [
  { num: '6.72', label: 'Acres of Premium Land',   suffix: '' },
  { num: '181',  label: 'Individual Plots',          suffix: '+' },
  { num: '40',   label: 'Percent Open Space',        suffix: '%' },
  { num: '2016', label: 'Established',               suffix: '' },
];
const STATS_TA = [
  { num: '6.72', label: 'ஏக்கர் நில பரப்பு',     suffix: '' },
  { num: '181',  label: 'தனிப்பட்ட மனைகள்',       suffix: '+' },
  { num: '40',   label: 'சதவீத திறந்த வெளி',     suffix: '%' },
  { num: '2016', label: 'நிறுவப்பட்ட ஆண்டு',      suffix: '' },
];

export default function StatsSection({ lang }) {
  const stats = lang === 'ta' ? STATS_TA : STATS_EN;
  return (
    <div className="stats-band">
      <div className="container">
        <div className="stats-grid">
          {stats.map((s, i) => <Stat key={i} {...s} lang={lang} />)}
        </div>
      </div>
    </div>
  );
}
