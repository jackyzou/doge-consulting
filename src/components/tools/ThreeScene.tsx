"use client";

import { useMemo, useState, useEffect, useImperativeHandle, forwardRef, useRef, useCallback } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import type { ContainerSpec } from "@/lib/unit-conversions";

// ── Types ─────────────────────────────────────────────────────
export interface CargoItem {
  id: string;
  name: string;
  lm: number; // meters
  wm: number;
  hm: number;
  weightKg: number;
  color: number;
  // Position inside container (set by packing algorithm)
  px: number;
  py: number;
  pz: number;
  packed: boolean;
}

export interface ThreeSceneProps {
  items: CargoItem[];
  container: ContainerSpec | null;
  showContainer: boolean;
  showHuman?: boolean;
  darkMode?: boolean;
  packedMode?: boolean; // when true, items are positioned inside the container
}

// ── Colors for cargo items ────────────────────────────────────
export const CARGO_COLORS = [
  0xf0a500, 0x2563eb, 0x16a34a, 0xdc2626, 0x9333ea,
  0xf97316, 0x06b6d4, 0xd946ef, 0x84cc16, 0xeab308,
];

// ── Scene background ──────────────────────────────────────────
function SceneSetup({ dark }: { dark: boolean }) {
  const { scene, gl } = useThree();
  useEffect(() => {
    const c = new THREE.Color(dark ? 0x111827 : 0xf0f4f8);
    scene.background = c;
    gl.setClearColor(c);
  }, [dark, scene, gl]);
  useFrame(() => {});
  return null;
}

// ── Ground ────────────────────────────────────────────────────
function Ground({ dark, cx }: { dark: boolean; cx: number }) {
  return (
    <group position={[cx, 0, 0]}>
      <gridHelper args={[30, 60, dark ? 0x374151 : 0x94a3b8, dark ? 0x1f2937 : 0xcbd5e1]} position={[0, -0.001, 0]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshBasicMaterial color={dark ? 0x0d1117 : 0xe2e8f0} />
      </mesh>
    </group>
  );
}

// ── Human (1.75m) ─────────────────────────────────────────────
function Human({ x }: { x: number }) {
  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, 1.58, 0]}><sphereGeometry args={[0.1, 12, 12]} /><meshBasicMaterial color={0xfbbf24} /></mesh>
      <mesh position={[0, 1.18, 0]}><boxGeometry args={[0.34, 0.48, 0.18]} /><meshBasicMaterial color={0x2563eb} /></mesh>
      <mesh position={[-0.24, 1.15, 0]}><boxGeometry args={[0.1, 0.5, 0.1]} /><meshBasicMaterial color={0x2563eb} /></mesh>
      <mesh position={[0.24, 1.15, 0]}><boxGeometry args={[0.1, 0.5, 0.1]} /><meshBasicMaterial color={0x2563eb} /></mesh>
      <mesh position={[0, 0.9, 0]}><boxGeometry args={[0.3, 0.06, 0.16]} /><meshBasicMaterial color={0x1e40af} /></mesh>
      <mesh position={[-0.08, 0.55, 0]}><boxGeometry args={[0.12, 0.62, 0.12]} /><meshBasicMaterial color={0x2563eb} /></mesh>
      <mesh position={[0.08, 0.55, 0]}><boxGeometry args={[0.12, 0.62, 0.12]} /><meshBasicMaterial color={0x2563eb} /></mesh>
      <mesh position={[-0.08, 0.2, 0.03]}><boxGeometry args={[0.12, 0.08, 0.18]} /><meshBasicMaterial color={0x1e293b} /></mesh>
      <mesh position={[0.08, 0.2, 0.03]}><boxGeometry args={[0.12, 0.08, 0.18]} /><meshBasicMaterial color={0x1e293b} /></mesh>
      <Html position={[0, 1.82, 0]} center>
        <div style={{ color: "#4ade80", fontSize: 10, whiteSpace: "nowrap", fontStyle: "italic" }}>Human (1.75m)</div>
      </Html>
    </group>
  );
}

