import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useInView } from '../hooks/useInView';
import { Aurora } from './Aurora';
import '../styles/contact.css';

const EMAIL = 'christianvillanueva9@gmail.com';

const LINKS = [
  { icon: 'fa-solid fa-envelope', label: 'Email', value: EMAIL, href: `mailto:${EMAIL}` },
  { icon: 'fa-brands fa-github', label: 'GitHub', value: '@chris903224', href: 'https://github.com/chris903224' },
  { icon: 'fa-brands fa-tiktok', label: 'TikTok', value: '@chriss.dev', href: 'https://www.tiktok.com/@chriss.dev' },
  { icon: 'fa-brands fa-instagram', label: 'Instagram', value: '@chrsvilla_', href: 'https://www.instagram.com/chrsvilla_/' },
  { icon: 'fa-solid fa-globe', label: 'Website', value: 'chriss-resume.vercel.app', href: 'https://chriss-resume.vercel.app/' },
];

export function Contact() {
  const [msg, setMsg] = useState('');
  const [sectionRef, inView] = useInView<HTMLElement>(0.15);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const body = `${f.get('message')}\n\n${f.get('name')} (${f.get('email')})`;
    const subject = `Portfolio message from ${f.get('name')}`;

    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    setMsg('Opening your email app…');
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMsg(''), 4000);
  };

  return (
    <section id="contact" ref={sectionRef} className={`ct${inView ? ' is-in' : ''}`}>
      <Aurora />

      <div className="ct-container">
        
        {/* KALIWA: Info Panel */}
        <div className="ct-panel ct-info" data-reveal style={{ ['--d' as string]: 0 }}>
          <div className="ct-badge">
            <span className="ct-dot" /> Get in touch
          </div>
          <h2 className="ct-title">
            Let's build <br/>something <span className="ct-grad">great.</span>
          </h2>
          <p className="ct-lead">
            Have a project idea or want to collaborate? Send a message or find me online.
          </p>

          <ul className="ct-list">
            {LINKS.map((l) => (
              <li key={l.label}>
                <a
                  className="ct-link"
                  href={l.href}
                  {...(l.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  <span className="ct-ico">
                    <i className={l.icon} />
                  </span>
                  <span className="ct-txt">
                    <small>{l.label}</small>
                    <b>{l.value}</b>
                  </span>
                  <i className="ct-arrow fa-solid fa-arrow-up-right-from-square" />
                </a>
              </li>
            ))}
            <li>
              <div className="ct-link ct-link--static">
                <span className="ct-ico">
                  <i className="fa-solid fa-location-dot" />
                </span>
                <span className="ct-txt">
                  <small>Location</small>
                  <b>Manila, Philippines</b>
                </span>
              </div>
            </li>
          </ul>
        </div>

        {/* KANAN: Form Panel */}
        <div className="ct-panel ct-form-wrapper" data-reveal style={{ ['--d' as string]: 1 }}>
          
          {/* BAGONG HEADLINE PARA SA FORM */}
          <div className="ct-form-head">
            <h3>Send a Message</h3>
            <p>Fill out the form below and I'll get back to you as soon as possible.</p>
          </div>

          <form onSubmit={onSubmit} className="ct-form">
            <div className="ct-row">
              <label className="ct-field">
                <span>Name</span>
                <input required name="name" placeholder="John Doe" autoComplete="name" />
              </label>
              <label className="ct-field">
                <span>Email</span>
                <input required type="email" name="email" placeholder="john@email.com" autoComplete="email" />
              </label>
            </div>
            <label className="ct-field">
              <span>Message</span>
              <textarea required name="message" rows={4} placeholder="Tell me about your project..." />
            </label>
            <button type="submit" className="ct-btn">
              Send Message <i className="fa-solid fa-paper-plane" />
            </button>
            <p className="ct-msg" aria-live="polite">{msg}</p>
          </form>
        </div>

      </div>
    </section>
  );
}