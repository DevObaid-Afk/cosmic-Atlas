import InfoCard from './InfoCard.jsx';
import { planetFacts } from '../data/spaceData.js';
import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

const planetModels = [
  { name: 'Mercury', radius: 0.3, orbit: 1.15, color: '#b9aaa0', roughness: 0.92, speed: 0.72, spin: 0.55 },
  { name: 'Earth', radius: 0.42, orbit: 1.95, color: '#4c9dff', roughness: 0.52, speed: 0.45, spin: 0.68, emissive: '#092342' },
  { name: 'Jupiter', radius: 0.68, orbit: 2.95, color: '#d8a46d', roughness: 0.66, speed: 0.24, spin: 0.92, emissive: '#2e1708' },
  { name: 'Neptune', radius: 0.48, orbit: 4.05, color: '#3e72ff', roughness: 0.58, speed: 0.16, spin: 0.58, emissive: '#06134a' },
];

function makePlanetTexture(model) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const base = new THREE.Color(model.color);

  ctx.fillStyle = model.color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < canvas.height; y += model.name === 'Jupiter' ? 8 : 14) {
    const tone = base.clone().offsetHSL(0, 0, (Math.random() - 0.5) * 0.18);
    ctx.fillStyle = `#${tone.getHexString()}`;
    ctx.globalAlpha = model.name === 'Jupiter' ? 0.46 : 0.18;
    ctx.fillRect(0, y, canvas.width, Math.max(3, Math.random() * 10));
  }

  if (model.name === 'Earth') {
    ctx.globalAlpha = 0.38;
    ctx.fillStyle = '#2bdc9b';
    for (let i = 0; i < 28; i += 1) {
      ctx.beginPath();
      ctx.ellipse(Math.random() * canvas.width, Math.random() * canvas.height, 10 + Math.random() * 24, 4 + Math.random() * 12, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (model.name === 'Mercury') {
    ctx.globalAlpha = 0.24;
    ctx.fillStyle = '#1d1714';
    for (let i = 0; i < 36; i += 1) {
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1 + Math.random() * 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.globalAlpha = 1;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 2;
  return texture;
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setPrefersReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return prefersReducedMotion;
}

function OrbitRing({ radius }) {
  const geometry = useMemo(() => new THREE.TorusGeometry(radius, 0.004, 8, 120), [radius]);
  const material = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#7df5ff', transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending }),
    [],
  );

  return (
    <mesh geometry={geometry} material={material} rotation={[Math.PI / 2, 0, 0]} />
  );
}

function PlanetBody({ model, index }) {
  const pivot = useRef();
  const planet = useRef();
  const cloud = useRef();
  const phase = useMemo(() => index * 1.7, [index]);
  const texture = useMemo(() => makePlanetTexture(model), [model]);
  const planetGeometry = useMemo(() => new THREE.SphereGeometry(model.radius, 36, 36), [model.radius]);
  const planetMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: model.color,
      map: texture,
      roughness: model.roughness,
      metalness: 0.04,
      emissive: model.emissive || '#080808',
      emissiveIntensity: 0.14,
    }),
    [model, texture],
  );
  const cloudGeometry = useMemo(() => new THREE.SphereGeometry(model.radius, 24, 24), [model.radius]);
  const cloudMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#dff8ff', transparent: true, opacity: 0.16, roughness: 1, depthWrite: false }), []);
  const ringGeometry = useMemo(() => new THREE.TorusGeometry(model.radius * 1.38, 0.012, 8, 120), [model.radius]);
  const ringMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: '#ffd7a6', transparent: true, opacity: 0.32, blending: THREE.AdditiveBlending }), []);

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
          <primitive object={planetGeometry} attach="geometry" />
          <primitive object={planetMaterial} attach="material" />
        </mesh>
        {model.name === 'Earth' && (
          <mesh ref={cloud} scale={1.018}>
            <primitive object={cloudGeometry} attach="geometry" />
            <primitive object={cloudMaterial} attach="material" />
          </mesh>
        )}
        {model.name === 'Jupiter' && (
          <mesh rotation={[Math.PI / 2.08, 0, 0]}>
            <primitive object={ringGeometry} attach="geometry" />
            <primitive object={ringMaterial} attach="material" />
          </mesh>
        )}
      </group>
    </group>
  );
}

function PlanetInfographic() {
  const group = useRef();
  const sunGeometry = useMemo(() => new THREE.SphereGeometry(0.2, 24, 24), []);
  const sunMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: '#fff4bd' }), []);

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
        <primitive object={sunGeometry} attach="geometry" />
        <primitive object={sunMaterial} attach="material" />
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
  const stageRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), { rootMargin: '160px' });
    if (stageRef.current) observer.observe(stageRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="planets" className="section split-section" data-scene="planets" aria-labelledby="planets-title">
      <div className="section-copy reveal">
        <p className="eyebrow">Planetary systems</p>
        <h2 id="planets-title">Worlds become readable when motion, scale, and light work together.</h2>
        <p>
          Planets are gravity-made records of their star systems. Atmospheres,
          magnetic fields, rings, storms, and moons reveal how material settled
          after a stellar nursery cleared.
        </p>
      </div>
      <div ref={stageRef} className="planet-stage reveal" role="img" aria-label="Animated orbital model showing rotating planets circling a central star.">
        <Canvas camera={{ position: [0, 4.1, 6.8], fov: 43 }} dpr={[1, 1.15]} frameloop={isVisible && !prefersReducedMotion ? 'always' : 'demand'} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}>
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
