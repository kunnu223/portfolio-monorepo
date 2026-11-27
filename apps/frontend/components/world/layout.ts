/**
 * The island map: where every place, road, tree and collider sits.
 * Pure data, shared by the physics (colliders) and the 3D components (what to draw).
 *
 * The camera looks from +x +z, so the world reads isometric. Layout is written in
 * screen terms with S(sx, sy): sx = right on screen, sy = up on screen.
 */
import { mulberry32 } from "./rand";

export const ISLAND_R = 34;
/** rotation.y that turns a +z-facing board toward the camera */
export const FACE = Math.PI / 4;

export type V2 = { x: number; z: number };

export function S(sx: number, sy: number): V2 {
  return { x: (sx - sy) / Math.SQRT2, z: (-sx - sy) / Math.SQRT2 };
}
/** world directions for screen right / screen up */
export const RIGHT: V2 = { x: Math.SQRT1_2, z: -Math.SQRT1_2 };
export const UP: V2 = { x: -Math.SQRT1_2, z: -Math.SQRT1_2 };

export type ZoneId =
  | "start"
  | "agents"
  | "billing"
  | "integrations"
  | "admin"
  | "career"
  | "stack"
  | "contact";

export type Place = {
  id: ZoneId;
  name: string; // name of the place on the island
  section: string; // what it is on a normal portfolio
  center: V2; // building centre
  rot: number; // building rotation; 0 = front faces +z, PI/2 = +x (both face the camera)
  pad: V2; // glowing pad where the info panel opens
  radius: number; // zone radius around the pad
  accent: string;
};

export const SPAWN = S(0, -1);
/** robot starts facing up the screen, towards the name */
export const SPAWN_HEADING = Math.atan2(UP.x, UP.z);
export const NAME_POS = S(0, 8.5);

const norm = (v: V2): V2 => {
  const l = Math.hypot(v.x, v.z) || 1;
  return { x: v.x / l, z: v.z / l };
};

function place(
  id: ZoneId,
  name: string,
  section: string,
  screen: [number, number],
  padDist: number,
  radius: number,
  accent: string,
): Place {
  const center = S(screen[0], screen[1]);
  const toSpawn = norm({ x: SPAWN.x - center.x, z: SPAWN.z - center.z });
  // front faces whichever camera-visible side (+z or +x) points more towards the spawn
  const rot = toSpawn.z >= toSpawn.x ? 0 : Math.PI / 2;
  const pad = {
    x: center.x + toSpawn.x * padDist,
    z: center.z + toSpawn.z * padDist,
  };
  return { id, name, section, center, rot, pad, radius, accent };
}

export const places: Place[] = [
  { ...place("start", "Start", "About", [0, -1], 0, 5, "#ff6a3d") },
  place("agents", "Agent Lab", "Work 01", [-17, 13], 6, 4.6, "#8a7cff"),
  place("billing", "The Vault", "Work 02", [17, 13], 6, 4.6, "#f5b942"),
  place("integrations", "Order Truck", "Work 03", [23, -3], 5, 4.6, "#fa5785"),
  place("admin", "Admin Tower", "Work 04", [-23, -3], 5, 4.6, "#38c9b4"),
  place("career", "Career Road", "Experience", [0, -15], 0, 6.5, "#ffb347"),
  place("stack", "Toolbox", "Stack", [15, -18], 5, 4.6, "#ff6a3d"),
  place("contact", "Post Office", "Contact", [-15, -18], 5, 4.6, "#fa5785"),
];

export const placeById = Object.fromEntries(places.map((p) => [p.id, p])) as Record<
  ZoneId,
  Place
>;

/** order of the guided tour (and of the "Next" button) */
export const TOUR: ZoneId[] = ["agents", "billing", "integrations", "admin", "career", "stack", "contact"];

/** where each place's floating name label sits (height above the ground) */
export const LABEL_Y: Record<ZoneId, number> = {
  start: 1.6,
  agents: 7.2,
  billing: 5.4,
  integrations: 4.3,
  admin: 12,
  career: 1.4,
  stack: 4.8,
  contact: 5.6,
};

/** a short line under each label */
export const LABEL_SUB: Record<ZoneId, string> = {
  start: "Who I am",
  agents: "Work 01 · AI agents",
  billing: "Work 02 · Payments",
  integrations: "Work 03 · Integrations",
  admin: "Work 04 · Admin SaaS",
  career: "Experience",
  stack: "Tech stack",
  contact: "Contact",
};

// ---------- roads ----------
export type Road = { a: V2; b: V2; w: number };

