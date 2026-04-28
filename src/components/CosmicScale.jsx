import InfoCard from './InfoCard.jsx';
import { scaleFacts } from '../data/spaceData.js';

const scaleStops = [
  { label: 'Moon', value: '1.3 light-sec', width: '12%' },
  { label: 'Sun', value: '8.3 light-min', width: '28%' },
  { label: 'Neptune', value: '4.1 light-hr', width: '45%' },
  { label: 'Proxima Centauri', value: '4.24 ly', width: '68%' },
  { label: 'Milky Way', value: '100k ly', width: '88%' },
];

export default function CosmicScale() {
  return (
    <section className="section scale-section" data-scene="scale">
      <div className="section-copy reveal">
        <p className="eyebrow">Cosmic scale</p>
        <h2>Distance is the universe's deepest user interface.</h2>
        <p>
          Light-years turn space into time. Looking farther means looking older,
          from nearby planets to galaxies whose light began traveling before
          Earth existed.
        </p>
      </div>
      <div className="scale-ruler reveal">
        <div className="scale-beam" />
        {scaleStops.map((stop) => (
          <div className="scale-stop" style={{ '--stop-width': stop.width }} key={stop.label}>
            <i />
            <strong>{stop.label}</strong>
            <span>{stop.value}</span>
          </div>
        ))}
      </div>
      <div className="lightyear-panel reveal">
        <div>
          <span>Light-year comparison</span>
          <strong>1 light-year = 9.46 trillion kilometers</strong>
        </div>
        <p>At light speed, Earth to Moon is seconds. Reaching the nearest star is years.</p>
      </div>
      <div className="card-grid compact reveal-group">
        {scaleFacts.map((fact) => <InfoCard key={fact.title} {...fact} />)}
      </div>
    </section>
  );
}
