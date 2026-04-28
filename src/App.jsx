  import React, { useEffect, useState } from 'react';
  import SpaceScene from './components/SpaceScene.jsx';
  import Hero from './components/Hero.jsx';
  import PlanetSection from './components/PlanetSection.jsx';
  import GalaxySection from './components/GalaxySection.jsx';
  import CosmicScale from './components/CosmicScale.jsx';
  import BlackHoleJourney from './components/BlackHoleJourney.jsx';
  import { initScrollAnimations } from './animations/scrollAnimations.js';
  
  export default function App() {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
      const timer = window.setTimeout(() => setIsLoaded(true), 900);
      return () => window.clearTimeout(timer);
    }, []);

    useEffect(() => {
      if (!isLoaded) return undefined;
      return initScrollAnimations();
    }, [isLoaded]);
  
    return (
      <>
        <div className={`site-loader ${isLoaded ? 'is-loaded' : ''}`} aria-hidden="true">
          <div className="loader-orbit">
            <i />
          </div>
          <span>Calibrating deep-space telemetry</span>
        </div>
        <SpaceScene />
        <main className={`page-shell ${isLoaded ? 'is-ready' : ''}`}>
          <Hero />
          <PlanetSection />
          <GalaxySection />
          <CosmicScale />
          <BlackHoleJourney />
        </main>
      </>
    );
  }  
