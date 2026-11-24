import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { CERT_IMAGES, EXP_IMAGES, PROJECTS, TAB_LABELS, TECH_GROUPS } from '../data';
import type { Project, TabKey, TechName } from '../types';
import { slugify, useProjectRoute } from '../hooks/useProjectRoute';
import { useReveal } from '../hooks/useReveal';
import { TechIcon } from './TechBadges';
import { ProjectDetail } from './ProjectDetail';
import '../styles/portfolio.css';

/* ────────────────────────────────────────────────────────────────────────────
   Small helpers
──────────────────────────────────────────────────────────────────────────── */

const vars = (o: Record<string, string | number>) => o as CSSProperties;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const pad = (n: number) => String(n).padStart(2, '0');
const reduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const faClass = (icon: string) =>
  /\bfa-(solid|regular|brands|light|duotone|thin)\b/.test(icon) ? icon : `fa-solid ${icon}`;

/** Spotlight position for the rim light that follows the pointer. */
const spot = (e: MouseEvent<HTMLElement>) => {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--sx', `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty('--sy', `${e.clientY - r.top}px`);
};

function useFinePointer() {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const m = window.matchMedia('(pointer: fine) and (hover: hover)');
    const on = () => setFine(m.matches);
    on();
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  return fine;
}

/** Same pointer spotlight, for a card whose click target is a stretched button that sits above the media. */
const spotIn = (e: MouseEvent<HTMLElement>) => {
  const m = e.currentTarget.querySelector<HTMLElement>('.pf-show-media');
  if (!m) return;
  const r = m.getBoundingClientRect();
  m.style.setProperty('--sx', `${e.clientX - r.left}px`);
  m.style.setProperty('--sy', `${e.clientY - r.top}px`);
};

/* ────────────────────────────────────────────────────────────────────────────
   Content you own. Edit the placeholders below.
   (Your data file has images only, so titles, issuers, dates and roles live here.)
──────────────────────────────────────────────────────────────────────────── */

/** One line under each block's heading (these were the folder pages' subtitles). */
const SECTION_META: Record<string, { page: string }> = {
  projects: { page: 'Everything I have built, end to end.' },
  certificates: { page: 'Certificates and formal training.' },
  experience: { page: 'My journey so far.' },
  skills: { page: 'The technologies I use day to day.' },
};

type CertMeta = { title: string; issuer: string; date: string };
// ✏️ One entry per image in CERT_IMAGES, in the same order.
const CERT_META: CertMeta[] = [
  { 
    title: 'Collaborative Robot TESDA NC3', 
    issuer: 'SIMS Southern Institute of Maritime', 
    date: 'August, 2025' 
  },
];

type ExpMeta = { role: string; org: string; period: string; points: string[] };
// ✏️ One entry per image in EXP_IMAGES, in the same order.
const EXP_META: ExpMeta[] = [
  {
    role: 'Full-Stack Application Development',
    org: 'Web Application Projects',
    period: '2026 — Present',
    points: [
      'Building web applications using React, TypeScript, Node.js, and Supabase.',
      'Focused on frontend architecture, backend logic, database integration, and real-world functionality.',
    ],
  },
  {
    role: 'Database Design & Backend Integration',
    org: 'Backend & Data Layer',
    period: '2026 — Present',
    points: [
      'Designing relational database structures and implementing PostgreSQL queries.',
      'Implementing authentication, Row Level Security (RLS), and application data management.',
    ],
  },
  {
    role: 'Payment Gateway Integration',
    org: 'E-Commerce Project',
    period: '2026 — Present',
    points: [
      'Integrating PayMongo GCash payments into an e-commerce application.',
      'Handling checkout validation, payment processing, and order management.',
    ],
  },
  {
    role: 'Responsive UI/UX Implementation',
    org: 'Frontend & Interface Work',
    period: '2026 — Present',
    points: [
      'Translating interface concepts into responsive, interactive web experiences.',
      'Applying attention to usability, accessibility, and visual consistency.',
    ],
  },
  {
    role: 'Full-Stack Development & Delivery',
    org: 'End-to-End Application Work',
    period: '2026 — Present',
    points: [
      'Combining frontend, backend, and database layers into complete, working applications.',
      'Delivering real-world functionality with a focus on reliability and usability.',
    ],
  },
];

