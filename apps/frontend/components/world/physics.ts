/**
 * Small arcade physics: a robot that drives like a toy car, static colliders
 * (circles + rotated boxes on the ground plane) and pushable crates that can tumble.
 * No physics engine; everything is 2D on the ground plus a little vertical hop for crates.
 */
import {
  CAREER_A,
  CAREER_B,
  CAREER_ZONE_A,
  CAREER_ZONE_B,
  ISLAND_R,
  RIGHT,
  SPAWN,
  SPAWN_HEADING,
  UP,
  colliders,
  distToSegment,
  milestones,
  placeById,
  places,
  type Collider,
  type V2,
  type ZoneId,
} from "./layout";
import { game, makeBodies, publish } from "./state";

const CAR_R = 0.8;
const MAX_SPEED = 10.5;
const BOOST = 1.55;
const ACCEL = 15;
const BRAKE = 26;
const REVERSE = 5;
const STEER = 2.6;
const GRIP = 7.5;
const GRAVITY = 28;
const HALF_PI = Math.PI / 2;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

type Hit = { nx: number; nz: number; depth: number };

function hitCircle(x: number, z: number, r: number, c: Collider): Hit | null {
  if (c.kind === "circle") {
    const dx = x - c.x;
    const dz = z - c.z;
    const d = Math.hypot(dx, dz);
    const min = r + c.r;
    if (d >= min) return null;
    if (d < 1e-6) return { nx: 1, nz: 0, depth: min };
    return { nx: dx / d, nz: dz / d, depth: min - d };
  }
  // into the box's frame (three.js rotation.y convention)
  const cos = Math.cos(c.rot);
  const sin = Math.sin(c.rot);
  const dx = x - c.x;
  const dz = z - c.z;
  const lx = cos * dx - sin * dz;
  const lz = sin * dx + cos * dz;
  if (Math.abs(lx) > c.hw + r || Math.abs(lz) > c.hd + r) return null;
  const cx = clamp(lx, -c.hw, c.hw);
  const cz = clamp(lz, -c.hd, c.hd);
  let nlx = lx - cx;
  let nlz = lz - cz;
  const d = Math.hypot(nlx, nlz);
  let depth: number;
  if (d > 1e-6) {
    if (d >= r) return null;
    nlx /= d;
    nlz /= d;
    depth = r - d;
  } else {
    // centre inside the box: push out along the shallowest axis
    const px = c.hw - Math.abs(lx);
    const pz = c.hd - Math.abs(lz);
    if (px < pz) {
      nlx = Math.sign(lx) || 1;
      nlz = 0;
      depth = px + r;
    } else {
      nlx = 0;
      nlz = Math.sign(lz) || 1;
      depth = pz + r;
    }
  }
  // back to world
  return { nx: cos * nlx + sin * nlz, nz: -sin * nlx + cos * nlz, depth };
}

/** Pushes a circle out of every static collider; returns the hardest hit speed. */
function collideStatic(
  o: { x: number; z: number; vx: number; vz: number },
  r: number,
  bounce: number,
) {
  let worst = 0;
  for (const c of colliders) {
    const h = hitCircle(o.x, o.z, r, c);
    if (!h) continue;
    o.x += h.nx * h.depth;
    o.z += h.nz * h.depth;
    const vn = o.vx * h.nx + o.vz * h.nz;
    if (vn < 0) {
      o.vx -= vn * h.nx * (1 + bounce);
      o.vz -= vn * h.nz * (1 + bounce);
      worst = Math.max(worst, -vn);
    }
  }
  // soft edge of the island
  const d = Math.hypot(o.x, o.z);
  const max = ISLAND_R - 1.2;
  if (d > max) {
    const nx = o.x / d;
    const nz = o.z / d;
    o.x = nx * max;
    o.z = nz * max;
    const vn = o.vx * nx + o.vz * nz;
    if (vn > 0) {
      o.vx -= vn * nx * (1 + bounce);
      o.vz -= vn * nz * (1 + bounce);
      worst = Math.max(worst, vn);
    }
  }
  return worst;
}

function placeCarAt(id: ZoneId) {
  const c = game.car;
  const p = placeById[id];
  c.x = p.pad.x;
  c.z = p.pad.z;
  // face the building (or up the screen at the start / career road)
  const dx = p.center.x - p.pad.x;
  const dz = p.center.z - p.pad.z;
  c.h = Math.hypot(dx, dz) > 0.5 ? Math.atan2(dx, dz) : id === "career" ? Math.atan2(RIGHT.x, RIGHT.z) : SPAWN_HEADING;
  c.vx = c.vz = c.vf = 0;
  game.snapCamera = true;
}

