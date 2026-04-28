import InfoCard from './InfoCard.jsx';
import { planetFacts } from '../data/spaceData.js';
import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

const planetModels = [
  { name: 'Mercury', radius: 0.3, orbit: 1.15, color: '#b9aaa0', roughness: 0.92, speed: 0.72, spin: 0.55 },
  { name: 'Earth', radius: 0.42, orbit: 1.95, color: '#4c9dff', roughness: 0.52, speed: 0.45, spin: 0.68, emissive: '#092342' },
  { name: 'Jupiter', radius: 0.68, orbit: 2.95, color: '#d8a46d', roughness: 0.66, speed: 0.24, spin: 0.92, emissive: '#2e1708' },
  { name: 'Neptune', radius: 0.48, orbit: 4.05, color: '#3e72ff', roughness: 0.58, speed: 0.16, spin: 0.58, emissive: '#06134a' },
];

function OrbitRing({ radius }) {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius, 0.004, 8, 160]} />
      <meshBasicMaterial color="#7df5ff" transparent opacity={0.18} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

function PlanetBody({ model, index }) {
  const pivot = useRef();
  const planet = useRef();
  const cloud = useRef();
  const phase = useMemo(() => index * 1.7, [index]);

  useFrame(({ clock }, delta) => {
    pivot.current.rotation.y = clock.elapsedTime * model.speed + phase;
    planet.current.rotation.y += delta * model.spin;
    planet.current.rotation.x = Math.sin(clock.elapsedTime * 0.25 + index) * 0.08;
    if (cloud.current) cloud.current.rotation.y -= delta * 0.18;
  });

  return (
    <group ref={pivot}>
      <group position={[model.orbit, 0, 0]}>
        <mesh ref={planet} castShadow receiveShadow>
          <sphereGeometry args={[model.radius, 48, 48]} />
          <meshStandardMaterial
            color={model.color}
            roughness={model.roughness}
            metalness={0.04}
            emissive={model.emissive || '#080808'}
            emissiveIntensity={0.14}
          />
        </mesh>
        {model.name === 'Earth' && (
          <mesh ref={cloud} scale={1.018}>
            <sphereGeometry args={[model.radius, 32, 32]} />
            <meshStandardMaterial color="#dff8ff" transparent opacity={0.16} roughness={1} depthWrite={false} />
          </mesh>
        )}
        {model.name === 'Jupiter' && (
          <mesh rotation={[Math.PI / 2.08, 0, 0]}>
            <torusGeometry args={[model.radius * 1.38, 0.012, 8, 160]} />
            <meshBasicMaterial color="#ffd7a6" transparent opacity={0.32} blending={THREE.AdditiveBlending} />
          </mesh>
        )}
      </group>
    </group>
  );
}

function PlanetInfographic() {
  const group = useRef();

  useFrame(({ clock }) => {
    group.current.rotation.x = -0.32 + Math.sin(clock.elapsedTime * 0.18) * 0.035;
    group.current.rotation.z = Math.sin(clock.elapsedTime * 0.14) * 0.025;
  });

  return (
    <group ref={group} rotation={[-0.32, 0, 0]}>
      <ambientLight intensity={0.42} />
      <directionalLight position={[4, 4, 5]} intensity={3.2} color="#f5fbff" castShadow />
      <pointLight position={[-3, -2, 2]} intensity={1.4} color="#625bff" />
      <mesh>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshBasicMaterial color="#fff4bd" />
      </mesh>
      <pointLight intensity={9} distance={8} color="#fff1b8" />
      {planetModels.map((model) => (
        <OrbitRing key={`${model.name}-orbit`} radius={model.orbit} />
      ))}
      {planetModels.map((model, index) => (
        <PlanetBody key={model.name} model={model} index={index} />
      ))}
    </group>
  );
}

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
      <div className="planet-stage reveal">
        <Canvas camera={{ position: [0, 4.1, 6.8], fov: 43 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
          <PlanetInfographic />
        </Canvas>
        <div className="planet-readouts" aria-hidden="true">
          <span>Inner orbit</span>
          <span>Gas giant</span>
          <span>Ice giant</span>
        </div>
      </div>
      <div className="card-grid planet-grid reveal-group">
        {planetFacts.map((fact) => <InfoCard key={fact.title} {...fact} />)}
      </div>
    </section>
  );
}
