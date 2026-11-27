"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import CareerRoad from "./CareerRoad";
import { Ground, Nature, Pads, Roads } from "./Island";
import { C, loadFonts, radialTexture, type Fonts } from "./kit";
import {
  ISLAND_R,
  LABEL_Y,
  SPAWN,
  TOUR,
  milestoneStone,
  milestones,
  placeById,
  places,
  type V2,
} from "./layout";
import { NameBlocks } from "./NameBlocks";
import Places from "./Places";
import Robot from "./Robot";
import { step } from "./physics";
import { game, labelEls, loadNight, publish, setNight, type Quality } from "./state";

const FIXED = 1 / 120;
const CAM_DIR = new THREE.Vector3(12, 15, 12).normalize();
// sun from the front-right so the faces the camera sees are lit. It stays put and its
// shadow box covers the whole island, so shadows can be drawn once and reused.
const SUN = new THREE.Vector3(9, 20, 5).setLength(60);
const SHADOW_BOX = 40;

const DAY = {
  sky: new THREE.Color(C.sky),
  hemiSky: new THREE.Color("#fff4e2"),
  hemiGround: new THREE.Color("#7d9a6a"),
  hemi: 1.35,
  sun: new THREE.Color("#ffe2bd"),
  sunI: 2.6,
};
const NIGHT = {
  sky: new THREE.Color("#0f1a2e"),
  hemiSky: new THREE.Color("#6a80c0"),
  hemiGround: new THREE.Color("#1b2333"),
  hemi: 0.75,
  sun: new THREE.Color("#9db4ff"),
  sunI: 0.85,
};

/** Graphics level, picked once per visit. `?quality=low|mid|high` forces one. */
function pickQuality(): Quality {
  const forced = new URLSearchParams(window.location.search).get("quality");
  if (forced === "low" || forced === "mid" || forced === "high") return forced;
  const cores = navigator.hardwareConcurrency || 4;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  const touch = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;
  if (cores <= 2 || mem <= 2) return "low";
  if (touch || cores <= 4 || mem <= 4) return "mid";
  return "high";
}

function Simulation() {
  const acc = useRef(0);
  useFrame((_, delta) => {
    acc.current += Math.min(delta, 0.1);
    while (acc.current >= FIXED) {
      step(FIXED);
      acc.current -= FIXED;
    }
  }, -1);
  return null;
}

function CameraRig() {
  const { camera, size } = useThree();
  const target = useRef(new THREE.Vector3(game.car.x, 0, game.car.z));
  const intro = useRef(0);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 20);
    const c = game.car;
    const lead = 0.32;
    const tx = c.x + c.vx * lead;
    const tz = c.z + c.vz * lead;
    if (game.snapCamera) {
      target.current.set(tx, 0, tz);
      game.snapCamera = false;
    } else {
      target.current.x = THREE.MathUtils.damp(target.current.x, tx, 4, dt);
      target.current.z = THREE.MathUtils.damp(target.current.z, tz, 4, dt);
    }
    game.camTarget.x = target.current.x;
    game.camTarget.z = target.current.z;

    // wider view on narrow screens, and a short zoom-in when the island first appears
    const aspect = size.width / size.height;
    const base = THREE.MathUtils.clamp(54 / aspect, 33, 46);
    intro.current = game.reducedMotion ? 1 : Math.min(1, intro.current + dt * 0.45);
    const e = 1 - Math.pow(1 - intro.current, 3);
    const dist = base * (1 + (1 - e) * 0.9);

    const shake = game.reducedMotion ? 0 : c.impact * 0.25;
    const t = state.clock.elapsedTime;
    camera.position.set(
      target.current.x + CAM_DIR.x * dist + Math.sin(t * 50) * shake,
      CAM_DIR.y * dist + Math.cos(t * 43) * shake,
      target.current.z + CAM_DIR.z * dist,
    );
    camera.lookAt(target.current.x, 0.6, target.current.z);
    // the view stays centred when a side panel opens; a sliding view made the whole island jump
  });
  return null;
}