// ---------- autopilot: the road network as a tiny graph ----------
const NODES: V2[] = [SPAWN, CAREER_A, CAREER_B];
const nodeOf = {} as Record<ZoneId, number>;
for (const p of places) {
  if (p.id === "start") continue;
  nodeOf[p.id] = NODES.length;
  NODES.push(p.pad);
}
const EDGES: [number, number][] = [
  ...places.filter((p) => p.id !== "start").map((p): [number, number] => [0, nodeOf[p.id]]),
  [1, nodeOf.career],
  [nodeOf.career, 2],
  [1, nodeOf.contact],
  [2, nodeOf.stack],
];

function nearestEdge(p: V2) {
  let best = { e: EDGES[0], d: Infinity, at: SPAWN };
  for (const e of EDGES) {
    const a = NODES[e[0]];
    const b = NODES[e[1]];
    const d = distToSegment(p, a, b);
    if (d < best.d) {
      const abx = b.x - a.x;
      const abz = b.z - a.z;
      const t = clamp(((p.x - a.x) * abx + (p.z - a.z) * abz) / (abx * abx + abz * abz || 1), 0, 1);
      best = { e, d, at: { x: a.x + abx * t, z: a.z + abz * t } };
    }
  }
  return best;
}

/** Waypoints along the roads from `from` to `to`. */
function route(from: V2, to: V2): V2[] {
  const s = nearestEdge(from);
  const e = nearestEdge(to);
  const pts = [...NODES, s.at, e.at];
  const S = NODES.length;
  const E = S + 1;
  const links: [number, number][] = [...EDGES, [S, s.e[0]], [S, s.e[1]], [E, e.e[0]], [E, e.e[1]]];
  if (s.e === e.e) links.push([S, E]);
  const len = (a: number, b: number) => Math.hypot(pts[a].x - pts[b].x, pts[a].z - pts[b].z);
  // dijkstra on a dozen nodes
  const dist = pts.map(() => Infinity);
  const prev = pts.map(() => -1);
  const done = pts.map(() => false);
  dist[S] = 0;
  for (;;) {
    let u = -1;
    for (let k = 0; k < pts.length; k++) if (!done[k] && (u < 0 || dist[k] < dist[u])) u = k;
    if (u < 0 || dist[u] === Infinity || u === E) break;
    done[u] = true;
    for (const [a, b] of links) {
      const v = a === u ? b : b === u ? a : -1;
      if (v < 0 || done[v]) continue;
      const nd = dist[u] + len(u, v);
      if (nd < dist[v]) {
        dist[v] = nd;
        prev[v] = u;
      }
    }
  }
  const chain: V2[] = [];
  for (let k = E; k >= 0 && k !== S; k = prev[k]) chain.unshift(pts[k]);
  if (s.d > 1.5) chain.unshift(s.at);
  if (Math.hypot(to.x - e.at.x, to.z - e.at.z) > 0.3) chain.push(to);
  return chain.length ? chain : [to];
}

/** Drive the robot to a place by itself (or jump there when motion is reduced). */
export function driveTo(id: ZoneId, point?: V2) {
  if (game.reducedMotion) {
    game.auto = null;
    game.teleport = id;
    return;
  }
  const to = point ?? placeById[id].pad;
  if (!point && game.zone === id) return;
  game.auto = { target: id, path: route(game.car, to), stuck: 0 };
  game.moved = true;
  publish();
}

/** Jump straight to a place (used by the Places menu). */
export function jumpTo(id: ZoneId) {
  game.auto = null;
  game.teleport = id;
  publish();
}

export function stopAuto() {
  if (!game.auto) return;
  game.auto = null;
  publish();
}

/** throttle/steer/boost from the autopilot, or null when it is finished */
function autopilot(dt: number): null | { throttle: number; steer: number; boost: boolean } {
  const a = game.auto;
  if (!a) return null;
  const c = game.car;
  while (a.path.length > 1 && Math.hypot(a.path[0].x - c.x, a.path[0].z - c.z) < 2.4) a.path.shift();
  const wp = a.path[0];
  const dx = wp.x - c.x;
  const dz = wp.z - c.z;
  const d = Math.hypot(dx, dz);
  const last = a.path.length === 1;
  if (last && d < 1) {
    c.vx *= 0.35;
    c.vz *= 0.35;
    game.auto = null;
    publish();
    return null;
  }
  const diff = wrap(Math.atan2(dx, dz) - c.h);
  let want = 12.5;
  if (last) want = Math.min(want, 1.7 * d + 1);
  else {
    // ease off before a bend
    const n = a.path[1];
    const turn = Math.abs(wrap(Math.atan2(n.x - wp.x, n.z - wp.z) - Math.atan2(dx, dz)));
    const corner = Math.max(3.5, 12.5 * (1 - turn / Math.PI) ** 1.5);
    if (d < 7) want = corner + (want - corner) * (d / 7);
  }
  if (Math.abs(diff) > 0.9) want = Math.min(want, 3);
  const vf = c.vx * Math.sin(c.h) + c.vz * Math.cos(c.h);
  a.stuck = Math.abs(vf) < 0.6 ? a.stuck + dt : 0;
  if (a.stuck > 1.5) {
    game.teleport = a.target;
    game.auto = null;
    publish();
    return null;
  }
  return {
    throttle: vf < want ? 1 : vf > want + 1.5 ? -0.5 : 0,
    steer: clamp(-diff * 2.5, -1, 1),
    boost: want > MAX_SPEED,
  };
}

