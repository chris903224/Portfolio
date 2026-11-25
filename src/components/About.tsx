import { useEffect, useRef } from 'react';
import { CursorReveal } from './CursorReveal';
import '../styles/about.css';

/* My story: three chapters, each gets its own full-screen moment and its own scroll window. */
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
].map((c) => ({ ...c, words: c.text.split(/\s+/) }));

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const clamp01 = (v: number) => clamp(v, 0, 1);
const ramp = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
const ease = (t: number) => t * t * (3 - 2 * t);

/*
 * Scene 1 and 2 timing was authored when the pinned length was 3.2 viewport heights.
 * `p` keeps those units (p = 1 ↔ 3.2vh of pinned scroll) so their feel is unchanged
 * now that the section is longer. `p` simply keeps counting past 1 for Scene 3.
 */
const LEGACY_PIN = 3.2;

/*
 * The timeline (T below, LEGACY_PIN above) is authored in "desktop units": 9.2 viewport heights of pinned scroll.
 * This number is a constant on purpose. The real track length changes per device (1020svh on desktop,
 * 100 + --ab-track on mobile, see about.css), but x (0 → 1) always spans the whole track, so
 * s = x * DESKTOP_PIN plays the full timeline on any track length. Desktop is unchanged because its track is 9.2 already.
 */
const DESKTOP_PIN = 9.2;

/*
 * Scene 3 chapter windows, in viewport heights of pinned scroll (s = 0 at the moment the stage pins).
 * Chapter 1's entrance is the Scene 3 entrance itself (p .58–.70 → s 1.86–2.24).
 * Pinned length is 9.2vh, which is why .ab is 1020svh tall in about.css (100 + 920).
 */
const T = {
  ch1: { read: [2.25, 3.35], exit: [3.8, 4.3] },
  ch2: { enter: [3.9, 4.4], read: [4.45, 5.95], exit: [6.35, 6.85] },
  ch3: { enter: [6.45, 6.95], read: [7.0, 8.4] },
} as const;
const win = (s: number, [a, b]: readonly [number, number] | readonly number[]) => ramp(s, a, b);

/*
 * Scroll timeline
 * ───────────────
 * x is the raw scroll position of the section, NOT clamped at 0:
 *   x < 0  → "approach": the section is still entering from below, the Hero is leaving (x = -k … 0)
 *   x ≥ 0  → "pinned":   the stage is sticky, x runs 0 → 1 (s = x · DESKTOP_PIN, in vh of "desktop" pinned scroll)
 * k = viewportHeight / pinnedScrollLength, i.e. the approach expressed in the same units as x.
 *
 *   approach  a 0 → 1      HERO → PORTRAIT hand-off (the Hero is pinned; this section slides up over it):
 *                            a .00–.60  Hero copy drifts left and dissolves
 *                            a .00–.85  Hero card travels to the screen centre, scales up to the portrait's size, blurs
 *                            a .50–.92  Hero card fades out …
 *                            a .12–.62  … while Scene 1's portrait fades in underneath/over it, scale .75 → 1,
 *                                       glide up, blur → sharp, ring spins up, CHRISTIAN sweeps across
 *   p .00–.16              portrait holds (ring keeps spinning, ghost keeps sweeping)
 *   p .16–.30              portrait pushes through + fades  ┐ cross-fade
 *   p .20–.34              Scene 2 (code window) flips in   ┘
 *   p .56–.68              Scene 2 leaves
 *   p .58–.70              Scene 3 enters (chapter 1 is already in place)
 *
 *   Scene 3, in vh of pinned scroll (see T above):
 *   s 2.25–3.35            ch 1  "My passion"      words light up
 *   s 3.80–4.30            ch 1 pushes up + blurs out   ┐ cross-fade
 *   s 3.90–4.40            ch 2 rises in, blur → sharp  ┘
 *   s 4.45–5.95            ch 2  "My beginning"    words light up
 *   s 6.35–6.85            ch 2 leaves              ┐ cross-fade
 *   s 6.45–6.95            ch 3 enters              ┘
 *   s 7.00–8.40            ch 3  "My aspiration"   words light up, then the CTA appears
 */
