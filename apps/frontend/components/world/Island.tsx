"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mulberry32 } from "./rand";
import { C, G, additive, blobMaterial, flatPlane, mat } from "./kit";
import { ISLAND_R, SPAWN, lamps, places, roads, rocks, trees, tufts } from "./layout";
import { game, type Quality } from "./state";

const DAY_WATER = new THREE.Color(C.water);
const NIGHT_WATER = new THREE.Color("#1c3a5c");
const DAY_SHALLOW = new THREE.Color("#7cc9cf");
const NIGHT_SHALLOW = new THREE.Color("#2b5f7c");

function islandShape(radius: number, seed: number) {
  const rand = mulberry32(seed);
  const shape = new THREE.Shape();
  const n = 72;
  const bumps = Array.from({ length: 5 }, () => ({ f: 1 + Math.floor(rand() * 4), p: rand() * 6, a: rand() }));
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * Math.PI * 2;
    let r = radius;
    for (const b of bumps) r += Math.sin(t * b.f + b.p) * b.a * 0.9;
    const x = Math.cos(t) * r;
    const y = Math.sin(t) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  return shape;
}

const dummy = new THREE.Object3D();
const tint = new THREE.Color();

function instanced(
  geo: THREE.BufferGeometry,
  material: THREE.Material,
  count: number,
  set: (i: number, o: THREE.Object3D, c: THREE.Color) => void,
  shadows = true,
) {
  const mesh = new THREE.InstancedMesh(geo, material, count);
  for (let i = 0; i < count; i++) {
    dummy.position.set(0, 0, 0);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, 1, 1);
    tint.set("#ffffff");
    set(i, dummy, tint);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    mesh.setColorAt(i, tint);
  }
  mesh.castShadow = shadows;
  mesh.receiveShadow = true;
  mesh.instanceMatrix.needsUpdate = true;
  return mesh;
}

export function Ground() {
  const geos = useMemo(() => {
    const grass = new THREE.ExtrudeGeometry(islandShape(ISLAND_R + 1.2, 11), {
      depth: 0.5,
      bevelEnabled: true,
      bevelThickness: 0.12,
      bevelSize: 0.35,
      bevelSegments: 2,
      curveSegments: 4,
    });
    const sand = new THREE.ExtrudeGeometry(islandShape(ISLAND_R + 3.4, 11), {
      depth: 1.6,
      bevelEnabled: true,
      bevelThickness: 0.4,
      bevelSize: 1.2,
      bevelSegments: 3,
      curveSegments: 4,
    });
    return {
      grass,
      sand,
      sea: new THREE.MeshStandardMaterial({ color: C.water, roughness: 0.35, metalness: 0.05 }),
      shallow: new THREE.MeshStandardMaterial({ color: "#7cc9cf", transparent: true, opacity: 0.55, roughness: 0.4 }),
    };
  }, []);

  const last = useRef(-1);
  useFrame(() => {
    if (last.current === game.nightT) return;
    last.current = game.nightT;
    geos.sea.color.copy(DAY_WATER).lerp(NIGHT_WATER, game.nightT);
    geos.shallow.color.copy(DAY_SHALLOW).lerp(NIGHT_SHALLOW, game.nightT);
  });

  return (
    <group>
      {/* sea */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.75, 0]} material={geos.sea} receiveShadow>
        <circleGeometry args={[220, 64]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.72, 0]} material={geos.shallow}>
        <ringGeometry args={[ISLAND_R + 3, ISLAND_R + 12, 72]} />
      </mesh>
      <Foam />
      {/* beach and grass */}
      <mesh
        geometry={geos.sand}
        material={mat(C.sand, { rough: 1 })}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -2.15, 0]}
        receiveShadow
      />
      <mesh
        geometry={geos.grass}
        material={[mat(C.grass, { rough: 1 }), mat(C.grassDark, { rough: 1 })]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.62, 0]}
        receiveShadow
      />
    </group>
  );
}

function Foam() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const m = ref.current;
    if (!m) return;
    const t = clock.elapsedTime;
    const s = 1 + Math.sin(t * 0.8) * 0.012;
    m.scale.set(s, s, 1);
    (m.material as THREE.MeshBasicMaterial).opacity = (0.45 + Math.sin(t * 0.8 + 1) * 0.2) * (1 - game.nightT * 0.6);
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.7, 0]}>
      <ringGeometry args={[ISLAND_R + 4.4, ISLAND_R + 5.2, 96]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
    </mesh>
  );
}

