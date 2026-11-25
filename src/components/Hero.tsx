import { useEffect, useRef } from 'react';
import '../styles/hero.css';

/**
 * Set this to the same portrait file CursorReveal shows in the About section
 * (the path inside /public). The card crops it to 4:5 and anchors it near the top so the face stays in frame.
 */
const PORTRAIT_SRC = '/christian.png';

/*
 * Hero = split layout. Left: type. Right: compact portrait card.
 *
 * Layer map of the card (each layer owns exactly one kind of transform, so they never fight):
 *   .hx-card-wrap  static, entrance animation, measured by About's scroll engine
 *   .hx-card       scroll-engine layer (--hc-*): travels / scales / blurs / fades into the About portrait
 *   .hx-tilt       hover-tilt layer (--rx / --ry), driven by the effect below
 *
 * The scroll transition itself is driven from About.tsx, which writes CSS variables onto #home:
 *   --hc-x / --hc-y / --hc-s / --hc-o / --hc-f → .hx-card
 *   --ht-o / --ht-x / --ht-y / --ht-f          → .hx-copy
 *   --hx-v                                     → .hx
 */
export function Hero() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);

  // Hover tilt. Pointer position sets a *target*; a rAF lerp chases it so the card has weight instead of
  // snapping to the cursor. The loop sleeps as soon as it settles. Fine pointers only, never under reduced motion.
  useEffect(() => {
    const wrap = wrapRef.current;
    const tilt = tiltRef.current;
    if (!wrap || !tilt) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const MAX = 6; // degrees
    let tx = 0; // target rotateX
    let ty = 0; // target rotateY
    let cx = 0; // current
    let cy = 0;
    let raf = 0;
    let last = 0;

    const tick = (t: number) => {
      const dt = last ? Math.min(t - last, 50) : 16.7;
      last = t;
      const k = 1 - Math.pow(1 - 0.14, dt / 16.7); // frame-rate independent smoothing
      cx += (tx - cx) * k;
      cy += (ty - cy) * k;

      const settled = Math.abs(tx - cx) < 0.005 && Math.abs(ty - cy) < 0.005;
      if (settled) {
        cx = tx;
        cy = ty;
      }
      tilt.style.setProperty('--rx', `${cx.toFixed(2)}deg`);
      tilt.style.setProperty('--ry', `${cy.toFixed(2)}deg`);

      if (settled) {
        raf = 0;
        last = 0;
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const clamp1 = (v: number) => Math.max(-1, Math.min(1, v));
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const r = wrap.getBoundingClientRect();
      const nx = clamp1(((e.clientX - r.left) / r.width) * 2 - 1);
      const ny = clamp1(((e.clientY - r.top) / r.height) * 2 - 1);
      ty = nx * MAX; // press-the-pad feel: the side under the cursor dips away
      tx = -ny * MAX;
      kick();
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
      kick();
    };

    wrap.addEventListener('pointermove', onMove);
    wrap.addEventListener('pointerleave', onLeave);
    return () => {
      wrap.removeEventListener('pointermove', onMove);
      wrap.removeEventListener('pointerleave', onLeave);
      if (raf) cancelAnimationFrame(raf);
      tilt.style.removeProperty('--rx');
      tilt.style.removeProperty('--ry');
    };
  }, []);

  return (
    <section id="home" className="hx">
      <div className="hx-container">
        <div className="hx-copy">
          <h1 className="hx-title">
            <span className="hx-hello hx-in" style={{ ['--d' as string]: 0 }}>
              Hello, I’m
            </span>
            <span className="hx-line hx-in" style={{ ['--d' as string]: 1 }}>
              Christian
            </span>
            <span className="hx-line hx-grad hx-in" style={{ ['--d' as string]: 2 }}>
              Villanueva
            </span>
          </h1>

          <p className="hx-role hx-in" style={{ ['--d' as string]: 3 }}>
            Full-Stack Web Developer
          </p>

          <p className="hx-lead hx-in" style={{ ['--d' as string]: 4 }}>
            I build complete web applications, from React interfaces on the frontend to Spring Boot backends behind
            them, and I’m a 2nd-year BSIT student working toward becoming a professional software engineer.
          </p>

          <div className="hx-actions hx-in" style={{ ['--d' as string]: 5 }}>
            <a href="#portfolio" className="hx-btn hx-btn--primary">
              View Projects <i className="fa-solid fa-arrow-right" />
            </a>
            <a href="#contact" className="hx-btn hx-btn--ghost">
              Contact Me <i className="fa-regular fa-envelope" />
            </a>
          </div>
        </div>

        <div className="hx-aside">
          <div ref={wrapRef} className="hx-card-wrap hx-in" style={{ ['--d' as string]: 3 }}>
            <figure className="hx-card">
              <div ref={tiltRef} className="hx-tilt">
                <div className="hx-card-media">
                  <img
                    className="hx-card-img"
                    src={PORTRAIT_SRC}
                    alt="Portrait of Christian Villanueva"
                    draggable={false}
                    decoding="async"
                  />
                </div>
                <div className="hx-tag">
                  React <i aria-hidden="true">•</i> Spring Boot
                </div>
              </div>
            </figure>
          </div>
        </div>
      </div>

      <div className="hx-scroll" aria-hidden="true">
        <span>Scroll</span>
        <i />
      </div>
    </section>
  );
}