const certMeta = (i: number): CertMeta =>
  CERT_META[i] ?? { title: `Certificate ${pad(i + 1)}`, issuer: 'Issuing organization', date: 'Year' };
const expMeta = (i: number): ExpMeta =>
  EXP_META[i] ?? { role: `Role ${pad(i + 1)}`, org: 'Organization', period: 'Start to End', points: [] };

const groupTitle = (k: string) =>
  /front/i.test(k) ? 'Frontend' : /back|data/i.test(k) ? 'Backend & Database' : /tool|work|ops|flow/i.test(k) ? 'Tools & Workflow' : k;

/* ────────────────────────────────────────────────────────────────────────────
   Images that can never show a broken icon
──────────────────────────────────────────────────────────────────────────── */

function SafeImg({
  src,
  alt,
  className,
  fallback,
}: {
  src?: string;
  alt: string;
  className?: string;
  fallback: ReactNode;
}) {
  const [bad, setBad] = useState(!src);
  useEffect(() => {
    setBad(!src);
  }, [src]);
  if (bad || !src) return <>{fallback}</>;
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      draggable={false}
      onError={() => setBad(true)}
    />
  );
}

/* Dark UI / code mockups, drawn in the palette. They stand in for any project without a screenshot. */

type MockKind = 'commerce' | 'code' | 'dashboard' | 'travel' | 'tasks';
const MOCK_KINDS: MockKind[] = ['commerce', 'code', 'dashboard', 'travel', 'tasks'];

function mockKind(title: string, i: number): MockKind {
  const t = title.toLowerCase();
  if (/commerce|shop|store|market|cart/.test(t)) return 'commerce';
  if (/generat|code|\bai\b|gpt|prompt/.test(t)) return 'code';
  if (/lumina|system|dash|admin|analytic/.test(t)) return 'dashboard';
  if (/travel|buddy|trip|tour|map/.test(t)) return 'travel';
  if (/task|master|todo|kanban|plan/.test(t)) return 'tasks';
  return MOCK_KINDS[i % MOCK_KINDS.length];
}

const CODE_LINES: [number, number][] = [
  [0, 150], [0, 96], [1, 232], [1, 176], [2, 264], [2, 120], [2, 204], [1, 72], [1, 212], [0, 52], [0, 168], [1, 140],
];
const BARS = [60, 96, 70, 132, 102, 150, 120, 172, 142];

