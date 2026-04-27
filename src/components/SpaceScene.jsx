import React from "react";
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, OrbitControls, Stars } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

function useSceneProgress() {
  return window.__spaceProgress || { total: 0, blackHole: 0 };
}

function CameraRig() {
  const { camera } = useThree();

  useFrame(() => {
    const progress = useSceneProgress();
    const t = progress.total;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, Math.sin(t * Math.PI * 2) * 2.3, 0.035);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 1.2 - t * 1.8, 0.035);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, 12 - t * 18 + progress.blackHole * 5, 0.035);
    camera.lookAt(0, -0.4, -8 - progress.blackHole * 6);
  });

  return null;
}

function Planet({ position, color, size, emissive = '#07111f' }) {
  const ref = useRef();

  useFrame((_, delta) => {
    ref.current.rotation.y += delta * 0.28;
    ref.current.rotation.x += delta * 0.05;
  });

  return (
    <Float speed={1.8} rotationIntensity={0.25} floatIntensity={0.6}>
      <group position={position}>
        <mesh ref={ref}>
          <sphereGeometry args={[size, 64, 64]} />
          <meshStandardMaterial color={color} roughness={0.55} metalness={0.08} emissive={emissive} />
        </mesh>
        <mesh rotation={[Math.PI / 2.15, 0, 0]}>
          <torusGeometry args={[size * 1.65, 0.012, 10, 120]} />
          <meshBasicMaterial color="#84f8ff" transparent opacity={0.35} />
        </mesh>
      </group>
    </Float>
  );
}

function GalaxyParticles() {
  const ref = useRef();
  const positions = useMemo(() => {
    const pts = new Float32Array(2600 * 3);
    for (let i = 0; i < 2600; i += 1) {
      const radius = Math.random() * 5.5;
      const arm = (i % 4) * (Math.PI / 2);
      const angle = radius * 1.7 + arm + (Math.random() - 0.5) * 0.45;
      pts[i * 3] = Math.cos(angle) * radius;
      pts[i * 3 + 1] = (Math.random() - 0.5) * 0.22;
      pts[i * 3 + 2] = Math.sin(angle) * radius - 13;
    }
    return pts;
  }, []);

  useFrame((_, delta) => {
    ref.current.rotation.y += delta * 0.045;
    ref.current.rotation.z += delta * 0.018;
  });

  return (
    <points ref={ref} position={[0.4, -0.8, -6]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#d8f7ff" size={0.035} transparent opacity={0.82} blending={THREE.AdditiveBlending} />
    </points>
  );
}

function NebulaVeil() {
  const ref = useRef();

  useFrame((state) => {
    ref.current.rotation.z = state.clock.elapsedTime * 0.018;
    ref.current.material.opacity = 0.2 + Math.sin(state.clock.elapsedTime * 0.4) * 0.05;
  });

  return (
    <mesh ref={ref} position={[-2.5, 1.3, -9]} scale={[8, 4.2, 1]}>
      <planeGeometry args={[1, 1, 48, 48]} />
      <meshBasicMaterial color="#7a4cff" transparent opacity={0.22} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  );
}

function BlackHole() {
  const group = useRef();
  const disk = useRef();
  const arcs = useRef();

  useFrame((state, delta) => {
    const p = useSceneProgress().blackHole;
    group.current.position.z = THREE.MathUtils.lerp(-22, -7.2, p);
    group.current.scale.setScalar(THREE.MathUtils.lerp(0.65, 2.8, p));
    disk.current.rotation.z += delta * (0.45 + p * 1.8);
    disk.current.material.opacity = 0.55 + p * 0.42;
    arcs.current.rotation.z = -state.clock.elapsedTime * (0.18 + p * 0.5);
    document.documentElement.style.setProperty('--horizon', p.toFixed(3));
  });

  return (
    <group ref={group} position={[0, -0.2, -22]}>
      <mesh>
        <sphereGeometry args={[1.32, 96, 96]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh ref={disk} rotation={[1.32, 0, 0]}>
        <torusGeometry args={[2.1, 0.14, 24, 220]} />
        <meshBasicMaterial color="#ffb44c" transparent opacity={0.7} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={arcs} rotation={[1.45, 0.15, 0]}>
        <torusGeometry args={[2.85, 0.018, 8, 240]} />
        <meshBasicMaterial color="#8af7ff" transparent opacity={0.7} blending={THREE.AdditiveBlending} />
      </mesh>
      <pointLight color="#ffb35c" intensity={18} distance={9} />
    </group>
  );
}

function SceneObjects() {
  return (
    <>
      <ambientLight intensity={0.38} />
      <directionalLight position={[4, 5, 5]} intensity={2.5} color="#b8eaff" />
      <Stars radius={90} depth={55} count={7000} factor={4} saturation={0.6} fade speed={0.7} />
      <NebulaVeil />
      <Planet position={[-3.8, 0.6, -3.5]} color="#3f8cff" size={0.72} emissive="#08274f" />
      <Planet position={[3.5, -1.2, -5.2]} color="#d49b58" size={0.48} emissive="#3a1704" />
      <Planet position={[1.7, 1.8, -8.4]} color="#7df5ff" size={0.34} emissive="#06454a" />
      <GalaxyParticles />
      <BlackHole />
      <CameraRig />
      <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
    </>
  );
}

export default function SpaceScene() {
  return (
    <div className="space-canvas" aria-hidden="true">
      <Canvas camera={{ position: [0, 1.2, 12], fov: 52 }} dpr={[1, 1.75]} gl={{ antialias: true, alpha: true }}>
        <SceneObjects />
      </Canvas>
      <div className="star-warp" />
      <div className="horizon-vignette" />
    </div>
  );
}
