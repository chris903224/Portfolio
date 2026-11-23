import { useState, useEffect } from 'react';
import { AmbientBackground } from './components/AmbientBackground';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Portfolio } from './components/Portfolio';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { LoadingScreen } from './components/LoadingScreen';
import { useReveal } from './hooks/useReveal';

function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  useReveal();

  useEffect(() => {
    const hasLoadedBefore = sessionStorage.getItem('portfolio_loaded');
    if (hasLoadedBefore === 'true') {
      setIsLoaded(true);
    }
  }, []);

  const handleLoadingComplete = () => {
    sessionStorage.setItem('portfolio_loaded', 'true');
    setIsLoaded(true);
  };

  if (!isLoaded) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  return (
    <>
      <AmbientBackground />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Portfolio />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

export default App;