function stepCar(dt: number) {
  const c = game.car;
  const i = game.input;

  let throttle = (i.up ? 1 : 0) - (i.down ? 1 : 0);
  let steer = (i.right ? 1 : 0) - (i.left ? 1 : 0);
  let boost = i.boost;
  const touching = i.joy && Math.hypot(i.joyX, i.joyY) > 0.12;
  // any key or the stick takes the wheel back from the autopilot
  if (game.auto && (throttle !== 0 || steer !== 0 || touching || i.brake)) {
    game.auto = null;
    publish();
  }
  const ap = autopilot(dt);
  if (ap) {
    throttle = ap.throttle;
    steer = ap.steer;
    boost = ap.boost;
  }

  if (i.joy) {
    // touch: push the stick where you want to go on screen; the robot turns that way
    const mag = Math.min(1, Math.hypot(i.joyX, i.joyY));
    if (mag > 0.12) {
      const wx = RIGHT.x * i.joyX + UP.x * i.joyY;
      const wz = RIGHT.z * i.joyX + UP.z * i.joyY;
      const diff = wrap(Math.atan2(wx, wz) - c.h);
      steer = clamp(-diff * 2.2, -1, 1);
      throttle = mag * (0.35 + 0.65 * Math.max(0, Math.cos(diff)));
    }
  }
  if (throttle !== 0 || steer !== 0) {
    if (!game.moved) {
      game.moved = true;
      publish();
    }
  }

  const fx = Math.sin(c.h);
  const fz = Math.cos(c.h);
  // local +x of the robot (its left side)
  const lx = fz;
  const lz = -fx;
  let vf = c.vx * fx + c.vz * fz;
  let vl = c.vx * lx + c.vz * lz;

  const top = MAX_SPEED * (boost ? BOOST : 1);
  if (throttle > 0) vf += throttle * (vf < 0 ? BRAKE : ACCEL * (boost ? 1.4 : 1)) * dt;
  else if (throttle < 0) vf += throttle * (vf > 0 ? BRAKE : ACCEL * 0.6) * dt;
  vf = clamp(vf, -REVERSE, Math.max(top, vf - 20 * dt)); // ease down after a boost
  vf *= Math.exp(-(throttle === 0 ? 1.8 : 0.25) * dt);
  if (i.brake) vf *= Math.exp(-7 * dt);
  vl *= Math.exp(-GRIP * dt);

  const turn = clamp(vf / 2.5, -1, 1) * (1 - 0.3 * Math.min(1, Math.abs(vf) / (MAX_SPEED * BOOST)));
  c.h = wrap(c.h - steer * STEER * turn * dt);

  const nfx = Math.sin(c.h);
  const nfz = Math.cos(c.h);
  c.vx = nfx * vf + nfz * vl;
  c.vz = nfz * vf - nfx * vl;
  c.x += c.vx * dt;
  c.z += c.vz * dt;
  c.odo += vf * dt;

  const hit = collideStatic(c, CAR_R, 0.25);
  if (hit > 2) c.impact = Math.max(c.impact, Math.min(1, hit / 10));
  c.impact *= Math.exp(-4 * dt);

  c.vf = c.vx * nfx + c.vz * nfz;
  c.steer += (steer - c.steer) * Math.min(1, dt * 10);
  c.throttle += (throttle - c.throttle) * Math.min(1, dt * 6);
}

function snapAngle(a: number, dt: number) {
  const target = Math.round(a / HALF_PI) * HALF_PI;
  return a + (target - a) * Math.min(1, dt * 7);
}

