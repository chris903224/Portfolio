import { useEffect, useRef } from 'react';
import '../styles/CursorReveal.css';

type Props = {
  /** Base photo (transparent PNG). Put it in /public. */
  src?: string;
  /** Optional: your own edited photo (e.g. wearing the hero suit). If omitted, a CSS suit is painted over the silhouette. */
  revealSrc?: string;
  /** Optional: a sticker/mask PNG (transparent) placed on the face, visible only inside the cursor circle. */
  stickerSrc?: string;
  /** Sticker position as % of the photo: center x, center y, and width. Tune these to fit the face. */
  stickerPos?: { x: number; y: number; w: number };
  /** Spotlight radius in px while the cursor is over the photo. */
  radius?: number;
  /** Reveal the whole figure (e.g. while hovering a button). */
  forceReveal?: boolean;
  alt?: string;
};

export function CursorReveal({
  src = '/christian.png',
  revealSrc,
  stickerSrc,
  stickerPos = { x: 59, y: 19, w: 44 },
  radius = 120,
  forceReveal = false,
  alt = 'Christian Villanueva',
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    let x = 0;
    let y = 0;

    const paint = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${x - r.left}px`);
      el.style.setProperty('--my', `${y - r.top}px`);
    };
    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      el.style.setProperty('--r', `${radius}px`);
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const onLeave = () => el.style.setProperty('--r', '0px');

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [radius]);

  return (
    <div ref={ref} className={`reveal-fig${forceReveal ? ' is-forced' : ''}`}>
      <img className="reveal-fig__base" src={src} alt={alt} draggable={false} />

      <div className={`reveal-fig__layer${revealSrc || stickerSrc ? ' has-image' : ' has-suit'}`} aria-hidden="true">
        {stickerSrc ? (
          <img
            className="reveal-fig__sticker"
            src={stickerSrc}
            alt=""
            draggable={false}
            style={{ left: `${stickerPos.x}%`, top: `${stickerPos.y}%`, width: `${stickerPos.w}%` }}
          />
        ) : revealSrc ? (
          <img src={revealSrc} alt="" draggable={false} />
        ) : (
          <>
            <div className="reveal-fig__suit" />
            <img className="reveal-fig__shade" src={src} alt="" draggable={false} />
          </>
        )}
      </div>
    </div>
  );
}