/** Sun, sky light, background and fog; all of them fade between day and night. */
function Atmosphere({ quality }: { quality: Quality }) {
  const sun = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const scene = useThree((s) => s.scene);
  const last = useRef(-1);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 20);
    const want = game.night ? 1 : 0;
    game.nightT = game.reducedMotion ? want : THREE.MathUtils.damp(game.nightT, want, 3, dt);
    if (Math.abs(game.nightT - want) < 0.002) game.nightT = want;

    const l = sun.current;
    const h = hemi.current;
    if (!l || !h) return;
    const k = game.nightT;
    if (k === last.current) return;
    last.current = k;
    if (scene.background instanceof THREE.Color) scene.background.copy(DAY.sky).lerp(NIGHT.sky, k);
    if (scene.fog) scene.fog.color.copy(DAY.sky).lerp(NIGHT.sky, k);
    h.color.copy(DAY.hemiSky).lerp(NIGHT.hemiSky, k);
    h.groundColor.copy(DAY.hemiGround).lerp(NIGHT.hemiGround, k);
    h.intensity = THREE.MathUtils.lerp(DAY.hemi, NIGHT.hemi, k);
    l.color.copy(DAY.sun).lerp(NIGHT.sun, k);
    l.intensity = THREE.MathUtils.lerp(DAY.sunI, NIGHT.sunI, k);
  });

  return (
    <>
      <color attach="background" args={[C.sky]} />
      <fog attach="fog" args={[C.sky, 55, 140]} />
      <hemisphereLight ref={hemi} args={[DAY.hemiSky, DAY.hemiGround, DAY.hemi]} />
      <directionalLight
        ref={sun}
        position={[SUN.x, SUN.y, SUN.z]}
        color={DAY.sun}
        intensity={DAY.sunI}
        castShadow={quality !== "low"}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-SHADOW_BOX}
        shadow-camera-right={SHADOW_BOX}
        shadow-camera-top={SHADOW_BOX}
        shadow-camera-bottom={-SHADOW_BOX}
        shadow-camera-near={15}
        shadow-camera-far={105}
        shadow-bias={-0.0005}
        shadow-normalBias={0.045}
      />
    </>
  );
}

/**
 * Draws the shadows once and reuses them. Almost nothing on the island moves, and drawing
 * shadows every frame was the biggest cost on slow devices. Things that do move either
 * have a soft blob under them (the robot) or ask for a redraw while moving (crates, the name).
 */
function ShadowBake() {
  const until = useRef(-1);
  useFrame(({ gl, clock }) => {
    const sm = gl.shadowMap;
    if (!sm.enabled) return;
    sm.autoUpdate = false;
    if (!game.ready) {
      sm.needsUpdate = true;
      return;
    }
    // keep drawing for a moment after the island appears, then only on request
    if (until.current < 0) until.current = clock.elapsedTime + 1;
    if (clock.elapsedTime < until.current || game.shadowDirty) {
      sm.needsUpdate = true;
      game.shadowDirty = false;
    }
  });
  return null;
}

const DPR_MIN = 0.75;

/**
 * Keeps the frame rate up on slow devices by lowering the pixel ratio a step at a time.
 * If a step doesn't help (for example a phone in battery saver, capped at 30 fps),
 * it goes back to the sharper setting and stops.
 */
function PerfWatch({ dpr, onDpr }: { dpr: number; onDpr: (v: number) => void }) {
  const st = useRef({ t: 0, n: 0, wait: 2, done: false, before: null as null | { fps: number; dpr: number } });
  useFrame((_, delta) => {
    const a = st.current;
    if (a.done || !game.ready) return;
    if (delta > 0.25) {
      // tab was hidden or a hitch: start the window again
      a.t = 0;
      a.n = 0;
      return;
    }
    if (a.wait > 0) {
      a.wait -= delta;
      return;
    }
    a.t += delta;
    a.n += 1;
    if (a.t < 1.5) return;
    const fps = a.n / a.t;
    a.t = 0;
    a.n = 0;
    if (a.before) {
      const was = a.before;
      a.before = null;
      if (fps < 45 && fps < was.fps * 1.1) {
        // a lower pixel ratio didn't help, so the limit is elsewhere: keep it sharp
        onDpr(was.dpr);
        a.done = true;
        return;
      }
    }
    if (fps >= 45) return;
    if (dpr <= DPR_MIN) {
      a.done = true;
      return;
    }
    a.before = { fps, dpr };
    onDpr(Math.max(DPR_MIN, Math.round((dpr - 0.25) * 100) / 100));
    a.wait = 0.5;
  });
  return null;
}

