import { useCallback, useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from 'react';
import { useScrollSpy } from '../hooks/useScrollSpy';

const LINKS = [
  { id: 'home', label: 'Home', icon: 'fa-house' },
  { id: 'about', label: 'About', icon: 'fa-user' },
  { id: 'portfolio', label: 'Portfolio', icon: 'fa-briefcase' },
  { id: 'contact', label: 'Contact', icon: 'fa-envelope' },
];

/** Tinatanggal lahat ng inline CSS vars na iniwang stuck ng About engine sa #home */
function releaseHome() {
  const home = document.getElementById('home');
  if (!home) return;
  ['--hx-v', '--hc-x', '--hc-y', '--hc-s', '--hc-o', '--hc-f', '--ht-o', '--ht-x', '--ht-y', '--ht-f'].forEach((v) =>
    home.style.removeProperty(v),
  );
}

export function Navbar() {
  const [active, setActive] = useState('home');
  const [hovered, setHovered] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [ready, setReady] = useState(false);

  const pillRef = useRef<HTMLSpanElement>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  const target = hovered ?? active;

  const movePill = useCallback(() => {
    const el = linkRefs.current[target];
    const pill = pillRef.current;
    if (!el || !pill) return;
    pill.style.width = `${el.offsetWidth}px`;
    pill.style.transform = `translateX(${el.offsetLeft}px)`;
  }, [target]);

  useScrollSpy(LINKS.map((l) => l.id), setActive);

  useLayoutEffect(() => {
    movePill();
  }, [movePill]);

  useEffect(() => {
    window.addEventListener('resize', movePill);
    document.fonts?.ready.then(movePill);
    return () => window.removeEventListener('resize', movePill);
  }, [movePill]);

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavClick = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();

    const isInsideProject = window.location.hash.includes('/');

    if (isInsideProject) {
      window.location.href = `${window.location.pathname}#${id}`;
      window.location.reload();
      return;
    }

    window.history.pushState('', document.title, `#${id}`);

    document.body.style.overflow = '';
    window.dispatchEvent(new Event('force-close-section'));

    if (id === 'home') releaseHome();

    // Kailangan ng instant scroll para hindi dumaan sa 1020vh ng About section
    setTimeout(() => {
      const el = document.getElementById(id);
      if (!el) return;
      
      if (id === 'home') {
        releaseHome();
        // Gagamit tayo ng window.scrollTo(0,0) para sure na deretso sa pinakataas
        window.scrollTo({ top: 0, behavior: 'auto' });
      } else {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);

    setActive(id);
  };

  return (
    <header className={`nav-header${scrolled ? ' is-scrolled' : ''}`}>
      <nav className="nav" aria-label="Primary">
        <a href="#home" className="nav-logo" onClick={(e) => handleNavClick(e, 'home')}>
          Christian V.
        </a>

        <div className="nav-links" onMouseLeave={() => setHovered(null)}>
          <span ref={pillRef} className={`nav-pill${ready ? ' is-ready' : ''}`} aria-hidden="true" />
          {LINKS.map((l) => (
            <a
              key={l.id}
              ref={(el) => {
                linkRefs.current[l.id] = el;
              }}
              href={`#${l.id}`}
              className={`nav-link${active === l.id ? ' active' : ''}`}
              aria-current={active === l.id ? 'page' : undefined}
              onClick={(e) => handleNavClick(e, l.id)}
              onMouseEnter={() => setHovered(l.id)}
              onFocus={() => setHovered(l.id)}
              onBlur={() => setHovered(null)}
            >
              <i className={`fa-solid ${l.icon}`} />
              <span>{l.label}</span>
            </a>
          ))}
        </div>

        <a href="#contact" className="nav-cta" onClick={(e) => handleNavClick(e, 'contact')}>
          <span>Let's Talk</span>
          <i className="fa-solid fa-arrow-up-right-from-square" />
        </a>
      </nav>
    </header>
  );
}