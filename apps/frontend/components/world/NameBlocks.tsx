"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Fonts } from "./kit";
import { FACE, NAME_POS, NAME_WIDTH, UP } from "./layout";
import { game } from "./state";

const GRADIENT = ["#ff6a3d", "#fa5785", "#8a7cff"].map((c) => new THREE.Color(c));

function sampleText(lines: string[], font: string) {
  const W = 1000;
  const H = 190 * lines.length;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return { cells: [] as [number, number][], cols: 1, rows: 1 };
  ctx.fillStyle = "#fff";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.font = `800 160px ${font}`;
  ctx.letterSpacing = "6px";
  lines.forEach((line, i) => ctx.fillText(line, W / 2, 190 * i + 98));
  const data = ctx.getImageData(0, 0, W, H).data;
  const step = 12;
  const cells: [number, number][] = [];
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (let y = 0; y < H; y += step) {
    for (let x = 0; x < W; x += step) {
      // a cell is filled when most of its centre is ink
      const i = ((y + (step >> 1)) * W + x + (step >> 1)) * 4 + 3;
      if (data[i] > 140) {
        const cx = x / step;
        const cy = y / step;
        cells.push([cx, cy]);
        minX = Math.min(minX, cx);
        maxX = Math.max(maxX, cx);
        minY = Math.min(minY, cy);
        maxY = Math.max(maxY, cy);
      }
    }
  }
  return {
    cells: cells.map(([x, y]) => [x - minX, maxY - y] as [number, number]),
    cols: maxX - minX + 1,
    rows: maxY - minY + 1,
  };
}

/** "KUNAL KUMAWAT" built from blocks that drop in when the island loads. */
export function NameBlocks({ fonts }: { fonts: Fonts }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const start = useRef<number | null>(null);
  const done = useRef(false);

  const data = useMemo(() => {
    const { cells, cols } = sampleText(["KUNAL", "KUMAWAT"], fonts.sans);
    const cube = NAME_WIDTH / cols;
    const items: { x: number; y: number; z: number; delay: number; drop: number }[] = [];
    const colors: THREE.Color[] = [];
    let seed = 1;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    for (const [cx, cy] of cells) {
      for (let layer = 0; layer < 2; layer++) {
        const x = (cx - (cols - 1) / 2) * cube;
        items.push({
          x,
          y: cy * cube + cube / 2,
          z: -layer * cube,
          delay: (cx / cols) * 0.7 + (1 - cy / 30) * 0.3 + rand() * 0.3,
          drop: 6 + rand() * 6,
        });
        const t = Math.min(1, Math.max(0, cx / cols + (cy / 30 - 0.5) * 0.25));
        const k = t * (GRADIENT.length - 1);
        const i = Math.min(GRADIENT.length - 2, Math.floor(k));
        const col = GRADIENT[i].clone().lerp(GRADIENT[i + 1], k - i);
        col.offsetHSL(0, 0, (rand() - 0.5) * 0.06 - layer * 0.08);
        colors.push(col);
      }
    }
    const geo = new THREE.BoxGeometry(cube * 0.94, cube * 0.94, cube * 0.94);
    // at night each block glows softly in its own colour
    const material = new THREE.MeshStandardMaterial({ roughness: 0.55, emissive: "#ffffff", emissiveIntensity: 0 });
    material.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <emissivemap_fragment>",
        "#include <emissivemap_fragment>\n#ifdef USE_COLOR\n  totalEmissiveRadiance *= vColor.rgb;\n#endif",
      );
    };
    const inst = new THREE.InstancedMesh(geo, material, items.length);
    colors.forEach((c, i) => inst.setColorAt(i, c));
    inst.castShadow = true;
    inst.receiveShadow = true;
    return { items, inst, cube };
  }, [fonts.sans]);

  const tmp = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    const m = mesh.current;
    if (!m) return;
    (m.material as THREE.MeshStandardMaterial).emissiveIntensity = game.nightT * 0.45;
    if (done.current) return;
    if (start.current === null) start.current = state.clock.elapsedTime + 0.3;
    const t = state.clock.elapsedTime - start.current;
    const instant = game.reducedMotion;
    let settled = true;
    data.items.forEach((it, i) => {
      const local = instant ? 1 : Math.min(1, Math.max(0, (t - it.delay) / 0.7));
      if (local < 1) settled = false;
      // fall with a little bounce at the end
      const e = local < 1 ? 1 - Math.pow(1 - local, 3) : 1;
      const bounce = local > 0.75 && local < 1 ? Math.sin(((local - 0.75) / 0.25) * Math.PI) * 0.12 : 0;
      tmp.position.set(it.x, it.y + (1 - e) * it.drop + bounce, it.z);
      tmp.rotation.set((1 - e) * 1.5, 0, (1 - e) * -0.8);
      tmp.scale.setScalar(local <= 0 ? 0.0001 : 1);
      tmp.updateMatrix();
      m.setMatrixAt(i, tmp.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
    game.shadowDirty = true;
    if (settled) done.current = true;
  });

  return (
    <group position={[NAME_POS.x - UP.x * 0.2, 0.12, NAME_POS.z - UP.z * 0.2]} rotation={[0, FACE, 0]}>
      <primitive ref={mesh} object={data.inst} />
    </group>
  );
}
