import { TECH_META } from '../data';
import type { TechName } from '../types';
import '../styles/tech-badges.css';

export function TechPill({ name }: { name: TechName }) {
  const c = TECH_META[name].color;
  return (
    <span 
      className="tb-pill" 
      style={{ 
        color: c, 
        borderColor: `${c}80`, // Mas makapal na border (50% opacity)
        background: `linear-gradient(135deg, ${c}25, ${c}10)`, // Gradient background
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