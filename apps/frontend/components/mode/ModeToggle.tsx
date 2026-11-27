"use client";

import type { MouseEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Car } from "lucide-react";
import { MODE_PATH, switchMode, type Mode } from "./mode";

/** A link to the other mode: plays the switch curtain, and warms up the next page on hover. */
export function ModeLink({
  to,
  className,
  children,
  onSwitch,
  ...rest
}: {
  to: Mode;
  className?: string;
  children: ReactNode;
  onSwitch?: () => void;
  "aria-label"?: string;
}) {
  const router = useRouter();
  const warm = () => {
    router.prefetch(MODE_PATH[to]);
    // start downloading the 3D island before the click lands
    if (to === "drive") void import("@/components/world/World");
  };
  const click = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    onSwitch?.();
    void switchMode(to);
  };
  return (
    <a
      href={MODE_PATH[to]}
      onClick={click}
      onPointerEnter={warm}
      onTouchStart={warm}
      onFocus={warm}
      className={className}
      {...rest}
    >
      {children}
    </a>
  );
}

const MODES: { id: Mode; label: string; Icon: typeof Car }[] = [
  { id: "drive", label: "Drive", Icon: Car },
  { id: "read", label: "Read", Icon: BookOpen },
];

/** Drive | Read switch. `island` is for the dark bar over the 3D world, `paper` for Read mode. */
export function ModeToggle({ current, variant }: { current: Mode; variant: "island" | "paper" }) {
  const island = variant === "island";
  const box = island
    ? "flex h-10 items-center rounded-full bg-[#0d0d12]/90 p-1 text-ink shadow-lg"
    : "flex h-10 items-center rounded-full border border-r-line bg-r-card p-1";
  const seg = "flex h-8 items-center gap-1.5 rounded-full px-3 text-[14px] font-medium transition-colors";
  const on = island ? "bg-ink text-bg" : "bg-r-ink text-r-bg";
  const off = island ? "text-ink/80 hover:bg-white/10 hover:text-ink" : "text-r-text hover:bg-r-chip hover:text-r-ink";

  return (
    <nav aria-label="View mode" className={box}>
      {MODES.map(({ id, label, Icon }) =>
        id === current ? (
          <span key={id} aria-current="page" className={`${seg} ${on}`}>
            <Icon aria-hidden className="hidden size-4 sm:block" strokeWidth={2} />
            {label}
          </span>
        ) : (
          <ModeLink key={id} to={id} className={`${seg} ${off}`} aria-label={`Switch to ${label} mode`}>
            <Icon aria-hidden className="hidden size-4 sm:block" strokeWidth={2} />
            {label}
          </ModeLink>
        ),
      )}
    </nav>
  );
}
