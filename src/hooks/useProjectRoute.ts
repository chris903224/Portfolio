import { useCallback, useEffect, useState } from 'react';

const PREFIX = '#/project/';

export const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const read = () => {
  const h = window.location.hash;
  if (h.startsWith(PREFIX)) return decodeURIComponent(h.slice(PREFIX.length));
  if (h.startsWith('#/')) return decodeURIComponent(h.slice(2));
  return null;
};

export function useProjectRoute() {
  const [slug, setSlug] = useState<string | null>(read);

  useEffect(() => {
    const sync = () => setSlug(read());
    window.addEventListener('popstate', sync);
    window.addEventListener('hashchange', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener('hashchange', sync);
    };
  }, []);

  const open = useCallback((s: string) => {
    setSlug(s); // Agad i-update yung state para mag-render
    window.history.pushState({ inApp: true }, '', `${PREFIX}${s}`);
  }, []);

  const swap = useCallback((s: string) => {
    setSlug(s);
    window.history.replaceState({ inApp: true }, '', `${PREFIX}${s}`);
  }, []);

  const close = useCallback(() => {
    if (window.history.state?.inApp) {
      window.history.back();
    } else {
      setSlug(null);
      window.history.replaceState(null, '', '#portfolio');
      document.getElementById('portfolio')?.scrollIntoView();
    }
  }, []);

  return { slug, open, swap, close };
}