function Mockup({ kind }: { kind: MockKind }) {
  return (
    <svg
      className="pf-mock"
      viewBox="0 0 640 400"
      preserveAspectRatio="xMidYMin slice"
      aria-hidden="true"
      focusable="false"
    >
      <rect className="mk-bg" width="640" height="400" />

      {kind === 'commerce' && (
        <>
          <rect className="mk-1" x="24" y="20" width="592" height="38" rx="12" />
          <circle className="mk-4" cx="46" cy="39" r="7" />
          <rect className="mk-3" x="62" y="35" width="64" height="8" rx="4" />
          <rect className="mk-2" x="400" y="35" width="40" height="8" rx="4" />
          <rect className="mk-2" x="452" y="35" width="40" height="8" rx="4" />
          <rect className="mk-5" x="540" y="30" width="62" height="18" rx="9" />
          <rect className="mk-2" x="24" y="74" width="592" height="120" rx="16" />
          <rect className="mk-4" x="48" y="102" width="200" height="14" rx="7" />
          <rect className="mk-3" x="48" y="128" width="150" height="8" rx="4" />
          <rect className="mk-5" x="48" y="152" width="84" height="22" rx="11" />
          <circle className="mk-1" cx="520" cy="134" r="54" />
          <circle className="mk-2" cx="520" cy="134" r="30" />
          {[0, 1, 2, 3].map((i) => (
            <g key={i} transform={`translate(${24 + i * 152} 212)`}>
              <rect className="mk-card" width="140" height="172" rx="14" />
              <rect className="mk-2" x="10" y="10" width="120" height="92" rx="10" />
              <rect className="mk-3" x="10" y="114" width="80" height="8" rx="4" />
              <rect className="mk-2" x="10" y="130" width="52" height="6" rx="3" />
              <rect className="mk-5" x="10" y="146" width="44" height="14" rx="7" />
            </g>
          ))}
        </>
      )}

      {kind === 'code' && (
        <>
          <rect className="mk-1" width="150" height="400" />
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} className={i === 1 ? 'mk-4' : 'mk-2'} x="20" y={52 + i * 26} width={i === 1 ? 92 : 70 + (i % 3) * 14} height="8" rx="4" />
          ))}
          <rect className="mk-2" x="150" width="490" height="34" />
          <rect className="mk-3" x="166" y="10" width="86" height="14" rx="7" />
          <rect className="mk-1" x="150" y="143" width="490" height="21" />
          {CODE_LINES.map(([ind, w], i) => (
            <g key={i}>
              <rect className="mk-3" x="170" y={50 + i * 21} width="10" height="6" rx="3" />
              <rect className={`mk-${2 + (i % 3)}`} x={198 + ind * 24} y={49 + i * 21} width={w} height="8" rx="4" />
            </g>
          ))}
          <rect className="mk-1" x="150" y="316" width="490" height="84" />
          <rect className="mk-3" x="170" y="334" width="44" height="7" rx="3.5" />
          <rect className="mk-4" x="224" y="334" width="150" height="7" rx="3.5" />
          <rect className="mk-2" x="170" y="352" width="236" height="7" rx="3.5" />
          <rect className="mk-5 mk-blink" x="170" y="372" width="8" height="12" rx="2" />
        </>
      )}

      {kind === 'dashboard' && (
        <>
          <rect className="mk-1" width="116" height="400" />
          <circle className="mk-4" cx="32" cy="34" r="8" />
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} className={i === 1 ? 'mk-3' : 'mk-2'} x="18" y={74 + i * 30} width={i === 1 ? 82 : 64} height="10" rx="5" />
          ))}
          <rect className="mk-2" x="140" y="22" width="180" height="12" rx="6" />
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${140 + i * 164} 56)`}>
              <rect className="mk-card" width="148" height="76" rx="14" />
              <rect className="mk-2" x="14" y="14" width="56" height="6" rx="3" />
              <rect className="mk-4" x="14" y="34" width={64 + i * 10} height="16" rx="8" />
              <rect className="mk-3" x="14" y="58" width="40" height="5" rx="2.5" />
            </g>
          ))}
          <rect className="mk-card" x="140" y="148" width="320" height="230" rx="14" />
          {BARS.map((h, i) => (
            <rect key={i} className={i === BARS.length - 2 ? 'mk-5' : 'mk-3'} x={162 + i * 32} y={360 - h} width="18" height={h} rx="5" />
          ))}
          <rect className="mk-card" x="476" y="148" width="140" height="230" rx="14" />
          <circle className="mk-ring" cx="546" cy="242" r="42" />
          <circle className="mk-arc" cx="546" cy="242" r="42" strokeDasharray="170 264" transform="rotate(-90 546 242)" />
          <rect className="mk-3" x="500" y="318" width="92" height="6" rx="3" />
          <rect className="mk-2" x="514" y="334" width="64" height="6" rx="3" />
        </>
      )}

      {kind === 'travel' && (
        <>
          {Array.from({ length: 9 }).map((_, i) => (
            <line key={`h${i}`} className="mk-grid" x1="0" x2="640" y1={i * 50} y2={i * 50} />
          ))}
          {Array.from({ length: 14 }).map((_, i) => (
            <line key={`v${i}`} className="mk-grid" y1="0" y2="400" x1={i * 50} x2={i * 50} />
          ))}
          <rect className="mk-card" x="40" y="24" width="360" height="40" rx="20" />
          <circle className="mk-3" cx="66" cy="44" r="8" />
          <rect className="mk-3" x="88" y="40" width="148" height="8" rx="4" />
          <path className="mk-route" d="M90 300 C 180 300, 190 190, 280 200 S 420 150, 470 90" />
          {[[90, 300], [280, 200], [470, 90]].map(([x, y], i) => (
            <g key={i}>
              <circle className="mk-2" cx={x} cy={y} r="18" />
              <circle className="mk-5" cx={x} cy={y} r="6" />
            </g>
          ))}
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${40 + i * 196} 320)`}>
              <rect className="mk-card" width="180" height="64" rx="14" />
              <rect className="mk-2" x="12" y="12" width="40" height="40" rx="10" />
              <rect className="mk-4" x="64" y="18" width="80" height="8" rx="4" />
              <rect className="mk-3" x="64" y="36" width="56" height="6" rx="3" />
            </g>
          ))}
        </>
      )}

      {kind === 'tasks' && (
        <>
          {[0, 1, 2].map((c) => (
            <g key={c} transform={`translate(${28 + c * 204} 28)`}>
              <rect className="mk-card" width="188" height="344" rx="16" />
              <rect className="mk-4" x="16" y="18" width="70" height="10" rx="5" />
              <rect className="mk-3" x="150" y="18" width="22" height="10" rx="5" />
              {Array.from({ length: c === 2 ? 2 : 3 }).map((_, r) => (
                <g key={r} transform={`translate(16 ${46 + r * 92})`}>
                  <rect className="mk-2" width="156" height="78" rx="12" />
                  <rect className="mk-4" x="12" y="14" width={96 - r * 12} height="8" rx="4" />
                  <rect className="mk-3" x="12" y="32" width="120" height="6" rx="3" />
                  <rect className="mk-3" x="12" y="46" width="84" height="6" rx="3" />
                  <circle className="mk-5" cx="140" cy="64" r="7" />
                </g>
              ))}
            </g>
          ))}
          <rect className="mk-lift" x="238" y="148" width="156" height="78" rx="12" transform="rotate(-4 316 187)" />
        </>
      )}
    </svg>
  );
}

