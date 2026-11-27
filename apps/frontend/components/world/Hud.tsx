"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type PointerEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { signalReady } from "@/components/mode/mode";
import { ModeLink, ModeToggle } from "@/components/mode/ModeToggle";
import { about, experience, hero, site, stack, work } from "@/lib/content";
import { LABEL_SUB, TOUR, milestones, placeById, places, type V2, type ZoneId } from "./layout";
import { driveTo, jumpTo, stopAuto } from "./physics";
import { game, getServerSnapshot, getSnapshot, labelEls, setNight, subscribe } from "./state";

const ease = [0.22, 1, 0.36, 1] as const;
const WORK_BY_ZONE: Partial<Record<ZoneId, number>> = { agents: 0, billing: 1, integrations: 2, admin: 3 };
const WELCOME_KEY = "island-welcome";
const noop = () => () => {};

function useGame() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

const touchQuery = "(pointer: coarse)";
function subscribeTouch(l: () => void) {
  const mq = window.matchMedia(touchQuery);
  mq.addEventListener("change", l);
  return () => mq.removeEventListener("change", l);
}
function useIsTouch() {
  return useSyncExternalStore(
    subscribeTouch,
    () => window.matchMedia(touchQuery).matches,
    () => false,
  );
}

function seenWelcome() {
  try {
    return sessionStorage.getItem(WELCOME_KEY) === "1";
  } catch {
    return false;
  }
}

/** the stop after this one on the tour; null at the end */
function nextAfter(zone: ZoneId | null, visited: ZoneId[]): ZoneId | null {
  if (!zone || zone === "start") return TOUR.find((t) => !visited.includes(t)) ?? TOUR[0];
  const i = TOUR.indexOf(zone);
  return i >= 0 && i < TOUR.length - 1 ? TOUR[i + 1] : null;
}

const displayName = (id: ZoneId) => (id === "start" ? "About me" : placeById[id].name);

// ---------------------------------------------------------------- panel content

function Kicker({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <div className="flex items-center gap-2.5 text-[12.5px] font-semibold uppercase tracking-[0.08em] text-ink/70">
      <span className="h-0.5 w-6 rounded-full" style={{ background: color ?? "#ff6a3d" }} />
      {children}
    </div>
  );
}

function Chips({ items }: { items: string[] }) {
  return (
    <div className="mt-4 flex flex-wrap gap-1.5">
      {items.map((s) => (
        <span key={s} className="rounded-full border border-white/15 bg-white/[0.05] px-2.5 py-1 text-[12.5px] text-ink/80">
          {s}
        </span>
      ))}
    </div>
  );
}

function StartPanel() {
  return (
    <>
      <Kicker>{hero.kicker}</Kicker>
      <h2 className="mt-4 font-display text-[2.15rem] font-bold leading-[1.04] tracking-[-0.03em]">
        I build <span className="text-[#ff8a5c]">AI agents</span> that ship to production.
      </h2>
      <p className="mt-4 text-[15.5px] leading-relaxed text-ink/85">{hero.intro}</p>
      <div className="mt-5 grid grid-cols-3 gap-2">
        {about.facts.map((f) => (
          <div key={f.label} className="rounded-xl border border-white/12 bg-white/[0.05] p-3">
            <div className="font-display text-3xl font-bold leading-none">{f.value}</div>
            <div className="mt-1.5 text-[12.5px] leading-snug text-ink/70">{f.label}</div>
          </div>
        ))}
      </div>
    </>
  );
}

