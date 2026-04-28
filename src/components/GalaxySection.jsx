import InfoCard from './InfoCard.jsx';
import { galaxyFacts } from '../data/spaceData.js';
import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

function SpiralGalaxy() {
  const points = useRef();
  const halo = useRef();
  const positions = useMemo(() => {
    const count = 5200;
    const data = new Float32Array(count * 3);

    for (let i = 0; i < count; i += 1) {
      const arm = i % 4;
      const radius = Math.pow(Math.random(), 0.58) * 4.4;
      const angle = radius * 1.85 + arm * Math.PI * 0.5 + (Math.random() - 0.5) * 0.52;
      data[i * 3] = Math.cos(angle) * radius + (Math.random() - 0.5) * 0.18;
      data[i * 3 + 1] = (Math.random() - 0.5) * 0.26;
      data[i * 3 + 2] = Math.sin(angle) * radius + (Math.random() - 0.5) * 0.18;
    }

    return data;
  }, []);

  useFrame(({ clock }, delta) => {
    points.current.rotation.y += delta * 0.065;
    points.current.rotation.z = Math.sin(clock.elapsedTime * 0.16) * 0.035;
    halo.current.rotation.z -= delta * 0.035;
  });

  return (
    <group rotation={[0.9, 0, -0.36]}>
      <points ref={points}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial color="#dff8ff" size={0.035} transparent opacity={0.82} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
      <mesh ref={halo} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.2, 0.16, 18, 220]} />
        <meshBasicMaterial color="#7c4dff" transparent opacity={0.18} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.36, 48, 48]} />
        <meshBasicMaterial color="#fff8d9" transparent opacity={0.92} />
      </mesh>
      <pointLight intensity={4} distance={7} color="#9fefff" />
    </group>
  );
}

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
        <Canvas camera={{ position: [0, 4.5, 7], fov: 42 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
          <ambientLight intensity={0.35} />
          <SpiralGalaxy />
        </Canvas>
        <span className="galaxy-label label-core">Dense stellar core</span>
        <span className="galaxy-label label-arm">Spiral arms</span>
        <span className="galaxy-label label-halo">Dust and gas halo</span>
      </div>
      <div className="card-grid compact reveal-group">
        {galaxyFacts.map((fact) => <InfoCard key={fact.title} {...fact} />)}
      </div>
    </section>
  );
}
