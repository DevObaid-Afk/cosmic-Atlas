  import React, { useEffect, useRef, useState } from 'react';
  import SpaceScene from './components/SpaceScene.jsx';
  import Hero from './components/Hero.jsx';
  import PlanetSection from './components/PlanetSection.jsx';
  import GalaxySection from './components/GalaxySection.jsx';
  import CosmicScale from './components/CosmicScale.jsx';
  import BlackHoleJourney from './components/BlackHoleJourney.jsx';
  import { initScrollAnimations } from './animations/scrollAnimations.js';

  const missionStops = [
    { href: '#hero', label: 'Origin' },
    { href: '#planets', label: 'Planets' },
    { href: '#galaxies', label: 'Galaxies' },
    { href: '#scale', label: 'Scale' },
    { href: '#black-hole', label: 'Horizon' },
  ];

  function SpaceCursor() {
    const cursorRef = useRef(null);
    const dotRef = useRef(null);

    useEffect(() => {
      const shouldDisableCursor = window.matchMedia('(hover: none), (pointer: coarse), (prefers-reduced-motion: reduce)').matches;
      if (shouldDisableCursor) return undefined;

      const cursor = cursorRef.current;
      const dot = dotRef.current;
      let frame;
      let targetX = window.innerWidth / 2;
      let targetY = window.innerHeight / 2;
      let currentX = targetX;
      let currentY = targetY;

      const move = (event) => {
        targetX = event.clientX;
        targetY = event.clientY;
        dot.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
      };

      const render = () => {
        currentX += (targetX - currentX) * 0.18;
        currentY += (targetY - currentY) * 0.18;
        cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
        frame = requestAnimationFrame(render);
      };

      window.addEventListener('pointermove', move, { passive: true });
      render();

      return () => {
        window.removeEventListener('pointermove', move);
        cancelAnimationFrame(frame);
      };
    }, []);

    return (
      <div className="space-cursor" aria-hidden="true">
        <i ref={cursorRef} />
        <b ref={dotRef} />
      </div>
    );
  }

  function MissionProgress() {
    return (
      <nav className="mission-progress" aria-label="Cosmic journey sections">
        {missionStops.map((stop) => (
          <a key={stop.href} href={stop.href}>
            <i aria-hidden="true" />
            <span>{stop.label}</span>
          </a>
        ))}
      </nav>
    );
  }
  
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
          <div className="loader-sigil">
            <i /><i /><i />
          </div>
          <span>Calibrating deep-space telemetry</span>
        </div>
        <SpaceCursor />
        <SpaceScene />
        <MissionProgress />
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
