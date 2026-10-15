"use client";

import { Suspense, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  useGLTF,
  ContactShadows,
  Float,
  OrbitControls,
  Environment,
} from "@react-three/drei";
import * as THREE from "three";
import { useInView } from "./useInView";

function Can() {
  const spin = useRef<THREE.Group>(null);
  const lastScroll = useRef(0);

  const { scene } = useGLTF("/models/sola_can.glb");

  // gentle idle spin + extra spin driven by page scroll
  useFrame((_, delta) => {
    if (!spin.current) return;
    const y = typeof window !== "undefined" ? window.scrollY : 0;
    const dScroll = y - lastScroll.current;
    lastScroll.current = y;
    spin.current.rotation.y += delta * 0.22 + dScroll * 0.004;
  });

  // glTF export already converts Blender Z-up → three Y-up, so the can is upright.
  // outer group spins on Y; inner group holds a deliberate product lean.
  return (
    <group ref={spin}>
      <group rotation={[0.1, 0, 0.09]} scale={1.45}>
        <primitive object={scene} />
      </group>
    </group>
  );
}

export default function Scene() {
  const { ref, inView } = useInView<HTMLCanvasElement>();
  // drag-to-orbit on desktop only; on touch it would hijack vertical scrolling.
  // Client-only component (ssr:false), so reading matchMedia at init is safe.
  const [touch] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches,
  );

  return (
    <Canvas
      ref={ref}
      frameloop={inView ? "always" : "never"}
      camera={{ position: [0, 0, 6], fov: 32 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      dpr={[1, 2]}
      performance={{ min: 0.5 }}
    >
      <ambientLight intensity={0.5} />
      {/* key */}
      <spotLight
        position={[5, 8, 6]}
        angle={0.35}
        penumbra={1}
        intensity={95}
        color="#fff4e6"
      />
      {/* warm fill */}
      <spotLight position={[-6, 2, 4]} intensity={32} color="#ffd9b0" />
      {/* cool back rim — carves the aluminum edge for a real-product highlight */}
      <spotLight
        position={[-3, 5, -6]}
        angle={0.5}
        penumbra={1}
        intensity={70}
        color="#dfe8ff"
      />
      <directionalLight position={[0, 4, 8]} intensity={0.8} color="#fff" />

      {/* The can (small, preloaded GLB) gets its own boundary so it paints the
          moment it's ready — it no longer waits on the 1.5 MB HDRI. The explicit
          spotlights above already light it; the HDRI only sharpens reflections. */}
      <Suspense fallback={null}>
        <Float speed={1.3} rotationIntensity={0.12} floatIntensity={0.45}>
          <Can />
        </Float>
      </Suspense>

      {/* real studio HDRI for true glossy metal reflections (CC0 Poly Haven) —
          loads in parallel in its own boundary and pops in a beat later */}
      <Suspense fallback={null}>
        <Environment
          files="/hdri/studio.hdr"
          environmentIntensity={1.0}
          environmentRotation={[0, Math.PI, 0]}
        />
      </Suspense>

      <ContactShadows
        position={[0, -0.95, 0]}
        opacity={0.4}
        scale={6}
        blur={3}
        far={4}
        color="#2a211c"
      />

      {!touch && (
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 2.6}
          maxPolarAngle={Math.PI / 1.8}
        />
      )}
    </Canvas>
  );
}

useGLTF.preload("/models/sola_can.glb");
