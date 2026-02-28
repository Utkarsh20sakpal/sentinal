import { Canvas } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';

function FloatingParticles() {
  const ref = useRef<THREE.Points>(null);
  const sphere = useMemo(() => {
    const positions = new Float32Array(5000 * 3);
    for (let i = 0; i < 5000; i += 1) {
      const r = 1.2 * Math.random();
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      positions.set([x, y, z], i * 3);
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.getElapsedTime() * 0.04;
  });

  return (
    <group rotation={[0, 0, Math.PI / 8]}>
      <Points
        ref={ref}
        positions={sphere}
        stride={3}
        frustumCulled
      >
        <PointMaterial
          transparent
          color="#22d3ee"
          size={0.01}
          sizeAttenuation
          depthWrite={false}
        />
      </Points>
    </group>
  );
}

const ThreeBackground = () => {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 2.4], fov: 55 }}>
        <color attach="background" args={['#020617']} />
        <ambientLight intensity={0.7} />
        <FloatingParticles />
      </Canvas>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),transparent_55%),radial-gradient(circle_at_bottom,_rgba(129,140,248,0.18),transparent_55%)]" />
    </div>
  );
};

export default ThreeBackground;