export function Roads() {
  const data = useMemo(() => {
    const segs = roads.map((r) => {
      const dx = r.b.x - r.a.x;
      const dz = r.b.z - r.a.z;
      return {
        len: Math.hypot(dx, dz),
        rot: Math.atan2(dx, dz),
        mid: [(r.a.x + r.b.x) / 2, (r.a.z + r.b.z) / 2] as [number, number],
        r,
      };
    });
    // centre dashes
    const dashes: { x: number; z: number; rot: number }[] = [];
    segs.forEach((s) => {
      const dx = (s.r.b.x - s.r.a.x) / s.len;
      const dz = (s.r.b.z - s.r.a.z) / s.len;
      for (let t = 7; t < s.len - 2; t += 2.2) dashes.push({ x: s.r.a.x + dx * t, z: s.r.a.z + dz * t, rot: s.rot });
    });
    const dashMesh = instanced(
      G.box,
      mat(C.roadLine, { rough: 0.9 }),
      dashes.length,
      (i, o, c) => {
        o.position.set(dashes[i].x, 0.075, dashes[i].z);
        o.rotation.y = dashes[i].rot;
        o.scale.set(0.16, 0.02, 0.9);
        c.set("#ffffff");
      },
      false,
    );
    return { segs, dashMesh };
  }, []);

  const roadMat = mat(C.road, { rough: 0.95 });
  const edgeMat = mat("#c9c1ae", { rough: 0.95 });
  return (
    <group>
      {data.segs.map((s, i) => (
        <group key={i} position={[s.mid[0], 0, s.mid[1]]} rotation={[0, s.rot, 0]}>
          <mesh geometry={G.box} material={edgeMat} scale={[s.r.w + 0.5, 0.08, s.len]} position={[0, 0.02, 0]} receiveShadow />
          <mesh geometry={G.box} material={roadMat} scale={[s.r.w, 0.1, s.len]} position={[0, 0.03, 0]} receiveShadow />
        </group>
      ))}
      {/* round joints at the ends */}
      {data.segs.flatMap((s, i) =>
        [s.r.a, s.r.b].map((p, k) => (
          <mesh key={`${i}-${k}`} geometry={G.cyl} material={roadMat} position={[p.x, 0.03, p.z]} scale={[s.r.w / 2, 0.1, s.r.w / 2]} receiveShadow />
        )),
      )}
      <primitive object={data.dashMesh} />
      {/* start plaza */}
      <mesh geometry={G.cyl} material={mat(C.plaza, { rough: 0.95 })} position={[SPAWN.x, 0.05, SPAWN.z]} scale={[6, 0.12, 6]} receiveShadow />
      <mesh geometry={G.cyl} material={mat("#ddd3bf", { rough: 0.95 })} position={[SPAWN.x, 0.06, SPAWN.z]} scale={[4.2, 0.12, 4.2]} receiveShadow />
    </group>
  );
}

/** Glowing rings on the ground: drive onto one to open that place's panel. */
export function Pads() {
  const items = useMemo(
    () =>
      places.map((p) => ({
        p,
        ring: new THREE.MeshBasicMaterial({ color: p.accent, transparent: true, opacity: 0.9, depthWrite: false }),
        fill: new THREE.MeshBasicMaterial({ color: p.accent, transparent: true, opacity: 0.18, depthWrite: false }),
      })),
    [],
  );
  const refs = useRef<(THREE.Group | null)[]>([]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    items.forEach((it, i) => {
      const g = refs.current[i];
      if (!g) return;
      const s = 1 + Math.sin(t * 2 + i) * 0.04;
      g.scale.set(s, 1, s);
      it.ring.opacity = 0.65 + Math.sin(t * 2 + i) * 0.25;
    });
  });
  return (
    <group>
      {items.map((it, i) => {
        const r = it.p.id === "start" ? 2.6 : it.p.id === "career" ? 0 : 2.3;
        if (!r) return null;
        return (
          <group
            key={it.p.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            position={[it.p.pad.x, 0.14, it.p.pad.z]}
          >
            <mesh geometry={G.ring} material={it.ring} rotation={[-Math.PI / 2, 0, 0]} scale={r} />
            <mesh geometry={G.disc} material={it.fill} rotation={[-Math.PI / 2, 0, 0]} scale={r * 0.82} />
          </group>
        );
      })}
    </group>
  );
}

const bulbMat = new THREE.MeshStandardMaterial({ color: "#ffd59a", emissive: "#ffd59a", emissiveIntensity: 1.4, roughness: 0.4 });
const poolMat = additive("#ffc277", 0);