function CertFallback() {
  return (
    <svg className="pf-cert-fallback" viewBox="0 0 200 150" aria-hidden="true" focusable="false">
      <rect className="mk-card" x="6" y="6" width="188" height="138" rx="10" />
      <rect className="mk-card" x="14" y="14" width="172" height="122" rx="6" />
      <rect className="mk-4" x="62" y="30" width="76" height="7" rx="3.5" />
      <rect className="mk-2" x="48" y="46" width="104" height="5" rx="2.5" />
      <rect className="mk-2" x="62" y="57" width="76" height="5" rx="2.5" />
      <circle className="mk-card" cx="100" cy="100" r="22" />
      <circle className="mk-card" cx="100" cy="100" r="15" />
      <circle className="mk-5" cx="100" cy="100" r="5" />
      <rect className="mk-3" x="34" y="116" width="44" height="4" rx="2" />
      <rect className="mk-3" x="122" y="116" width="44" height="4" rx="2" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   Glass cursor: a lerp-smoothed silver ring that morphs into a frosted pill.
   rAF-driven, desktop (pointer: fine) only, active inside [data-cursor-zone].
──────────────────────────────────────────────────────────────────────────── */

const CURSOR_LABELS: Record<string, string> = {
  project: 'VIEW CASE ↗',
};

function GlassCursor() {
  const root = useRef<HTMLDivElement>(null);
  const ringPos = useRef<HTMLDivElement>(null);
  const dotPos = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = root.current;
    const rp = ringPos.current;
    const dp = dotPos.current;
    const lb = label.current;
    if (!el || !rp || !dp || !lb) return;

    const rm = reduced();
    const s = {
      px: -100, py: -100, // pointer
      rx: -100, ry: -100, // ring / pill (lerped, magnetic)
      dx: -100, dy: -100, // dot (lerped tightly)
      inside: false,
      mode: 'idle',
      target: null as HTMLElement | null,
      raf: 0,
      last: 0,
      frame: 0,
      left: 0,
    };

    const setMode = (m: string) => {
      if (s.mode === m) return;
      s.mode = m;
      el.dataset.mode = m;
      lb.textContent = CURSOR_LABELS[m] ?? '';
    };

    const evaluate = (node: Element | null) => {
      const zone = node ? node.closest('[data-cursor-zone]') : null;
      if (!node || !zone) {
        if (s.inside) {
          s.inside = false;
          s.left = performance.now();
        }
        s.target = null;
        el.dataset.show = '0';
        setMode('idle');
        return;
      }
      if (!s.inside) {
        s.inside = true;
        s.rx = s.dx = s.px; // snap on entry so it never streaks in from the corner
        s.ry = s.dy = s.py;
      }
      el.dataset.show = '1';
      const hit = node.closest<HTMLElement>('[data-cursor]');
      s.target = hit;
      setMode(hit?.dataset.cursor ?? 'idle');
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - s.last) / 1000));
      s.last = now;

      let tx = s.px;
      let ty = s.py;
      if (s.target && s.mode === 'project') {
        // subtle magnetic pull toward the centre of the hovered target
        const r = s.target.getBoundingClientRect();
        tx += clamp((r.left + r.width / 2 - s.px) * 0.16, -26, 26);
        ty += clamp((r.top + r.height / 2 - s.py) * 0.16, -18, 18);
      } else if (s.target && s.mode === 'link') {
        const r = s.target.getBoundingClientRect();
        tx += clamp((r.left + r.width / 2 - s.px) * 0.28, -8, 8);
        ty += clamp((r.top + r.height / 2 - s.py) * 0.28, -8, 8);
      }

      // frame-rate independent exponential smoothing
      const ab = 1 - Math.exp(-(rm ? 1000 : 13) * dt);
      const ad = 1 - Math.exp(-(rm ? 1000 : 48) * dt);
      s.rx += (tx - s.rx) * ab;
      s.ry += (ty - s.ry) * ab;
      s.dx += (s.px - s.dx) * ad;
      s.dy += (s.py - s.dy) * ad;
      rp.style.transform = `translate3d(${s.rx.toFixed(2)}px, ${s.ry.toFixed(2)}px, 0)`;
      dp.style.transform = `translate3d(${s.dx.toFixed(2)}px, ${s.dy.toFixed(2)}px, 0)`;

      // re-check what is under a stationary pointer (content may scroll beneath it)
      if (++s.frame % 6 === 0 && s.inside) evaluate(document.elementFromPoint(s.px, s.py));

      if (!s.inside && now - s.left > 500) {
        s.raf = 0;
        return;
      }
      s.raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (s.raf) return;
      s.last = performance.now();
      s.raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      s.px = e.clientX;
      s.py = e.clientY;
      evaluate(e.target as Element | null);
      if (s.inside) start();
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && s.inside) el.dataset.press = '1';
    };
    const onUp = () => {
      el.dataset.press = '0';
    };
    const onLeave = () => evaluate(null);

    document.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerdown', onDown, { passive: true });
    document.addEventListener('pointerup', onUp, { passive: true });
    document.addEventListener('pointercancel', onUp, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    window.addEventListener('blur', onLeave);

    return () => {
      cancelAnimationFrame(s.raf);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('blur', onLeave);
    };
  }, []);

  return createPortal(
    <div ref={root} className="pf-cur" data-show="0" data-mode="idle" data-press="0" aria-hidden="true">
      <div ref={ringPos} className="pf-cur-pos">
        <div className="pf-cur-ring" />
        <div className="pf-cur-pill">
          <span ref={label} className="pf-cur-label" />
        </div>
      </div>
      <div ref={dotPos} className="pf-cur-pos">
        <div className="pf-cur-dot" />
      </div>
    </div>,
    document.body,
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   Block header, shared by all four blocks
──────────────────────────────────────────────────────────────────────────── */

function BlockHead({ id, title, sub, count, unit, icon }: { id: string; title: string; sub: string; count: number; unit: string; icon?: string }) {
  return (
    <header className="pf-bh" data-rv>
      <div className="pf-bh-main">
        <h3 id={id} className="pf-bh-title">
          {icon && <i className={faClass(icon)} aria-hidden="true" />}
          {title}
        </h3>
        {sub && <p className="pf-bh-sub">{sub}</p>}
      </div>
      <span className="pf-bh-count">
        {pad(count)} {unit}
      </span>
    </header>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   Projects: direct vertical showcases, one per row, media and copy alternating sides
──────────────────────────────────────────────────────────────────────────── */

function ProjectsShowcase({ onView }: { onView: (p: Project) => void }) {
  return (
    <div className="pf-shows">
      {PROJECTS.map((p, i) => {
        const slug = slugify(p.title);
        return (
          <article
            key={p.title}
            className={`pf-show${i % 2 ? ' is-flip' : ''}`}
            data-rv
            data-cursor="project"
            onMouseMove={spotIn}
          >
            <div className="pf-show-media pf-surface">
              <span className="pf-glow" aria-hidden="true" />
              <div className="pf-frame">
                <div className="pf-frame-bar" aria-hidden="true">
                  <span className="pf-dots">
                    <span />
                    <span />
                    <span />
                  </span>
                  <span className="pf-url">{slug}.app</span>
                </div>
                <div className="pf-frame-view">
                  <SafeImg
                    src={p.image as string | undefined}
                    alt={`${p.title} screenshot`}
                    className="pf-shot"
                    fallback={<Mockup kind={mockKind(p.title, i)} />}
                  />
                </div>
              </div>
            </div>

            <div className="pf-show-info">
              <span className="pf-show-index">
                {pad(i + 1)} <span aria-hidden="true">/ {pad(PROJECTS.length)}</span>
              </span>
              <h4 className="pf-show-title">{p.title}</h4>
              <p className="pf-show-desc">{p.description}</p>
              <ul className="pf-chips" aria-label={`${p.title} technologies`}>
                {p.tech.map((t) => (
                  <li key={t} className="pf-chip">{t}</li>
                ))}
              </ul>
              <button type="button" className="pf-show-cta" data-project={slug} onClick={() => onView(p)}>
                View case study
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="pf-sr"> : {p.title}</span>
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   Experience: scroll-lit silver timeline (tracks the window scroll now that it is not in a modal)
──────────────────────────────────────────────────────────────────────────── */

function ExperienceTimeline() {
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = wrap.current;
    if (!tl) return;
    let raf = 0;
    const calc = () => {
      raf = 0;
      const mid = window.innerHeight * 0.62;
      const r = tl.getBoundingClientRect();
      tl.style.setProperty('--prog', clamp((mid - r.top) / r.height, 0, 1).toFixed(4));
      tl.querySelectorAll<HTMLElement>('.pf-tl-item').forEach((it) => {
        it.classList.toggle('is-lit', it.getBoundingClientRect().top + 30 < mid);
      });
    };
    const req = () => {
      if (!raf) raf = requestAnimationFrame(calc);
    };
    calc();
    window.addEventListener('scroll', req, { passive: true });
    window.addEventListener('resize', req);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', req);
      window.removeEventListener('resize', req);
    };
  }, []);

  return (
    <div ref={wrap} className="pf-tl-wrap">
      <div className="pf-tl-line" aria-hidden="true">
        <span className="pf-tl-fill" />
      </div>
      <ol className="pf-tl">
        {EXP_IMAGES.map((img, i) => {
          const m = expMeta(i);
          return (
            <li key={i} className="pf-tl-item" data-rv>
              <span className="pf-tl-node" aria-hidden="true" />
              <article className="pf-tl-card pf-surface" onMouseMove={spot}>
                <span className="pf-glow" aria-hidden="true" />
                <div className="pf-tl-main">
                  <div className="pf-tl-head">
                    <h4 className="pf-tl-role">{m.role}</h4>
                    <span className="pf-tl-period">{m.period}</span>
                  </div>
                  <p className="pf-tl-org">{m.org}</p>
                  {m.points.length > 0 && (
                    <ul className="pf-tl-points">
                      {m.points.map((pt) => (
                        <li key={pt}>{pt}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <SafeImg
                  src={img as string | undefined}
                  alt={`${m.role} document`}
                  className="pf-tl-thumb"
                  fallback={null}
                />
              </article>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   Certificates: a plain grid. No carousel for what is usually one to three credentials.
──────────────────────────────────────────────────────────────────────────── */

function Certificates() {
  return (
    <div className="pf-certs">
      {CERT_IMAGES.map((img, i) => {
        const m = certMeta(i);
        return (
          <article key={i} className="pf-cert pf-surface" data-rv style={vars({ '--d': i })} onMouseMove={spot}>
            <span className="pf-glow" aria-hidden="true" />
            <div className="pf-cert-doc">
              <SafeImg src={img as string | undefined} alt={`${m.title}, ${m.issuer}`} className="pf-cert-img" fallback={<CertFallback />} />
            </div>
            <div className="pf-cert-info">
              <span className="pf-cert-no">Credential {pad(i + 1)}</span>
              <h4 className="pf-cert-title">{m.title}</h4>
              <p className="pf-cert-issuer">{m.issuer}</p>
              <dl className="pf-cert-meta">
                <dt>Issued</dt>
                <dd>{m.date}</dd>
              </dl>
            </div>
          </article>
        );
      })}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   Tech skills: architectural matrix with magnetic tiles
──────────────────────────────────────────────────────────────────────────── */

function SkillTile({ name }: { name: TechName }) {
  const move = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${(((e.clientX - (r.left + r.width / 2)) / r.width) * 12).toFixed(2)}px`);
    el.style.setProperty('--my', `${(((e.clientY - (r.top + r.height / 2)) / r.height) * 12).toFixed(2)}px`);
    el.style.setProperty('--sx', `${e.clientX - r.left}px`);
    el.style.setProperty('--sy', `${e.clientY - r.top}px`);
  };
  const leave = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.style.setProperty('--mx', '0px');
    e.currentTarget.style.setProperty('--my', '0px');
  };
  return (
    <div className="pf-tile" role="listitem" onPointerMove={move} onPointerLeave={leave}>
      <div className="pf-tile-in">
        <span className="pf-tile-ico">
          <TechIcon name={name} />
        </span>
        <span className="pf-tile-name">{name}</span>
      </div>
    </div>
  );
}

function SkillsMatrix() {
  const groups = Object.entries(TECH_GROUPS) as [string, TechName[]][];
  return (
    <div className="pf-skills">
      {groups.map(([key, names], gi) => (
        <section key={key} className={`pf-sg pf-sg-${gi} pf-surface`} data-rv style={vars({ '--d': gi })} onMouseMove={spot} aria-label={groupTitle(key)}>
          <span className="pf-glow" aria-hidden="true" />
          <header className="pf-sg-head">
            <h4>{groupTitle(key)}</h4>
            <span>{names.length}</span>
          </header>
          <div className="pf-sg-grid" role="list">
            {names.map((n) => (
              <SkillTile key={n} name={n} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   Portfolio
──────────────────────────────────────────────────────────────────────────── */

type Props = {
  onModalChange?: (modal: 'section' | 'project' | null) => void;
};

export function Portfolio({ onModalChange }: Props) {
  const { slug, open, swap, close } = useProjectRoute();
  const sectionRef = useReveal<HTMLElement>();
  const fine = useFinePointer();
  const lastOpened = useRef<string | null>(null);

  // 'section' is kept in the prop type for the parent, but nothing here opens a section modal any more.
  useEffect(() => {
    onModalChange?.(slug ? 'project' : null);
  }, [slug, onModalChange]);

  const currentIndex = slug ? PROJECTS.findIndex((p) => slugify(p.title) === slug) : -1;
  const current = currentIndex >= 0 ? PROJECTS[currentIndex] : null;
  const next = PROJECTS[(currentIndex + 1) % PROJECTS.length];

  const allTech = (Object.values(TECH_GROUPS) as TechName[][]).flat();

  const counts: Record<string, { n: number; unit: string }> = {
    projects: { n: PROJECTS.length, unit: PROJECTS.length === 1 ? 'project' : 'projects' },
    certificates: { n: CERT_IMAGES.length, unit: CERT_IMAGES.length === 1 ? 'credential' : 'credentials' },
    experience: { n: EXP_IMAGES.length, unit: EXP_IMAGES.length === 1 ? 'entry' : 'entries' },
    skills: { n: allTech.length, unit: 'technologies' },
  };

  const handleViewProject = (p: Project) => {
    const s = slugify(p.title);
    lastOpened.current = s;
    open(s);
  };

  // Closing a case study returns focus to the button that opened it; the page never moved underneath.
  const closeProject = () => {
    const s = lastOpened.current;
    lastOpened.current = null;
    close();
    if (s) {
      requestAnimationFrame(() => {
        document.querySelector<HTMLElement>(`[data-project="${s}"]`)?.focus({ preventScroll: true });
      });
    }
  };

  const renderBlock = (tab: TabKey) => {
    switch (tab) {
      case 'projects':
        return <ProjectsShowcase onView={handleViewProject} />;
      case 'certificates':
        return <Certificates />;
      case 'experience':
        return <ExperienceTimeline />;
      case 'skills':
        return <SkillsMatrix />;
      default:
        return null;
    }
  };

  return (
    <>
      <section
        id="portfolio"
        ref={sectionRef}
        className={`pf${fine ? ' pf-fine' : ''}`}
        data-cursor-zone=""
        aria-labelledby="pf-title"
      >
        <div className="pf-bg" aria-hidden="true" />
        <div className="pf-inner">
          <header className="pf-head">
            <h2 id="pf-title" className="pf-title" data-rv>
              My <span className="pf-title-dim">Portfolio</span>
            </h2>
            <p className="pf-sub" data-rv style={vars({ '--d': 1 })}>
              Projects, certificates, experience, and technical skills.
            </p>
            <nav className="pf-jump" aria-label="Portfolio sections" data-rv style={vars({ '--d': 2 })}>
              {TAB_LABELS.map((t) => (
                <a key={t.key} href={`#pf-${t.key}`} className="pf-jump-link" data-cursor="link">
                  {t.label}
                  <span className="pf-jump-n">{pad(counts[t.key]?.n ?? 0)}</span>
                </a>
              ))}
            </nav>
          </header>

          {TAB_LABELS.map((t) => (
            <section key={t.key} id={`pf-${t.key}`} className="pf-block" aria-labelledby={`pf-${t.key}-title`}>
              <BlockHead
                id={`pf-${t.key}-title`}
                title={t.label}
                sub={SECTION_META[t.key]?.page ?? ''}
                count={counts[t.key]?.n ?? 0}
                unit={counts[t.key]?.unit ?? ''}
                icon={String(t.icon)}
              />
              {renderBlock(t.key)}
            </section>
          ))}
        </div>
      </section>

      {current && (
        <ProjectDetail
          key={current.title}
          project={current}
          index={currentIndex}
          total={PROJECTS.length}
          next={next}
          onClose={closeProject}
          onNavigate={(p) => swap(slugify(p.title))}
        />
      )}

      {fine && <GlassCursor />}
    </>
  );
}