"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  type MutableRefObject,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Environment } from "@react-three/drei";
import * as THREE from "three";
import { SHOWCASE_FLAVORS } from "./showcaseData";

const N = SHOWCASE_FLAVORS.length;
const ENTRANCE = 0.16; // fraction of scroll spent on the cascade entrance
const SPREAD = 3.1; // horizontal gap between neighbouring cans
const DEPTH = 2.1; // how far side cans recede on Z
const FLOOR = -0.95; // reflective floor height
const BOTTOM = 0.575; // unscaled distance from can origin to its base
// nudge the carousel right of dead-centre on DESKTOP (clears the left caption);
// on mobile the caption stacks above/below, so the cans sit dead-centre instead
const CENTER_X_DESKTOP = 0.45;
const useCenterX = () =>
  useThree((s) => (s.size.width < 768 ? 0 : CENTER_X_DESKTOP));

const lerp = THREE.MathUtils.lerp;
const clamp = THREE.MathUtils.clamp;

function Can({
  src,
  index,
  progress,
  drag,
}: {
  src: string;
  index: number;
  progress: MutableRefObject<number>;
  drag: MutableRefObject<number>;
}) {
  const outer = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const centerX = useCenterX();
  const { scene } = useGLTF(src);

  // clone + make every material transparent so we can dim side cans into the dark
  const model = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) {
        const m = (mesh.material as THREE.Material).clone();
        m.transparent = true;
        mesh.material = m;
        mesh.castShadow = false;
      }
    });
    return c;
  }, [scene]);

  useFrame((state, delta) => {
    const g = outer.current;
    const s = spin.current;
    if (!g || !s) return;

    const p = progress.current;
    const entrance = clamp(p / ENTRANCE, 0, 1);

    // Staggered "stand-up" entrance: cans rise into place one after another —
    // the hero (centre) first, the rest fanning out to the right — so the moment
    // the section appears you see a premium hero plus a line of more to explore.
    const stagger = 0.1;
    const span = Math.max(0.4, 1 - stagger * (N - 1));
    const local = clamp((entrance - index * stagger) / span, 0, 1);
    const eased = 1 - Math.pow(1 - local, 3); // easeOutCubic

    // carousel position (float index 0..N-1)
    const f = clamp((p - ENTRANCE) / (1 - ENTRANCE), 0, 1) * (N - 1);
    const offset = index - f;
    const dist = Math.min(Math.abs(offset), 1.4);
    const activeness = 1 - Math.min(Math.abs(offset), 1); // 1 at centre

    // targets for the carousel state — active can is notably larger (hero impact)
    const tScale = lerp(0.6, 1.55, 1 - dist / 1.4);
    const tx = centerX + offset * SPREAD;
    const tz = -Math.abs(offset) * DEPTH + activeness * 0.6; // active leans toward camera
    // stand each can on the reflective floor (bottom-aligned), with a tiny bob
    const ty =
      FLOOR +
      BOTTOM * tScale +
      Math.sin(state.clock.elapsedTime * 0.9 + index) * 0.03 * eased;

    // Premium "materialise" entrance — NO rising up through the floor. Each can
    // fades in while scaling up and dollying FORWARD from depth, then settles.
    const y = lerp(ty + 0.12, ty, eased); // whisper of a settle, never below floor
    const z = lerp(tz - 0.9, tz, eased); // ease toward camera out of the dark
    const sc = lerp(tScale * 0.82, tScale, eased);

    g.position.x = lerp(g.position.x, tx, 0.14);
    g.position.y = lerp(g.position.y, y, 0.14);
    g.position.z = lerp(g.position.z, z, 0.14);
    g.scale.setScalar(lerp(g.scale.x, sc, 0.14));

    // active can spins (slow idle) + any user drag velocity, which decays (inertia);
    // side cans tilt away into a styled lineup (dynamic product-shot feel)
    if (activeness > 0.55 && entrance > 0.98) {
      // read-only: velocity is decayed by the owner (ShowcaseStage rAF)
      s.rotation.y += delta * 0.45 + drag.current;
      s.rotation.z = lerp(s.rotation.z, 0.03, 0.1);
      s.rotation.x = lerp(s.rotation.x, 0, 0.1);
    } else {
      const dir = Math.sign(offset) || 1;
      s.rotation.y = lerp(s.rotation.y, offset * 0.3, 0.1);
      s.rotation.z = lerp(s.rotation.z, -0.13 * dir * (1 - activeness), 0.1);
      s.rotation.x = lerp(s.rotation.x, 0.07 * (1 - activeness), 0.1);
    }

    // fade each can in on its own stagger, then dim the side cans into the dark
    const tOpacity = (0.26 + activeness * 0.74) * eased;
    model.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) {
        const m = mesh.material as THREE.Material & { opacity: number };
        m.opacity = lerp(m.opacity, tOpacity, 0.12);
      }
    });
  });

  return (
    <group ref={outer}>
      <group ref={spin}>
        <primitive object={model} />
      </group>
    </group>
  );
}

// soft white radial falloff (built once) — tinted per flavour, used as the glow pool
function radialTexture() {
  const s = 128;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.55, "rgba(255,255,255,0.35)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  return new THREE.CanvasTexture(c);
}