const anchor = new THREE.Vector3();

/** where each floating label points to, in the world */
function labelAnchor(key: string): THREE.Vector3 | null {
  const [kind, id] = key.split(":");
  if (kind === "place") {
    const p = placeById[id as keyof typeof placeById];
    if (!p) return null;
    if (p.id === "career") {
      const s = milestoneStone(milestones[1]);
      return anchor.set(s.x, 3.6, s.z);
    }
    const at = p.id === "start" ? SPAWN : p.center;
    return anchor.set(at.x, LABEL_Y[p.id], at.z);
  }
  if (kind === "ms") {
    const m = milestones[Number(id)];
    if (!m) return null;
    const s = milestoneStone(m);
    return anchor.set(s.x, 3.6, s.z);
  }
  return null;
}

/** Moves the HTML labels so they float over their places. Runs after the camera. */
function LabelProjector() {
  const { camera, size } = useThree();
  useFrame(() => {
    if (!labelEls.size) return;
    // the camera moved this frame; refresh its matrices before projecting
    camera.updateMatrixWorld();
    const inCareer = game.zone === "career";
    labelEls.forEach((el, key) => {
      const a = labelAnchor(key);
      if (!a) return;
      a.project(camera);
      const x = (a.x * 0.5 + 0.5) * size.width;
      const y = (-a.y * 0.5 + 0.5) * size.height;
      const onScreen = a.z < 1 && x > -60 && x < size.width + 60 && y > -90 && y < size.height + 60;
      // keep tags clear of the top bar and the screen edges
      const px = Math.min(Math.max(x, 72), size.width - 72);
      const py = Math.max(y, 118);
      // the desktop panel covers the right side; don't draw tags over it
      let show = onScreen && !(game.panel && px > size.width - game.panel - 60);
      if (key.startsWith("ms:")) show = show && inCareer;
      else if (key === `place:${game.zone}`) show = false;
      else if (key === "place:career" && inCareer) show = false;
      el.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0) translate(-50%, -100%)`;
      const o = show ? "1" : "0";
      if (el.style.opacity !== o) {
        el.style.opacity = o;
        el.style.visibility = show ? "visible" : "hidden";
      }
    });
  });
  return null;
}

/** where the guide arrow should point: the next autopilot waypoint, or the next place not seen yet */
function nextTarget(): { at: V2; color: string } | null {
  if (game.auto) {
    return { at: game.auto.path[0], color: placeById[game.auto.target].accent };
  }
  const id = TOUR.find((t) => !game.visited.has(t));
  if (!id) return null;
  return { at: placeById[id].pad, color: placeById[id].accent };
}

const chevron = (() => {
  const s = new THREE.Shape();
  s.moveTo(0, 0.55);
  s.lineTo(0.62, -0.15);
  s.lineTo(0.36, -0.15);
  s.lineTo(0, 0.25);
  s.lineTo(-0.36, -0.15);
  s.lineTo(-0.62, -0.15);
  s.closePath();
  // lie flat, tip pointing along +z
  return new THREE.ShapeGeometry(s).rotateX(-Math.PI / 2).rotateY(Math.PI);
})();

const guideMat = new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
const guideColor = new THREE.Color();

/** Chevrons on the ground in front of the robot, pointing the way to go next. */
function GuideArrow() {
  const group = useRef<THREE.Group>(null);
  const material = guideMat;
  const color = guideColor;
  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const dt = Math.min(delta, 1 / 20);
    const target = nextTarget();
    const c = game.car;
    const reading = game.zone !== null && game.zone !== "start";
    const d = target ? Math.hypot(target.at.x - c.x, target.at.z - c.z) : 0;
    const show = game.ready && !!target && !reading && d > 3.5;
    material.opacity = THREE.MathUtils.damp(material.opacity, show ? 0.85 : 0, 6, dt);
    g.visible = material.opacity > 0.01;
    if (!target || !g.visible) return;
    color.set(target.color);
    material.color.lerp(color, Math.min(1, dt * 6));
    const ang = Math.atan2(target.at.x - c.x, target.at.z - c.z);
    const pulse = game.reducedMotion ? 0 : ((state.clock.elapsedTime * 1.6) % 1) * 0.5;
    g.position.set(c.x + Math.sin(ang) * (2.3 + pulse), 0.2, c.z + Math.cos(ang) * (2.3 + pulse));
    g.rotation.y = ang;
  });
  return (
    <group ref={group} visible={false}>
      <mesh geometry={chevron} material={material} scale={1.2} />
      <mesh geometry={chevron} material={material} position={[0, 0, -0.75]} scale={0.95} />
    </group>
  );
}

const beamTex = (() => {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 4;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const g = ctx.createLinearGradient(0, 0, 0, 128);
    g.addColorStop(0, "rgba(255,255,255,0)");
    g.addColorStop(0.6, "rgba(255,255,255,0.35)");
    g.addColorStop(1, "rgba(255,255,255,0.9)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 4, 128);
  }
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
})();
const beamGeo = new THREE.CylinderGeometry(1, 1, 1, 20, 1, true).translate(0, 0.5, 0);

/** Soft columns of light over the places you have not visited yet. */
function Beacons() {
  const items = useMemo(
    () =>
      places
        .filter((p) => p.id !== "start")
        .map((p) => ({
          p,
          at: p.pad,
          m: new THREE.MeshBasicMaterial({
            color: p.accent,
            map: beamTex,
            transparent: true,
            opacity: 0,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            toneMapped: false,
          }),
        })),
    [],
  );
  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 20);
    const t = state.clock.elapsedTime;
    items.forEach((it, i) => {
      const want = game.ready && !game.visited.has(it.p.id) ? 0.22 + game.nightT * 0.3 + Math.sin(t * 2 + i) * 0.05 : 0;
      it.m.opacity = THREE.MathUtils.damp(it.m.opacity, want, 3, dt);
    });
  });
  return (
    <group>
      {items.map((it) => (
        <mesh key={it.p.id} geometry={beamGeo} material={it.m} position={[it.at.x, 0.1, it.at.z]} scale={[0.9, 14, 0.9]} />
      ))}
    </group>
  );
}

/** Fireflies over the grass at night. */
function Fireflies({ count }: { count: number }) {
  const data = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const seeds = Array.from({ length: count }, (_, i) => {
      const a = (i * 2.399) % (Math.PI * 2);
      const r = Math.sqrt((i + 0.5) / count) * (ISLAND_R - 3);
      return { x: Math.cos(a) * r, z: Math.sin(a) * r, p: i * 1.7, s: 0.4 + ((i * 37) % 10) / 20 };
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const m = new THREE.PointsMaterial({
      color: "#ffe9a0",
      map: radialTexture(),
      size: 0.45,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
    return { geo, m, seeds };
  }, [count]);
  const points = useRef<THREE.Points>(null);
  useFrame((state) => {
    const p = points.current;
    if (!p) return;
    (p.material as THREE.PointsMaterial).opacity = game.nightT;
    p.visible = game.nightT > 0.01;
    if (!p.visible) return;
    const t = state.clock.elapsedTime;
    const attr = p.geometry.getAttribute("position") as THREE.BufferAttribute;
    data.seeds.forEach((s, i) => {
      const w = t * s.s + s.p;
      attr.setXYZ(i, s.x + Math.sin(w) * 1.2, 0.6 + Math.sin(w * 1.7) * 0.4 + s.s, s.z + Math.cos(w * 0.8) * 1.2);
    });
    attr.needsUpdate = true;
  });
  return <points ref={points} geometry={data.geo} material={data.m} frustumCulled={false} visible={false} />;
}

/** Marks the world as ready once the first frame with everything in it has rendered. */
function Ready({ when }: { when: boolean }) {
  const frames = useRef(0);
  useFrame(() => {
    if (!when || game.ready) return;
    frames.current += 1;
    if (frames.current > 2) {
      game.ready = true;
      publish();
    }
  });
  return null;
}

function useKeyboard() {
  useEffect(() => {
    const map: Record<string, keyof typeof game.input> = {
      KeyW: "up",
      ArrowUp: "up",
      KeyS: "down",
      ArrowDown: "down",
      KeyA: "left",
      ArrowLeft: "left",
      KeyD: "right",
      ArrowRight: "right",
      ShiftLeft: "boost",
      ShiftRight: "boost",
      Space: "brake",
    };
    const typing = (t: EventTarget | null) =>
      t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
    const down = (e: KeyboardEvent) => {
      if (typing(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.code === "KeyR") {
        game.reset = true;
        return;
      }
      if (e.code === "KeyN" && !e.repeat) {
        setNight(!game.night);
        return;
      }
      const k = map[e.code];
      if (!k) return;
      // keep Space on a focused button working as a click
      if (e.code === "Space" && e.target instanceof HTMLButtonElement) return;
      e.preventDefault();
      (game.input as Record<string, unknown>)[k] = true;
    };
    const up = (e: KeyboardEvent) => {
      const k = map[e.code];
      if (k) (game.input as Record<string, unknown>)[k] = false;
    };
    const clear = () => {
      game.input.up = game.input.down = game.input.left = game.input.right = false;
      game.input.boost = game.input.brake = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
    };
  }, []);
}

// sharp enough on phones and retina screens; above this the GPU pays a lot for little
const DPR_CAP: Record<Quality, number> = { high: 1.5, mid: 1.5, low: 1 };

export default function World() {
  const [fonts, setFonts] = useState<Fonts | null>(null);
  // this component only renders in the browser (loaded with ssr: false)
  const [quality] = useState<Quality>(() => pickQuality());
  const [dpr, setDpr] = useState(() => Math.min(window.devicePixelRatio || 1, DPR_CAP[quality]));

  useKeyboard();

  useEffect(() => {
    game.quality = quality;
    loadNight();
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      game.reducedMotion = rm.matches;
    };
    sync();
    rm.addEventListener("change", sync);
    let alive = true;
    loadFonts().then((f) => alive && setFonts(f));
    if (new URLSearchParams(window.location.search).has("debug")) {
      (window as unknown as { __game: typeof game }).__game = game;
    }
    return () => {
      alive = false;
      rm.removeEventListener("change", sync);
      // this state outlives the page; clear it so coming back from Read mode starts fresh
      game.ready = false;
      game.auto = null;
      game.panel = 0;
      publish();
    };
  }, [quality]);

  return (
    <Canvas
      shadows={quality === "low" ? false : "percentage"}
      dpr={dpr}
      camera={{ fov: 38, near: 0.5, far: 260, position: [20, 25, 20] }}
      // on sharp screens the extra pixels already smooth the edges, so skip the costly antialiasing
      gl={{ antialias: quality !== "low" && window.devicePixelRatio < 1.5, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextrestored", () => {
          game.shadowDirty = true;
        });
        if (new URLSearchParams(window.location.search).has("debug")) {
          (window as unknown as { __gl: THREE.WebGLRenderer }).__gl = gl;
        }
        gl.toneMappingExposure = 1.05;
      }}
    >
      <Atmosphere quality={quality} />
      <Simulation />
      <CameraRig />
      <LabelProjector />
      <PerfWatch dpr={dpr} onDpr={setDpr} />
      <ShadowBake />
      <Ground />
      <Roads />
      <Pads />
      <Nature quality={quality} />
      <Beacons />
      <GuideArrow />
      <Fireflies count={quality === "low" ? 30 : 70} />
      <Robot />
      {fonts && (
        <>
          <NameBlocks fonts={fonts} />
          <CareerRoad fonts={fonts} />
          <Places fonts={fonts} />
        </>
      )}
      <Ready when={!!fonts} />
    </Canvas>
  );
}
