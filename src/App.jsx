import { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Nav           from './components/Nav';
import HeroSection   from './components/HeroSection';
import StatsSection  from './components/sections/Stats';
import Pillars       from './components/sections/Pillars';
import Process       from './components/sections/Process';
import ProjectAlight from './components/sections/ProjectAlight';
import AIBuilder     from './components/sections/AIBuilder';
import Upcoming      from './components/sections/Upcoming';
import Founder       from './components/sections/Founder';
import CTA           from './components/sections/CTA';

gsap.registerPlugin(ScrollTrigger);

// GSAP-powered reveals with stagger + spring easing
function useGsapReveals() {
  useEffect(() => {
    // Wait one tick so sections are mounted
    const id = setTimeout(() => {
      const els = document.querySelectorAll('[data-reveal]');
      els.forEach((el) => {
        const dir = el.getAttribute('data-reveal');
        const xFrom = dir === 'left' ? -60 : dir === 'right' ? 60 : 0;
        const yFrom = (dir === 'left' || dir === 'right') ? 0 : 50;
        const scale = dir === 'scale' ? 0.88 : 1;

        gsap.fromTo(el,
          { opacity: 0, x: xFrom, y: yFrom, scale },
          {
            opacity: 1, x: 0, y: 0, scale: 1,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              toggleActions: 'play none none none',
            },
          }
        );
      });

      // Staggered children inside grid parents
      document.querySelectorAll('[data-stagger]').forEach(parent => {
        gsap.fromTo(parent.children,
          { opacity: 0, y: 45 },
          {
            opacity: 1, y: 0,
            duration: 0.75,
            ease: 'power3.out',
            stagger: 0.1,
            scrollTrigger: {
              trigger: parent,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      });
    }, 400);

    return () => clearTimeout(id);
  }, []);
}

export default function App() {
  const [lang, setLang] = useState('en');
  useGsapReveals();

  return (
    <>
      <Nav lang={lang} setLang={setLang} />
      <main>
        <HeroSection   lang={lang} />
        <StatsSection  lang={lang} />
        <Pillars       lang={lang} />
        <Process       lang={lang} />
        <ProjectAlight lang={lang} />
        <AIBuilder     lang={lang} />
        <Upcoming      lang={lang} />
        <Founder       lang={lang} />
        <CTA           lang={lang} />
      </main>
    </>
  );
}
