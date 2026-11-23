import { useEffect } from 'react';

export function useScrollSpy(ids: string[], onChange: (id: string) => void) {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            onChange(e.target.id);
          }
        });
      },
      // Mag-a-activate kapag nasa gitna na ng screen yung section
      { rootMargin: '-45% 0px -50% 0px' }
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });

    return () => io.disconnect();
  }, [ids, onChange]);
}