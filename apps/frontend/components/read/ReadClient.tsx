"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Check, Copy, Moon, Sun } from "lucide-react";
import { signalReady } from "@/components/mode/mode";
import { applyNight, isNight, readNight, subscribeNight, writeNight } from "@/components/mode/night";

/** Sets the saved day/night look and tells the switch curtain this page is ready. */
export function ReadReady() {
  useEffect(() => {
    applyNight(readNight());
    let raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => signalReady("read"));
    });
    return () => cancelAnimationFrame(raf);
  }, []);
  return null;
}

export function ThemeToggle() {
  const night = useSyncExternalStore(subscribeNight, isNight, () => false);
  return (
    <button
      type="button"
      onClick={() => writeNight(!night)}
      aria-label={night ? "Switch to day" : "Switch to night"}
      aria-pressed={night}
      className="grid size-10 shrink-0 place-items-center rounded-full border border-r-line bg-r-card text-r-ink transition-colors hover:bg-r-chip"
    >
      {night ? <Sun className="size-[18px]" strokeWidth={2} /> : <Moon className="size-[18px]" strokeWidth={2} />}
    </button>
  );
}

export type NavItem = { id: string; label: string; color: string };

/** Section list with the one on screen marked (desktop side column). */
export function SectionNav({ items }: { items: NavItem[] }) {
  const [active, setActive] = useState(items[0]?.id);
  useEffect(() => {
    const seen = new Map<string, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => seen.set(e.target.id, e.isIntersecting));
        const first = items.find((it) => seen.get(it.id));
        if (first) setActive(first.id);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    items.forEach((it) => {
      const el = document.getElementById(it.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [items]);

  return (
    <nav aria-label="Sections">
      <ul className="space-y-0.5">
        {items.map((it) => {
          const on = it.id === active;
          return (
            <li key={it.id}>
              <a
                href={`#${it.id}`}
                aria-current={on ? "true" : undefined}
                className={`group flex items-center gap-3 py-1 text-[14px] font-semibold transition-colors ${
                  on ? "text-r-ink" : "text-r-mute hover:text-r-ink"
                }`}
              >
                <span
                  aria-hidden
                  className={`h-[3px] rounded-full transition-all duration-300 ${on ? "w-12" : "w-6 bg-r-line group-hover:w-9"}`}
                  style={on ? { background: it.color } : undefined}
                />
                {it.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard
          ?.writeText(email)
          .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          })
          .catch(() => {
            window.location.href = `mailto:${email}`;
          });
      }}
      className="inline-flex h-11 items-center gap-2 rounded-full bg-r-bg px-5 text-[15px] font-semibold text-r-ink transition-transform active:scale-[0.97]"
      aria-live="polite"
    >
      {copied ? <Check className="size-4" strokeWidth={2.4} /> : <Copy className="size-4" strokeWidth={2} />}
      {copied ? "Copied" : "Copy email"}
    </button>
  );
}

const timeFmt = (zone: string) =>
  new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: zone });
function subscribeMinute(cb: () => void) {
  const id = setInterval(cb, 20000);
  return () => clearInterval(id);
}

/** Kunal's local time, e.g. "14:05" */
export function LocalTime({ zone }: { zone: string }) {
  const t = useSyncExternalStore(subscribeMinute, () => timeFmt(zone).format(new Date()), () => "");
  return <span suppressHydrationWarning>{t}</span>;
}
