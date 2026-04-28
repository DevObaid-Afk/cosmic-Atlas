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
    <section ref={sectionRef} className="section black-hole-section black-hole-experience" data-scene="blackhole">
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
      <style>{`
        .black-hole-experience {
          --black-hole-progress: 0;
          position: relative;
          overflow: hidden;
        }

        .black-hole-experience .section-copy,
        .black-hole-experience .black-hole-grid,
        .black-hole-experience .horizon-terminal {
          position: relative;
          z-index: 2;
        }

        .black-hole-experience .black-hole-visual {
          z-index: 2;
          transform: scale(calc(0.96 + var(--black-hole-progress) * 0.08));
          transition: transform 160ms linear;
        }

        .gravity-well {
          position: absolute;
          width: 86%;
          aspect-ratio: 1;
          border-radius: 50%;
          background:
            radial-gradient(circle, transparent 0 28%, rgba(128, 247, 255, 0.12) 34%, transparent 45%),
            repeating-conic-gradient(from 18deg, rgba(128, 247, 255, 0.16) 0deg 1.4deg, transparent 1.8deg 10deg);
          opacity: calc(0.24 + var(--black-hole-progress) * 0.34);
        }

        .particle-swirl {
          position: absolute;
          width: 70%;
          height: 42%;
          border-radius: 50%;
          transform: rotateX(72deg) rotateZ(0deg);
          background:
            radial-gradient(circle at 12% 50%, rgba(255, 236, 184, 0.72) 0 0.16rem, transparent 0.2rem),
            radial-gradient(circle at 28% 24%, rgba(128, 247, 255, 0.62) 0 0.12rem, transparent 0.16rem),
            radial-gradient(circle at 64% 76%, rgba(255, 188, 99, 0.72) 0 0.15rem, transparent 0.2rem),
            radial-gradient(circle at 88% 44%, rgba(216, 200, 255, 0.64) 0 0.11rem, transparent 0.15rem);
          opacity: calc(0.45 + var(--black-hole-progress) * 0.28);
          animation: particleOrbit 14s linear infinite;
        }

        .swirl-b {
          width: 58%;
          height: 34%;
          animation-duration: 9s;
          animation-direction: reverse;
          opacity: calc(0.32 + var(--black-hole-progress) * 0.3);
        }

        .black-hole-experience .disk-outer {
          box-shadow:
            0 0 calc(30px + var(--black-hole-progress) * 34px) rgba(255, 188, 99, calc(0.34 + var(--black-hole-progress) * 0.24)),
            0 0 calc(72px + var(--black-hole-progress) * 56px) rgba(128, 247, 255, calc(0.13 + var(--black-hole-progress) * 0.14)),
            inset 0 0 28px rgba(255, 188, 99, 0.22);
        }

        .black-hole-experience .event-horizon {
          transform: scale(calc(0.98 + var(--black-hole-progress) * 0.05));
          box-shadow:
            0 0 0 1px rgba(128, 247, 255, 0.12),
            0 0 calc(48px + var(--black-hole-progress) * 54px) rgba(0, 0, 0, 0.96),
            0 0 calc(82px + var(--black-hole-progress) * 46px) rgba(255, 188, 99, calc(0.18 + var(--black-hole-progress) * 0.16));
        }

        .center-lens,
        .final-darkness {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
        }

        .center-lens {
          background:
            radial-gradient(circle at 50% 43%, transparent 0 15%, rgba(128, 247, 255, calc(var(--black-hole-progress) * 0.1)) 18%, transparent 31%),
            radial-gradient(circle at 50% 43%, transparent 0 22%, rgba(255, 188, 99, calc(var(--black-hole-progress) * 0.08)) 27%, transparent 42%);
          opacity: calc(0.38 + var(--black-hole-progress) * 0.42);
          transform: scale(calc(1 + var(--black-hole-progress) * 0.035));
        }

        .final-darkness {
          background:
            radial-gradient(circle at 50% 43%, transparent 0 21%, rgba(0, 0, 0, calc(var(--black-hole-progress) * 0.18)) 52%, rgba(0, 0, 0, calc(var(--black-hole-progress) * 0.68)) 100%);
          opacity: 1;
        }

        @keyframes gravitySpin {
          to { transform: rotate(360deg); }
        }

        @keyframes particleOrbit {
          to { transform: rotateX(72deg) rotateZ(360deg); }
        }

        @media (max-width: 700px) {
          .particle-swirl {
            width: 78%;
          }
        }
      `}</style>
    </section>
  );
}
