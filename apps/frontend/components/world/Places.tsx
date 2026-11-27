"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Box, C, Cyl, G, Group, canvasTexture, glow, mat, roundRect, type Fonts } from "./kit";
import { FACE, placeById, type Place } from "./layout";
import { game } from "./state";

const HALF_DOME = new THREE.SphereGeometry(1, 32, 14, 0, Math.PI * 2, 0, Math.PI / 2);
const DISH = new THREE.SphereGeometry(1, 24, 8, 0, Math.PI * 2, 0, 0.85);
const TORUS = new THREE.TorusGeometry(1, 0.03, 8, 72);
const DISH_MAT = new THREE.MeshStandardMaterial({ color: C.cream, side: THREE.DoubleSide, roughness: 0.5 });
const ROOF = (() => {
  const s = new THREE.Shape();
  s.moveTo(-2.15, 0);
  s.lineTo(2.15, 0);
  s.lineTo(0, 1.35);
  s.closePath();
  return new THREE.ExtrudeGeometry(s, { depth: 3.5, bevelEnabled: false }).translate(0, 0, -1.75);
})();

/** rotation that makes something inside a place group face the camera */
const faceIn = (p: Place) => FACE - p.rot;

// ---------------------------------------------------------------------------
// 01 · Agent Lab: dome lab, satellite dish, a live "agent network" floating above,
//      and three product listings getting their checks.
// ---------------------------------------------------------------------------
function AgentLab({ fonts }: { fonts: Fonts }) {
  const p = placeById.agents;
  const net = useRef<THREE.Group>(null);
  const cards = useRef<THREE.Group>(null);

  const graph = useMemo(() => {
    const nodes: [number, number, number][] = [];
    const n = 8;
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < n; i++) {
      const y = 1 - ((i + 0.5) / n) * 2;
      const r = Math.sqrt(1 - y * y);
      nodes.push([Math.cos(golden * i) * r * 1.7, y * 1.1, Math.sin(golden * i) * r * 1.7]);
    }
    const seg: number[] = [];
    nodes.forEach((a, i) => {
      nodes
        .map((b, j) => ({ j, d: Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) }))
        .filter((x) => x.j > i)
        .sort((x, y) => x.d - y.d)
        .slice(0, 2)
        .forEach(({ j }) => seg.push(...a, ...nodes[j]));
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(seg, 3));
    return { nodes, geo };
  }, []);

  const listing = useMemo(
    () =>
      canvasTexture(320, 220, (ctx, w, h) => {
        ctx.fillStyle = "#ffffff";
        roundRect(ctx, 0, 0, w, h, 22);
        ctx.fill();
        ctx.fillStyle = "#ece6f9";
        roundRect(ctx, 18, 18, 92, 92, 14);
        ctx.fill();
        ctx.fillStyle = "#c9c2e6";
        for (let i = 0; i < 3; i++) {
          roundRect(ctx, 126, 26 + i * 26, 160 - i * 34, 12, 6);
          ctx.fill();
        }
        ["Title", "Size chart", "Images"].forEach((t, i) => {
          const y = 140 + i * 28;
          ctx.fillStyle = "#22c55e";
          ctx.beginPath();
          ctx.arc(32, y, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#3a3942";
          ctx.font = `600 20px ${fonts.sans}`;
          ctx.textBaseline = "middle";
          ctx.fillText(t, 52, y + 1);
        });
      }),
    [fonts.sans],
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (net.current) {
      net.current.rotation.y = t * 0.35;
      net.current.position.y = 5.3 + Math.sin(t * 1.3) * 0.15;
    }
    cards.current?.children.forEach((c, i) => {
      c.position.y = 1.5 + Math.sin(t * 1.6 + i * 1.3) * 0.12;
    });
  });

  const nodeColors = [C.violet, C.rose, C.ember];
  return (
    <Group x={p.center.x} z={p.center.z} rot={p.rot}>
      <Cyl p={[0, 0.15, 0]} r={3.4} h={0.3} m={mat(C.stone)} />
      <mesh geometry={HALF_DOME} material={mat(C.cream, { rough: 0.5 })} position={[0, 0.3, 0]} scale={2.75} castShadow receiveShadow />
      <mesh geometry={TORUS} material={glow(C.violet, 2)} position={[0, 0.34, 0]} rotation={[Math.PI / 2, 0, 0]} scale={2.78} />
      <mesh geometry={TORUS} material={glow(C.violet, 1.2)} position={[0, 1.6, 0]} rotation={[Math.PI / 2, 0, 0]} scale={2.42} />
      {/* door */}
      <Box p={[0, 1, 2.45]} s={[1.2, 1.4, 0.7]} m={mat(C.slate)} round />
      <Box p={[0, 1, 2.82]} s={[0.8, 1.1, 0.05]} m={glow("#cfc8ff", 1.2)} cast={false} />
      {/* satellite dish */}
      <group position={[-2.6, 0, -2.4]}>
        <Cyl p={[0, 1.2, 0]} r={0.12} h={2.4} m={mat(C.slate)} seg8 />
        <group position={[0, 2.5, 0]} rotation={[-0.7, 0.6, 0]}>
          <mesh geometry={DISH} material={DISH_MAT} rotation={[Math.PI, 0, 0]} scale={1.1} castShadow />
          <Cyl p={[0, 0.45, 0]} r={0.03} h={0.9} m={mat(C.slate)} seg8 />
          <mesh geometry={G.sphere} material={glow(C.violet, 2.5)} position={[0, 0.92, 0]} scale={0.09} />
        </group>
      </group>
      {/* the agent network */}
      <group ref={net} position={[0, 5.3, 0]}>
        <lineSegments geometry={graph.geo}>
          <lineBasicMaterial color={C.violet} transparent opacity={0.7} />
        </lineSegments>
        {graph.nodes.map((n, i) => (
          <mesh key={i} geometry={G.ico} material={glow(nodeColors[i % 3], 2)} position={n} scale={0.17} />
        ))}
        <mesh geometry={G.ico} material={glow("#ffffff", 1.4)} scale={0.32} />
      </group>
      {/* listings being checked */}
      <group ref={cards}>
        {[-1, 0, 1].map((k) => (
          <group key={k} position={[3.4, 1.5, k * 1.45 - 0.2]} rotation={[0, faceIn(p), 0]}>
            <mesh>
              <planeGeometry args={[1.15, 0.8]} />
              <meshStandardMaterial map={listing} roughness={0.6} side={THREE.DoubleSide} />
            </mesh>
          </group>
        ))}
      </group>
      {[-1, 0, 1].map((k) => (
        <Cyl key={k} p={[3.4, 0.45, k * 1.45 - 0.2]} r={0.18} h={0.9} m={mat(C.stone)} seg8 />
      ))}
    </Group>
  );
}

