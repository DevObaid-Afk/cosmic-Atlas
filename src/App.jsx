  import React, { useEffect } from 'react';
  import SpaceScene from './components/SpaceScene.jsx';
  import Hero from './components/Hero.jsx';
  import PlanetSection from './components/PlanetSection.jsx';
  import GalaxySection from './components/GalaxySection.jsx';
  import CosmicScale from './components/CosmicScale.jsx';
  import BlackHoleJourney from './components/BlackHoleJourney.jsx';
  import { initScrollAnimations } from './animations/scrollAnimations.js';
  
  export default function App() {
    useEffect(() => initScrollAnimations(), []);
  
    return (
      <>
        <SpaceScene />
        <main className="page-shell">
          <Hero />
          <PlanetSection />
          <GalaxySection />
          <CosmicScale />
          <BlackHoleJourney />
        </main>
      </>
    );
  }  