export const CAREER_A = S(-11, -15);
export const CAREER_B = S(11, -15);

export const roads: Road[] = [
  ...places
    .filter((p) => p.id !== "start" && p.id !== "career")
    .map((p) => ({ a: SPAWN, b: p.pad, w: 3 })),
  { a: SPAWN, b: placeById.career.pad, w: 3 },
  { a: CAREER_A, b: CAREER_B, w: 3.4 },
];

export function distToSegment(p: V2, a: V2, b: V2) {
  const abx = b.x - a.x;
  const abz = b.z - a.z;
  const t = Math.max(
    0,
    Math.min(1, ((p.x - a.x) * abx + (p.z - a.z) * abz) / (abx * abx + abz * abz || 1)),
  );
  return Math.hypot(p.x - (a.x + abx * t), p.z - (a.z + abz * t));
}

// ---------- career milestones ----------
/** role = index into `experience` in lib/content (newest first) */
export const milestones = [
  { at: S(-7.5, -15), sx: -7.5, year: "2023", label: "Infogram", sub: "React intern", role: 2, color: "#8a7cff" },
  { at: S(0, -15), sx: 0, year: "2024", label: "Knovator", sub: "MERN developer", role: 1, color: "#fa5785" },
  { at: S(7.5, -15), sx: 7.5, year: "2026", label: "AI-agents startup", sub: "Full stack · now", role: 0, color: "#ff6a3d" },
];
/** the part of Career Road that counts as the Experience zone (keeps clear of the pads at both ends) */
export const CAREER_ZONE_A = S(-8.6, -15);
export const CAREER_ZONE_B = S(8.6, -15);
/** milestone stones stand on the screen-upper side of the road */
export const milestoneStone = (m: { at: V2 }): V2 => ({ x: m.at.x + UP.x * 2.7, z: m.at.z + UP.z * 2.7 });

// ---------- crates in the toolbox (pushable) ----------
export const CRATE = 1;
export const crateLabels = [
  "TypeScript",
  "Node.js",
  "React",
  "Next.js",
  "MongoDB",
  "Postgres",
  "Redis",
  "Kafka",
  "LLM APIs",
  "NestJS",
];
export const crateStart = (() => {
  const c = placeById.stack.center;
  const rows = [
    { n: 4, y: 0 },
    { n: 3, y: CRATE },
    { n: 2, y: CRATE * 2 },
    { n: 1, y: CRATE * 3 },
  ];
  const out: { x: number; y: number; z: number }[] = [];
  for (const row of rows) {
    for (let i = 0; i < row.n; i++) {
      const off = (i - (row.n - 1) / 2) * CRATE * 1.01;
      out.push({ x: c.x + RIGHT.x * off, y: row.y, z: c.z + RIGHT.z * off });
    }
  }
  return out;
})();

// ---------- colliders ----------
export type Collider =
  | { kind: "circle"; x: number; z: number; r: number }
  | { kind: "box"; x: number; z: number; hw: number; hd: number; rot: number };

/** footprint of each building, in its own (unrotated) frame */
const footprints: Partial<Record<ZoneId, Collider[]>> = {
  agents: [
    { kind: "circle", x: 0, z: 0, r: 3.1 },
    { kind: "circle", x: -2.6, z: -2.4, r: 0.6 },
    { kind: "box", x: 3.4, z: -0.2, hw: 0.35, hd: 1.75, rot: 0 },
  ],
  billing: [{ kind: "box", x: 0, z: -0.3, hw: 3.3, hd: 2.4, rot: 0 }],
  integrations: [
    { kind: "box", x: 0, z: 0, hw: 2.7, hd: 1.25, rot: 0 },
    { kind: "circle", x: 3.4, z: 2.6, r: 1.1 },
  ],
  admin: [
    { kind: "box", x: 0, z: 0.1, hw: 2, hd: 2.15, rot: 0 },
    { kind: "circle", x: 2.4, z: 3.4, r: 0.3 },
  ],
  contact: [
    { kind: "box", x: 0, z: -0.4, hw: 2, hd: 1.7, rot: 0 },
    { kind: "circle", x: 2.6, z: 2, r: 0.55 },
  ],
};

function toWorld(c: Collider, p: Place): Collider {
  const cos = Math.cos(p.rot);
  const sin = Math.sin(p.rot);
  const x = p.center.x + c.x * cos + c.z * sin;
  const z = p.center.z - c.x * sin + c.z * cos;
  return c.kind === "circle" ? { ...c, x, z } : { ...c, x, z, rot: c.rot + p.rot };
}

export const NAME_WIDTH = 13;