// ---------------------------------------------------------------------------
// 02 · The Vault: a bank with a round vault door; coins move down three lanes,
//      always in order (Kafka keyed by subscription).
// ---------------------------------------------------------------------------
function Vault() {
  const p = placeById.billing;
  const coins = useRef<THREE.Group>(null);
  const door = useRef<THREE.Group>(null);
  const lanes = [C.ember, C.rose, C.violet];

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    coins.current?.children.forEach((c, i) => {
      const lane = Math.floor(i / 4);
      const k = i % 4;
      const u = (t * (0.18 + lane * 0.03) + k / 4) % 1;
      c.position.x = -2.6 + u * 5.2;
      c.position.y = 0.22 + Math.abs(Math.sin(u * Math.PI * 8)) * 0.05;
      const s = Math.min(1, u * 8, (1 - u) * 8);
      c.scale.setScalar(Math.max(0.001, s));
      c.rotation.y = t * 2;
    });
    if (door.current) {
      const open = game.zone === "billing" ? 1 : 0;
      door.current.rotation.z = THREE.MathUtils.damp(door.current.rotation.z, open * Math.PI * 1.5, 2, 1 / 60);
    }
  });

  return (
    <Group x={p.center.x} z={p.center.z} rot={p.rot}>
      <Box p={[0, 0.2, -0.3]} s={[7, 0.4, 5.2]} m={mat(C.stone)} />
      <Box p={[0, 0.5, 2.5]} s={[3.4, 0.2, 0.8]} m={mat(C.stone)} />
      <Box p={[0, 2.1, -0.7]} s={[6.2, 3.2, 4]} m={mat(C.cream)} />
      <Box p={[0, 3.85, -0.7]} s={[6.8, 0.35, 4.6]} m={mat("#e9dfcc")} />
      <Box p={[0, 4.25, -0.7]} s={[5.6, 0.45, 3.6]} m={mat(C.gold, { rough: 0.6 })} />
      {[-2.65, -1.9, 1.9, 2.65].map((x) => (
        <Cyl key={x} p={[x, 2.15, 1.65]} r={0.24} h={3.3} m={mat("#fbf6ec")} />
      ))}
      {/* vault door */}
      <Cyl p={[0, 2, 1.35]} r={1.2} h={0.12} m={mat("#7c8494", { metal: 0.6, rough: 0.35 })} rot={[Math.PI / 2, 0, 0]} />
      <mesh geometry={TORUS} material={glow(C.gold, 1.8)} position={[0, 2, 1.43]} scale={1.12} />
      <group ref={door} position={[0, 2, 1.48]}>
        <Cyl p={[0, 0, 0]} r={0.92} h={0.1} m={mat("#a3abbb", { metal: 0.7, rough: 0.3 })} rot={[Math.PI / 2, 0, 0]} />
        {[0, 1, 2].map((i) => (
          <Box key={i} p={[0, 0, 0.1]} s={[1.3, 0.09, 0.06]} r={[0, 0, (i * Math.PI) / 3]} m={mat("#4b5262", { metal: 0.5 })} />
        ))}
        <Cyl p={[0, 0, 0.12]} r={0.16} h={0.1} m={glow(C.gold, 1.5)} rot={[Math.PI / 2, 0, 0]} />
      </group>
      {/* ordered lanes */}
      {lanes.map((c, i) => (
        <Box key={c} p={[0, 0.1, 3.4 + i * 0.6]} s={[5.6, 0.06, 0.34]} m={glow(c, 0.5)} cast={false} />
      ))}
      <group ref={coins}>
        {lanes.flatMap((_, lane) =>
          [0, 1, 2, 3].map((k) => (
            <group key={`${lane}-${k}`} position={[0, 0.22, 3.4 + lane * 0.6]}>
              <Cyl p={[0, 0, 0]} r={0.2} h={0.07} m={mat(C.gold, { metal: 0.6, rough: 0.3, emissive: C.gold, ei: 0.25 })} rot={[Math.PI / 2, 0, 0]} cast={false} />
            </group>
          )),
        )}
      </group>
    </Group>
  );
}

