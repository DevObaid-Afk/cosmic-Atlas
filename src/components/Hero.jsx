export default function Hero() {
  return (
    <section id="hero" className="section hero-section" data-scene="hero" aria-labelledby="hero-title">
      <div className="hero-copy reveal">
        <p className="eyebrow">Interactive cosmic atlas</p>
        <h1 id="hero-title">Journey from planetary worlds to the edge of a black hole.</h1>
        <p>
          Scroll through a cinematic deep-space infographic where planets orbit,
          galaxies bloom, nebulae glow, and gravity bends the final horizon.
        </p>
      </div>
      <div className="mission-panel glass reveal" aria-label="Mission path from Earth orbit to the event horizon">
        <span>Current vector</span>
        <strong>Earth orbit to event horizon</strong>
        <div className="signal-bars"><i /><i /><i /><i /></div>
      </div>
    </section>
  );
}
