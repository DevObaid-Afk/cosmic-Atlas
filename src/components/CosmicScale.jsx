import InfoCard from './InfoCard.jsx';
import { scaleFacts } from '../data/spaceData.js';

export default function CosmicScale() {
  return (
    <section className="section scale-section" data-scene="scale">
      <div className="section-copy reveal">
        <p className="eyebrow">Cosmic scale</p>
        <h2>Distance is the universe’s deepest user interface.</h2>
        <p>
          Light-years turn space into time. Looking farther means looking older,
          from nearby planets to galaxies whose light began traveling before
          Earth existed.
        </p>
      </div>
      <div className="scale-ruler reveal">
        <span>Moon</span>
        <span>Sun</span>
        <span>Nearest star</span>
        <span>Milky Way</span>
        <span>Observable edge</span>
      </div>
      <div className="card-grid compact">
        {scaleFacts.map((fact) => <InfoCard key={fact.title} {...fact} />)}
      </div>
    </section>
  );
}
