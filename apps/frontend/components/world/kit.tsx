/**
 * Shared look: palette, cached materials, unit geometries, canvas text textures,
 * and tiny <Box>/<Cyl> helpers so the places can be built from primitives.
 */
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { ReactNode } from "react";

export const C = {
  sky: "#9fd3db",
  water: "#4fa6b8",
  waterDeep: "#3b8aa3",
  grass: "#9cc27a",
  grassDark: "#86b066",
  sand: "#ead39f",
  road: "#5d6470",
  roadLine: "#f6e7bd",
  plaza: "#ece4d4",
  cream: "#f5efe4",
  stone: "#d8d0c1",
  slate: "#4c566a",
  ink: "#23232b",
  wood: "#b9814f",
  woodDark: "#8a5a36",
  ember: "#ff6a3d",
  rose: "#fa5785",
  violet: "#8a7cff",
  teal: "#38c9b4",
  gold: "#f5b942",
  glass: "#bfe6f0",
  leaf: "#5f9a4f",
  leaf2: "#79b45d",
  trunk: "#8d5e3c",
};

const cache = new Map<string, THREE.MeshStandardMaterial>();

export function mat(
  color: string,
  o: { emissive?: string; ei?: number; rough?: number; metal?: number; flat?: boolean; opacity?: number } = {},
) {
  const key = `${color}|${o.emissive ?? ""}|${o.ei ?? 1}|${o.rough ?? 0.85}|${o.metal ?? 0}|${o.flat ?? false}|${o.opacity ?? 1}`;
  let m = cache.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      color,
      roughness: o.rough ?? 0.85,
      metalness: o.metal ?? 0,
      flatShading: o.flat ?? false,
      emissive: o.emissive ?? "#000000",
      emissiveIntensity: o.ei ?? 1,
      transparent: (o.opacity ?? 1) < 1,
      opacity: o.opacity ?? 1,
    });
    cache.set(key, m);
  }
  return m;
}

/** glowing material that ignores light */
export const glow = (color: string, intensity = 1.6) => mat(color, { emissive: color, ei: intensity, rough: 0.4 });

export const G = {
  box: new THREE.BoxGeometry(1, 1, 1),
  round: new RoundedBoxGeometry(1, 1, 1, 3, 0.12),
  cyl: new THREE.CylinderGeometry(1, 1, 1, 28),
  cyl8: new THREE.CylinderGeometry(1, 1, 1, 8),
  cone: new THREE.ConeGeometry(1, 1, 24),
  sphere: new THREE.SphereGeometry(1, 24, 16),
  ico: new THREE.IcosahedronGeometry(1, 0),
  plane: new THREE.PlaneGeometry(1, 1),
  disc: new THREE.CircleGeometry(1, 40),
  ring: new THREE.RingGeometry(0.82, 1, 48),
};

type Vec = [number, number, number];

export function Box({
  p,
  s,
  m,
  r,
  round,
  cast = true,
}: {
  p: Vec;
  s: Vec;
  m: THREE.Material;
  r?: Vec;
  round?: boolean;
  cast?: boolean;
}) {
  return (
    <mesh
      geometry={round ? G.round : G.box}
      material={m}
      position={p}
      scale={s}
      rotation={r}
      castShadow={cast}
      receiveShadow
    />
  );
}

export function Cyl({
  p,
  r = 1,
  h = 1,
  m,
  rot,
  seg8,
  cast = true,
}: {
  p: Vec;
  r?: number;
  h?: number;
  m: THREE.Material;
  rot?: Vec;
  seg8?: boolean;
  cast?: boolean;
}) {
  return (
    <mesh
      geometry={seg8 ? G.cyl8 : G.cyl}
      material={m}
      position={p}
      scale={[r, h, r]}
      rotation={rot}
      castShadow={cast}
      receiveShadow
    />
  );
}

export function Group({
  x,
  z,
  y = 0,
  rot = 0,
  children,
}: {
  x: number;
  z: number;
  y?: number;
  rot?: number;
  children: ReactNode;
}) {
  return (
    <group position={[x, y, z]} rotation={[0, rot, 0]}>
      {children}
    </group>
  );
}

// ---------- canvas text ----------

export type Fonts = { sans: string; display: string; mono: string };

export function readFonts(): Fonts {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
  return {
    sans: v("--font-geist", "system-ui, sans-serif"),
    display: v("--font-bricolage", "system-ui, sans-serif"),
    mono: v("--font-geist-mono", "ui-monospace, monospace"),
  };
}

export async function loadFonts(): Promise<Fonts> {
  const f = readFonts();
  try {
    await Promise.all([
      document.fonts.load(`800 64px ${f.sans}`),
      document.fonts.load(`600 64px ${f.sans}`),
      document.fonts.load(`700 64px ${f.display}`),
      document.fonts.load(`500 64px ${f.mono}`),
    ]);
  } catch {
    // fall back to whatever is available
  }
  return f;
}

export function canvasTexture(
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (ctx) draw(ctx, w, h);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

// ---------- soft round sprites (light pools, beacons, blob shadows) ----------

let radial: THREE.Texture | null = null;
/** white dot that fades to clear at the edge */
export function radialTexture() {
  if (!radial) {
    radial = canvasTexture(128, 128, (ctx, w, h) => {
      const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.35, "rgba(255,255,255,0.55)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    });
  }
  return radial;
}

/** additive glow material for fake lights */
export function additive(color: string, opacity = 1) {
  return new THREE.MeshBasicMaterial({
    color,
    map: radialTexture(),
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  });
}

let blob: THREE.MeshBasicMaterial | null = null;
/** soft dark spot under things when real shadows are off */
export function blobMaterial() {
  if (!blob) {
    blob = new THREE.MeshBasicMaterial({
      color: "#1d2a1a",
      map: radialTexture(),
      transparent: true,
      opacity: 0.34,
      depthWrite: false,
    });
  }
  return blob;
}
/** flat plane lying on the ground */
export const flatPlane = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