export const lamps: V2[] = (() => {
  const out: V2[] = [];
  roads.forEach((r, ri) => {
    const len = Math.hypot(r.b.x - r.a.x, r.b.z - r.a.z);
    const d = norm({ x: r.b.x - r.a.x, z: r.b.z - r.a.z });
    const perp = { x: -d.z, z: d.x };
    for (let t = 8, k = ri; t < len - 4; t += 10, k++) {
      const side = k % 2 === 0 ? 1 : -1;
      out.push({
        x: r.a.x + d.x * t + perp.x * (r.w / 2 + 0.7) * side,
        z: r.a.z + d.z * t + perp.z * (r.w / 2 + 0.7) * side,
      });
    }
  });
  return out;
})();

// ---------- trees, rocks, tufts (seeded, so the island is the same on every visit) ----------
export type Tree = { x: number; z: number; s: number; kind: 0 | 1; hue: number };

export const trees: Tree[] = (() => {
  const rand = mulberry32(2026);
  const out: Tree[] = [];
  const keepClear = (p: V2) => {
    if (Math.hypot(p.x, p.z) > ISLAND_R - 3) return false;
    if (roads.some((r) => distToSegment(p, r.a, r.b) < r.w / 2 + 1.8)) return false;
    if (places.some((pl) => Math.hypot(p.x - pl.center.x, p.z - pl.center.z) < 7)) return false;
    if (places.some((pl) => Math.hypot(p.x - pl.pad.x, p.z - pl.pad.z) < pl.radius + 1)) return false;
    // name blocks and the ground text in front of them
    const sx = (p.x - p.z) / Math.SQRT2;
    const sy = (-p.x - p.z) / Math.SQRT2;
    if (Math.abs(sx) < NAME_WIDTH / 2 + 2 && sy > 4.5 && sy < 12) return false;
    if (Math.abs(sx) < 11 && sy > -18 && sy < -12) return false;
    if (lamps.some((l) => Math.hypot(p.x - l.x, p.z - l.z) < 1.5)) return false;
    if (out.some((t) => Math.hypot(p.x - t.x, p.z - t.z) < 2.6)) return false;
    return true;
  };
  for (let i = 0; i < 900 && out.length < 58; i++) {
    const a = rand() * Math.PI * 2;
    const r = Math.sqrt(rand()) * ISLAND_R;
    const p = { x: Math.cos(a) * r, z: Math.sin(a) * r };
    if (!keepClear(p)) continue;
    out.push({ ...p, s: 0.75 + rand() * 0.65, kind: rand() < 0.55 ? 0 : 1, hue: rand() });
  }
  return out;
})();

export const rocks = (() => {
  const rand = mulberry32(99);
  return Array.from({ length: 46 }, () => {
    const a = rand() * Math.PI * 2;
    const r = ISLAND_R + 0.6 + rand() * 1.8;
    return { x: Math.cos(a) * r, z: Math.sin(a) * r, s: 0.4 + rand() * 0.9, ry: rand() * 6 };
  });
})();

export const tufts = (() => {
  const rand = mulberry32(5);
  const out: { x: number; z: number; s: number; c: number }[] = [];
  for (let i = 0; i < 1400 && out.length < 160; i++) {
    const a = rand() * Math.PI * 2;
    const r = Math.sqrt(rand()) * (ISLAND_R - 1.5);
    const p = { x: Math.cos(a) * r, z: Math.sin(a) * r };
    if (roads.some((rd) => distToSegment(p, rd.a, rd.b) < rd.w / 2 + 0.4)) continue;
    if (Math.hypot(p.x - SPAWN.x, p.z - SPAWN.z) < 6) continue;
    if (places.some((pl) => Math.hypot(p.x - pl.center.x, p.z - pl.center.z) < 4)) continue;
    out.push({ ...p, s: 0.5 + rand() * 0.8, c: rand() });
  }
  return out;
})();

export const colliders: Collider[] = [
  ...places.flatMap((p) => (footprints[p.id] ?? []).map((c) => toWorld(c, p))),
  // the block name
  { kind: "box", x: NAME_POS.x, z: NAME_POS.z, hw: NAME_WIDTH / 2, hd: 0.45, rot: FACE },
  ...trees.map((t) => ({ kind: "circle" as const, x: t.x, z: t.z, r: 0.45 * t.s })),
  ...lamps.map((l) => ({ kind: "circle" as const, x: l.x, z: l.z, r: 0.2 })),
  ...milestones.map((m) => {
    const p = milestoneStone(m);
    return { kind: "circle" as const, x: p.x, z: p.z, r: 0.55 };
  }),
];
