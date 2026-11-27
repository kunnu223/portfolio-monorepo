"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { C, G, additive, blobMaterial, flatPlane, glow, mat } from "./kit";
import { game } from "./state";

const SCALE = 1.15;
const PUFFS = 20;
const puffGeo = new THREE.IcosahedronGeometry(1, 0);
const puffMat = mat("#efe6d4", { flat: true, rough: 1 });
const beamMat = additive("#fff0c8", 0);
const tmp = new THREE.Object3D();

/** little dust clouds kicked up behind the wheels */
function Dust() {
  const mesh = useMemo(() => {
    const m = new THREE.InstancedMesh(puffGeo, puffMat, PUFFS);
    m.frustumCulled = false;
    tmp.scale.setScalar(0);
    tmp.updateMatrix();
    for (let i = 0; i < PUFFS; i++) m.setMatrixAt(i, tmp.matrix);
    return m;
  }, []);
  const ref = useRef<THREE.InstancedMesh>(null);
  const puffs = useRef(Array.from({ length: PUFFS }, () => ({ x: 0, y: 0, z: 0, vy: 0, age: 1, life: 1, s: 0 })));
  const state = useRef({ next: 0, acc: 0, side: 1 });

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 20);
    const c = game.car;
    const st = state.current;
    const inst = ref.current;
    if (!inst) return;
    const speed = Math.abs(c.vf);
    // more dust when going fast or turning hard
    const rate = game.reducedMotion ? 0 : speed > 3 ? 10 + speed * 1.2 + Math.abs(c.steer) * speed * 1.5 : 0;
    st.acc += rate * dt;
    while (st.acc >= 1) {
      st.acc -= 1;
      const p = puffs.current[st.next];
      st.next = (st.next + 1) % PUFFS;
      st.side = -st.side;
      const fx = Math.sin(c.h);
      const fz = Math.cos(c.h);
      p.x = c.x - fx * 0.75 * SCALE + fz * 0.5 * st.side * SCALE + (Math.random() - 0.5) * 0.2;
      p.z = c.z - fz * 0.75 * SCALE - fx * 0.5 * st.side * SCALE + (Math.random() - 0.5) * 0.2;
      p.y = 0.15;
      p.vy = 0.6 + Math.random() * 0.6;
      p.age = 0;
      p.life = 0.45 + Math.random() * 0.35;
      p.s = 0.14 + Math.random() * 0.12 + speed * 0.008;
    }
    let live = false;
    puffs.current.forEach((p, i) => {
      if (p.age >= p.life) return;
      live = true;
      p.age += dt;
      p.y += p.vy * dt;
      p.vy *= Math.exp(-3 * dt);
      const k = Math.min(1, p.age / p.life);
      // grow fast, then shrink away
      const s = p.s * (k < 0.25 ? k / 0.25 : 1 - (k - 0.25) / 0.75) * (1 + k * 1.5);
      tmp.position.set(p.x, p.y, p.z);
      tmp.rotation.set(i, i * 2, 0);
      tmp.scale.setScalar(Math.max(0.0001, s));
      tmp.updateMatrix();
      inst.setMatrixAt(i, tmp.matrix);
    });
    if (live) inst.instanceMatrix.needsUpdate = true;
  });
  return <primitive ref={ref} object={mesh} />;
}

const WHEEL_R = 0.23;
const wheelGeo = new THREE.CylinderGeometry(WHEEL_R, WHEEL_R, 0.2, 18).rotateZ(Math.PI / 2);
const hubGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.22, 10).rotateZ(Math.PI / 2);
const flagGeo = (() => {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0, 0, -0.32, 0, 0, -0.16, -0.5], 3));
  g.computeVertexNormals();
  return g;
})();
const eyeGeo = new THREE.CapsuleGeometry(0.055, 0.1, 4, 8);

const M = {
  body: mat(C.cream, { rough: 0.55 }),
  lid: mat(C.ember, { rough: 0.5 }),
  dark: mat(C.ink, { rough: 0.5 }),
  tyre: mat("#2a2a30", { rough: 0.9 }),
  hub: mat("#c9c3b8", { rough: 0.5 }),
  screen: mat("#14141a", { rough: 0.2, metal: 0.2 }),
  eye: glow("#9ff0ff", 2.2),
  light: new THREE.MeshStandardMaterial({ color: "#fff2c8", emissive: "#fff2c8", emissiveIntensity: 2, roughness: 0.4 }),
  tip: glow(C.ember, 2.4),
  flag: new THREE.MeshStandardMaterial({ color: C.ember, side: THREE.DoubleSide, roughness: 0.7 }),
};

const WHEELS: [number, number][] = [
  [0.58, 0.48],
  [-0.58, 0.48],
  [0.58, 0],
  [-0.58, 0],
  [0.58, -0.48],
  [-0.58, -0.48],
];

