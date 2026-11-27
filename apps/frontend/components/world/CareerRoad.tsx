"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { C, G, additive, canvasTexture, flatPlane, mat, type Fonts } from "./kit";
import { FACE, milestoneStone, milestones } from "./layout";
import { game } from "./state";

function groundText(fonts: Fonts, text: string, px: number) {
  return canvasTexture(1024, 256, (ctx, w, h) => {
    ctx.fillStyle = "rgba(255,248,230,0.95)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `800 ${px}px ${fonts.sans}`;
    ctx.fillText(text, w / 2, h / 2 + 8);
  });
}

function Decal({ x, z, tex, w }: { x: number; z: number; tex: THREE.Texture; w: number }) {
  return (
    <group position={[x, 0.1, z]} rotation={[0, FACE, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w, w / 4]} />
        <meshBasicMaterial map={tex} transparent depthWrite={false} />
      </mesh>
    </group>
  );
}

/**
 * Career Road: the year of each job painted big on the road, and a flag stone
 * beside it. The stone of the job the robot is next to lights up.
 */
export default function CareerRoad({ fonts }: { fonts: Fonts }) {
  const data = useMemo(
    () => ({
      years: milestones.map((m) => groundText(fonts, m.year, 210)),
      flags: milestones.map(
        (m) => new THREE.MeshStandardMaterial({ color: m.color, emissive: m.color, emissiveIntensity: 0.1, roughness: 0.6 }),
      ),
      halos: milestones.map((m) => additive(m.color, 0)),
    }),
    [fonts],
  );
  const flagRefs = useRef<(THREE.Group | null)[]>([]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 1 / 20);
    const on = game.zone === "career";
    milestones.forEach((_, i) => {
      const active = on && game.careerStep === i;
      const halo = data.halos[i];
      const want = active ? 0.75 + Math.sin(t * 3) * 0.15 : 0;
      halo.opacity = THREE.MathUtils.damp(halo.opacity, want, 6, dt);
      const f = data.flags[i];
      f.emissiveIntensity = THREE.MathUtils.damp(f.emissiveIntensity, active ? 0.9 : 0.1 + game.nightT * 0.35, 6, dt);
      const flag = flagRefs.current[i];
      if (flag && !game.reducedMotion) flag.rotation.y = Math.sin(t * 2.4 + i) * (active ? 0.35 : 0.12);
    });
  });

  const stone = mat(C.stone, { flat: true });
  const pole = mat("#5b6472", { rough: 0.6 });

  return (
    <group>
      {milestones.map((m, i) => {
        const p = milestoneStone(m);
        return (
          <group key={m.year}>
            <Decal x={m.at.x} z={m.at.z} tex={data.years[i]} w={3.8} />
            <group position={[p.x, 0, p.z]} rotation={[0, FACE, 0]}>
              <mesh geometry={flatPlane} material={data.halos[i]} position={[0, 0.16, 0]} scale={4.2} />
              <mesh geometry={G.round} material={stone} position={[0, 0.25, 0]} scale={[1.1, 0.5, 1.1]} castShadow receiveShadow />
              <mesh geometry={G.cyl8} material={pole} position={[0, 1.55, 0]} scale={[0.05, 2.6, 0.05]} castShadow />
              <group
                position={[0, 2.5, 0]}
                ref={(el) => {
                  flagRefs.current[i] = el;
                }}
              >
                <mesh geometry={G.box} material={data.flags[i]} position={[0.5, 0, 0]} scale={[0.95, 0.6, 0.05]} castShadow />
              </group>
            </group>
          </group>
        );
      })}
    </group>
  );
}