// Flavour-tint glow behind the active can: a coloured bounce light + an additive
// glow pool on the floor, both lerping through the flavour colours as you scroll.
function FloorGlow({ progress }: { progress: MutableRefObject<number> }) {
  const light = useRef<THREE.PointLight>(null);
  const pool = useRef<THREE.Mesh>(null);
  const centerX = useCenterX();
  const colors = useMemo(
    () => SHOWCASE_FLAVORS.map((f) => new THREE.Color(f.dot)),
    [],
  );
  const tex = useMemo(radialTexture, []);
  const tint = useMemo(() => new THREE.Color(), []);

  useFrame(() => {
    const p = progress.current;
    const f = clamp((p - ENTRANCE) / (1 - ENTRANCE), 0, 1) * (N - 1);
    const i = Math.floor(f);
    tint.copy(colors[i]).lerp(colors[Math.min(N - 1, i + 1)], f - i);
    const vis = clamp(p / ENTRANCE, 0, 1); // fade in with the entrance

    if (light.current) {
      light.current.color.copy(tint);
      light.current.intensity = 7 * vis;
    }
    if (pool.current) {
      const m = pool.current.material as THREE.MeshBasicMaterial;
      m.color.copy(tint);
      m.opacity = 0.3 * vis;
    }
  });

  return (
    <group>
      <pointLight
        ref={light}
        position={[centerX, FLOOR + 0.55, -1.1]}
        distance={8}
        decay={2}
      />
      <mesh
        ref={pool}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[centerX, FLOOR + 0.02, -0.2]}
      >
        <planeGeometry args={[5.5, 5.5]} />
        <meshBasicMaterial
          map={tex}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

// On orientation change the R3F canvas must re-measure and repaint — pump a
// burst of frames after the layout settles so the cans re-materialise even if
// the render loop was idling on-demand.
function ResizeRepaint() {
  const invalidate = useThree((s) => s.invalidate);
  const setSize = useThree((s) => s.setSize);
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    let lastW = window.innerWidth;
    const onResize = () => {
      if (window.innerWidth === lastW) return;
      lastW = window.innerWidth;
      requestAnimationFrame(() => {
        const parent = gl.domElement.parentElement;
        if (parent && parent.clientWidth && parent.clientHeight) {
          setSize(parent.clientWidth, parent.clientHeight);
        }
        let n = 0;
        const tick = () => {
          invalidate();
          if (n++ < 48) requestAnimationFrame(tick);
        };
        tick();
      });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [invalidate, setSize, gl]);
  return null;
}

export default function ShowcaseStage({
  progress,
}: {
  progress: MutableRefObject<number>;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  // user drag velocity added to the active can's spin (grab-to-spin)
  const drag = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let down = false;
    let lastX = 0;
    const onDown = (e: PointerEvent) => {
      down = true;
      lastX = e.clientX;
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      // horizontal movement -> spin; touch-action:pan-y keeps vertical scroll native
      drag.current += (e.clientX - lastX) * 0.01;
      lastX = e.clientX;
    };
    const onUp = () => {
      down = false;
    };
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);

    // inertia: decay the drag velocity each frame (owner of the ref does the mutation)
    let raf = 0;
    const decay = () => {
      drag.current *= 0.9;
      raf = requestAnimationFrame(decay);
    };
    raf = requestAnimationFrame(decay);

    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      cancelAnimationFrame(raf);
    };
  }, [ref]);

  return (
    <Canvas
      ref={ref}
      // always render: gating the loop on an IntersectionObserver left the cans
      // frozen/blank on some mobile browsers (notably iPad Safari, esp. in
      // landscape). A 6-can scene is light enough to keep live while mounted.
      frameloop="always"
      camera={{ position: [0, 0.2, 7], fov: 30 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      dpr={[1, 1.5]}
      performance={{ min: 0.5 }}
      style={{ touchAction: "pan-y", cursor: "grab" }}
    >
      <ambientLight intensity={0.44} />
      <spotLight
        position={[5, 8, 6]}
        angle={0.4}
        penumbra={1}
        intensity={135}
        color="#fff1dc"
      />
      <spotLight position={[-7, 3, 2]} intensity={60} color="#e8a977" />
      <directionalLight position={[0, 5, 8]} intensity={0.9} color="#ffffff" />

      <Suspense fallback={null}>
        {/* real studio HDRI (CC0 Poly Haven) — softbox reflections streak the aluminum */}
        <Environment
          files="/hdri/studio.hdr"
          environmentIntensity={0.95}
          environmentRotation={[0, Math.PI, 0]}
        />
        {SHOWCASE_FLAVORS.map((f, i) => (
          <Can
            key={f.src}
            src={f.src}
            index={i}
            progress={progress}
            drag={drag}
          />
        ))}
        {/* no floor — the cans float on the smooth espresso gradient; a soft
            flavour-tinted glow below the hero is the only grounding */}
        <FloorGlow progress={progress} />
      </Suspense>
      <ResizeRepaint />
    </Canvas>
  );
}

SHOWCASE_FLAVORS.forEach((f) => useGLTF.preload(f.src));
