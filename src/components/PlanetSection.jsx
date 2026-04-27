import InfoCard from './InfoCard.jsx';
import { planetFacts } from '../data/spaceData.js';

export default function PlanetSection() {
  return (
    <section className="section split-section" data-scene="planets">
      <div className="section-copy reveal">
        <p className="eyebrow">Planetary systems</p>
        <h2>Worlds become readable when motion, scale, and light work together.</h2>
        <p>
          Planets are gravity-made records of their star systems. Atmospheres,
          magnetic fields, rings, storms, and moons reveal how material settled
          after a stellar nursery cleared.
        </p>
      </div>
      <div className="card-grid planet-grid">
        {planetFacts.map((fact) => <InfoCard key={fact.title} {...fact} />)}
      </div>
    </section>
  );
}
