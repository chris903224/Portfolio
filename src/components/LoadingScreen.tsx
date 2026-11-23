import { useEffect } from 'react';
import '../styles/loading.css';

export function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="loading-overlay">
      <div className="loading-spinner"></div>
      <p className="loading-text">LOADING...</p>
    </div>
  );
}