function stepBodies(dt: number) {
  const bodies = game.bodies;
  const c = game.car;

  for (const b of bodies) {
    // what is it standing on?
    let floor = 0;
    for (const o of bodies) {
      if (o === b) continue;
      if (o.y + o.size > b.y + b.size * 0.5) continue;
      if (Math.hypot(o.x - b.x, o.z - b.z) < b.size * 0.85) floor = Math.max(floor, o.y + o.size);
    }
    const airborne = b.y > floor + 1e-3 || b.vy > 0;
    if (airborne) {
      b.vy -= GRAVITY * dt;
      b.y += b.vy * dt;
      if (b.y <= floor) {
        b.y = floor;
        b.vy = b.vy < -4 ? -b.vy * 0.28 : 0;
      }
    } else {
      b.y = floor;
      b.vy = 0;
    }

    const grounded = b.y <= floor + 1e-3 && b.vy === 0;
    const fr = Math.exp(-(grounded ? 3.2 : 0.3) * dt);
    b.vx *= fr;
    b.vz *= fr;
    b.x += b.vx * dt;
    b.z += b.vz * dt;

    b.rx += b.wx * dt;
    b.ry += b.wy * dt;
    b.rz += b.wz * dt;
    if (grounded) {
      const wd = Math.exp(-7 * dt);
      b.wx *= wd;
      b.wy *= wd;
      b.wz *= wd;
      b.rx = snapAngle(b.rx, dt);
      b.rz = snapAngle(b.rz, dt);
    }

    collideStatic(b, b.size * 0.5, 0.35);

    // robot shoves crates
    if (b.y < 1.1) {
      const dx = b.x - c.x;
      const dz = b.z - c.z;
      const d = Math.hypot(dx, dz) || 1e-6;
      const min = CAR_R + b.size * 0.55;
      if (d < min) {
        const nx = dx / d;
        const nz = dz / d;
        const over = min - d;
        b.x += nx * over * 0.85;
        b.z += nz * over * 0.85;
        c.x -= nx * over * 0.15;
        c.z -= nz * over * 0.15;
        const rel = (c.vx - b.vx) * nx + (c.vz - b.vz) * nz;
        if (rel > 0) {
          b.vx += nx * rel * 1.45;
          b.vz += nz * rel * 1.45;
          c.vx -= nx * rel * 0.22;
          c.vz -= nz * rel * 0.22;
          if (rel > 3.2) {
            b.vy = Math.min(8, rel * 0.55);
            b.wx = (Math.random() - 0.5) * rel * 1.6;
            b.wz = (Math.random() - 0.5) * rel * 1.6;
            b.wy = (Math.random() - 0.5) * rel;
            c.impact = Math.max(c.impact, Math.min(0.6, rel / 14));
          }
        }
      }
    }
  }

  // crates against each other (only when side by side, not stacked)
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const a = bodies[i];
      const b = bodies[j];
      if (Math.abs(a.y - b.y) > a.size * 0.8) continue;
      const dx = b.x - a.x;
      const dz = b.z - a.z;
      const d = Math.hypot(dx, dz) || 1e-6;
      const min = (a.size + b.size) * 0.5;
      if (d >= min) continue;
      const nx = dx / d;
      const nz = dz / d;
      const over = (min - d) / 2;
      a.x -= nx * over;
      a.z -= nz * over;
      b.x += nx * over;
      b.z += nz * over;
      const rel = (a.vx - b.vx) * nx + (a.vz - b.vz) * nz;
      if (rel > 0) {
        const k = rel * 0.7;
        a.vx -= nx * k;
        a.vz -= nz * k;
        b.vx += nx * k;
        b.vz += nz * k;
      }
    }
  }
}

function updateZone() {
  const c = game.car;
  let zone: ZoneId | null = null;
  let best = Infinity;
  for (const p of places) {
    if (p.id === "career") continue;
    const d = Math.hypot(c.x - p.pad.x, c.z - p.pad.z);
    const r = p.radius + (game.zone === p.id ? 1.2 : 0);
    if (d < r && d < best) {
      best = d;
      zone = p.id;
    }
  }
  // Career Road counts along its whole length, not just one pad
  if (!zone && distToSegment(c, CAREER_ZONE_A, CAREER_ZONE_B) < 3 + (game.zone === "career" ? 1.2 : 0)) {
    zone = "career";
  }
  let changed = false;
  if (zone === "career") {
    const sx = (c.x - c.z) / Math.SQRT2;
    let stepIdx = game.careerStep;
    let bd = Infinity;
    milestones.forEach((m, k) => {
      const d = Math.abs(sx - m.sx);
      if (d < bd) {
        bd = d;
        stepIdx = k;
      }
    });
    if (stepIdx !== game.careerStep) {
      game.careerStep = stepIdx;
      changed = true;
    }
  }
  if (zone !== game.zone) {
    game.zone = zone;
    if (zone) game.visited.add(zone);
    changed = true;
  }
  if (changed) publish();
}

export function step(dt: number) {
  if (game.reset) {
    game.reset = false;
    game.auto = null;
    placeCarAt("start");
    game.car.x = SPAWN.x;
    game.car.z = SPAWN.z;
    game.bodies = makeBodies();
  }
  if (game.teleport) {
    placeCarAt(game.teleport);
    game.teleport = null;
  }
  stepCar(dt);
  stepBodies(dt);
  updateZone();
}