export function About() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; // CSS shows a static version

    let target = 0;
    let current = 0;
    let raf = 0;
    let k = 0.1; // approach length in x-units (updated in measure)
    let vw = window.innerWidth;
    let seen2 = false;

    const set = (name: string, v: string) => el.style.setProperty(name, v);

    // Sticky stage: its height is the true viewport on mobile (100dvh), so the track length is measured against it
    const stage = el.querySelector<HTMLElement>('.ab-stage');

    // Hero hand-off: the engine owns a handful of CSS variables on #home (see Hero.tsx / hero.css)
    const hero = document.getElementById('home');
    const heroCard = hero?.querySelector<HTMLElement>('.hx-card-wrap') ?? null;
    const heroVars = ['--hc-x', '--hc-y', '--hc-s', '--hc-o', '--hc-f', '--ht-o', '--ht-x', '--ht-y', '--ht-f', '--hx-v'];
    const hset = (name: string, v: string) => hero?.style.setProperty(name, v);
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    let cardDX = 0; // px the card must travel to reach the portrait's centre
    let cardDY = 0;
    let cardS = 1.4; // scale at which the card matches the portrait's height

    // Generic scene (used by Scenes 2 and 3): fade/slide/scale + a Y-axis flip
    const scene = (n: number, enter: number, exit: number) => {
      const o = enter * (1 - exit);
      set(`--o${n}`, o.toFixed(3));
      set(`--y${n}`, `${((1 - enter) * 60 - exit * 60).toFixed(1)}px`);
      set(`--s${n}`, (0.92 + 0.08 * enter - 0.06 * exit).toFixed(3));
      set(`--r${n}`, `${((1 - enter) * -26 + exit * 26).toFixed(1)}deg`);
      set(`--v${n}`, o > 0.01 ? 'visible' : 'hidden');
      set(`--e${n}`, o > 0.5 ? 'auto' : 'none');
      return o;
    };

    // Story chapter (inside Scene 3): rises in from below out of focus, pushes up and blurs out.
    // Same "dolly" language as the portrait: it leaves by moving toward the viewer.
    const chapter = (n: number, enter: number, exit: number, read: number) => {
      const o = enter * (1 - exit);
      const blur = (1 - enter) * 14 + exit * 12;
      set(`--c${n}o`, o.toFixed(3));
      set(`--c${n}y`, `${((1 - enter) * 70 - exit * 70).toFixed(1)}px`);
      set(`--c${n}s`, (0.96 + 0.04 * enter + 0.04 * exit).toFixed(3));
      set(`--c${n}f`, blur > 0.05 ? `blur(${blur.toFixed(1)}px)` : 'none');
      set(`--c${n}v`, o > 0.01 ? 'visible' : 'hidden');
      set(`--rd${n}`, read.toFixed(4)); // this chapter's word-illumination progress
    };

    // Scene 1: the portrait. One continuous dolly: it arrives from below and from far away,
    // settles into focus, then keeps pushing forward and dissolves into Scene 2.
    const portrait = (a: number, p: number) => {
      const arrive = ease(ramp(a, 0.12, 0.62)); // opacity waits for the Hero card to get its moment…
      const settle = ease(a); //                 …scale / glide / focus take the whole approach
      const leave = ease(ramp(p, 0.16, 0.3));

      const o = arrive * (1 - leave);
      const blur = (1 - settle) * 12 + leave * 10;

      set('--o1', o.toFixed(3));
      set('--y1', `${((1 - settle) * 160 - leave * 70).toFixed(1)}px`);
      set('--s1', (0.75 + 0.25 * settle + 0.08 * leave).toFixed(3));
      set('--f1', blur > 0.05 ? `blur(${blur.toFixed(1)}px)` : 'none');
      set('--v1', o > 0.01 ? 'visible' : 'hidden');
      set('--e1', o > 0.5 ? 'auto' : 'none');
    };

    // Hero side of the hand-off. The card travels to where the portrait will land, grows to the portrait's size,
    // blurs and fades; the copy drifts left and dissolves. Neutral values at a = 0, so the Hero rests untouched.
    const heroTransition = (a: number) => {
      if (!hero) return;
      const travel = ease(ramp(a, 0, 0.85));
      const cardBlur = ease(ramp(a, 0.25, 0.9)) * 14;
      const textOut = ease(ramp(a, 0.05, 0.6));
      const textBlur = textOut * 8;

      hset('--hc-x', `${(cardDX * travel).toFixed(1)}px`);
      hset('--hc-y', `${(cardDY * travel).toFixed(1)}px`);
      hset('--hc-s', (1 + (cardS - 1) * travel).toFixed(3));
      hset('--hc-o', (1 - ease(ramp(a, 0.5, 0.92))).toFixed(3));
      hset('--hc-f', cardBlur > 0.05 ? `blur(${cardBlur.toFixed(1)}px)` : 'none');

      hset('--ht-o', (1 - textOut).toFixed(3));
      hset('--ht-x', `${(-travel * 40).toFixed(1)}px`);
      hset('--ht-y', `${(-ease(ramp(a, 0, 0.7)) * 36).toFixed(1)}px`);
      hset('--ht-f', textBlur > 0.05 ? `blur(${textBlur.toFixed(1)}px)` : 'none');

      hset('--hx-v', a > 0.985 ? 'hidden' : 'visible'); // fully covered: stop painting it
    };

    const apply = (x: number) => {
      const s = Math.max(0, x) * DESKTOP_PIN; // pinned scroll in desktop viewport heights; x spans the real track, so the whole timeline always plays
      const p = s / LEGACY_PIN; //         legacy pinned progress (Scenes 1–2 windows); runs past 1
      const a = ramp(x, -k, 0); //         approach progress

      // Hero → portrait hand-off, then Scene 1 itself (+ ring + ghost)
      heroTransition(a);
      portrait(a, p);

      // Scenes 2 and 3 — same crossfade windows as before, with the code window in the middle
      const o2 = scene(2, ease(ramp(p, 0.2, 0.34)), ease(ramp(p, 0.56, 0.68)));
      scene(3, ease(ramp(p, 0.58, 0.7)), 0);

      // Start the code window's entrance stagger the first time it becomes visible
      if (!seen2 && o2 > 0.05) {
        seen2 = true;
        el.classList.add('ab--s2');
      }

      // Portrait life = approach + first 30% of the legacy pinned scroll
      const life = ramp(p, 0, 0.3);
      const sweep = a * 0.45 + life * 0.55; // 0 → 1 across the whole portrait scene

      set('--rot', (a * 540 + life * 900).toFixed(1)); //            ring: 4 full turns, fastest while arriving
      set('--rs', (0.55 + 0.45 * ease(ramp(a, 0.1, 0.9))).toFixed(3)); // ring grows into place
      set('--par', ((0.5 - sweep) * vw * 1.2).toFixed(1)); //        ghost text: right edge → left edge of the screen
      set('--gs', (1.3 - sweep * 0.35).toFixed(3)); //               ghost settles back as it sweeps

      set('--spread', ease(ramp(p, 0.22, 0.46)).toFixed(3)); // code-window layers separate as Scene 2 arrives

      // Scene 3 chapters: one paragraph on screen at a time (cross-fades overlap only while swapping)
      chapter(1, 1, ease(win(s, T.ch1.exit)), win(s, T.ch1.read));
      chapter(2, ease(win(s, T.ch2.enter)), ease(win(s, T.ch2.exit)), win(s, T.ch2.read));
      const read3 = win(s, T.ch3.read);
      chapter(3, ease(win(s, T.ch3.enter)), 0, read3);

      // CTA appears once the last paragraph has finished lighting up
      const cta = clamp01((read3 - 0.9) * 10);
      set('--cta', cta.toFixed(3));
      set('--ce', cta > 0.5 ? 'auto' : 'none');
      set('--cv', cta > 0.01 ? 'visible' : 'hidden');
    };

    const frame = () => {
      raf = 0;
      current += (target - current) * 0.14; // easing → smooth even with a jumpy wheel
      if (Math.abs(target - current) < 0.00015) current = target;
      apply(current);
      if (current !== target) raf = requestAnimationFrame(frame);
    };

    const measure = () => {
      const vh = window.innerHeight;
      vw = window.innerWidth;

      // Where the card is vs. where the portrait lands (viewport centre, nudged for Scene 1's padding).
      // The wrapper is never transformed by this engine, so its rect is the card's resting position.
      if (heroCard) {
        const r = heroCard.getBoundingClientRect();
        // mirrors --ph in about.css (mobile query is 768px, matching the mobile block at the end of the file)
        const ph = vw <= 768 ? Math.min(vh * 0.62, 30 * rem) : Math.min(vh * 0.76, 46 * rem);
        cardDX = vw / 2 - (r.left + r.width / 2);
        cardDY = vh / 2 + 1.5 * rem - (r.top + r.height / 2);
        cardS = r.height > 0 ? clamp(ph / r.height, 1.15, 1.8) : 1.4;
      }

      // Track length = section height minus the sticky stage height (falls back to the viewport height).
      const total = el.offsetHeight - (stage?.offsetHeight || vh);
      if (total <= 0) {
        target = 0;
        return;
      }
      k = vh / total;
      target = clamp(-el.getBoundingClientRect().top / total, -k, 1);
    };
    const onScroll = () => {
      measure();
      if (!raf) raf = requestAnimationFrame(frame);
    };

    measure();
    current = target;
    apply(current);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
      heroVars.forEach((v) => hero?.style.removeProperty(v));
    };
  }, []);

  return (
    <section id="about" ref={ref} className="ab">
      <div className="ab-stage">
        <div className="ab-bg" aria-hidden="true">
          <span className="ab-blob ab-blob--a" />
          <span className="ab-blob ab-blob--b" />
          <span className="ab-arc ab-arc--a" />
          <span className="ab-arc ab-arc--b" />
          <span className="ab-grid" />
          <span className="ab-grain" />
        </div>

        {/* Full story as plain text for assistive tech: the animated chapters below are aria-hidden word spans. */}
        <div className="ab-sr">
          {CHAPTERS.map((c) => (
            <p key={c.key}>{c.text}</p>
          ))}
        </div>

        {/* ───────── Scene 1 — portrait (first thing after the Hero) ───────── */}
        <div className="ab-scene ab-scene--1">
          <span className="ab-ghost" aria-hidden="true">CHRISTIAN</span>
          <div className="ab-photo">
            <span className="ab-ring" aria-hidden="true" />
            <CursorReveal stickerSrc="/spiderman.jpg" stickerPos={{ x: 59, y: 19, w: 44 }} />
          </div>
        </div>

        {/* ───────── Scene 2 — hook + code window ───────── */}
        <div className="ab-scene ab-scene--2">
          <div className="ab-s1">
            <div className="ab-copy">
              <span className="ab-eyebrow ab-in" style={{ ['--d' as string]: 0 }}>About Me</span>
              <h2 className="ab-title">
                <span className="ab-names">
                  <span className="ab-name ab-name--hook ab-in" style={{ ['--d' as string]: 1 }}>Frontend to backend,</span>
                  <span className="ab-name ab-name--hook ab-name--serif ab-in" style={{ ['--d' as string]: 2 }}>one layer at a time.</span>
                </span>
              </h2>
              <p className="ab-code ab-in" style={{ ['--d' as string]: 3 }}>
                <span className="ab-k">const</span> goal <span className="ab-op">=</span>{' '}
                <span className="ab-str">"software engineer"</span>;<span className="ab-caret" aria-hidden="true" />
              </p>
            </div>

            {/* code window (public/code.png): framed + tilted, 2 cards stacked behind, floating tech badges */}
            <div className="ab-stack ab-in" style={{ ['--d' as string]: 2 }}>
              <div className="ab-tilt">
                <span className="ab-under ab-under--2" aria-hidden="true" />
                <span className="ab-under ab-under--1" aria-hidden="true" />
                <div className="ab-window">
                  <div className="ab-window-bar" aria-hidden="true">
                    <span className="ab-dots"><i /><i /><i /></span>
                    <span className="ab-window-title">About Me</span>
                  </div>
                  <img className="ab-window-img" src="/code.png" alt="My code editor" draggable={false} />
                </div>
              </div>
              <span className="ab-badge ab-badge--a" aria-hidden="true">React</span>
              <span className="ab-badge ab-badge--b" aria-hidden="true">Spring Boot</span>
              <span className="ab-badge ab-badge--c" aria-hidden="true">Typescript</span>
            </div>
          </div>
        </div>

        {/* ───────── Scene 3 — story: three chapters, one paragraph on screen at a time ───────── */}
        <div className="ab-scene ab-scene--3">
          <div className="ab-s3">
            {CHAPTERS.map((c, i) => (
              <div key={c.key} className={`ab-ch ab-ch--${i + 1}`}>
                <span className="ab-label" aria-hidden="true">
                  <span className="ab-num">{`0${i + 1}`}</span>
                  <span className="ab-rule" />
                  {c.label}
                </span>
                <p className="ab-read" aria-hidden="true" style={{ ['--n' as string]: c.words.length }}>
                  {c.words.map((w, j) => (
                    <span key={j}>
                      <span className="ab-word" style={{ ['--i' as string]: j }}>
                        {w}
                      </span>{' '}
                    </span>
                  ))}
                </p>
                {i === CHAPTERS.length - 1 && (
                  <div className="ab-cta ab-cta--end">
                    <a className="ab-btn" href="#portfolio">
                      View Projects
                    </a>
                    <a className="ab-btn ab-btn--ghost" href="/cv.png" target="_blank" rel="noreferrer">
                      View CV
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* chapter progress: each bar fills as its paragraph is read */}
          <div className="ab-prog" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
        </div>
      </div>
    </section>
  );
}