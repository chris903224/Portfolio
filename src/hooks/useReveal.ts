import { useEffect, useRef } from 'react';

/**
 * One-shot scroll reveal for a whole section.
 *
 * Put `data-rv` on anything that should fade up when it first scrolls into view; this hook sets `data-in` on it
 * exactly once (the section's CSS decides what that looks like). It replaces scroll-linked choreography with a
 * single, cheap IntersectionObserver, and it can never leave content hidden:
 *   - reduced motion, or no IntersectionObserver  → everything is shown immediately
 *   - an element that is already above the viewport (deep link, restored scroll) → shown immediately
 */
export function useReveal<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const els = Array.from(root.querySelectorAll<HTMLElement>('[data-rv]'));
    const show = (el: Element) => el.setAttribute('data-in', '');

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || typeof IntersectionObserver === 'undefined') {
      els.forEach(show);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting || e.boundingClientRect.top < 0) {
            show(e.target);
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return ref;
}