export function Nature({ quality }: { quality: Quality }) {
  useFrame(() => {
    // lamps light up the road at night
    poolMat.opacity = game.nightT * 0.85;
    bulbMat.emissiveIntensity = 1.4 + game.nightT * 2.2;
  });
  const meshes = useMemo(() => {
    const low = quality === "low";
    const round = trees.filter((t) => t.kind === 0);
    const pine = trees.filter((t) => t.kind === 1);
    const trunkGeo = new THREE.CylinderGeometry(0.14, 0.2, 1, 6);
    const canopyGeo = new THREE.IcosahedronGeometry(1, 1);
    const coneGeo = new THREE.ConeGeometry(1, 1.6, 7);
    const rockGeo = new THREE.DodecahedronGeometry(1, 0);
    const tuftGeo = new THREE.ConeGeometry(0.12, 0.45, 4);
    const leafA = new THREE.Color(C.leaf);
    const leafB = new THREE.Color(C.leaf2);

    const trunks = instanced(trunkGeo, mat(C.trunk, { flat: true }), trees.length, (i, o) => {
      const t = trees[i];
      const h = t.kind === 0 ? 1.3 : 0.9;
      o.position.set(t.x, (h * t.s) / 2, t.z);
      o.scale.set(t.s, h * t.s, t.s);
    });
    const canopies = instanced(canopyGeo, mat("#ffffff", { flat: true }), round.length, (i, o, c) => {
      const t = round[i];
      o.position.set(t.x, 1.3 * t.s + 0.75 * t.s, t.z);
      o.scale.set(1.05 * t.s, 1.0 * t.s, 1.05 * t.s);
      o.rotation.set(t.hue * 3, t.hue * 5, 0);
      c.copy(leafA).lerp(leafB, t.hue);
    });
    const cones = instanced(coneGeo, mat("#ffffff", { flat: true }), pine.length * 2, (i, o, c) => {
      const t = pine[i >> 1];
      const top = i % 2;
      o.position.set(t.x, (0.9 + 0.75 + top * 0.85) * t.s, t.z);
      const k = top ? 0.62 : 0.9;
      o.scale.set(k * t.s, k * t.s, k * t.s);
      o.rotation.y = t.hue * 4;
      c.set("#4c8a52").lerp(new THREE.Color("#3f7a4a"), t.hue);
    });
    const rockMesh = instanced(rockGeo, mat("#cfc6b4", { flat: true }), rocks.length, (i, o) => {
      const r = rocks[i];
      o.position.set(r.x, -0.55 + r.s * 0.35, r.z);
      o.scale.set(r.s, r.s * 0.7, r.s);
      o.rotation.set(r.ry, r.ry * 2, 0);
    });
    const tuftList = low ? tufts.slice(0, 70) : quality === "mid" ? tufts.slice(0, 120) : tufts;
    const tuftMesh = instanced(
      tuftGeo,
      mat("#ffffff", { flat: true }),
      tuftList.length,
      (i, o, c) => {
        const t = tuftList[i];
        o.position.set(t.x, 0.18 * t.s, t.z);
        o.scale.setScalar(t.s);
        c.set(C.grassDark).lerp(new THREE.Color("#6f9a52"), t.c);
      },
      false,
    );

    // street lamps
    const poles = instanced(G.cyl8, mat("#5b6472", { rough: 0.6 }), lamps.length, (i, o) => {
      o.position.set(lamps[i].x, 0.9, lamps[i].z);
      o.scale.set(0.08, 1.8, 0.08);
    });
    const bulbs = instanced(G.sphere, bulbMat, lamps.length, (i, o) => {
      o.position.set(lamps[i].x, 1.9, lamps[i].z);
      o.scale.setScalar(0.24);
    }, false);
    const pools = instanced(flatPlane, poolMat, lamps.length, (i, o) => {
      o.position.set(lamps[i].x, 0.17, lamps[i].z);
      o.scale.setScalar(5.5);
    }, false);
    pools.receiveShadow = false;
    const out: THREE.Object3D[] = [trunks, canopies, cones, rockMesh, tuftMesh, poles, bulbs, pools];
    if (low) {
      // no shadow maps on weak devices: a soft dark spot under each tree instead
      const blobs = instanced(flatPlane, blobMaterial(), trees.length, (i, o) => {
        o.position.set(trees[i].x, 0.03, trees[i].z);
        o.scale.setScalar(2.4 * trees[i].s);
      }, false);
      blobs.receiveShadow = false;
      out.push(blobs);
    }
    return out;
  }, [quality]);

  return (
    <group>
      {meshes.map((m, i) => (
        <primitive key={i} object={m} />
      ))}
    </group>
  );
}
