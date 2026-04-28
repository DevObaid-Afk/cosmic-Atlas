import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const STAR_COLORS = ['#ffffff', '#dff8ff', '#b9d6ff', '#a7f7ff', '#d8c8ff'];
const NEBULA_COLORS = ['#7c4dff', '#2f7dff', '#62f6ff'];

function sceneProgress() {
  return window.__spaceProgress || { total: 0, blackHole: 0, cameraDepth: 0, parallax: 0 };
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

function CameraFloat({ intensity = 1 }) {
  const { camera, scene, viewport } = useThree();
  const fogColor = useMemo(() => new THREE.Color(), []);
  const blackFogColor = useMemo(() => new THREE.Color('#000000'), []);

  useFrame(({ clock, pointer }) => {
    const elapsed = clock.elapsedTime;
    const progress = sceneProgress();
    const mobileScale = viewport.width < 7 ? 0.62 : 1;
    const cinematicDepth = THREE.MathUtils.smoothstep(progress.cameraDepth, 0, 1);
    const finalApproach = THREE.MathUtils.smoothstep(progress.blackHole, 0, 1);
    const driftX = Math.sin(elapsed * 0.18) * 0.36 + pointer.x * 0.16;
    const driftY = Math.cos(elapsed * 0.14) * 0.22 + pointer.y * 0.1;
    const scrollPush = cinematicDepth * 6.4 + finalApproach * 2.1;
    const targetZ = 8.8 - scrollPush;
    const lookAheadZ = -14 - cinematicDepth * 8 - finalApproach * 6;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, driftX * intensity * mobileScale * (1 - finalApproach * 0.32), 0.03);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, driftY * intensity * mobileScale * (1 - finalApproach * 0.28), 0.03);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.022);
    camera.fov = THREE.MathUtils.lerp(camera.fov, 58 - finalApproach * 4, 0.018);
    camera.updateProjectionMatrix();
    camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, Math.sin(elapsed * 0.1) * 0.014 + finalApproach * 0.012, 0.018);
    camera.lookAt(pointer.x * 0.24 * (1 - finalApproach), pointer.y * 0.12 * (1 - finalApproach), lookAheadZ);

    if (scene.fog) {
      fogColor.set('#020412').lerp(blackFogColor, finalApproach * 0.72);
      scene.fog.color.copy(fogColor);
      scene.fog.near = THREE.MathUtils.lerp(scene.fog.near, 18 - finalApproach * 5, 0.025);
      scene.fog.far = THREE.MathUtils.lerp(scene.fog.far, 58 - finalApproach * 15, 0.025);
    }
  });

  return null;
}

