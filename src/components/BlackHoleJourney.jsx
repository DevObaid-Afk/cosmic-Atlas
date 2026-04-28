import InfoCard from './InfoCard.jsx';
import { blackHoleFacts } from '../data/spaceData.js';

export default function BlackHoleJourney() {
  return (
    <section className="section black-hole-section" data-scene="blackhole">
      <div className="section-copy centered reveal">
        <p className="eyebrow">Final approach</p>
        <h2>The event horizon turns direction into destiny.</h2>
        <p>
          As the camera falls inward, the accretion disk brightens, background
          stars smear into arcs, and the visible universe fades behind the
          horizon's curved darkness.
        </p>
      </div>
      <div className="black-hole-visual reveal" aria-hidden="true">
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
    </section>
  );
}