// ── Single cargo box ──────────────────────────────────────────
function CargoBox({ item }: { item: CargoItem }) {
  const { lm, wm, hm, px, py, pz, color, name } = item;
  if (lm <= 0 || wm <= 0 || hm <= 0) return null;
  return (
    <group position={[px, py, pz]}>
      <mesh position={[lm / 2, hm / 2, wm / 2]}>
        <boxGeometry args={[lm, hm, wm]} />
        <meshBasicMaterial color={color} transparent opacity={0.82} />
      </mesh>
      <lineSegments position={[lm / 2, hm / 2, wm / 2]}>
        <edgesGeometry args={[new THREE.BoxGeometry(lm, hm, wm)]} />
        <lineBasicMaterial color={0x000000} transparent opacity={0.3} />
      </lineSegments>
      <Html position={[lm / 2, hm + 0.1, wm / 2]} center>
        <div style={{ background: "rgba(0,0,0,0.7)", color: "white", fontSize: 9, padding: "1px 5px", borderRadius: 3, whiteSpace: "nowrap", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis" }}>
          {name}
        </div>
      </Html>
    </group>
  );
}

// ── Container ─────────────────────────────────────────────────
function Container({ spec, posX }: { spec: ContainerSpec; posX: number }) {
  const { l, w, h } = spec.internalM;
  return (
    <group position={[posX, 0, 0]}>
      <mesh position={[l / 2, h / 2, -w / 2 + w / 2]}> {/* back */}
        <boxGeometry args={[l, h, 0.02]} />
        <meshBasicMaterial color={0xdc2626} transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, h / 2, w / 2]}> {/* left */}
        <boxGeometry args={[0.02, h, w]} />
        <meshBasicMaterial color={0xdc2626} transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[l, h / 2, w / 2]}> {/* right */}
        <boxGeometry args={[0.02, h, w]} />
        <meshBasicMaterial color={0xdc2626} transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[l / 2, h, w / 2]}> {/* ceiling */}
        <boxGeometry args={[l, 0.02, w]} />
        <meshBasicMaterial color={0xb91c1c} transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[l / 2, 0.005, w / 2]}> {/* floor */}
        <boxGeometry args={[l, 0.01, w]} />
        <meshBasicMaterial color={0x991b1b} transparent opacity={0.3} />
      </mesh>
      <mesh position={[l / 2, h / 2, w]}> {/* front - very translucent */}
        <boxGeometry args={[l, h, 0.02]} />
        <meshBasicMaterial color={0xdc2626} transparent opacity={0.12} side={THREE.DoubleSide} />
      </mesh>
      <lineSegments position={[l / 2, h / 2, w / 2]}>
        <edgesGeometry args={[new THREE.BoxGeometry(l, h, w)]} />
        <lineBasicMaterial color={0x7f1d1d} />
      </lineSegments>
      <Html position={[l / 2, h + 0.2, w / 2]} center>
        <div style={{ background: "rgba(127,29,29,0.9)", color: "white", fontSize: 11, padding: "3px 8px", borderRadius: 4, fontWeight: 600, whiteSpace: "nowrap" }}>
          {spec.label} — {spec.cbm} m³
        </div>
      </Html>
    </group>
  );
}

// ── Scene content ─────────────────────────────────────────────
function SceneContent(props: ThreeSceneProps) {
  const { items, container, showContainer, showHuman = true, darkMode = true, packedMode = false } = props;

  // When packed, items are positioned inside container starting at container origin
  // When unpacked, items are laid out side by side on the ground
  const containerX = useMemo(() => {
    if (!showContainer || !container) return 0;
    if (packedMode) return 0;
    // Place container to the right of all items
    let totalWidth = 0;
    for (const item of items) { if (item.lm > 0) totalWidth += item.lm + 0.1; }
    return totalWidth + 0.5;
  }, [items, showContainer, container, packedMode]);

  const humanX = useMemo(() => {
    if (!showHuman) return -999;
    return -0.6;
  }, [showHuman]);

  return (
    <>
      <SceneSetup dark={darkMode} />
      <ambientLight intensity={1.0} />
      <directionalLight position={[10, 15, 10]} intensity={1.2} />
      <pointLight position={[-8, 8, -8]} intensity={0.5} />
      <Ground dark={darkMode} cx={containerX * 0.3} />

      {showHuman && <Human x={humanX} />}

      {items.map((item) => (
        <CargoBox key={item.id} item={item} />
      ))}

      {showContainer && container && (
        <Container spec={container} posX={packedMode ? 0 : containerX} />
      )}

      <OrbitControls enablePan enableZoom enableRotate minDistance={0.5} maxDistance={50} maxPolarAngle={Math.PI / 2.05} target={[containerX * 0.3, 1, 0]} />
    </>
  );
}

