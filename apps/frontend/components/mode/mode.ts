/**
 * Switching between Drive mode (the island, "/") and Read mode ("/read").
 * A curtain slides over the page, the route changes underneath it, and the
 * curtain lifts once the new mode says it is ready (or after a time limit).
 */

import { isNight } from "./night";

export type Mode = "drive" | "read";
export const MODE_PATH: Record<Mode, string> = { drive: "/", read: "/read" };

export type Phase = "in" | "hold" | "out";
type Switch = { to: Mode | null; phase: Phase | null; night: boolean };

const IDLE: Switch = { to: null, phase: null, night: false };
let state: Switch = IDLE;
const listeners = new Set<() => void>();
function set(patch: Partial<Switch>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export function subscribeSwitch(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}
export const getSwitch = () => state;
export const getServerSwitch = () => IDLE;

let navigate: ((href: string) => void) | null = null;
/** the overlay hands over the router, so switching stays a client-side navigation */
export function setNavigator(fn: ((href: string) => void) | null) {
  navigate = fn;
}

let readyFor: Mode | null = null;
const waiters = new Set<() => void>();

/** a mode calls this once it is ready to be seen */
export function signalReady(mode: Mode) {
  readyFor = mode;
  waiters.forEach((w) => w());
}

function whenReady(mode: Mode) {
  return new Promise<void>((resolve) => {
    if (readyFor === mode) return resolve();
    const check = () => {
      if (readyFor !== mode) return;
      waiters.delete(check);
      resolve();
    };
    waiters.add(check);
  });
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function switchMode(to: Mode) {
  if (state.phase) return;
  if (!navigate) {
    window.location.assign(MODE_PATH[to]);
    return;
  }
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const t0 = performance.now();
  readyFor = null;
  waiters.clear();
  set({ to, phase: "in", night: isNight() });
  await wait(reduce ? 60 : 560);
  navigate(MODE_PATH[to]);
  set({ phase: "hold" });
  await Promise.race([whenReady(to), wait(10000)]);
  // keep the card up long enough to read
  const left = (reduce ? 400 : 1500) - (performance.now() - t0);
  if (left > 0) await wait(left);
  set({ phase: "out" });
  await wait(reduce ? 120 : 650);
  set({ to: null, phase: null });
}
