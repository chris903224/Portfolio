import { CursorReveal } from './CursorReveal';
import { useReveal } from '../hooks/useReveal';
import '../styles/about.css';

/* My story, three chapters. Same words as before, now read in one pass instead of one pinned screen each. */
const CHAPTERS = [
  {
    key: 'passion',
    label: 'My passion',
    text: "I'm incredibly passionate about building systems and websites, to the point where simply making something work is never enough for me.",
  },
  {
    key: 'beginning',
    label: 'My beginning',
    text: 'I started learning how to code because I wanted to build an application someday that real users could actually use. Learning backend development was particularly challenging for me, even with AI assistance, but that experience taught me how an application is built from the ground up.',
  },
  {
    key: 'aspiration',
    label: 'My aspiration',
    text: "I'm still a student, and I know I have a lot more to learn. I want to continue improving my skills, expanding my knowledge, and growing as a developer so that one day, I can achieve my dream of becoming a Software Engineer.",
  },
];

/*
 * About = one cohesive section, top to bottom:
 *   1. Heading + the hook, with the code window beside it (it carries the stack)
 *   2. The story: portrait on the left (sticky on desktop), the three chapters and the CTAs on the right
 *
 * There is no pinned scroll track and no scroll engine. The page scrolls normally, the text is real text
 * (no word-by-word illumination to wait through), and each block fades up once as it arrives.
 */
export function About() {
  const ref = useReveal<HTMLElement>();

  return (
    <section id="about" ref={ref} className="ab" aria-labelledby="ab-title">
      <div className="ab-head">
        <div className="ab-copy">
          <h2 id="ab-title" className="ab-title" data-rv>
            About <span className="ab-title-dim">Me</span>
          </h2>
          <p className="ab-hook" data-rv style={{ ['--d' as string]: 1 }}>
            <span>Frontend to backend,</span> <em>one layer at a time.</em>
          </p>
          <p className="ab-code" data-rv style={{ ['--d' as string]: 2 }}>
            <span className="ab-k">const</span> goal <span className="ab-op">=</span>{' '}
            <span className="ab-str">"software engineer"</span>;<span className="ab-caret" aria-hidden="true" />
          </p>
        </div>

        {/* code window (public/code.png): framed, two cards stacked behind, floating tech badges */}
        <div className="ab-stack" data-rv style={{ ['--d' as string]: 2 }}>
          <span className="ab-under ab-under--2" aria-hidden="true" />
          <span className="ab-under ab-under--1" aria-hidden="true" />
          <div className="ab-window">
            <div className="ab-window-bar" aria-hidden="true">
              <span className="ab-dots"><i /><i /><i /></span>
              <span className="ab-window-title">About Me</span>
            </div>
            <img className="ab-window-img" src="/code.png" alt="My code editor" draggable={false} loading="lazy" decoding="async" />
          </div>
          <span className="ab-badge ab-badge--a" aria-hidden="true">React</span>
          <span className="ab-badge ab-badge--b" aria-hidden="true">Spring Boot</span>
          <span className="ab-badge ab-badge--c" aria-hidden="true">TypeScript</span>
        </div>
      </div>

      <div className="ab-story">
        <div className="ab-portrait" data-rv>
          <span className="ab-ghost" aria-hidden="true">CHRISTIAN</span>
          <div className="ab-photo">
            <span className="ab-ring" aria-hidden="true" />
            <CursorReveal stickerSrc="/spiderman.jpg" stickerPos={{ x: 59, y: 19, w: 44 }} />
          </div>
        </div>

        <div className="ab-chapters">
          {CHAPTERS.map((c, i) => (
            <article key={c.key} className="ab-ch" data-rv style={{ ['--d' as string]: Math.min(i, 2) }}>
              <h3 className="ab-ch-title">{c.label}</h3>
              <p className="ab-read">{c.text}</p>
            </article>
          ))}

          <div className="ab-cta" data-rv>
            <a className="ab-btn" href="#portfolio">
              View Projects
            </a>
            <a className="ab-btn ab-btn--ghost" href="/cv.png" target="_blank" rel="noreferrer">
              View CV<span className="ab-sr"> (opens in a new tab)</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}