function NebulaLayer({ color, position, scale, speed, opacity, rotation = 0, parallax = 0 }) {
  const mesh = useRef();
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: opacity },
    }),
    [color, opacity],
  );

  useFrame(({ clock }) => {
    const progress = sceneProgress();
    uniforms.uTime.value = clock.elapsedTime * speed;
    mesh.current.rotation.z = rotation + Math.sin(clock.elapsedTime * speed * 0.35) * 0.08;
    mesh.current.position.x = position[0] - progress.parallax * parallax * 0.26;
    mesh.current.position.z = position[2] + progress.parallax * parallax;
  });

  return (
    <mesh ref={mesh} position={position} scale={scale} rotation={[0, 0, rotation]}>
      <planeGeometry args={[1, 1, 96, 96]} />
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          uniform vec3 uColor;
          uniform float uOpacity;
          varying vec2 vUv;

          float glow(vec2 p, vec2 center, float radius, float softness) {
            float d = length(p - center);
            return smoothstep(radius, radius - softness, d);
          }

          void main() {
            vec2 p = vUv;
            float pulse = sin(uTime + p.x * 5.0 + p.y * 3.0) * 0.5 + 0.5;
            float cloud =
              glow(p, vec2(0.36 + sin(uTime * 0.22) * 0.06, 0.58), 0.52, 0.36) +
              glow(p, vec2(0.68, 0.38 + cos(uTime * 0.18) * 0.05), 0.42, 0.32) +
              glow(p, vec2(0.48, 0.42), 0.28, 0.2);
            float grain = fract(sin(dot(p * 420.0, vec2(12.9898, 78.233))) * 43758.5453);
            float alpha = clamp(cloud * (0.55 + pulse * 0.24) + grain * 0.045, 0.0, 1.0) * uOpacity;
            gl_FragColor = vec4(uColor, alpha);
          }
        `}
      />
    </mesh>
  );
}

function StarLayer({ count, radius, depth, speed, size, opacity, colorShift = 0, parallax = 0 }) {
  const mesh = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);
  const geometry = useMemo(() => new THREE.SphereGeometry(1, 6, 6), []);
  const material = useMemo(() => new THREE.MeshBasicMaterial({ transparent: true, opacity, toneMapped: false }), [opacity]);
  const stars = useMemo(() => {
    const x = new Float32Array(count);
    const y = new Float32Array(count);
    const z = new Float32Array(count);
    const scales = new Float32Array(count);
    const twinkles = new Float32Array(count);
    const colorIndexes = new Uint8Array(count);

    for (let i = 0; i < count; i += 1) {
      const theta = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * radius;
      x[i] = Math.cos(theta) * r;
      y[i] = (Math.random() - 0.5) * radius * 0.76;
      z[i] = -Math.random() * depth - 4;
      scales[i] = THREE.MathUtils.randFloat(size * 0.55, size * 1.7);
      twinkles[i] = Math.random() * Math.PI * 2;
      colorIndexes[i] = (i + colorShift) % STAR_COLORS.length;
    }
    return { x, y, z, scales, twinkles, colorIndexes };
  }, [colorShift, count, depth, radius, size]);

  useLayoutEffect(() => {
    for (let index = 0; index < count; index += 1) {
      dummy.position.set(stars.x[index], stars.y[index], stars.z[index]);
      dummy.scale.setScalar(stars.scales[index]);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(index, dummy.matrix);
      color.set(STAR_COLORS[stars.colorIndexes[index]]);
      mesh.current.setColorAt(index, color);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
    mesh.current.instanceColor.needsUpdate = true;
  }, [color, count, dummy, stars]);

  useFrame(({ clock }, delta) => {
    const elapsed = clock.elapsedTime;
    const progress = sceneProgress();
    const finalApproach = THREE.MathUtils.smoothstep(progress.blackHole, 0, 1);
    for (let index = 0; index < count; index += 1) {
      stars.z[index] += delta * speed;
      if (stars.z[index] > 7) {
        stars.z[index] = -depth - 7;
      }
      const shimmer = 0.74 + Math.sin(elapsed * 0.75 + stars.twinkles[index]) * 0.22;
      const centerPull = finalApproach * parallax * 0.018;
      dummy.position.set(
        stars.x[index] * (1 - centerPull) + Math.sin(elapsed * 0.04 + stars.y[index]) * 0.12,
        stars.y[index] * (1 - centerPull),
        stars.z[index] + finalApproach * parallax * 0.8,
      );
      dummy.scale.setScalar(stars.scales[index] * shimmer);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(index, dummy.matrix);
    }
    mesh.current.rotation.z = Math.sin(elapsed * 0.025) * 0.015 + finalApproach * parallax * 0.012;
    mesh.current.position.x = -progress.parallax * parallax * 0.18;
    mesh.current.position.z = progress.parallax * parallax;
    mesh.current.material.opacity = opacity * (1 - finalApproach * 0.28);
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[geometry, material, count]} frustumCulled={false} />
  );
}

function FloatingParticles({ count = 70 }) {
  const points = useRef();
  const material = useMemo(
    () => new THREE.PointsMaterial({
      color: '#7df5ff',
      size: 0.028,
      transparent: true,
      opacity: 0.48,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    }),
    [],
  );
  const { positions, sizes } = useMemo(() => {
    const positionData = new Float32Array(count * 3);
    const sizeData = new Float32Array(count);

    for (let i = 0; i < count; i += 1) {
      positionData[i * 3] = (Math.random() - 0.5) * 18;
      positionData[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positionData[i * 3 + 2] = -Math.random() * 18 - 2;
      sizeData[i] = THREE.MathUtils.randFloat(0.018, 0.055);
    }

    return { positions: positionData, sizes: sizeData };
  }, [count]);

  useFrame(({ clock }) => {
    const elapsed = clock.elapsedTime;
    const progress = sceneProgress();
    points.current.rotation.y = Math.sin(elapsed * 0.07) * 0.04;
    points.current.rotation.x = Math.cos(elapsed * 0.05) * 0.025;
    points.current.position.y = Math.sin(elapsed * 0.18) * 0.16;
    points.current.position.z = progress.parallax * 2.4;
  });

  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={sizes.length} array={sizes} itemSize={1} />
      </bufferGeometry>
      <primitive object={material} attach="material" />
    </points>
  );
}

function SpaceEnvironment() {
  const group = useRef();

  useFrame(({ clock }) => {
    const elapsed = clock.elapsedTime;
    const progress = sceneProgress();
    group.current.rotation.y = Math.sin(elapsed * 0.025) * 0.035;
    group.current.position.x = Math.sin(elapsed * 0.035) * 0.18 - progress.parallax * 0.22;
  });

  return (
    <group ref={group}>
      <NebulaLayer color={NEBULA_COLORS[0]} position={[-3.4, 1.6, -18]} scale={[18, 10, 1]} speed={0.34} opacity={0.18} rotation={-0.18} parallax={0.7} />
      <NebulaLayer color={NEBULA_COLORS[1]} position={[4.5, -1.2, -23]} scale={[22, 12, 1]} speed={0.24} opacity={0.15} rotation={0.34} parallax={0.35} />
      <NebulaLayer color={NEBULA_COLORS[2]} position={[0.7, 0.1, -15]} scale={[13, 7.5, 1]} speed={0.42} opacity={0.11} rotation={0.08} parallax={1.1} />
      <StarLayer count={450} radius={12} depth={24} speed={0.22} size={0.013} opacity={0.92} parallax={2.2} />
      <StarLayer count={650} radius={20} depth={40} speed={0.12} size={0.01} opacity={0.72} colorShift={2} parallax={1.15} />
      <StarLayer count={850} radius={34} depth={66} speed={0.06} size={0.008} opacity={0.56} colorShift={4} parallax={0.45} />
      <FloatingParticles />
    </group>
  );
}

export default function SpaceScene({ className = '', cameraFloat = 1 }) {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <div className={`space-canvas ${className}`.trim()} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 8.8], fov: 58, near: 0.1, far: 90 }}
        dpr={[1, 1.15]}
        frameloop={prefersReducedMotion ? 'demand' : 'always'}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#01020a']} />
        <fog attach="fog" args={['#020412', 18, 58]} />
        <SpaceEnvironment />
        {!prefersReducedMotion && <CameraFloat intensity={cameraFloat} />}
      </Canvas>
      <div className="cosmic-depth-fade" />
    </div>
  );
}