// ── Snapshot ───────────────────────────────────────────────────
function SnapshotCapture({ onReady }: { onReady: (fn: () => string | null) => void }) {
  const { gl } = useThree();
  const cap = useCallback(() => { try { return gl.domElement.toDataURL("image/png"); } catch { return null; } }, [gl]);
  useEffect(() => { onReady(cap); }, [cap, onReady]);
  return null;
}

export interface ThreeSceneHandle { takeSnapshot: () => string | null; }

const Scene = forwardRef<ThreeSceneHandle, ThreeSceneProps>(function Scene(props, ref) {
  const { container, showContainer, darkMode = true, items } = props;
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const snapRef = useRef<(() => string | null) | null>(null);
  useImperativeHandle(ref, () => ({ takeSnapshot: () => snapRef.current?.() ?? null }), []);

  const maxDim = useMemo(() => {
    let m = 2;
    for (const it of items) m = Math.max(m, it.lm, it.wm, it.hm);
    if (showContainer && container) m = Math.max(m, container.internalM.l, container.internalM.h);
    return m;
  }, [items, container, showContainer]);

  const dist = maxDim * 2.5;
  const bg = darkMode ? "#111827" : "#f0f4f8";
  if (!mounted) return <div style={{ width: "100%", height: "100%", background: bg }} />;

  return (
    <Canvas
      camera={{ position: [dist * 0.5, dist * 0.6, dist * 0.8], fov: 35, near: 0.01, far: 200 }}
      style={{ width: "100%", height: "100%", background: bg }}
      gl={{ antialias: true, preserveDrawingBuffer: true, powerPreference: "default", failIfMajorPerformanceCaveat: false }}
    >
      <SceneContent {...props} />
      <SnapshotCapture onReady={(fn) => { snapRef.current = fn; }} />
    </Canvas>
  );
});

export default Scene;

// ── Packing algorithm (simple first-fit shelf packing) ────────
export function packItemsIntoContainer(
  items: CargoItem[],
  container: ContainerSpec
): { packed: CargoItem[]; fits: boolean; suggestedContainer: string | null } {
  const { l: CL, w: CW, h: CH } = container.internalM;
  const sorted = [...items].sort((a, b) => (b.lm * b.wm * b.hm) - (a.lm * a.wm * a.hm));

  // Simple shelf-based bin packing
  let curX = 0, curZ = 0, curY = 0;
  let shelfH = 0, rowW = 0;
  const result: CargoItem[] = [];
  let allFit = true;

  for (const item of sorted) {
    // Try to place at current position
    if (curX + item.lm > CL) {
      // Move to next row in this shelf
      curX = 0;
      curZ += rowW;
      rowW = 0;
    }
    if (curZ + item.wm > CW) {
      // Move to next shelf (new layer)
      curX = 0;
      curZ = 0;
      curY += shelfH;
      shelfH = 0;
      rowW = 0;
    }
    if (curY + item.hm > CH || curX + item.lm > CL || curZ + item.wm > CW) {
      // Doesn't fit
      result.push({ ...item, px: 0, py: 0, pz: 0, packed: false });
      allFit = false;
      continue;
    }

    result.push({
      ...item,
      px: curX,
      py: curY,
      pz: curZ,
      packed: true,
    });

    shelfH = Math.max(shelfH, item.hm);
    rowW = Math.max(rowW, item.wm);
    curX += item.lm + 0.02; // 2cm gap
  }

  // Suggest upgrade if doesn't fit
  let suggestedContainer: string | null = null;
  if (!allFit) {
    const totalCbm = items.reduce((s, i) => s + i.lm * i.wm * i.hm, 0);
    const CONTAINERS_SORTED = [
      { type: "20gp", cbm: 33.2 },
      { type: "40gp", cbm: 67.7 },
      { type: "40hc", cbm: 76.3 },
    ];
    for (const c of CONTAINERS_SORTED) {
      if (c.cbm > container.cbm && totalCbm * 1.2 <= c.cbm) {
        suggestedContainer = c.type;
        break;
      }
    }
  }

  return { packed: result, fits: allFit, suggestedContainer };
}
