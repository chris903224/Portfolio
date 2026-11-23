import type { CSSProperties, ReactNode } from 'react';

export type FolderItem = {
  key: string;
  label: string;
  image?: string;
  gradient?: string;
  node?: ReactNode;
};

type Props = {
  index: number;
  title: string;
  subtitle: string;
  icon: string;
  count: number;
  accent: string;
  items: FolderItem[];
  onOpen: () => void;
};

/**
 * A folder whose contents "erupt" upward in a cone shape (like Mayon Volcano)
 * when the cursor hovers it. Pure CSS animation, no re-renders on hover.
 */
export function FolderCard({ index, title, subtitle, icon, count, accent, items, onOpen }: Props) {
  const list = items.slice(0, 4);
  const n = list.length;

  return (
    <button
      type="button"
      className="fd"
      onClick={onOpen}
      aria-label={`Open ${title}`}
      style={{ ['--accent' as string]: accent, ['--d' as string]: index } as CSSProperties}
    >
      <span className="fd-glow" aria-hidden="true" />

      <span className="fd-embers" aria-hidden="true">
        {Array.from({ length: 9 }).map((_, i) => (
          <i key={i} style={{ ['--e' as string]: i } as CSSProperties} />
        ))}
      </span>

      <span className="fd-body">
        <span className="fd-back">
          <span className="fd-tab" />
        </span>

        <span className="fd-items" aria-hidden="true">
          {list.map((it, i) => {
            // t runs -1 … 1 across the fan; the middle items climb highest => volcano cone
            const t = n === 1 ? 0 : (i / (n - 1)) * 2 - 1;
            const bg = it.image
              ? `url("${it.image}") center / cover no-repeat, ${it.gradient ?? '#1b1233'}`
              : it.gradient ?? '#1b1233';
            return (
              <span
                key={it.key}
                className="fd-item"
                style={
                  {
                    ['--i' as string]: i,
                    ['--tx' as string]: `${(t * 6.2).toFixed(2)}rem`,
                    ['--ty' as string]: `${(-(8.4 - Math.abs(t) * 2.6)).toFixed(2)}rem`,
                    ['--r' as string]: `${(t * 13).toFixed(1)}deg`,
                    background: bg,
                  } as CSSProperties
                }
              >
                {!it.image && it.node && <span className="fd-item-node">{it.node}</span>}
                <span className="fd-item-label">{it.label}</span>
              </span>
            );
          })}
        </span>

        <span className="fd-front">
          <span className="fd-ico">
            <i className={`fa-solid ${icon}`} />
          </span>
          <span className="fd-text">
            <strong>{title}</strong>
            <small>{subtitle}</small>
          </span>
          <span className="fd-count">{String(count).padStart(2, '0')}</span>
          <i className="fa-solid fa-arrow-right fd-go" />
        </span>
      </span>
    </button>
  );
}