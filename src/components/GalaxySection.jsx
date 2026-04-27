import InfoCard from './InfoCard.jsx';
import { galaxyFacts } from '../data/spaceData.js';

export default function GalaxySection() {
  return (
    <section className="section galaxy-section" data-scene="galaxy">
      <div className="section-copy centered reveal">
        <p className="eyebrow">Galaxies and nebulae</p>
        <h2>Star cities form inside luminous clouds of dust and ionized gas.</h2>
        <p>
          Spiral arms, stellar winds, and supernova shockwaves compress nebulae
          into new stars, while galactic rotation turns bright clusters into
          vast luminous architecture.
        </p>
      </div>
      <div className="galaxy-orbit reveal">
        <div className="spiral-ring ring-a" />
        <div className="spiral-ring ring-b" />
        <div className="spiral-core" />
      </div>
      <div className="card-grid compact">
        {galaxyFacts.map((fact) => <InfoCard key={fact.title} {...fact} />)}
      </div>
    </section>
  );
}
