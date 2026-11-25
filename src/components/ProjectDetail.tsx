import { useCallback, useEffect, useId, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { createPortal } from 'react-dom';
import type { Project } from '../types';
import { TechPill } from './TechBadges';
import '../styles/project-detail.css';

// Optional fields — add them to your Project type (and data) whenever you want them to show up.
type Extra = { images?: string[]; liveUrl?: string; repoUrl?: string };

type Props = {
  project: Project;
  index: number;
  total: number;
  next: Project;
  onClose: () => void;
  onNavigate: (p: Project) => void;
};

const EXIT_MS = 160; // keep in sync with --pdm-exit in project-detail.css
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function ProjectDetail({ project, index, total, next, onClose, onNavigate }: Props) {
  const { images, liveUrl, repoUrl } = project as Project & Extra;

  const titleId = useId();
  const cardRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const closingRef = useRef(false);
  const timerRef = useRef<number>(0);
  const pressedOnBackdrop = useRef(false);
  const dragStart = useRef<number | null>(null);

  const [closing, setClosing] = useState(false);
  const [shot, setShot] = useState(0);
  const [broken, setBroken] = useState<Record<string, boolean>>({});

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const gallery = useMemo(
    () => (images?.length ? images : project.image ? [project.image] : []),
    [images, project.image],
  );
  const shots = gallery.filter((g) => !broken[g]); // a screenshot that fails to load simply drops out
  const active = Math.min(shot, Math.max(shots.length - 1, 0));
  const src = shots[active];
  const paragraphs = (project.longDescription || project.description).split(/\n{2,}/);
  const hasFooter = total > 1 || Boolean(liveUrl || repoUrl);

  // Close with a short exit animation (instant when the user prefers reduced motion).
  const requestClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    if (prefersReducedMotion()) {
      onCloseRef.current();
      return;
    }
    setClosing(true);
    timerRef.current = window.setTimeout(() => onCloseRef.current(), EXIT_MS);
  }, []);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  // Phones: drag the top bar down to dismiss the sheet. Uses `translate` so it never fights the entrance animation.
  const dragMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragStart.current === null || !cardRef.current) return;
    const dy = Math.max(0, e.clientY - dragStart.current);
    cardRef.current.style.translate = `0 ${dy}px`;
  };
  const dragEnd = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragStart.current === null || !cardRef.current) return;
    const dy = e.clientY - dragStart.current;
    dragStart.current = null;
    delete cardRef.current.dataset.drag;
    if (dy > 80) requestClose();
    else cardRef.current.style.translate = '';
  };

  // Scroll lock (without the page jumping sideways) + move focus into the dialog.
  useEffect(() => {
    const { body, documentElement } = document;
    const prevOverflow = body.style.overflow;
    const prevPadding = body.style.paddingRight;
    const scrollbar = window.innerWidth - documentElement.clientWidth;
    body.style.overflow = 'hidden';
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
    cardRef.current?.focus({ preventScroll: true });
    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPadding;
    };
  }, []);

  // Keyboard: Esc closes, Tab stays inside the dialog, ← → flip through screenshots.
  useEffect(() => {
    const count = shots.length;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        requestClose();
        return;
      }
      if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && count > 1) {
        const step = e.key === 'ArrowRight' ? 1 : -1;
        setShot((s) => (Math.min(s, count - 1) + step + count) % count);
        return;
      }
      if (e.key !== 'Tab') return;
      // only visible controls (the mobile bar and the desktop X swap with a media query)
      const nodes = Array.from(cardRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).filter(
        (n) => n.offsetParent !== null,
      );
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const current = document.activeElement;
      if (e.shiftKey && (current === first || current === cardRef.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && current === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [requestClose, shots.length]);

  return createPortal(
    <div
      className={`pdm${closing ? ' is-closing' : ''}`}
      // Only a press *and* release on the dim backdrop closes it, so selecting text and letting go outside doesn't.
      onPointerDown={(e) => {
        pressedOnBackdrop.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        if (pressedOnBackdrop.current && e.target === e.currentTarget) requestClose();
      }}
    >
      <div
        ref={cardRef}
        className="pdm-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <div className="pdm-bar">
          <div
            className="pdm-grab"
            onPointerDown={(e) => {
              dragStart.current = e.clientY;
              if (cardRef.current) cardRef.current.dataset.drag = '1';
              e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onPointerMove={dragMove}
            onPointerUp={dragEnd}
            onPointerCancel={dragEnd}
            aria-hidden="true"
          >
            <span className="pdm-handle" />
          </div>
          <button type="button" className="pdm-bar-close" onClick={requestClose}>
            Close
          </button>
        </div>

        <button type="button" className="pdm-close" onClick={requestClose} aria-label="Close project details">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <div className="pdm-scroll">
          <div className="pdm-media">
            <div className="pdm-stage">
              {src ? (
                <img
                  key={src}
                  src={src}
                  alt={`${project.title} screenshot ${active + 1} of ${shots.length}`}
                  onError={() => setBroken((b) => ({ ...b, [src]: true }))}
                />
              ) : (
                <div className="pdm-fallback" style={{ background: project.gradient }}>
                  <i className={`fa-solid ${project.icon}`} aria-hidden="true" />
                </div>
              )}
            </div>

            {shots.length > 1 && (
              <div className="pdm-thumbs" role="tablist" aria-label="Project screenshots">
                {shots.map((g, i) => (
                  <button
                    key={g}
                    type="button"
                    role="tab"
                    aria-selected={i === active}
                    aria-label={`Screenshot ${i + 1}`}
                    className={`pdm-thumb${i === active ? ' is-active' : ''}`}
                    onClick={() => setShot(i)}
                  >
                    <img src={g} alt="" onError={() => setBroken((b) => ({ ...b, [g]: true }))} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="pdm-body">
            <h2 id={titleId} className="pdm-title">
              {project.title}
            </h2>
            <span className="pdm-sr">{`Project ${index + 1} of ${total}`}</span>

            <div className="pdm-copy">
              {paragraphs.map((t, i) => (
                <p key={i}>{t}</p>
              ))}
            </div>

            <section className="pdm-stack" aria-label="Tech stack">
              <h3 className="pdm-label" aria-hidden="true">
                Tech stack
              </h3>
              <div className="tb-row">
                {project.tech.map((t) => (
                  <TechPill key={t} name={t} />
                ))}
              </div>
            </section>
          </div>
        </div>

        {hasFooter && (
          <footer className="pdm-foot">
            {total > 1 ? (
              <button type="button" className="pdm-next" onClick={() => onNavigate(next)}>
                <span className="pdm-next-text">
                  <small>Next project</small>
                  <strong>{next.title}</strong>
                </span>
                <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </button>
            ) : (
              <span />
            )}

            {(liveUrl || repoUrl) && (
              <div className="pdm-actions">
                {repoUrl && (
                  <a className="pdm-btn pdm-btn--ghost" href={repoUrl} target="_blank" rel="noreferrer">
                    <i className="fa-brands fa-github" aria-hidden="true" /> Source code
                  </a>
                )}
                {liveUrl && (
                  <a className="pdm-btn pdm-btn--primary" href={liveUrl} target="_blank" rel="noreferrer">
                    Live demo <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" />
                  </a>
                )}
              </div>
            )}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  );
}