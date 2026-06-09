"use client";

/**
 * Live 3D "hero" visualizations (react-three-fiber). One standout, interactive (drag-to-orbit) 3D
 * scene per role, fed by REAL data:
 *   - TenantLandscape  (Super Admin)  : a 3D bar field, height = MRR, colour = health
 *   - PipelineFlow     (Tenant Admin) : a stacked-disc 3D funnel, radius = candidates per stage
 *   - CandidateMatch   (HR / Manager) : a 3D scatter, x=AI score, y=requirement match, z=stage, colour=verdict
 *
 * Scene3D is mount-gated so it never executes three.js during SSR (renders a skeleton first).
 */

import * as React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { cn } from "@/lib/utils";
import { colorAt } from "@/components/shared/charts";

export function Scene3D({
  children, height = 340, camera, className, autoRotate = true,
}: {
  children: React.ReactNode; height?: number;
  camera?: { position: [number, number, number]; fov?: number };
  className?: string; autoRotate?: boolean;
}) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) {
    return <div style={{ height }} className={cn("animate-pulse rounded-xl border border-border bg-card/60", className)} />;
  }
  return (
    <div
      style={{ height }}
      className={cn("overflow-hidden rounded-xl border border-border bg-gradient-to-b from-[#0b1220] to-[#10183a]", className)}
    >
      <Canvas camera={camera ?? { position: [7, 6, 9], fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={0.65} />
        <directionalLight position={[8, 14, 6]} intensity={1.1} />
        <pointLight position={[-8, 5, -8]} intensity={0.5} color="#7c5cff" />
        {children}
        <OrbitControls enablePan={false} minDistance={5} maxDistance={26} autoRotate={autoRotate} autoRotateSpeed={0.55} />
      </Canvas>
    </div>
  );
}

function maxOf(nums: number[]): number {
  let m = 1;
  for (const n of nums) if (typeof n === "number" && n > m) m = n;
  return m;
}

/* ---- Super Admin: tenant spend landscape ---- */
export interface LandscapeTenant { name: string; mrr?: number; cost30?: number; users?: number; health?: string }
export function TenantLandscape({ tenants, height = 360 }: { tenants: LandscapeTenant[]; height?: number }) {
  const list = (tenants || []).filter(Boolean).slice(0, 64);
  if (!list.length) return <Scene3D height={height}><Text position={[0, 0, 0]} fontSize={0.5} color="#94a3b8">No tenants</Text></Scene3D>;
  const maxMrr = maxOf(list.map((t) => Number(t.mrr) || 0));
  const cols = Math.max(1, Math.ceil(Math.sqrt(list.length)));
  const spread = 2.2;
  const offset = ((cols - 1) * spread) / 2;
  return (
    <Scene3D height={height} camera={{ position: [cols * 1.6 + 4, cols * 1.4 + 4, cols * 1.6 + 5], fov: 45 }}>
      <gridHelper args={[cols * spread + 4, cols + 2, "#1e293b", "#16203a"]} />
      <group position={[-offset, 0, -offset]}>
        {list.map((t, i) => {
          const gx = (i % cols) * spread;
          const gz = Math.floor(i / cols) * spread;
          const h = 0.4 + ((Number(t.mrr) || 0) / maxMrr) * 4.5;
          const health = String(t.health || "healthy").toLowerCase();
          const color = health === "over-budget" ? "#ef4444" : health === "watch" ? "#f59e0b" : "#34d399";
          return (
            <group key={i} position={[gx, 0, gz]}>
              <mesh position={[0, h / 2, 0]}>
                <boxGeometry args={[1.1, h, 1.1]} />
                <meshStandardMaterial color={color} metalness={0.35} roughness={0.4} emissive={color} emissiveIntensity={0.12} />
              </mesh>
              <Text position={[0, h + 0.45, 0]} fontSize={0.3} color="#cbd5e1" anchorX="center" anchorY="bottom">
                {String(t.name || "").slice(0, 14)}
              </Text>
            </group>
          );
        })}
      </group>
    </Scene3D>
  );
}

/* ---- Tenant Admin: pipeline flow funnel ---- */
export interface FlowStage { name: string; value: number }
export function PipelineFlow({ stages, height = 360 }: { stages: FlowStage[]; height?: number }) {
  const list = (stages || []).filter(Boolean);
  if (!list.length) return <Scene3D height={height}><Text position={[0, 0, 0]} fontSize={0.5} color="#94a3b8">No pipeline data</Text></Scene3D>;
  const max = maxOf(list.map((s) => Number(s.value) || 0));
  const n = list.length;
  return (
    <Scene3D height={height} camera={{ position: [6, 3.5, 8], fov: 45 }}>
      {list.map((s, i) => {
        const r = 0.7 + ((Number(s.value) || 0) / max) * 2.6;
        const y = (n - 1 - i) * 1.15 - ((n - 1) * 1.15) / 2;
        const color = colorAt(i);
        return (
          <group key={i} position={[0, y, 0]}>
            <mesh>
              <cylinderGeometry args={[r, r, 0.5, 56]} />
              <meshStandardMaterial color={color} metalness={0.3} roughness={0.35} transparent opacity={0.92} emissive={color} emissiveIntensity={0.1} />
            </mesh>
            <Text position={[r + 0.5, 0, 0]} fontSize={0.32} color="#e2e8f0" anchorX="left" anchorY="middle">
              {String(s.name)} - {Number(s.value) || 0}
            </Text>
          </group>
        );
      })}
    </Scene3D>
  );
}

/* ---- HR / Manager: candidate match scatter ---- */
export interface MatchPoint { name?: string; score: number; match: number; stageIndex: number; verdict?: string }
export function CandidateMatch({ candidates, height = 360 }: { candidates: MatchPoint[]; height?: number }) {
  const list = (candidates || []).filter(Boolean).slice(0, 300);
  if (!list.length) return <Scene3D height={height}><Text position={[0, 0, 0]} fontSize={0.5} color="#94a3b8">No candidates</Text></Scene3D>;
  const S = 6;
  return (
    <Scene3D height={height} camera={{ position: [9, 7, 10], fov: 45 }}>
      <axesHelper args={[S]} />
      {list.map((c, i) => {
        const x = (Math.max(0, Math.min(100, Number(c.score) || 0)) / 100) * S;
        const y = (Math.max(0, Math.min(100, Number(c.match) || 0)) / 100) * S;
        const z = (Math.max(0, Math.min(5, Number(c.stageIndex) || 0)) / 5) * S;
        const v = String(c.verdict || "").toLowerCase();
        const color = v === "fail" ? "#ef4444" : v === "review" ? "#f59e0b" : v === "pass" ? "#34d399" : "#7c5cff";
        return (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[0.17, 16, 16]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.25} roughness={0.5} />
          </mesh>
        );
      })}
      <Text position={[S + 0.5, 0, 0]} fontSize={0.34} color="#94a3b8" anchorX="left">AI score</Text>
      <Text position={[0, S + 0.5, 0]} fontSize={0.34} color="#94a3b8" anchorX="center">Match</Text>
      <Text position={[0, 0, S + 0.5]} fontSize={0.34} color="#94a3b8" anchorX="center">Stage</Text>
    </Scene3D>
  );
}
