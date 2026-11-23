import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent as ReactMouseEvent, type TouchEvent as ReactTouchEvent } from 'react';
import { useSpringGroup, stepSpring } from '../hooks/useSpring';
import idCardImg from '../assets/cj.png';
import lanyardStrapImg from '../assets/cite.png';

export function Lanyard() {
  const rigRef = useRef<HTMLDivElement>(null);
  const swingRef = useRef<HTMLDivElement>(null);
  const pivotRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  
  const springs = useSpringGroup();
  const [flipped, setFlipped] = useState(false);
  const hasDropped = useRef(false);
  
  const dragRef = useRef({ isDragging: false, startX: 0, startY: 0, currentX: 0, currentY: 0, hasMoved: false });

  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    if (!hasDropped.current) {
      hasDropped.current = true;
      springs.rope.p = -180; 
      springs.rope.v = 600; 
      springs.card.v = 400;
    }

    const onGlobalMove = (e: MouseEvent | TouchEvent) => {
      if (!dragRef.current.isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      
      dragRef.current.currentX = clientX;
      dragRef.current.currentY = clientY;
      dragRef.current.hasMoved = true;
    };

    const onGlobalUp = () => {
      if (!dragRef.current.isDragging) return;
      dragRef.current.isDragging = false;
      if (rigRef.current) rigRef.current.style.cursor = 'grab';
    };

    window.addEventListener('mousemove', onGlobalMove, { passive: true });
    window.addEventListener('touchmove', onGlobalMove, { passive: true });
    window.addEventListener('mouseup', onGlobalUp);
    window.addEventListener('touchend', onGlobalUp);

    const loop = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;

      let targetRy = 0;
      let targetRx = 0;
      let targetRope = 0;

      if (dragRef.current.isDragging) {
        const dx = dragRef.current.currentX - dragRef.current.startX;
        const dy = dragRef.current.currentY - dragRef.current.startY;
        
        targetRy = Math.max(-35, Math.min(35, dx * 0.3));
        targetRx = Math.max(-35, Math.min(35, -dy * 0.3));
        targetRope = Math.max(-15, Math.min(15, dx * 0.1));
      }

      stepSpring(springs.rope, targetRope, dt);
      stepSpring(springs.card, 0, dt, -springs.rope.v * 0.85);
      stepSpring(springs.ry, targetRy, dt);
      stepSpring(springs.rx, targetRx, dt);

      if (swingRef.current) swingRef.current.style.transform = `rotate(${springs.rope.p.toFixed(3)}deg)`;
      if (pivotRef.current) pivotRef.current.style.transform = `rotate(${springs.card.p.toFixed(3)}deg)`;
      if (tiltRef.current) tiltRef.current.style.transform = `rotateX(${springs.rx.p.toFixed(2)}deg) rotateY(${springs.ry.p.toFixed(2)}deg)`;
      if (glowRef.current) glowRef.current.style.transform = `translate(-50%, -50%)`;

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onGlobalMove);
      window.removeEventListener('touchmove', onGlobalMove);
      window.removeEventListener('mouseup', onGlobalUp);
      window.removeEventListener('touchend', onGlobalUp);
    };
  }, [springs]);

  const handleStart = (e: ReactMouseEvent | ReactTouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as ReactMouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as ReactMouseEvent).clientY;
    
    dragRef.current.isDragging = true;
    dragRef.current.startX = clientX;
    dragRef.current.startY = clientY;
    dragRef.current.currentX = clientX;
    dragRef.current.currentY = clientY;
    dragRef.current.hasMoved = false;
    
    if (rigRef.current) rigRef.current.style.cursor = 'grabbing';
  };

  const onTiltClick = (e: ReactMouseEvent) => {
    if ((e.target as HTMLElement).closest('a')) return;
    if (dragRef.current.hasMoved) return;
    setFlipped((f) => !f);
  };

  const onTiltKey = (e: ReactKeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setFlipped((f) => !f);
    }
  };

  return (
    <div id="rig" className="lanyard" ref={rigRef}>
      <div className="lanyard-glow" ref={glowRef} />
      
      <div className="lanyard-swing" ref={swingRef}>
        <img 
          src={lanyardStrapImg} 
          alt="Lanyard Strap" 
          className="lanyard-strap-img" 
          draggable={false}
        />
        
        <div className="lanyard-pivot" ref={pivotRef}>
          <div
            className="lanyard-card-tilt"
            ref={tiltRef}
            role="button"
            tabIndex={0}
            aria-label="Flip ID badge"
            onMouseDown={handleStart}
            onTouchStart={handleStart}
            onClick={onTiltClick}
            onKeyDown={onTiltKey}
            style={{ cursor: 'grab', touchAction: 'none' }}
          >
            <div className={`card-inner ${flipped ? 'flipped' : ''}`}>
              
              <div className="face face-front-real">
                <img src={idCardImg} alt="Christian Villanueva ID" className="real-id-img" draggable={false} />
              </div>

              <div className="face face-back">
                <div className="face-hole" />
                <h3 className="grad-text face-back-title">About Me</h3>
                <p className="face-back-text">
                  2nd-year BSIT student learning full-stack development: React on
                  the frontend, Spring Boot behind it.
                </p>
                <div className="face-stats">
                  <div className="face-stat">
                    <div className="face-stat-value">Year 2</div>
                    <div className="face-stat-label">BSIT</div>
                  </div>
                  <div className="face-stat">
                    <div className="face-stat-value">4</div>
                    <div className="face-stat-label">MILESTONES</div>
                  </div>
                  <div className="face-stat">
                    <div className="face-stat-value">NC3</div>
                    <div className="face-stat-label">TESDA</div>
                  </div>
                </div>
                <div className="face-find">FIND ME</div>
                <div className="face-socials">
                  <span className="social social--muted"><i className="fa-solid fa-location-dot" />Sampaloc, Manila</span>
                  <a className="social" href="https://github.com/chris903224" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-github" />chris903224</a>
                  <a className="social" href="https://www.tiktok.com/@chris_devvv" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-tiktok" />chris_devvv</a>
                  <a className="social" href="https://www.instagram.com/chrvstln_" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-instagram" />chrvstln_</a>
                  <a className="social" href="mailto:christianvillanueva9@gmail.com"><i className="fa-solid fa-envelope" />Email</a>
                </div>
                <div className="face-flip-hint">CLICK TO FLIP BACK</div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}