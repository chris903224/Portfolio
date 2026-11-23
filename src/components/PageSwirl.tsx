import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import '../styles/PageSwirl.css';

export type SwirlPhase = 'in' | 'out' | null;

/**
 * IMPORTANT: the page swap must happen exactly when the "in" animation ends,
 * so use these same numbers in your timeouts (see the patch for Portfolio.tsx).
 */
export const SWIRL_IN_MS = 1700;
export const SWIRL_OUT_MS = 900;

type Props = {
  phase: SwirlPhase;
  /** Name of the page you're navigating TO, e.g. "Certificates". */
  label?: string;
};

/**
 * Cinematic typographic "zoom-through" transition.
 *
 *  "in"  : letterbox bars close in -> the title rises letter by letter while the
 *          camera slowly pushes in -> a light streak sweeps across -> the camera
 *          dives into one letter until it fills the screen.
 *  (swap the page underneath while the screen is fully covered)
 *  "out" : the fill dissolves, the bars open, and the new page is revealed.
 */
export function PageSwirl({ phase, label = 'Portfolio' }: Props) {
  const text = (label.trim() || 'Portfolio').toUpperCase();
  const letters = useMemo(() => Array.from(text), [text]);

  if (!phase) return null;

  const len = letters.length;
  const mid = Math.floor(len / 2);
  // dive into the stem of the middle letter so the zoom lands near screen centre
  const originX = ((mid + 0.14) / len) * 100;

  const style = {
    '--in': `${SWIRL_IN_MS}ms`,
    '--out': `${SWIRL_OUT_MS}ms`,
    '--len': len,
    '--ox': `${originX}%`,
  } as CSSProperties;

  return createPortal(
    <div className={`sw sw--${phase}`} style={style} aria-hidden="true">
      <div className="sw-bg" />
      <div className="sw-glow" />
      <div className="sw-vig" />

      {phase === 'in' && (
        <div className="sw-stage">
          <div className="sw-zoom">
            <div className="sw-word">
              {letters.map((ch, i) =>
                ch === ' ' ? (
                  <span key={i} className="sw-space" />
                ) : (
                  <span key={i} className="sw-mask">
                    <span className="sw-ch" style={{ '--i': i } as CSSProperties}>
                      {ch}
                    </span>
                  </span>
                ),
              )}
            </div>
          </div>
          <span className="sw-streak" />
        </div>
      )}

      <div className="sw-fill" />

      {phase === 'out' && (
        <div className="sw-echo">
          <i className="fa-solid fa-bolt" />
          <b>{text}</b>
        </div>
      )}

      <span className="sw-bar sw-bar--t" />
      <span className="sw-bar sw-bar--b" />
      <span className="sw-grain" />
    </div>,
    document.body,
  );
}