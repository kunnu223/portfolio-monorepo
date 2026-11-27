"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Car } from "lucide-react";
import { getServerSwitch, getSwitch, setNavigator, subscribeSwitch } from "./mode";

const COPY = {
  drive: {
    title: "Drive mode",
    body: "Drive a little robot around my island. Every place on it is a part of my work.",
  },
  read: {
    title: "Read mode",
    body: "All my work on one simple page. Quick to scan, easy to read.",
  },
};

/** The curtain shown while switching between Drive mode and Read mode. Lives in the root layout. */
export default function ModeOverlay() {
  const router = useRouter();
  useEffect(() => {
    setNavigator((href) => router.push(href));
    return () => setNavigator(null);
  }, [router]);

  const s = useSyncExternalStore(subscribeSwitch, getSwitch, getServerSwitch);
  if (!s.phase || !s.to) return null;

  const drive = s.to === "drive";
  const copy = COPY[s.to];
  const bg = s.night ? "#0f1a2e" : drive ? "#9fd3db" : "#f5f1e8";
  const fg = s.night ? "#eef2f8" : "#1b1c24";
  const Icon = drive ? Car : BookOpen;

  return (
    <div className={`mode-curtain ${s.phase}`} style={{ background: bg, color: fg }} role="status" aria-live="polite">
      <div className="mode-card">
        <span
          aria-hidden
          className="mx-auto grid size-14 place-items-center rounded-2xl"
          style={{ background: s.night ? "rgba(255,255,255,0.1)" : "rgba(27,28,36,0.08)" }}
        >
          <Icon className="size-7" strokeWidth={1.8} />
        </span>
        <div className="mt-5 text-[13px] font-semibold uppercase tracking-[0.12em] opacity-65">Switching to</div>
        <div className="mt-1 font-display text-[clamp(2.4rem,7vw,3.6rem)] font-bold leading-none tracking-[-0.03em]">
          {copy.title}
        </div>
        <p className="mx-auto mt-4 max-w-[34ch] text-[16px] leading-relaxed opacity-80">{copy.body}</p>
        {drive && (
          <div className="mx-auto mt-6 h-1 w-36 overflow-hidden rounded-full" style={{ background: s.night ? "rgba(255,255,255,0.15)" : "rgba(27,28,36,0.14)" }}>
            <div className="h-full w-1/3 animate-[loader_1.1s_ease-in-out_infinite] rounded-full bg-[#ff6a3d]" />
          </div>
        )}
      </div>
    </div>
  );
}
