"use client";

import { Canvas } from "@react-three/fiber";
import { Float, MeshTransmissionMaterial } from "@react-three/drei";

function FoldMesh() {
  return (
    <Float floatIntensity={0.8} rotationIntensity={0.35} speed={1.2}>
      <mesh rotation={[-0.7, 0.15, -0.2]} scale={[2.6, 2.6, 2.6]}>
        <octahedronGeometry args={[1, 0]} />
        <MeshTransmissionMaterial
          color="#F7F3E8"
          distortion={0.06}
          roughness={0.82}
          thickness={0.05}
          transmission={0.18}
        />
      </mesh>
    </Float>
  );
}

export function PaperFoldSculpture() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 42 }} dpr={[1, 1.5]}>
      <ambientLight intensity={1.1} />
      <directionalLight color="#F7F3E8" intensity={2.2} position={[3, 4, 5]} />
      <directionalLight color="#4A5B49" intensity={0.6} position={[-4, -2, 3]} />
      <FoldMesh />
    </Canvas>
  );
}