// ---------------------------------------------------------------------------
// 03 · Order Truck: a food truck taking orders; tickets pop out of the window.
// ---------------------------------------------------------------------------
function OrderTruck({ fonts }: { fonts: Fonts }) {
  const p = placeById.integrations;
  const tickets = useRef<THREE.Group>(null);

  const tex = useMemo(() => {
    const stripes = canvasTexture(256, 64, (ctx, w, h) => {
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = i % 2 ? "#fbf6ec" : C.rose;
        ctx.fillRect((i * w) / 8, 0, w / 8, h);
      }
    });
    const sign = canvasTexture(512, 128, (ctx, w, h) => {
      ctx.fillStyle = "#23232b";
      roundRect(ctx, 0, 0, w, h, 24);
      ctx.fill();
      ctx.fillStyle = "#ffd59a";
      ctx.font = `700 84px ${fonts.display}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Orders in", w / 2, h / 2 + 4);
    });
    const ticket = canvasTexture(128, 160, (ctx, w, h) => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = C.rose;
      ctx.fillRect(0, 0, w, 22);
      ctx.fillStyle = "#c9c4bb";
      for (let i = 0; i < 4; i++) ctx.fillRect(14, 42 + i * 24, w - 28 - (i % 2) * 30, 8);
      ctx.fillStyle = "#22c55e";
      ctx.fillRect(14, h - 26, 40, 10);
    });
    return { stripes, sign, ticket };
  }, [fonts.display]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    tickets.current?.children.forEach((c, i) => {
      const u = (t * 0.32 + i / 3) % 1;
      c.position.set(-1.2 + i * 0.9, 1.8 + u * 2.2, 1.6 + u * 0.6);
      const m = (c as THREE.Mesh).material as THREE.MeshBasicMaterial;
      m.opacity = Math.min(1, u * 5, (1 - u) * 3);
    });
  });

  const wheel = mat("#26262c", { rough: 0.9 });
  return (
    <Group x={p.center.x} z={p.center.z} rot={p.rot}>
      <Box p={[-0.4, 1.55, 0]} s={[4, 2.1, 2.3]} m={mat(C.cream)} round />
      <Box p={[-0.4, 0.72, 0]} s={[4.06, 0.36, 2.36]} m={mat(C.rose)} />
      <Box p={[2.25, 1.15, 0]} s={[1.4, 1.6, 2.2]} m={mat(C.rose)} round />
      <Box p={[2.93, 1.45, 0]} s={[0.06, 0.62, 1.8]} m={mat(C.glass, { rough: 0.1, metal: 0.2 })} cast={false} />
      {[-1.6, 1.95].flatMap((x) =>
        [-1.12, 1.12].map((z) => <Cyl key={`${x}${z}`} p={[x, 0.42, z]} r={0.42} h={0.32} m={wheel} rot={[Math.PI / 2, 0, 0]} />),
      )}
      {/* serving window + counter */}
      <Box p={[-0.4, 1.75, 1.16]} s={[2.6, 0.85, 0.04]} m={glow("#ffd9a8", 1.1)} cast={false} />
      <Box p={[-0.4, 1.3, 1.38]} s={[2.9, 0.08, 0.42]} m={mat(C.wood)} />
      {/* awning */}
      <mesh position={[-0.4, 2.42, 1.55]} rotation={[0.42, 0, 0]} castShadow>
        <boxGeometry args={[3.1, 0.05, 0.95]} />
        <meshStandardMaterial map={tex.stripes} roughness={0.8} />
      </mesh>
      {/* roof sign */}
      <Box p={[-0.4, 2.72, 0]} s={[0.12, 0.25, 0.12]} m={mat(C.ink)} />
      <mesh position={[-0.4, 3.15, 0.06]}>
        <planeGeometry args={[2.6, 0.65]} />
        <meshStandardMaterial map={tex.sign} emissiveMap={tex.sign} emissive="#ffffff" emissiveIntensity={0.55} />
      </mesh>
      <Box p={[-0.4, 3.15, 0]} s={[2.66, 0.71, 0.08]} m={mat(C.ink)} />
      {/* tickets flying out */}
      <group ref={tickets}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} rotation={[0, faceIn(p), 0]}>
            <planeGeometry args={[0.34, 0.42]} />
            <meshBasicMaterial map={tex.ticket} transparent side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
        ))}
      </group>
      {/* picnic table with an umbrella */}
      <group position={[3.4, 0, 2.6]}>
        <Cyl p={[0, 0.75, 0]} r={0.55} h={0.08} m={mat(C.wood)} />
        <Cyl p={[0, 0.38, 0]} r={0.06} h={0.75} m={mat(C.ink)} seg8 />
        <Cyl p={[0, 1.3, 0]} r={0.035} h={1.9} m={mat(C.ink)} seg8 />
        <mesh geometry={G.cone} material={mat(C.rose, { flat: true })} position={[0, 2.3, 0]} scale={[1.2, 0.5, 1.2]} castShadow />
        {[0, 2.1, 4.2].map((a) => (
          <Cyl key={a} p={[Math.cos(a) * 0.95, 0.42, Math.sin(a) * 0.95]} r={0.2} h={0.08} m={mat(C.cream)} />
        ))}
      </group>
    </Group>
  );
}

// ---------------------------------------------------------------------------
// 04 · Admin Tower: an office tower with lit windows and a badge gate (RBAC).
// ---------------------------------------------------------------------------
function AdminTower() {
  const p = placeById.admin;
  const arm = useRef<THREE.Group>(null);
  const beacon = useRef<THREE.Mesh>(null);

  const facade = useMemo(
    () =>
      canvasTexture(256, 512, (ctx, w, h) => {
        ctx.fillStyle = "#3f4a5e";
        ctx.fillRect(0, 0, w, h);
        let s = 3;
        const rand = () => {
          s = (s * 16807) % 2147483647;
          return s / 2147483647;
        };
        const cols = 5;
        const rows = 14;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const lit = rand() < 0.4;
            ctx.fillStyle = lit ? (rand() < 0.5 ? "#ffd59a" : "#9be8dc") : "#253042";
            ctx.fillRect(14 + c * 48, 12 + r * 36, 36, 22);
          }
        }
      }),
    [],
  );

  useFrame(({ clock }) => {
    if (arm.current) {
      const open = game.zone === "admin" ? 1 : 0;
      arm.current.rotation.z = THREE.MathUtils.damp(arm.current.rotation.z, open * 1.35, 4, 1 / 60);
    }
    if (beacon.current) beacon.current.visible = Math.sin(clock.elapsedTime * 3) > 0;
  });

  return (
    <Group x={p.center.x} z={p.center.z} rot={p.rot}>
      <Box p={[0, 0.12, 0]} s={[4.6, 0.24, 4.6]} m={mat(C.stone)} />
      <mesh position={[0, 4.6, 0]} scale={[3.6, 8.8, 3.6]} castShadow receiveShadow>
        <boxGeometry />
        <meshStandardMaterial map={facade} emissiveMap={facade} emissive="#ffffff" emissiveIntensity={0.35} roughness={0.6} />
      </mesh>
      <Box p={[0, 9.1, 0]} s={[3.9, 0.3, 3.9]} m={mat("#2f3746")} />
      <Box p={[0.6, 9.6, -0.5]} s={[1.2, 0.7, 1.2]} m={mat("#cfd6e2")} />
      <Cyl p={[-0.9, 10.2, 0.8]} r={0.05} h={2} m={mat(C.ink)} seg8 />
      <mesh ref={beacon} geometry={G.sphere} material={glow(C.rose, 3)} position={[-0.9, 11.25, 0.8]} scale={0.12} />
      {/* lobby */}
      <Box p={[0, 0.95, 1.95]} s={[2.6, 1.7, 0.4]} m={mat(C.glass, { emissive: C.teal, ei: 0.35, rough: 0.2 })} />
      <Box p={[0, 1.95, 2.05]} s={[3, 0.25, 0.7]} m={mat(C.teal)} />
      {/* badge gate */}
      <group position={[2.4, 0, 3.4]}>
        <Box p={[0, 0.55, 0]} s={[0.35, 1.1, 0.35]} m={mat(C.cream)} round />
        <Box p={[0, 0.85, 0.19]} s={[0.2, 0.2, 0.02]} m={glow(C.teal, 2)} cast={false} />
        <group ref={arm} position={[0, 0.95, 0]}>
          <Box p={[-1.3, 0, 0]} s={[2.6, 0.12, 0.12]} m={mat("#f4f1ea")} cast={false} />
          {[0.4, 1.2, 2].map((x) => (
            <Box key={x} p={[-x, 0, 0]} s={[0.35, 0.13, 0.13]} m={mat(C.rose)} cast={false} />
          ))}
        </group>
      </group>
    </Group>
  );
}

// ---------------------------------------------------------------------------
// Post Office: drive up to say hello. The mailbox flag pops up when you arrive.
// ---------------------------------------------------------------------------
function PostOffice() {
  const p = placeById.contact;
  const flag = useRef<THREE.Group>(null);
  const env = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const here = game.zone === "contact" ? 1 : 0;
    if (flag.current) flag.current.rotation.x = THREE.MathUtils.damp(flag.current.rotation.x, here ? 0 : Math.PI / 2, 5, 1 / 60);
    if (env.current) {
      const t = clock.elapsedTime;
      env.current.position.y = 4.3 + Math.sin(t * 1.8) * 0.18 + here * 0.4;
      env.current.rotation.y = faceIn(p) + Math.sin(t * 0.9) * 0.25;
    }
  });

  return (
    <Group x={p.center.x} z={p.center.z} rot={p.rot}>
      <Box p={[0, 0.12, -0.3]} s={[4.6, 0.24, 4.2]} m={mat(C.stone)} />
      <Box p={[0, 1.45, -0.4]} s={[3.6, 2.6, 3]} m={mat(C.cream)} />
      <mesh geometry={ROOF} material={mat(C.rose, { flat: true })} position={[0, 2.75, -0.4]} castShadow />
      <Box p={[0, 0.95, 1.12]} s={[0.95, 1.6, 0.1]} m={mat(C.wood)} />
      <Box p={[-1.1, 1.75, 1.12]} s={[0.7, 0.6, 0.06]} m={glow("#ffe1b0", 0.9)} cast={false} />
      <Box p={[1.1, 1.75, 1.12]} s={[0.7, 0.6, 0.06]} m={glow("#ffe1b0", 0.9)} cast={false} />
      <Box p={[0, 2.3, 1.13]} s={[1.6, 0.34, 0.06]} m={mat(C.ink)} cast={false} />
      {/* mailbox */}
      <group position={[2.6, 0, 2]}>
        <Cyl p={[0, 0.55, 0]} r={0.08} h={1.1} m={mat(C.ink)} seg8 />
        <Box p={[0, 1.35, 0]} s={[0.65, 0.6, 0.95]} m={mat(C.ember)} round />
        <group ref={flag} position={[0.36, 1.25, -0.2]}>
          <Box p={[0, 0.28, 0]} s={[0.04, 0.56, 0.06]} m={mat(C.ink)} cast={false} />
          <Box p={[0, 0.48, 0.14]} s={[0.04, 0.2, 0.28]} m={mat(C.rose)} cast={false} />
        </group>
      </group>
      {/* floating envelope */}
      <group ref={env} position={[0, 4.3, -0.4]}>
        <Box p={[0, 0, 0]} s={[1.4, 0.9, 0.08]} m={mat("#fffaf0")} cast={false} />
        <Box p={[-0.33, 0.12, 0.05]} s={[0.85, 0.06, 0.02]} r={[0, 0, -0.55]} m={mat(C.rose)} cast={false} />
        <Box p={[0.33, 0.12, 0.05]} s={[0.85, 0.06, 0.02]} r={[0, 0, 0.55]} m={mat(C.rose)} cast={false} />
      </group>
    </Group>
  );
}

// ---------------------------------------------------------------------------
// Toolbox: crates with the stack on them. Physics moves them; this just draws.
// ---------------------------------------------------------------------------
function Crates({ fonts }: { fonts: Fonts }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const mats = useMemo(
    () =>
      game.bodies.map((b) => {
        const tex = canvasTexture(256, 256, (ctx, w, h) => {
          ctx.fillStyle = "#d6a067";
          ctx.fillRect(0, 0, w, h);
          ctx.strokeStyle = "#a8743f";
          ctx.lineWidth = 18;
          ctx.strokeRect(9, 9, w - 18, h - 18);
          ctx.fillStyle = "#f8efe0";
          roundRect(ctx, 26, 86, w - 52, 84, 12);
          ctx.fill();
          ctx.fillStyle = C.ink;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          let size = 40;
          ctx.font = `800 ${size}px ${fonts.sans}`;
          while (ctx.measureText(b.label).width > w - 70 && size > 18) {
            size -= 2;
            ctx.font = `800 ${size}px ${fonts.sans}`;
          }
          ctx.fillText(b.label, w / 2, h / 2 + 2);
        });
        return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 });
      }),
    [fonts.sans],
  );

  useFrame(() => {
    let moved = false;
    game.bodies.forEach((b, i) => {
      const m = refs.current[i];
      if (!m) return;
      const y = b.y + b.size / 2;
      const p = m.position;
      const r = m.rotation;
      if (
        Math.abs(p.x - b.x) + Math.abs(p.y - y) + Math.abs(p.z - b.z) > 1e-4 ||
        Math.abs(r.x - b.rx) + Math.abs(r.y - b.ry) + Math.abs(r.z - b.rz) > 1e-4
      ) {
        moved = true;
      }
      p.set(b.x, y, b.z);
      r.set(b.rx, b.ry, b.rz);
    });
    // the shadow picture is only redrawn while a crate is moving
    if (moved) game.shadowDirty = true;
  });

  return (
    <group>
      {mats.map((m, i) => (
        <mesh
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          geometry={G.box}
          material={m}
          scale={0.98}
          castShadow
          receiveShadow
        />
      ))}
    </group>
  );
}

export default function Places({ fonts }: { fonts: Fonts }) {
  return (
    <group>
      <AgentLab fonts={fonts} />
      <Vault />
      <OrderTruck fonts={fonts} />
      <AdminTower />
      <PostOffice />
      <Crates fonts={fonts} />
    </group>
  );
}
