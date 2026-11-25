import '../styles/footer.css';

const EMAIL = 'christianvillanueva9@gmail.com';
const SITE = { label: 'chriss-resume.vercel.app', href: 'https://chriss-resume.vercel.app/' };

const NAV = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'View CV', href: '/cv.pdf', external: true },
];

const SOCIALS = [
  { icon: 'fa-brands fa-github', label: 'GitHub', href: 'https://github.com/chris903224' },
  { icon: 'fa-brands fa-tiktok', label: 'TikTok', href: 'https://www.tiktok.com/@chriss.dev' },
  { icon: 'fa-brands fa-instagram', label: 'Instagram', href: 'https://www.instagram.com/chrsvilla_/' },
];

export function Footer() {
  return (
    <footer className="ft">
      <div className="ft-inner">
        <div className="ft-main">
          <div className="ft-id">
            <p className="ft-name">Christian Villanueva</p>
            <p className="ft-tag">Frontend to backend, one layer at a time.</p>
          </div>

          <nav className="ft-nav" aria-label="Footer">
            <ul>
              {NAV.map((n) => (
                <li key={n.label}>
                  <a href={n.href} {...(n.external ? { target: '_blank', rel: 'noreferrer' } : {})}>
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ft-contact">
            <ul className="ft-social">
              {SOCIALS.map((s) => (
                <li key={s.label}>
                  <a href={s.href} aria-label={s.label} target="_blank" rel="noopener noreferrer">
                    <i className={s.icon} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
            <a className="ft-btn" href={`mailto:${EMAIL}`} title={EMAIL}>
              Email me
            </a>
          </div>
        </div>

        <div className="ft-bar">
          <div className="ft-legal">
            <p>&copy; {new Date().getFullYear()} Christian Villanueva</p>
            <p>Manila, Philippines</p>
            <a className="ft-site" href={SITE.href} target="_blank" rel="noopener noreferrer">
              {SITE.label}
            </a>
          </div>
          <a className="ft-top-link" href="#home">
            Back to top <i className="fa-solid fa-arrow-up" aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}