/** The player: a little six-wheeled delivery robot with a screen face and a flag. */
export default function Robot() {
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const antenna = useRef<THREE.Group>(null);
  const eyes = useRef<THREE.Group>(null);
  const wheels = useRef<(THREE.Mesh | null)[]>([]);
  const spring = useRef({ ax: 0, vx: 0, az: 0, vz: 0, lastVf: 0, blink: 2.5 });

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 20);
    const c = game.car;
    const r = root.current;
    const b = body.current;
    const a = antenna.current;
    const e = eyes.current;
    if (!r || !b || !a || !e) return;
    const s = spring.current;
    const t = state.clock.elapsedTime;

    r.position.set(c.x, 0, c.z);
    r.rotation.y = c.h;
    beamMat.opacity = game.nightT * 0.4;
    M.light.emissiveIntensity = 2 + game.nightT * 3;

    const accel = (c.vf - s.lastVf) / Math.max(dt, 1e-4);
    s.lastVf = c.vf;
    const speed = Math.abs(c.vf);

    // body leans back when speeding up, rolls out of turns, buzzes a little while driving
    const pitch = THREE.MathUtils.clamp(-accel * 0.006, -0.12, 0.12);
    const roll = THREE.MathUtils.clamp(c.steer * c.vf * 0.012, -0.12, 0.12);
    b.rotation.x = THREE.MathUtils.damp(b.rotation.x, pitch, 8, dt);
    b.rotation.z = THREE.MathUtils.damp(b.rotation.z, roll, 8, dt);
    const buzz = game.reducedMotion ? 0 : Math.sin(t * 40) * 0.008 * Math.min(1, speed / 4);
    const hop = game.reducedMotion ? 0 : Math.sin(t * 2.2) * 0.012 * (speed < 0.3 ? 1 : 0);
    b.position.y = buzz + hop + c.impact * 0.15 * Math.abs(Math.sin(t * 30));

    // springy antenna
    const kx = -accel * 0.01 - c.vf * 0.012;
    const kz = c.steer * c.vf * 0.02;
    s.vx += (-(s.ax - kx) * 60 - s.vx * 6) * dt;
    s.vz += (-(s.az - kz) * 60 - s.vz * 6) * dt;
    s.ax += s.vx * dt;
    s.az += s.vz * dt;
    a.rotation.x = THREE.MathUtils.clamp(s.ax, -0.7, 0.7);
    a.rotation.z = THREE.MathUtils.clamp(s.az, -0.7, 0.7);

    // eyes look into the turn and blink now and then
    s.blink -= dt;
    let lid = 1;
    if (s.blink < 0.12) lid = Math.max(0.1, Math.abs(s.blink - 0.06) / 0.06);
    if (s.blink < 0) s.blink = 2 + Math.random() * 3;
    e.scale.y = lid;
    e.position.x = THREE.MathUtils.damp(e.position.x, -c.steer * 0.07, 10, dt);

    for (let i = 0; i < 6; i++) {
      const w = wheels.current[i];
      if (w) w.rotation.x = c.odo / WHEEL_R;
    }
  });

  return (
    <>
    <Dust />
    <group ref={root} scale={SCALE}>
      {/* headlight beam on the ground at night */}
      <mesh geometry={flatPlane} material={beamMat} position={[0, 0.18, 2.3]} scale={[2.6, 1, 3.6]} />
      {/* soft shadow: the robot moves all the time, so it doesn't use the drawn-once island shadows */}
      <mesh geometry={flatPlane} material={blobMaterial()} position={[0, 0.04, 0]} scale={[1.9, 1, 2.3]} />
      <group ref={body}>
        {/* chassis */}
        <mesh geometry={G.round} material={M.body} position={[0, 0.62, 0]} scale={[1.05, 0.62, 1.42]} receiveShadow />
        <mesh geometry={G.round} material={M.lid} position={[0, 0.98, -0.02]} scale={[0.98, 0.16, 1.3]} />
        <mesh geometry={G.box} material={M.dark} position={[0, 0.36, 0]} scale={[1.08, 0.08, 1.38]} />
        {/* face */}
        <mesh geometry={G.round} material={M.screen} position={[0, 0.66, 0.69]} scale={[0.74, 0.34, 0.08]} />
        <group ref={eyes} position={[0, 0.67, 0.735]}>
          <mesh geometry={eyeGeo} material={M.eye} position={[-0.15, 0, 0]} />
          <mesh geometry={eyeGeo} material={M.eye} position={[0.15, 0, 0]} />
        </group>
        <mesh geometry={G.sphere} material={M.light} position={[-0.38, 0.44, 0.71]} scale={0.055} />
        <mesh geometry={G.sphere} material={M.light} position={[0.38, 0.44, 0.71]} scale={0.055} />
        {/* tail light */}
        <mesh geometry={G.box} material={glow(C.rose, 1.6)} position={[0, 0.58, -0.72]} scale={[0.5, 0.06, 0.03]} />
        {/* antenna with flag */}
        <group ref={antenna} position={[-0.34, 1.05, -0.5]}>
          <mesh geometry={G.cyl8} material={M.dark} position={[0, 0.55, 0]} scale={[0.025, 1.1, 0.025]} />
          <mesh geometry={G.sphere} material={M.tip} position={[0, 1.12, 0]} scale={0.06} />
          <mesh geometry={flagGeo} material={M.flag} position={[0, 1.08, 0]} />
        </group>
      </group>
      {WHEELS.map(([x, z], i) => (
        <group key={i} position={[x, WHEEL_R, z]}>
          <mesh
            ref={(el) => {
              wheels.current[i] = el;
            }}
            geometry={wheelGeo}
            material={M.tyre}
          >
            <mesh geometry={hubGeo} material={M.hub} />
          </mesh>
        </group>
      ))}
    </group>
    </>
  );
}
