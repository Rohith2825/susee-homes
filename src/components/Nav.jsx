import { useState, useEffect } from 'react';

const LINKS_EN = [
  { label: 'Project',    href: '#alight'     },
  { label: 'Build Cost', href: '#ai-builder' },
  { label: 'Process',    href: '#process'    },
  { label: 'Founder',    href: '#founder'    },
  { label: 'Contact',    href: '#cta'        },
];
const LINKS_TA = [
  { label: 'திட்டம்',    href: '#alight'     },
  { label: 'மதிப்பீடு',  href: '#ai-builder' },
  { label: 'செயல்முறை', href: '#process'    },
  { label: 'நிறுவனர்',   href: '#founder'    },
  { label: 'தொடர்பு',   href: '#cta'        },
];

export default function Nav({ lang, setLang }) {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const links = lang === 'ta' ? LINKS_TA : LINKS_EN;

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 72);
      if (menuOpen) setMenuOpen(false);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [menuOpen]);

  const transparent = !scrolled && !menuOpen;

  return (
    <>
      <nav style={{
        position: 'fixed', inset: '0 0 auto 0',
        zIndex: 200, height: 'var(--nav-h)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(1.2rem, 5vw, 4rem)',
        background: transparent ? 'transparent' : 'rgba(250,247,242,.95)',
        backdropFilter: transparent ? 'none' : 'blur(18px)',
        WebkitBackdropFilter: transparent ? 'none' : 'blur(18px)',
        borderBottom: transparent ? 'none' : '1px solid rgba(45,106,79,.12)',
        boxShadow: transparent ? 'none' : '0 2px 24px rgba(0,0,0,.07)',
        transition: 'background .35s ease, box-shadow .35s ease, border-color .35s ease',
      }}>

        {/* Logo */}
        <a href="#" style={{ display: 'flex', alignItems: 'center', lineHeight: 0, textDecoration: 'none' }}>
          <div style={{
            background: 'rgba(250,247,242,0.93)',
            borderRadius: 10,
            padding: '4px 12px',
            display: 'flex',
            alignItems: 'center',
            boxShadow: transparent ? '0 2px 16px rgba(0,0,0,0.20)' : 'none',
            transition: 'box-shadow .35s ease',
          }}>
            <img
              src="/images/logo.png"
              alt="Susee Homes"
              style={{ height: '38px', width: 'auto', objectFit: 'contain', display: 'block', mixBlendMode: 'multiply' }}
            />
          </div>
        </a>

        {/* Desktop nav links */}
        <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '2.2rem' }}>
          {links.map(l => (
            <a
              key={l.href}
              href={l.href}
              style={{
                fontSize: '.875rem', fontWeight: 500,
                color: transparent ? 'rgba(255,255,255,.82)' : 'var(--muted)',
                transition: 'color .25s',
                textDecoration: 'none',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = transparent ? '#fff' : 'var(--green)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = transparent ? 'rgba(255,255,255,.82)' : 'var(--muted)'; }}
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Right controls */}
        <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center' }}>
          {/* Language toggle */}
          <button
            onClick={() => setLang(l => l === 'en' ? 'ta' : 'en')}
            style={{
              fontSize: '.8rem', fontWeight: 600,
              padding: '.35rem .75rem', borderRadius: 999, cursor: 'pointer',
              border: transparent ? '1.5px solid rgba(255,255,255,.45)' : '1.5px solid rgba(45,106,79,.2)',
              color: transparent ? 'rgba(255,255,255,.85)' : 'var(--green-dark)',
              background: 'transparent',
              transition: 'all .25s',
            }}
          >
            {lang === 'en' ? 'தமிழ்' : 'EN'}
          </button>

          {/* Book Visit — hidden on mobile (shown in mobile menu instead) */}
          <a
            href="#cta"
            className="nav-book-btn"
            style={{
              padding: '.55rem 1.2rem', borderRadius: 999,
              fontSize: '.875rem', fontWeight: 600,
              textDecoration: 'none', transition: 'all .25s',
              background: transparent ? 'rgba(255,255,255,.12)' : 'var(--green)',
              color: '#fff',
              border: transparent ? '1.5px solid rgba(255,255,255,.55)' : '1.5px solid transparent',
              backdropFilter: transparent ? 'blur(8px)' : 'none',
            }}
          >
            {lang === 'ta' ? 'தள வருகை' : 'Book Visit'}
          </a>
        </div>

        {/* Hamburger button */}
        <button
          className="nav-mobile-btn"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen(o => !o)}
        >
          <span style={{
            background: transparent ? '#fff' : 'var(--green-dark)',
            transform: menuOpen ? 'rotate(45deg) translate(0, 7px)' : 'none',
          }} />
          <span style={{
            background: transparent ? '#fff' : 'var(--green-dark)',
            opacity: menuOpen ? 0 : 1,
            transform: menuOpen ? 'scaleX(0)' : 'none',
          }} />
          <span style={{
            background: transparent ? '#fff' : 'var(--green-dark)',
            transform: menuOpen ? 'rotate(-45deg) translate(0, -7px)' : 'none',
          }} />
        </button>
      </nav>

      {/* Mobile slide-down menu */}
      <div style={{
        position: 'fixed',
        top: 'var(--nav-h)',
        left: 0, right: 0,
        background: 'rgba(250,247,242,.97)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(45,106,79,.12)',
        boxShadow: '0 8px 32px rgba(0,0,0,.10)',
        zIndex: 199,
        transition: 'transform .3s cubic-bezier(.16,1,.3,1), opacity .25s ease',
        transform: menuOpen ? 'translateY(0)' : 'translateY(-110%)',
        opacity: menuOpen ? 1 : 0,
        pointerEvents: menuOpen ? 'auto' : 'none',
        padding: '0.5rem clamp(1.2rem, 5vw, 2rem) 1.5rem',
      }}>
        {links.map(l => (
          <a
            key={l.href}
            href={l.href}
            onClick={() => setMenuOpen(false)}
            style={{
              display: 'block',
              fontSize: '1.05rem', fontWeight: 500,
              color: 'var(--green-dark)',
              padding: '.9rem 0',
              borderBottom: '1px solid rgba(45,106,79,.08)',
              textDecoration: 'none',
            }}
          >
            {l.label}
          </a>
        ))}
        <a
          href="#cta"
          onClick={() => setMenuOpen(false)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginTop: '1rem',
            padding: '.8rem 1.5rem', borderRadius: 999,
            background: 'var(--green)', color: '#fff',
            fontWeight: 600, fontSize: '.95rem', textDecoration: 'none',
          }}
        >
          {lang === 'ta' ? 'தள வருகை' : 'Book Visit'}
        </a>
      </div>
    </>
  );
}
