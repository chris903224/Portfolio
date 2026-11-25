import { TECH_META } from '../data';
import type { TechName } from '../types';
import '../styles/tech-badges.css';

/* ────────────────────────────────────────────────────────────────────────────
   CODE ESCALATOR BACKGROUND
   ──────────────────────────────────────────────────────────────────────────── */
const CODE_LINES = [
  'const build = (idea) => { ... }',
  'npm run dev',
  'return <Component />;',
  'git commit -m "feat: done"',
  'interface User { id: string }',
  'SELECT * FROM projects;',
  'await fetch("/api/data");',
  'import { useState } from "react";',
  'docker run -p 3000:3000',
  'export default function App() { ... }',
  'let isAwesome = true;',
  '// TODO: Ship to production',
  '<div className="container">',
  'const data = useMemo(...)',
  'app.listen(PORT, () => { ... });',
];

export function CodeEscalator() {
  return (
    <div className="tb-escalator-wrapper" aria-hidden="true">
      <div className="tb-escalator-track">
        {/* Dinoble natin para tuloy-tuloy at walang butas */}
        {[...CODE_LINES, ...CODE_LINES].map((line, i) => (
          <span key={i} className="tb-code-line">
            {line}
          </span>
        ))}
      </div>
    </div>
  );
}

export function TechPill({ name }: { name: TechName }) {
  const c = TECH_META[name].color;
  return (
    <span 
      className="tb-pill" 
      style={{ 
        color: c, 
        borderColor: `${c}80`,
        background: `linear-gradient(135deg, ${c}25, ${c}10)`,
      }}
    >
      {name}
    </span>
  );
}

export function TechIcon({ name }: { name: TechName }) {
  const m = TECH_META[name];
  return m.glyph ? (
    <span className="ico tech-glyph" style={{ ['--c' as string]: m.color }}>
      {m.glyph}
    </span>
  ) : (
    <i className={`ico ${m.icon}`} style={{ ['--c' as string]: m.color }} />
  );
}