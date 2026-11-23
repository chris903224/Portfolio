import '../styles/footer.css';

const SOCIALS = [
  { icon: 'fa-brands fa-github', label: 'GitHub', href: 'https://github.com/chris903224' },
  { icon: 'fa-brands fa-tiktok', label: 'TikTok', href: 'https://www.tiktok.com/@chriss.dev' },
  { icon: 'fa-brands fa-instagram', label: 'Instagram', href: 'https://www.instagram.com/chrsvilla_/' },
  { icon: 'fa-solid fa-envelope', label: 'Email', href: 'mailto:christianvillanueva9@gmail.com' },
];

export function Footer() {
  return (
    <footer className="ft">
      <div className="ft-inner">
        <p className="ft-copy">
          © {new Date().getFullYear()} Christian Villanueva
          <span className="ft-sep">·</span>
          Manila, Philippines
          <span className="ft-sep">·</span>
          <a className="ft-site" href="https://chriss-resume.vercel.app/" target="_blank" rel="noopener noreferrer">
            chriss-resume.vercel.app
          </a>
        </p>

        <ul className="ft-social">
          {SOCIALS.map((s) => (
            <li key={s.label}>
              <a
                href={s.href}
                aria-label={s.label}
                {...(s.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                <i className={s.icon} />
              </a>
            </li>
          ))}
        </ul>

        <a className="ft-top" href="#home">
          Back to top <i className="fa-solid fa-arrow-up" />
        </a>
      </div>
    </footer>
  );
}