import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useInView } from '../hooks/useInView';
import { Aurora } from './Aurora';
import '../styles/contact.css';

const EMAIL = 'christianvillanueva9@gmail.com';
const DEFAULT_NOTE = 'Sends through your default email app.';

const LINKS = [
  { icon: 'fa-solid fa-envelope', label: 'Email', value: EMAIL, href: `mailto:${EMAIL}` },
  { icon: 'fa-brands fa-github', label: 'GitHub', value: '@chris903224', href: 'https://github.com/chris903224' },
  { icon: 'fa-brands fa-tiktok', label: 'TikTok', value: '@chriss.dev', href: 'https://www.tiktok.com/@chriss.dev' },
  { icon: 'fa-brands fa-instagram', label: 'Instagram', value: '@chrsvilla_', href: 'https://www.instagram.com/chrsvilla_/' },
  { icon: 'fa-solid fa-globe', label: 'Website', value: 'chriss-resume.vercel.app', href: 'https://chriss-resume.vercel.app/' },
];

export function Contact() {
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [sectionRef, inView] = useInView<HTMLElement>(0.15);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sending) return;

    const f = new FormData(e.currentTarget);
    const name = String(f.get('name') ?? '').trim();
    const email = String(f.get('email') ?? '').trim();
    const message = String(f.get('message') ?? '').trim();

    const subject = `Portfolio message from ${name}`;
    const body = `${message}\n\n${name} (${email})`;

    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    setSending(true);
    setMsg('Opening your email app…');
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setMsg('');
      setSending(false);
    }, 4000);
  };

  return (
    <section id="contact" ref={sectionRef} className={`ct${inView ? ' is-in' : ''}`} aria-labelledby="contact-title">
      <Aurora />

      <div className="ct-container">
        {/* LEFT: info panel */}
        <div className="ct-panel ct-info" data-reveal style={{ ['--d' as string]: 0 }}>
          <div className="ct-head">
            <h2 id="contact-title" className="ct-title">
              Let&rsquo;s build <br />
              something <span className="ct-grad">great.</span>
            </h2>
            <p className="ct-lead">
              Have a project idea or want to collaborate? Send a message or find me online.
            </p>
          </div>

          <ul className="ct-list">
            {LINKS.map((l) => {
              const external = l.href.startsWith('http');
              return (
                <li key={l.label}>
                  <a
                    className="ct-link"
                    href={l.href}
                    {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    <span className="ct-ico" aria-hidden="true">
                      <i className={l.icon} />
                    </span>
                    <span className="ct-txt">
                      <small>{l.label}</small>
                      <b>{l.value}</b>
                    </span>
                    <i className="ct-arrow fa-solid fa-arrow-up-right-from-square" aria-hidden="true" />
                    {external && <span className="ct-sr">(opens in a new tab)</span>}
                  </a>
                </li>
              );
            })}
            <li>
              <div className="ct-link ct-link--static">
                <span className="ct-ico" aria-hidden="true">
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

        {/* RIGHT: form panel */}
        <div className="ct-panel ct-form-wrapper" data-reveal style={{ ['--d' as string]: 1 }}>
          <div className="ct-head ct-form-head">
            <h3>Send a Message</h3>
            <p>Fill out the form below and I&rsquo;ll get back to you as soon as possible.</p>
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

            <label className="ct-field ct-field--grow">
              <span>Message</span>
              <textarea required name="message" rows={5} placeholder="Tell me about your project…" />
            </label>

            <button type="submit" className="ct-btn" disabled={sending}>
              {sending ? 'Opening…' : 'Send Message'}
              <i className="fa-solid fa-paper-plane" aria-hidden="true" />
            </button>

            <p className={`ct-msg${msg ? ' is-active' : ''}`} role="status" aria-live="polite">
              {msg || DEFAULT_NOTE}
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}