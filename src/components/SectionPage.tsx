import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Aurora } from './Aurora';

type Props = {
  eyebrow: string;
  title: string;
  subtitle: string;
  icon: string;
  onClose: () => void;
  escapeDisabled?: boolean;
  children: ReactNode;
};

export function SectionPage({ eyebrow, title, subtitle, icon, onClose, escapeDisabled, children }: Props) {
  const backRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    backRef.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    if (escapeDisabled) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, escapeDisabled]);

  useEffect(() => {
    const handleNavClick = () => {
      onClose();
      document.body.style.overflow = ''; 
    };
    window.addEventListener('nav-navigate', handleNavClick);
    return () => window.removeEventListener('nav-navigate', handleNavClick);
  }, [onClose]);

  return createPortal(
    <div className="sp" role="dialog" aria-modal="true" aria-label={title}>
      {/* Inilagay ang Aurora sa loob ng SectionPage */}
      <Aurora />
      
      <div className="sp-scroll">
        <div className="sp-inner">
          <div className="sp-top sp-rise" style={{ ['--i' as string]: 0 }}>
            <button ref={backRef} className="sp-back" onClick={onClose}>
              <i className="fa-solid fa-arrow-left" /> Back to Portfolio
            </button>
            <span className="sp-eyebrow">
              <i className={`fa-solid ${icon}`} /> {eyebrow}
            </span>
          </div>

          <header className="sp-head sp-rise" style={{ ['--i' as string]: 1 }}>
            <h1 className="sp-title">{title}</h1>
            <p className="sp-sub">{subtitle}</p>
          </header>

          <div className="sp-body sp-rise" style={{ ['--i' as string]: 2 }}>
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}