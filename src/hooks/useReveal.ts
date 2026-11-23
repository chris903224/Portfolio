import { useEffect } from 'react';

export function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    const elements = document.querySelectorAll('.reveal');
    elements.forEach((el) => io.observe(el));

    return () => io.disconnect();
  });
}