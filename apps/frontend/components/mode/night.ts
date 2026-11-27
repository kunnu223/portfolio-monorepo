/** Day/night look, shared by Drive mode and Read mode (one switch, remembered across visits). */

export const NIGHT_KEY = "island-night";
const EVENT = "island-night";

export function readNight(): boolean {
  try {
    return localStorage.getItem(NIGHT_KEY) === "1";
  } catch {
    return false;
  }
}

/** marks <html data-night> so CSS (Read mode, the switch curtain) can follow along */
export function applyNight(on: boolean) {
  document.documentElement.toggleAttribute("data-night", on);
  window.dispatchEvent(new Event(EVENT));
}

export function writeNight(on: boolean) {
  try {
    localStorage.setItem(NIGHT_KEY, on ? "1" : "0");
  } catch {
    // storage blocked: the switch still works for this visit
  }
  applyNight(on);
}

export const isNight = () => document.documentElement.hasAttribute("data-night");

export function subscribeNight(l: () => void) {
  window.addEventListener(EVENT, l);
  return () => window.removeEventListener(EVENT, l);
}

/** runs before the first paint of Read mode, so a night visitor never sees a flash of day */
export const NIGHT_SCRIPT = `try{if(localStorage.getItem("${NIGHT_KEY}")==="1")document.documentElement.setAttribute("data-night","")}catch(e){}`;
