import { useEffect, useRef } from 'react';
import InfoCard from './InfoCard.jsx';
import { blackHoleFacts } from '../data/spaceData.js';

export default function BlackHoleJourney() {
  const sectionRef = useRef(null);

  useEffect(() => {
    let frame;

    const update = () => {
      const progress = window.__spaceProgress?.blackHole || 0;
      sectionRef.current?.style.setProperty('--black-hole-progress', progress.toFixed(3));
      frame = requestAnimationFrame(update);
    };

    update();

    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <section ref={sectionRef} id="black-hole" className="section black-hole-section black-hole-experience" data-scene="blackhole" aria-labelledby="black-hole-title">
      <div className="section-copy centered reveal">
        <p className="eyebrow">Final approach</p>
        <h2 id="black-hole-title">The event horizon turns direction into destiny.</h2>
        <p>
          As the camera falls inward, the accretion disk brightens, background
          stars smear into arcs, and the visible universe fades behind the
          horizon's curved darkness.
        </p>
      </div>
      <div className="black-hole-visual reveal" role="img" aria-label="A centered black hole with glowing accretion disks, particle swirl, and a darkening gravity well.">
        <div className="gravity-well" />
        <div className="particle-swirl swirl-a" />
        <div className="particle-swirl swirl-b" />
        <div className="accretion-disk disk-outer" />
        <div className="accretion-disk disk-inner" />
        <div className="event-horizon" />
      </div>
      <div className="card-grid compact black-hole-grid reveal-group">
        {blackHoleFacts.map((fact) => <InfoCard key={fact.title} {...fact} />)}
      </div>
      <div className="horizon-terminal reveal">
        <span>Signal degradation</span>
        <strong>Crossing Schwarzschild boundary</strong>
      </div>
      <div className="center-lens" aria-hidden="true" />
      <div className="final-darkness" aria-hidden="true" />
    </section>
  );
}
