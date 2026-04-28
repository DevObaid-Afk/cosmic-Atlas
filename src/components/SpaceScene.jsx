import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const STAR_COLORS = ['#ffffff', '#dff8ff', '#b9d6ff', '#a7f7ff', '#d8c8ff'];
const NEBULA_COLORS = ['#7c4dff', '#2f7dff', '#62f6ff'];

function sceneProgress() {
  return window.__spaceProgress || { total: 0, blackHole: 0 };
}

function CameraFloat({ intensity = 1 }) {
  const { camera, viewport } = useThree();

  useFrame(({ clock, pointer }) => {
    const elapsed = clock.elapsedTime;
    const progress = sceneProgress();
    const mobileScale = viewport.width < 7 ? 0.62 : 1;
    const driftX = Math.sin(elapsed * 0.18) * 0.42 + pointer.x * 0.22;
    const driftY = Math.cos(elapsed * 0.14) * 0.26 + pointer.y * 0.12;
    const scrollPush = progress.total * 2.2 - progress.blackHole * 1.4;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, driftX * intensity * mobileScale, 0.035);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, driftY * intensity * mobileScale, 0.035);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, 8.8 - scrollPush, 0.03);
    camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, Math.sin(elapsed * 0.1) * 0.018, 0.025);
    camera.lookAt(pointer.x * 0.45, pointer.y * 0.22, -14);
  });

  return null;
}

function NebulaLayer({ color, position, scale, speed, opacity, rotation = 0 }) {
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
    uniforms.uTime.value = clock.elapsedTime * speed;
    mesh.current.rotation.z = rotation + Math.sin(clock.elapsedTime * speed * 0.35) * 0.08;
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

function StarLayer({ count, radius, depth, speed, size, opacity, colorShift = 0 }) {
  const mesh = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);
  const stars = useMemo(() => {
    const data = [];
    for (let i = 0; i < count; i += 1) {
      const theta = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * radius;
      data.push({
        x: Math.cos(theta) * r,
        y: (Math.random() - 0.5) * radius * 0.76,
        z: -Math.random() * depth - 4,
        scale: THREE.MathUtils.randFloat(size * 0.55, size * 1.7),
        twinkle: Math.random() * Math.PI * 2,
        color: STAR_COLORS[(i + colorShift) % STAR_COLORS.length],
      });
    }
    return data;
  }, [colorShift, count, depth, radius, size]);

  useLayoutEffect(() => {
    stars.forEach((star, index) => {
      dummy.position.set(star.x, star.y, star.z);
      dummy.scale.setScalar(star.scale);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(index, dummy.matrix);
      color.set(star.color);
      mesh.current.setColorAt(index, color);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    mesh.current.instanceColor.needsUpdate = true;
  }, [color, dummy, stars]);

  useFrame(({ clock }, delta) => {
    const elapsed = clock.elapsedTime;
    stars.forEach((star, index) => {
      star.z += delta * speed;
      if (star.z > 7) {
        star.z = -depth - 7;
      }
      const shimmer = 0.74 + Math.sin(elapsed * 0.75 + star.twinkle) * 0.22;
      dummy.position.set(star.x + Math.sin(elapsed * 0.04 + star.y) * 0.12, star.y, star.z);
      dummy.scale.setScalar(star.scale * shimmer);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(index, dummy.matrix);
    });
    mesh.current.rotation.z = Math.sin(elapsed * 0.025) * 0.015;
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, count]} frustumCulled={false}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial transparent opacity={opacity} toneMapped={false} />
    </instancedMesh>
  );
}

function FloatingParticles({ count = 360 }) {
  const points = useRef();
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
    points.current.rotation.y = Math.sin(elapsed * 0.07) * 0.04;
    points.current.rotation.x = Math.cos(elapsed * 0.05) * 0.025;
    points.current.position.y = Math.sin(elapsed * 0.18) * 0.16;
  });

  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={sizes.length} array={sizes} itemSize={1} />
      </bufferGeometry>
      <pointsMaterial
        color="#7df5ff"
        size={0.028}
        transparent
        opacity={0.48}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
}

function SpaceEnvironment() {
  const group = useRef();

  useFrame(({ clock }) => {
    const elapsed = clock.elapsedTime;
    group.current.rotation.y = Math.sin(elapsed * 0.025) * 0.035;
    group.current.position.x = Math.sin(elapsed * 0.035) * 0.18;
  });

  return (
    <group ref={group}>
      <NebulaLayer color={NEBULA_COLORS[0]} position={[-3.4, 1.6, -18]} scale={[18, 10, 1]} speed={0.42} opacity={0.18} rotation={-0.18} />
      <NebulaLayer color={NEBULA_COLORS[1]} position={[4.5, -1.2, -23]} scale={[22, 12, 1]} speed={0.3} opacity={0.15} rotation={0.34} />
      <NebulaLayer color={NEBULA_COLORS[2]} position={[0.7, 0.1, -15]} scale={[13, 7.5, 1]} speed={0.54} opacity={0.11} rotation={0.08} />
      <StarLayer count={1800} radius={12} depth={24} speed={0.22} size={0.012} opacity={0.92} />
      <StarLayer count={2600} radius={20} depth={40} speed={0.12} size={0.009} opacity={0.7} colorShift={2} />
      <StarLayer count={3400} radius={34} depth={66} speed={0.06} size={0.007} opacity={0.52} colorShift={4} />
      <FloatingParticles />
    </group>
  );
}

export default function SpaceScene({ className = '', cameraFloat = 1 }) {
  return (
    <div className={`space-canvas ${className}`.trim()} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 8.8], fov: 58, near: 0.1, far: 90 }}
        dpr={[1, 1.6]}
        frameloop="always"
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#01020a']} />
        <fog attach="fog" args={['#020412', 18, 58]} />
        <SpaceEnvironment />
        <CameraFloat intensity={cameraFloat} />
      </Canvas>
      <div className="cosmic-depth-fade" />
    </div>
  );
}
