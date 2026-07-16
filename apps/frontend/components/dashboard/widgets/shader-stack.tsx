"use client";
// The actual WebGPU shader stack. Split out from shader-backdrop.tsx so it can be
// dynamically imported (ssr:false) — `shaders` touches navigator.gpu on import.
//
// Layer order mirrors the supplied spec (Swirl -> ChromaFlow -> FlutedGlass ->
// FilmGrain), with two deliberate departures:
//
//  1. COLOR: the spec's directional accents were orange (#ff5f03). Those are
//     replaced by the live --c-brand / --c-ai tokens passed in, so the card
//     matches the ATS (and any tenant's branding) instead of importing a second
//     visual identity.
//  2. INTENSITY: speeds and opacities are pulled well down from the spec's
//     hero-section values. This sits behind live KPI numbers, not a landing
//     page — it must never compete with the data or pin the GPU.
import * as React from "react";
import { Shader, Swirl, ChromaFlow, FlutedGlass, FilmGrain } from "shaders/react";

export default function ShaderStack({
  brand,
  ai,
  surface,
}: {
  brand: string;
  ai: string;
  surface: string;
}) {
  return (
    <Shader
      style={{ width: "100%", height: "100%", display: "block" }}
      colorSpace="srgb"
      disableTelemetry
    >
      {/* Base wash. Near-white so the card stays a light surface and the KPI
          text keeps its contrast; the swirl only adds gentle movement. */}
      <Swirl
        colorA={surface || "#ffffff"}
        colorB="#f2f7f5"
        detail={1.7}
        speed={0.06}
        opacity={0.9}
      />

      {/* Directional flow — the spec's orange accents become the brand green /
          AI violet, the same two hues the charts already use. */}
      <ChromaFlow
        baseColor={surface || "#ffffff"}
        upColor={brand}
        downColor={brand}
        leftColor={ai}
        rightColor={brand}
        momentum={13}
        radius={3.5}
        opacity={0.22}
      />

      {/* Glass refraction, softened from the spec (speed 0.15 -> 0.05). */}
      <FlutedGlass
        shape="rounded"
        angle={31}
        frequency={8}
        softness={1}
        refraction={4}
        aberration={0.61}
        lightAngle={-90}
        highlight={0.12}
        highlightSoftness={0}
        speed={0.05}
        opacity={0.35}
      />

      {/* Grain, static (animated grain behind numbers reads as flicker). */}
      <FilmGrain strength={0.05} animated={false} opacity={0.5} />
    </Shader>
  );
}
