/**
 * Shared, mutable game state. The physics writes it every step; 3D components read it in
 * useFrame; the HTML overlay subscribes to the few fields it shows (zone, visited, ...).
 */
import { applyNight, readNight, writeNight } from "@/components/mode/night";
import { CRATE, SPAWN, SPAWN_HEADING, crateLabels, crateStart, type V2, type ZoneId } from "./layout";

export type Body = {
  label: string;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  rx: number;
  ry: number;
  rz: number;
  wx: number;
  wy: number;
  wz: number;
  size: number;
};

export function makeBodies(): Body[] {
  return crateStart.map((p, i) => ({
    label: crateLabels[i],
    ...p,
    vx: 0,
    vy: 0,
    vz: 0,
    rx: 0,
    ry: Math.PI / 4,
    rz: 0,
    wx: 0,
    wy: 0,
    wz: 0,
    size: CRATE,
  }));
}

export const game = {
  car: {
    x: SPAWN.x,
    z: SPAWN.z,
    h: SPAWN_HEADING,
    vx: 0,
    vz: 0,
    /** forward speed (signed) */
    vf: 0,
    steer: 0,
    throttle: 0,
    /** strength of the last bump, decays; drives wobble + camera shake */
    impact: 0,
    /** total distance driven, for wheel spin */
    odo: 0,
  },
  input: {
    up: false,
    down: false,
    left: false,
    right: false,
    boost: false,
    brake: false,
    /** touch joystick, screen space (-1..1), y up */
    joyX: 0,
    joyY: 0,
    joy: false,
  },
  bodies: makeBodies(),
  camTarget: { x: SPAWN.x, z: SPAWN.z },
  zone: "start" as ZoneId | null,
  visited: new Set<ZoneId>(["start"]),
  moved: false,
  ready: false,
  /** set by the UI; the physics applies it on the next step */
  teleport: null as ZoneId | null,
  reset: false,
  /** the camera jumps instead of gliding (after a teleport) */
  snapCamera: false,
  reducedMotion: false,
  /** px of screen covered by the side panel on the right; name tags under it are hidden */
  panel: 0,
  /** night mode: `night` is the switch, `nightT` eases 0..1 for the look */
  night: false,
  nightT: 0,
  /** autopilot: the robot drives itself along `path` to a place */
  auto: null as null | { target: ZoneId; path: V2[]; stuck: number },
  /** which job on Career Road the robot is next to (index into `milestones`) */
  careerStep: 2,
  /** graphics level picked for this device */
  quality: "high" as Quality,
  /**
   * Shadows are drawn once and then reused, because almost nothing on the island moves.
   * Set this when something that casts a shadow moved (crates being pushed, the name falling in).
   */
  shadowDirty: false,
};

export type Quality = "high" | "mid" | "low";

/** floating HTML labels, registered by the overlay and positioned by the 3D scene every frame */
export const labelEls = new Map<string, HTMLElement>();

export type Snapshot = {
  zone: ZoneId | null;
  visited: ZoneId[];
  moved: boolean;
  ready: boolean;
  night: boolean;
  auto: ZoneId | null;
  careerStep: number;
};

const initial: Snapshot = {
  zone: "start",
  visited: ["start"],
  moved: false,
  ready: false,
  night: false,
  auto: null,
  careerStep: 2,
};
let snap: Snapshot = initial;
const listeners = new Set<() => void>();

/** Push the UI-visible fields to subscribers. Call only when one of them changed. */
export function publish() {
  snap = {
    zone: game.zone,
    visited: [...game.visited],
    moved: game.moved,
    ready: game.ready,
    night: game.night,
    auto: game.auto?.target ?? null,
    careerStep: game.careerStep,
  };
  listeners.forEach((l) => l());
}

export function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}
export const getSnapshot = () => snap;
export const getServerSnapshot = () => initial;

/** day/night: the same switch as Read mode, remembered across visits */
export function setNight(on: boolean) {
  game.night = on;
  writeNight(on);
  publish();
}

/** night setting from the last visit (snaps the look, no fade) */
export function loadNight() {
  const on = readNight();
  game.night = on;
  game.nightT = on ? 1 : 0;
  applyNight(on);
  publish();
}
