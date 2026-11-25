import { Fragment, useEffect, useRef, useState } from 'react';
import '../styles/loading.css';

const NAME = 'Christian Villanueva';

/* Timeline (ms). The whole screen lasts TOTAL_MS from the moment it mounts:
   progress runs 0 → 100 for PROGRESS_MS, then the curtain lifts for EXIT_MS and onComplete fires. */
const TOTAL_MS = 5000;
const EXIT_MS = 800;
const PROGRESS_MS = TOTAL_MS - EXIT_MS;
const LETTER_STEP_MS = 85; // gap between letters (also read by loading.css as --ls)
const TILT_MAX = 12; // degrees the 3D rings follow the mouse

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [ready, setReady] = useState(false); // fonts settled → letters may start
  const [exiting, setExiting] = useState(false);

  const fillRef = useRef<HTMLElement>(null);
  const countRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  // Keep the latest callback without restarting the timeline when the parent re-renders.
  const doneRef = useRef(onComplete);
  useEffect(() => {
    doneRef.current = onComplete;
  }, [onComplete]);

  // 1. Wait for the italic serif before the letters write themselves in (capped, so it never blocks the 5s).
  useEffect(() => {
    let alive = true;
    const go = () => alive && setReady(true);
    const cap = window.setTimeout(go, 900);
    if ('fonts' in document) {
      document.fonts.load('italic 1em "Instrument Serif"').then(go, go);
    } else {
      go();
    }
    return () => {
      alive = false;
      window.clearTimeout(cap);
    };
  }, []);

  // 2. Lock page scroll while the screen is up.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // 3. Progress + exit. Writes straight to the DOM each frame, so React never re-renders for the counter.
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    let exitTimer = 0;
    let exited = false;

    const frame = (now: number) => {
      const t = Math.min((now - start) / PROGRESS_MS, 1);
      const p = easeInOutCubic(t);
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${p})`;
      if (countRef.current) countRef.current.textContent = String(Math.round(p * 100)).padStart(3, '0');

      if (t < 1) {
        raf = requestAnimationFrame(frame);
      } else if (!exited) {
        exited = true;
        setExiting(true);
        exitTimer = window.setTimeout(() => doneRef.current(), EXIT_MS);
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(exitTimer);
    };
  }, []);

  // 4. 3D parallax: the ring group leans toward the mouse. Fine pointers only, never under reduced motion.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const onMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      stage.style.setProperty('--tx', `${(nx * TILT_MAX).toFixed(2)}deg`);
      stage.style.setProperty('--ty', `${(-ny * TILT_MAX).toFixed(2)}deg`);
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  let n = 0; // letter index across the whole name (spaces add no delay)

  return (
    <div
      className={`ld${ready ? ' is-on' : ''}${exiting ? ' is-exit' : ''}`}
      role="status"
      aria-live="polite"
      aria-busy={!exiting}
      style={{ ['--ls' as string]: `${LETTER_STEP_MS}ms`, ['--exit' as string]: `${EXIT_MS}ms` }}
    >
      <span className="ld-sr">Loading portfolio</span>

      <div className="ld-content" aria-hidden="true">
        <div className="ld-stage">
          <div className="ld-tilt" ref={stageRef}>
            <span className="ld-ring ld-ring--a" />
            <span className="ld-ring ld-ring--b" />
            <span className="ld-ring ld-ring--c" />
            <span className="ld-core" />
          </div>
        </div>

        <p className="ld-name">
          {NAME.split(' ').map((word, wi) => (
            <Fragment key={wi}>
              {wi > 0 && ' '}
              <span className="ld-word">
                {Array.from(word).map((ch, ci) => (
                  <span key={ci} className="ld-letter" style={{ ['--i' as string]: n++ }}>
                    {ch}
                  </span>
                ))}
              </span>
            </Fragment>
          ))}
        </p>

        <div className="ld-meter">
          <div className="ld-bar">
            <i ref={fillRef} />
          </div>
          <div className="ld-row">
            <span>Loading</span>
            <span className="ld-count">
              <b ref={countRef}>000</b>%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}