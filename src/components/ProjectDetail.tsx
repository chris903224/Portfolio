import { useEffect, useMemo, useRef, useState } from 'react';
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

const pad = (n: number) => String(n).padStart(2, '0');

export function ProjectDetail({ project, index, total, next, onClose, onNavigate }: Props) {
  const { images, liveUrl, repoUrl } = project as Project & Extra;

  const gallery = useMemo(
    () => (images?.length ? images : project.image ? [project.image] : []),
    [images, project.image],
  );
  const [shot, setShot] = useState(0);
  const [broken, setBroken] = useState<Record<string, boolean>>({});
  const backRef = useRef<HTMLButtonElement>(null);

  const src = gallery[shot];
  const showImage = Boolean(src) && !broken[src];
  const paragraphs = (project.longDescription || project.description).split(/\n{2,}/);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; // the page behind must not scroll
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    backRef.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return createPortal(
    <div className="pd" role="dialog" aria-modal="true" aria-label={`${project.title} — project details`}>
      <div className="pd-bg" aria-hidden="true">
        <span className="pd-orb pd-orb--a" style={{ background: project.gradient }} />
        <span className="pd-orb pd-orb--b" />
        <span className="pd-grid-bg" />
      </div>

      <div className="pd-scroll">
        <div className="pd-inner">
          <div className="pd-top pd-rise" style={{ ['--i' as string]: 0 }}>
            <button ref={backRef} className="pd-back" onClick={onClose}>
              <i className="fa-solid fa-arrow-left" /> Back to Portfolio
            </button>
            <span className="pd-count">
              {pad(index + 1)} <em>/ {pad(total)}</em>
            </span>
          </div>

          <div className="pd-layout">
            {/* ───────── LEFT: details ───────── */}
            <div className="pd-left">
              <span className="pd-eyebrow pd-rise" style={{ ['--i' as string]: 1 }}>
                <span className="pd-dot" /> Featured Project
              </span>

              <h1 className="pd-title pd-rise" style={{ ['--i' as string]: 2 }}>
                {project.title}
              </h1>

              <div className="pd-copy pd-rise" style={{ ['--i' as string]: 3 }}>
                {paragraphs.map((t, i) => (
                  <p key={i}>{t}</p>
                ))}
              </div>

              {(liveUrl || repoUrl) && (
                <div className="pd-actions pd-rise" style={{ ['--i' as string]: 4 }}>
                  {liveUrl && (
                    <a className="pd-btn pd-btn--primary" href={liveUrl} target="_blank" rel="noreferrer">
                      Live Demo <i className="fa-solid fa-arrow-up-right-from-square" />
                    </a>
                  )}
                  {repoUrl && (
                    <a className="pd-btn pd-btn--ghost" href={repoUrl} target="_blank" rel="noreferrer">
                      <i className="fa-brands fa-github" /> Source Code
                    </a>
                  )}
                </div>
              )}

              {total > 1 && (
                <button className="pd-next pd-rise" style={{ ['--i' as string]: 5 }} onClick={() => onNavigate(next)}>
                  <span>
                    <small>Next project</small>
                    <strong>{next.title}</strong>
                  </span>
                  <i className="fa-solid fa-arrow-right" />
                </button>
              )}
            </div>

            {/* ───────── RIGHT: gallery + name + stack ───────── */}
            <div className="pd-right pd-rise" style={{ ['--i' as string]: 2 }}>
              <div className="pd-frame">
                <span className="pd-frame-glow" style={{ background: project.gradient }} aria-hidden="true" />

                <div className="pd-window">
                  <div className="pd-window-bar">
                    <span /> <span /> <span />
                    <b>{project.title}</b>
                  </div>

                  <div className="pd-stage">
                    {showImage ? (
                      <img
                        key={src}
                        src={src}
                        alt={`${project.title} screenshot ${shot + 1}`}
                        onError={() => setBroken((b) => ({ ...b, [src]: true }))}
                      />
                    ) : (
                      <div className="pd-fallback" style={{ background: project.gradient }}>
                        <i className={`fa-solid ${project.icon}`} />
                      </div>
                    )}
                  </div>

                  {gallery.length > 1 && (
                    <div className="pd-thumbs" role="tablist" aria-label="Project screenshots">
                      {gallery.map((g, i) => (
                        <button
                          key={g}
                          role="tab"
                          aria-selected={i === shot}
                          className={`pd-thumb${i === shot ? ' active' : ''}`}
                          onClick={() => setShot(i)}
                        >
                          <img src={g} alt="" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pd-meta">
                  <div className="pd-meta-head">
                    <h2 className="pd-name">{project.title}</h2>
                    <span className="pd-label">Tech stack · {project.tech.length}</span>
                  </div>
                  <div className="tb-row">
                    {project.tech.map((t) => (
                      <TechPill key={t} name={t} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}