import { useRef } from 'react';

export type Spring = { p: number; v: number; k: number; c: number };

// Gumagawa ng bagong spring object (p = position, v = velocity, k = stiffness, c = damping)
export const createSpring = (k: number, c: number): Spring => ({ p: 0, v: 0, k, c });

// Ito ang nag-uupdate ng position/velocity kada frame (physics math)
export const stepSpring = (s: Spring, target: number, dt: number, ext = 0) => {
  s.v += (-s.k * (s.p - target) - s.c * s.v + ext) * dt;
  s.p += s.v * dt;
};

// Hook para mag-hold ng apat na magkakaibang springs para sa Lanyard
export function useSpringGroup() {
  return useRef({
    rope: createSpring(34, 4.6),   // Para sa lubid (sway)
    card: createSpring(60, 3.4),   // Para sa ID card (bounce)
    ry: createSpring(80, 8),       // Para sa rotate Y (left/right tilt)
    rx: createSpring(80, 8),       // Para sa rotate X (up/down tilt)
  }).current;
}