function WorkPanel({ i, accent }: { i: number; accent: string }) {
  const w = work[i];
  return (
    <>
      <Kicker color={accent}>
        {w.index} · {w.kind} · {w.year}
      </Kicker>
      <h2 className="mt-4 font-display text-[1.85rem] font-bold leading-[1.08] tracking-[-0.025em]">{w.title}</h2>
      <p className="mt-4 text-[15.5px] leading-relaxed text-ink/85">{w.problem}</p>
      <ul className="mt-5 space-y-3">
        {w.built.map((b) => (
          <li key={b} className="flex gap-3 text-[15px] leading-snug text-ink/90">
            <span className="mt-[0.45em] size-1.5 shrink-0 rounded-full" style={{ background: accent }} />
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <Chips items={w.stack} />
    </>
  );
}

/** Experience as a timeline; the job next to the robot on Career Road is open. */
function CareerPanel({ step }: { step: number }) {
  const active = milestones[step]?.role ?? 0;
  const [open, setOpen] = useState(active);
  const [lastActive, setLastActive] = useState(active);
  if (active !== lastActive) {
    setLastActive(active);
    setOpen(active);
  }
  return (
    <>
      <Kicker color="#ffb347">Experience</Kicker>
      <h2 className="mt-4 font-display text-[1.85rem] font-bold leading-[1.08] tracking-[-0.025em]">Where I&apos;ve worked</h2>
      <p className="mt-2 text-[14px] text-ink/70">Drive along the road to walk through the years.</p>
      <ol className="relative mt-6">
        <span aria-hidden className="absolute bottom-3 left-[7px] top-3 w-px bg-white/15" />
        {experience.map((r, i) => {
          const isOpen = open === i;
          const color = milestones.find((m) => m.role === i)?.color ?? "#ffb347";
          return (
            <li key={r.company} className="relative pb-5 pl-8 last:pb-0">
              <span
                aria-hidden
                className={`absolute left-0 top-1.5 size-[15px] rounded-full border-2 transition-shadow ${
                  i === active ? "shadow-[0_0_0_5px_rgba(255,255,255,0.08)]" : ""
                }`}
                style={{ borderColor: color, background: isOpen ? color : "#0d0d12" }}
              />
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="w-full text-left"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white/[0.08] px-2.5 py-0.5 text-[12.5px] font-medium text-ink/90">
                    {r.period}
                  </span>
                  {i === 0 && (
                    <span className="rounded-full bg-ok/15 px-2.5 py-0.5 text-[11.5px] font-medium text-ok">Current</span>
                  )}
                </div>
                <div className="mt-2 text-[16.5px] font-semibold leading-snug">{r.title}</div>
                <div className="text-[14.5px] text-ink/75">
                  {r.company} · {r.where}
                </div>
              </button>
              {isOpen && (
                <div className="mt-2.5">
                  <p className="text-[15px] leading-relaxed text-ink/85">{r.summary}</p>
                  {r.points.length > 0 && (
                    <ul className="mt-3 space-y-2">
                      {r.points.map((pt) => (
                        <li key={pt} className="flex gap-3 text-[14.5px] leading-snug text-ink/85">
                          <span className="mt-[0.5em] size-1.5 shrink-0 rounded-full" style={{ background: color }} />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <Chips items={r.stack} />
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <div className="mt-6 rounded-xl border border-white/12 bg-white/[0.04] p-3.5">
        <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ink/65">Education</div>
        <div className="mt-1 text-[14px] leading-snug text-ink/85">{about.education}</div>
      </div>
    </>
  );
}

function StackPanel() {
  return (
    <>
      <Kicker>Stack</Kicker>
      <h2 className="mt-4 font-display text-[1.85rem] font-bold leading-[1.08] tracking-[-0.025em]">Tools I use every day</h2>
      <p className="mt-2 flex items-center text-[14px] text-ink/75">
        <span className="mr-1.5 inline-block size-2 rounded-full bg-ember" /> daily
        <span className="ml-4 mr-1.5 inline-block size-2 rounded-full border border-ink/60" /> working knowledge
      </p>
      <div className="mt-5 space-y-5">
        {stack.map((g) => (
          <div key={g.name}>
            <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ink/65">{g.name}</div>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {g.items.map((it) => (
                <li
                  key={it.label}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[13.5px] ${
                    it.level === "daily" ? "border-ember/50 text-ink" : "border-white/15 text-ink/75"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`size-1.5 rounded-full ${it.level === "daily" ? "bg-ember" : "border border-ink/60"}`}
                  />
                  {it.label}
                  <span className="sr-only">{it.level === "daily" ? " (daily)" : " (working knowledge)"}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-5 text-[13.5px] text-ink/65">Tip: the crates outside are real. Push them around.</p>
    </>
  );
}

function ContactPanel() {
  const [copied, setCopied] = useState(false);
  return (
    <>
      <Kicker color="#fa5785">Contact</Kicker>
      <h2 className="mt-4 font-display text-[2.15rem] font-bold leading-[1.04] tracking-[-0.03em]">
        Let&apos;s build something <span className="text-ink/70">that ships.</span>
      </h2>
      <p className="mt-3 text-[15px] text-ink/80">
        {site.available}. Based in {site.location}, {site.relocate}.
      </p>
      <a
        href={`mailto:${site.email}`}
        className="mt-5 block break-all rounded-xl border border-white/15 bg-white/[0.05] px-4 py-3 font-display text-[1.2rem] font-semibold transition-colors hover:border-ink/40"
      >
        {site.email}
      </a>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(site.email).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1800);
            });
          }}
          className="rounded-full bg-ink px-4 py-2 text-[14px] font-medium text-bg"
        >
          {copied ? "Copied" : "Copy email"}
        </button>
        <a href={site.linkedin} target="_blank" rel="noreferrer" className="rounded-full border border-white/20 px-4 py-2 text-[14px]">
          LinkedIn ↗
        </a>
        <a href={site.github} target="_blank" rel="noreferrer" className="rounded-full border border-white/20 px-4 py-2 text-[14px]">
          GitHub ↗
        </a>
        {site.resumeUrl && (
          <a href={site.resumeUrl} target="_blank" rel="noreferrer" className="rounded-full border border-white/20 px-4 py-2 text-[14px]">
            Resume ↗
          </a>
        )}
      </div>
    </>
  );
}

function PanelBody({ zone, step }: { zone: ZoneId; step: number }) {
  const accent = placeById[zone]?.accent ?? "#ff6a3d";
  if (zone === "start") return <StartPanel />;
  if (zone === "career") return <CareerPanel step={step} />;
  if (zone === "stack") return <StackPanel />;
  if (zone === "contact") return <ContactPanel />;
  const i = WORK_BY_ZONE[zone];
  return i === undefined ? null : <WorkPanel i={i} accent={accent} />;
}

/** progress dots + the button to the next stop */
function TourFooter({ zone, visited, compact }: { zone: ZoneId; visited: ZoneId[]; compact?: boolean }) {
  const next = nextAfter(zone, visited);
  const idx = TOUR.indexOf(zone);
  const started = TOUR.some((t) => visited.includes(t));
  return (
    <div className={`flex items-center gap-3 border-t border-white/10 ${compact ? "px-5 py-3" : "px-7 py-4"}`}>
      <div className="min-w-0 flex-1">
        <div className="flex gap-1.5" aria-hidden>
          {TOUR.map((id) => (
            <span
              key={id}
              className={`h-1.5 rounded-full transition-all ${id === zone ? "w-5" : "w-1.5"}`}
              style={{ background: visited.includes(id) || id === zone ? placeById[id].accent : "rgba(255,255,255,0.18)" }}
            />
          ))}
        </div>
        <div className="mt-1.5 text-[12.5px] text-ink/65">
          {idx >= 0 ? `Stop ${idx + 1} of ${TOUR.length}` : `${TOUR.length} stops on the tour`}
        </div>
      </div>
      {next ? (
        <button
          type="button"
          onClick={() => driveTo(next)}
          className="shrink-0 rounded-full bg-ink px-4 py-2.5 text-[14px] font-medium text-bg transition-transform active:scale-95"
        >
          {zone === "start" ? (started ? `Next: ${placeById[next].name}` : "Start the tour") : `Next: ${placeById[next].name}`} →
        </button>
      ) : (
        <button
          type="button"
          onClick={() => driveTo("start")}
          className="shrink-0 rounded-full border border-white/20 px-4 py-2.5 text-[14px] font-medium"
        >
          Back to start ↺
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- floating labels

type LabelDef = { key: string; id: ZoneId; name: string; sub: string; accent: string; point?: V2 };

const LABELS: LabelDef[] = [
  ...places.map((p) => ({
    key: `place:${p.id}`,
    id: p.id,
    name: p.id === "start" ? "About me" : p.name,
    sub: p.id === "start" ? "Start here" : LABEL_SUB[p.id],
    accent: p.accent,
  })),
  ...milestones.map((m, i) => ({
    key: `ms:${i}`,
    id: "career" as ZoneId,
    name: `${m.year} · ${m.label}`,
    sub: m.sub,
    accent: m.color,
    point: m.at,
  })),
];

/** Name tags over each place. The 3D scene moves them every frame; a click drives there. */
function Labels({ visited, driving }: { visited: ZoneId[]; driving: ZoneId | null }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden">
      {LABELS.map((l) => {
        const seen = !l.point && visited.includes(l.id);
        const going = !l.point && driving === l.id;
        return (
          <button
            key={l.key}
            type="button"
            ref={(el) => {
              if (!el) return;
              labelEls.set(l.key, el);
              return () => {
                labelEls.delete(l.key);
              };
            }}
            onClick={() => driveTo(l.id, l.point)}
            aria-label={`Drive to ${l.name}, ${l.sub}`}
            className="pointer-events-auto invisible absolute left-0 top-0 touch-manipulation opacity-0 transition-[opacity,visibility] duration-200 will-change-transform"
          >
            <span
              className={`flex items-center gap-2 rounded-full bg-white/95 py-1.5 pl-2.5 pr-3.5 text-left shadow-[0_6px_18px_rgba(10,20,30,0.22)] ring-1 transition-transform hover:scale-105 ${
                going ? "ring-2" : "ring-black/5"
              }`}
              style={going ? { boxShadow: `0 0 0 3px ${l.accent}` } : undefined}
            >
              <span className="size-2.5 shrink-0 rounded-full" style={{ background: l.accent }} />
              <span className="leading-tight">
                <span className="block whitespace-nowrap text-[14px] font-semibold text-[#1b1b22]">{l.name}</span>
                <span className="block whitespace-nowrap text-[11.5px] text-[#4d4c56]">{going ? "Driving there…" : l.sub}</span>
              </span>
              {seen && (
                <span aria-label="visited" className="text-[13px] font-bold text-[#15803d]">
                  ✓
                </span>
              )}
            </span>
            <span aria-hidden className="mx-auto block size-0 border-x-[6px] border-t-[7px] border-x-transparent border-t-white/95" />
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------- controls

function Joystick({ raised }: { raised: boolean }) {
  const base = useRef<HTMLDivElement>(null);
  const knob = useRef<HTMLDivElement>(null);
  const id = useRef<number | null>(null);

  const move = (e: PointerEvent<HTMLDivElement>) => {
    const b = base.current;
    const k = knob.current;
    if (!b || !k || id.current !== e.pointerId) return;
    const r = b.getBoundingClientRect();
    const R = r.width / 2;
    let dx = e.clientX - (r.left + R);
    let dy = e.clientY - (r.top + R);
    const d = Math.hypot(dx, dy);
    if (d > R) {
      dx = (dx / d) * R;
      dy = (dy / d) * R;
    }
    k.style.transform = `translate(${dx}px, ${dy}px)`;
    game.input.joy = true;
    game.input.joyX = dx / R;
    game.input.joyY = -dy / R;
  };
  const end = () => {
    id.current = null;
    game.input.joy = false;
    game.input.joyX = game.input.joyY = 0;
    if (knob.current) knob.current.style.transform = "translate(0px, 0px)";
  };

  return (
    <div
      ref={base}
      aria-label="Drive stick"
      role="application"
      onPointerDown={(e) => {
        id.current = e.pointerId;
        e.currentTarget.setPointerCapture(e.pointerId);
        move(e);
      }}
      onPointerMove={move}
      onPointerUp={end}
      onPointerCancel={end}
      style={{ bottom: `calc(${raised ? 92 : 20}px + env(safe-area-inset-bottom))` }}
      className="pointer-events-auto fixed left-4 z-30 grid size-28 touch-none select-none place-items-center rounded-full border-2 border-white/60 bg-black/25 transition-[bottom] duration-300"
    >
      <div ref={knob} className="size-12 rounded-full bg-white shadow-lg transition-transform duration-75" />
    </div>
  );
}

function Key({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-grid min-w-6 place-items-center rounded-md border border-black/15 bg-white px-1.5 py-0.5 font-mono text-[11.5px] text-[#23232b] shadow-[0_2px_0_rgba(0,0,0,0.15)]">
      {children}
    </kbd>
  );
}

function IconButton({ label, onClick, pressed, children }: { label: string; onClick: () => void; pressed?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      onClick={onClick}
      className="grid size-10 shrink-0 place-items-center rounded-full bg-[#0d0d12]/90 text-ink shadow-lg transition-colors hover:bg-[#0d0d12]"
    >
      {children}
    </button>
  );
}

const SunIcon = () => (
  <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);
const MoonIcon = () => (
  <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
  </svg>
);

// ---------------------------------------------------------------- welcome

function Welcome({ touch, onClose }: { touch: boolean; onClose: (tour: boolean) => void }) {
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    // keyboard users land on the main button; on phones a focus ring would just look odd
    if (!window.matchMedia(touchQuery).matches) close.current?.focus();
  }, []);
  useEffect(() => {
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose(false);
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [onClose]);

  const steps: { n: string; color: string; body: ReactNode }[] = [
    {
      n: "1",
      color: "#ff6a3d",
      body: touch ? (
        <>
          <b className="font-semibold">Drive</b> with the stick at the bottom left.
        </>
      ) : (
        <>
          <b className="font-semibold">Drive</b> with <Key>W</Key> <Key>A</Key> <Key>S</Key> <Key>D</Key> or the arrow keys.
        </>
      ),
    },
    {
      n: "2",
      color: "#8a7cff",
      body: (
        <>
          <b className="font-semibold">{touch ? "Tap" : "Click"} a name tag</b> over a place, and the robot drives there by itself.
        </>
      ),
    },
    {
      n: "3",
      color: "#38c9b4",
      body: (
        <>
          <b className="font-semibold">Stop on a glowing ring</b> to read about that place.
        </>
      ),
    },
  ];

  return (
    <motion.div
      key="welcome"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
      className="fixed inset-0 z-40 grid place-items-center bg-[#0b1420]/50 p-3"
      onClick={(e) => e.target === e.currentTarget && onClose(false)}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease } }}
        exit={{ opacity: 0, y: 12 }}
        className="w-full max-w-[440px] rounded-3xl bg-[#fbf8f2] p-6 text-[#1b1b22] shadow-2xl sm:p-8"
      >
        <div className="text-[12.5px] font-semibold uppercase tracking-[0.08em] text-[#62606b]">
          Hi, I&apos;m {site.name.split(" ")[0]} · full-stack engineer
        </div>
        <h2 id="welcome-title" className="mt-3 font-display text-[2.2rem] font-bold leading-[1.04] tracking-[-0.03em]">
          Welcome to my <span className="text-[#e0532a]">island</span>
        </h2>
        <p className="mt-3 text-[15.5px] leading-relaxed text-[#3d3c45]">
          This is my portfolio as a tiny world. Each place on it is one part of my work.
        </p>
        <ol className="mt-5 space-y-3">
          {steps.map((s) => (
            <li key={s.n} className="flex items-start gap-3 text-[15px] leading-snug text-[#2a2a31]">
              <span
                className="grid size-7 shrink-0 place-items-center rounded-full text-[13px] font-bold text-white"
                style={{ background: s.color }}
              >
                {s.n}
              </span>
              <span className="pt-0.5">{s.body}</span>
            </li>
          ))}
        </ol>
        <div className="mt-7 flex flex-col gap-2 sm:flex-row">
          <button
            ref={close}
            type="button"
            onClick={() => onClose(true)}
            className="flex-1 rounded-full bg-[#1b1b22] px-5 py-3.5 text-[15px] font-semibold text-white transition-transform active:scale-[0.98]"
          >
            Start the tour →
          </button>
          <button
            type="button"
            onClick={() => onClose(false)}
            className="flex-1 rounded-full border border-[#1b1b22]/20 px-5 py-3.5 text-[15px] font-medium transition-colors hover:bg-black/5"
          >
            Explore on my own
          </button>
        </div>
        <p className="mt-5 text-center text-[13.5px] text-[#5d5c66]">
          Prefer a normal page?{" "}
          <ModeLink to="read" className="font-medium text-[#1b1b22] underline underline-offset-4">
            Read mode
          </ModeLink>
          {!touch && (
            <>
              {" "}
              · <Key>N</Key> night mode
            </>
          )}
        </p>
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------- HUD

export default function Hud() {
  const snap = useGame();
  const touch = useIsTouch();
  const [menu, setMenu] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [fade, setFade] = useState(false);
  const seenBefore = useSyncExternalStore(noop, seenWelcome, () => true);
  const [welcome, setWelcome] = useState<boolean | null>(null);
  const showWelcome = snap.ready && (welcome ?? !seenBefore);

  // while the robot drives itself, panels stay shut until it arrives
  const zone = snap.auto ? null : snap.zone;
  const place = zone ? placeById[zone] : null;
  const tourDone = TOUR.filter((t) => snap.visited.includes(t)).length;
  const nextStop = TOUR.find((t) => !snap.visited.includes(t)) ?? null;

  // close the places menu on an outside click or Escape
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!menu) return;
    const click = (e: globalThis.PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenu(false);
    };
    const key = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    window.addEventListener("pointerdown", click);
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("pointerdown", click);
      window.removeEventListener("keydown", key);
    };
  }, [menu]);

  // tell the camera how much of the screen the desktop panel covers
  const panelOpen = !touch && !!place && !showWelcome;
  useEffect(() => {
    const sync = () => {
      game.panel = panelOpen && window.innerWidth >= 900 ? 450 : 0;
    };
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, [panelOpen]);

  // collapse the phone sheet whenever you reach a new place
  const [lastZone, setLastZone] = useState(zone);
  if (zone !== lastZone) {
    setLastZone(zone);
    setSheetOpen(false);
  }

  const closeWelcome = (tour: boolean) => {
    setWelcome(false);
    try {
      sessionStorage.setItem(WELCOME_KEY, "1");
    } catch {
      // storage blocked: the card shows again next visit, that's fine
    }
    if (tour) driveTo(TOUR.find((t) => !game.visited.has(t)) ?? TOUR[0]);
  };

  const jump = (id: ZoneId) => {
    setMenu(false);
    setFade(true);
    setTimeout(() => {
      jumpTo(id);
      setTimeout(() => setFade(false), 120);
    }, 260);
  };

  // the switch curtain (from Read mode) waits for this before it lifts
  useEffect(() => {
    if (snap.ready) signalReady("drive");
  }, [snap.ready]);

  // solid colours, no backdrop blur: blurring the moving 3D scene every frame is slow on weak GPUs
  const bar = "rounded-full bg-[#0d0d12]/90 text-ink shadow-lg";

  return (
    <div className="touch-manipulation">
      {/* loading cover */}
      <AnimatePresence>
        {!snap.ready && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8, ease } }}
            className="fixed inset-0 z-50 grid place-items-center bg-[#9fd3db] text-[#23232b]"
          >
            <div className="text-center">
              <div className="font-display text-5xl font-bold tracking-[-0.03em]">{site.name}</div>
              <div className="mt-3 text-[13px] font-semibold uppercase tracking-[0.1em] text-[#23232b]/75">
                Building the island…
              </div>
              <div className="mx-auto mt-5 h-1 w-40 overflow-hidden rounded-full bg-[#23232b]/15">
                <div className="h-full w-1/3 animate-[loader_1.1s_ease-in-out_infinite] rounded-full bg-[#ff6a3d]" />
              </div>
              <ModeLink to="read" className="mt-8 inline-block text-[14px] underline underline-offset-4">
                Or skip to Read mode
              </ModeLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Labels visited={snap.visited} driving={snap.auto} />

      {/* fade for jumps from the Places menu */}
      <div
        aria-hidden
        className={`pointer-events-none fixed inset-0 z-40 transition-opacity duration-300 ${fade ? "opacity-100" : "opacity-0"}`}
        style={{ background: snap.night ? "#0f1a2e" : "#9fd3db" }}
      />

      {/* top bar */}
      <header
        className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-start justify-between gap-2 px-3 pb-3 sm:px-5 sm:pb-5"
        style={{ paddingTop: "calc(12px + env(safe-area-inset-top))" }}
      >
        <div className="pointer-events-auto flex min-w-0 items-center">
          <div className={`hidden min-w-0 items-center gap-2.5 py-1.5 pl-1.5 pr-4 md:flex ${bar}`}>
            <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-full bg-ink pb-0.5 font-display text-[17px] font-bold leading-none text-bg">
              k
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-[14px] font-medium">{site.name}</span>
              <span className="block text-[12px] text-ink/65">Full-stack engineer · AI agents</span>
            </span>
          </div>
          {/* phones: the Drive | Read switch takes the name's spot */}
          <div className="md:hidden">
            <ModeToggle current="drive" variant="island" />
          </div>
        </div>

        <nav aria-label="Island" className="pointer-events-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          <IconButton label={snap.night ? "Switch to day" : "Switch to night"} pressed={snap.night} onClick={() => setNight(!snap.night)}>
            {snap.night ? <SunIcon /> : <MoonIcon />}
          </IconButton>
          <IconButton label="How to explore" onClick={() => setWelcome(true)}>
            <span className="text-[16px] font-semibold">?</span>
          </IconButton>
          <div ref={menuRef} className="relative">
            <button
              type="button"
              aria-expanded={menu}
              onClick={() => setMenu((m) => !m)}
              className={`flex h-10 items-center gap-1.5 px-3 text-[14px] sm:gap-2 sm:px-4 ${bar}`}
            >
              Places
              <span className="font-mono text-[12px] text-ink/65">
                {tourDone}/{TOUR.length}
              </span>
            </button>
            <AnimatePresence>
              {menu && (
                <motion.ul
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 max-h-[calc(100dvh-80px)] w-[min(18rem,calc(100vw-24px))] overflow-y-auto rounded-2xl border border-white/12 bg-[#0d0d12]/[0.97] p-1.5 text-ink shadow-2xl"
                >
                  <li className="px-3 pb-1 pt-2 text-[12px] text-ink/60">Jump straight to a place</li>
                  {places.map((p) => {
                    const seen = snap.visited.includes(p.id);
                    return (
                      <li key={p.id}>
                        <button
                          type="button"
                          onClick={() => jump(p.id)}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/[0.07]"
                        >
                          <span className="size-2.5 shrink-0 rounded-full" style={{ background: p.accent }} />
                          <span className="flex-1">
                            <span className="block text-[14.5px]">{displayName(p.id)}</span>
                            <span className="block text-[12px] text-ink/60">{LABEL_SUB[p.id]}</span>
                          </span>
                          <span className={`text-[13px] ${seen ? "text-ok" : "text-ink/30"}`}>{seen ? "✓" : "·"}</span>
                        </button>
                      </li>
                    );
                  })}
                  <li className="mt-1 border-t border-white/10 pt-1">
                    <ModeLink
                      to="read"
                      onSwitch={() => setMenu(false)}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-[14px] hover:bg-white/[0.07]"
                    >
                      Switch to Read mode <span className="text-ink/60">→</span>
                    </ModeLink>
                    <a href={`mailto:${site.email}`} className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-[14px] hover:bg-white/[0.07]">
                      Email me <span className="text-ink/60">✉</span>
                    </a>
                  </li>
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
          <div className="hidden md:block">
            <ModeToggle current="drive" variant="island" />
          </div>
          <a
            href={`mailto:${site.email}`}
            className="hidden h-10 items-center gap-2 rounded-full bg-ink px-4 text-[14px] font-medium text-bg shadow-lg lg:flex"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-ok opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-ok" />
            </span>
            Let&apos;s talk
          </a>
        </nav>
      </header>

      {/* info panel: side card on desktop, bottom sheet on phones */}
      <AnimatePresence mode="wait">
        {zone && place && !showWelcome && (
          <motion.aside
            key={zone}
            aria-live="polite"
            aria-label={displayName(zone)}
            initial={{ opacity: 0, x: touch ? 0 : 30, y: touch ? 30 : 0 }}
            animate={{ opacity: 1, x: 0, y: 0, transition: { duration: 0.45, ease } }}
            exit={{ opacity: 0, x: touch ? 0 : 20, y: touch ? 20 : 0, transition: { duration: 0.2 } }}
            style={touch ? { bottom: "calc(8px + env(safe-area-inset-bottom))" } : undefined}
            className={
              touch
                ? "pointer-events-auto fixed inset-x-2 z-30 flex max-h-[calc(100dvh-84px)] flex-col overflow-hidden rounded-3xl border border-white/12 bg-[#0d0d12]/[0.97] text-ink shadow-2xl"
                : "pointer-events-auto fixed bottom-5 right-5 top-[84px] z-30 flex w-[420px] max-w-[calc(100vw-40px)] flex-col"
            }
          >
            {touch ? (
              <div className="flex min-h-0 flex-1 flex-col">
                <div className="flex items-center gap-3 py-3 pl-4 pr-3">
                  <span className="size-3 shrink-0 rounded-full" style={{ background: place.accent }} />
                  <button type="button" onClick={() => setSheetOpen((o) => !o)} className="min-w-0 flex-1 text-left">
                    <span className="block truncate font-display text-[19px] font-semibold leading-tight tracking-[-0.01em]">{displayName(zone)}</span>
                    <span className="block truncate text-[12.5px] text-ink/65">{LABEL_SUB[zone]}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSheetOpen((o) => !o)}
                    className="shrink-0 rounded-full bg-ink px-4 py-2 text-[14px] font-semibold text-bg"
                  >
                    {sheetOpen ? "Close" : "Read"}
                  </button>
                  {!sheetOpen && nextAfter(zone, snap.visited) && (
                    <button
                      type="button"
                      aria-label={`Next: ${displayName(nextAfter(zone, snap.visited) as ZoneId)}`}
                      onClick={() => driveTo(nextAfter(zone, snap.visited) as ZoneId)}
                      className="shrink-0 rounded-full border border-white/25 px-3.5 py-2 text-[14px] font-medium"
                    >
                      Next →
                    </button>
                  )}
                </div>
                {sheetOpen && (
                  <>
                    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6">
                      <PanelBody zone={zone} step={snap.careerStep} />
                    </div>
                    <TourFooter zone={zone} visited={snap.visited} compact />
                  </>
                )}
              </div>
            ) : (
              <div className="flex max-h-full flex-col overflow-hidden rounded-3xl border border-white/12 bg-[#0d0d12]/[0.97] text-ink shadow-2xl">
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-7">
                  <PanelBody zone={zone} step={snap.careerStep} />
                </div>
                <TourFooter zone={zone} visited={snap.visited} />
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* what to do next, when you're between places */}
      {snap.ready && !showWelcome && !zone && (
        <div
          className="pointer-events-none fixed inset-x-0 z-20 flex justify-center px-3"
          style={touch ? { top: "calc(64px + env(safe-area-inset-top))" } : { bottom: 24 }}
        >
          <div className="pointer-events-auto flex max-w-full items-center gap-3 rounded-full bg-[#0d0d12]/92 py-1.5 pl-4 pr-1.5 text-[14px] text-ink shadow-xl">
            {snap.auto ? (
              <>
                <span className="relative flex size-2.5 shrink-0">
                  <span className="absolute inline-flex size-full animate-ping rounded-full opacity-70" style={{ background: placeById[snap.auto].accent }} />
                  <span className="relative inline-flex size-2.5 rounded-full" style={{ background: placeById[snap.auto].accent }} />
                </span>
                <span className="truncate">
                  Driving to <b className="font-semibold">{displayName(snap.auto)}</b>…
                </span>
                <button type="button" onClick={stopAuto} className="shrink-0 rounded-full border border-white/25 px-3.5 py-1.5 text-[13.5px]">
                  Stop
                </button>
              </>
            ) : nextStop ? (
              <>
                <span className="truncate">
                  Next stop: <b className="font-semibold">{displayName(nextStop)}</b>
                </span>
                <button
                  type="button"
                  onClick={() => driveTo(nextStop)}
                  className="shrink-0 rounded-full bg-ink px-4 py-1.5 text-[13.5px] font-semibold text-bg"
                >
                  Go →
                </button>
              </>
            ) : (
              <>
                <span className="truncate">You&apos;ve seen it all. Thanks for driving by!</span>
                <a href={`mailto:${site.email}`} className="shrink-0 rounded-full bg-ink px-4 py-1.5 text-[13.5px] font-semibold text-bg">
                  Email me
                </a>
              </>
            )}
          </div>
        </div>
      )}

      {/* keyboard hints (desktop) */}
      {!touch && snap.ready && !showWelcome && (
        <div
          className={`pointer-events-none fixed bottom-5 left-5 z-20 hidden flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl bg-white/92 px-4 py-3 text-[12.5px] text-[#23232b] shadow-lg transition-opacity duration-700 xl:flex ${
            snap.moved ? "opacity-80" : "opacity-100"
          }`}
        >
          <span className="flex items-center gap-1">
            <Key>W</Key>
            <Key>A</Key>
            <Key>S</Key>
            <Key>D</Key>
            <span className="ml-1">drive</span>
          </span>
          <span className="flex items-center gap-1">
            <Key>Shift</Key> boost
          </span>
          <span className="flex items-center gap-1">
            <Key>N</Key> night
          </span>
          <span className="flex items-center gap-1">
            <Key>R</Key> reset
          </span>
        </div>
      )}

      {touch && snap.ready && !showWelcome && !menu && !(zone && sheetOpen) && <Joystick raised={!!place} />}

      <AnimatePresence>{showWelcome && <Welcome touch={touch} onClose={closeWelcome} />}</AnimatePresence>
    </div>
  );
}
