import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { ArrowRight, ArrowUpRight, Mail } from "lucide-react";
import { about, experience, hero, sideProjects, site, stack, work } from "@/lib/content";
import { ModeLink, ModeToggle } from "@/components/mode/ModeToggle";
import { NIGHT_SCRIPT } from "@/components/mode/night";
import { milestones, placeById, type ZoneId } from "@/components/world/layout";
import { CopyEmail, LocalTime, ReadReady, SectionNav, ThemeToggle, type NavItem } from "./ReadClient";

/**
 * Read mode: the whole portfolio on one plain page. Two columns on desktop (who I am on
 * the left, the work on the right), one column on phones. Same colours as the island,
 * and the same day/night switch.
 */

const SECTIONS: NavItem[] = [
  { id: "about", label: "About", color: "#ff6a3d" },
  { id: "work", label: "Work", color: "#8a7cff" },
  { id: "experience", label: "Experience", color: "#ffb347" },
  { id: "stack", label: "Stack", color: "#38c9b4" },
  { id: "contact", label: "Contact", color: "#fa5785" },
];

// each project is also a place on the island
const WORK_PLACE: ZoneId[] = ["agents", "billing", "integrations", "admin"];
const roleColor = (i: number) => milestones.find((m) => m.role === i)?.color ?? "#ffb347";

function Section({ id, title, children, sub }: { id: string; title: string; children: ReactNode; sub?: string }) {
  const color = SECTIONS.find((s) => s.id === id)?.color;
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-20 pt-16 first:pt-10 lg:first:pt-0">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <span aria-hidden className="size-3 rounded-full" style={{ background: color }} />
          <h2 id={`${id}-title`} className="font-display text-[28px] font-bold leading-tight tracking-[-0.02em] text-r-ink">
            {title}
          </h2>
        </div>
        {sub && <p className="mt-1.5 pl-6 text-[15px] text-r-mute">{sub}</p>}
      </div>
      {children}
    </section>
  );
}

function Chips({ items }: { items: string[] }) {
  return (
    <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Tools">
      {items.map((s) => (
        <li key={s} className="rounded-full bg-r-chip px-3 py-1 text-[13.5px] font-medium text-r-text">
          {s}
        </li>
      ))}
    </ul>
  );
}

function Bullets({ items, color }: { items: string[]; color: string }) {
  return (
    <ul className="space-y-2.5">
      {items.map((b) => (
        <li key={b} className="flex gap-3 text-[16px] leading-[1.6]">
          <span aria-hidden className="mt-[0.6em] size-1.5 shrink-0 rounded-full" style={{ background: color }} />
          <span>{b}</span>
        </li>
      ))}
    </ul>
  );
}

function DriveCard() {
  return (
    <ModeLink
      to="drive"
      className="group flex flex-col overflow-hidden rounded-3xl border border-r-line bg-r-card transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-12px_rgba(20,30,50,0.35)] lg:flex-row lg:items-center lg:gap-4 lg:rounded-2xl lg:p-2.5 lg:pr-4"
    >
      <span className="relative block aspect-[16/9] w-full shrink-0 overflow-hidden bg-[#9fd3db] lg:aspect-auto lg:h-[68px] lg:w-[108px] lg:rounded-xl">
        <Image src="/island-day.webp" alt="" fill sizes="(min-width: 1024px) 108px, 100vw" className="day-only object-cover" />
        <Image src="/island-night.webp" alt="" fill sizes="(min-width: 1024px) 108px, 100vw" className="night-only object-cover" />
      </span>
      <span className="flex items-center gap-3 p-4 lg:contents">
        <span className="min-w-0 flex-1">
          <span className="block text-[15.5px] font-semibold text-r-ink">Try Drive mode</span>
          <span className="block text-[14px] leading-snug text-r-mute">The same work as a little 3D island you drive around.</span>
        </span>
        <ArrowRight aria-hidden className="size-5 shrink-0 text-r-ink transition-transform group-hover:translate-x-1" />
      </span>
    </ModeLink>
  );
}

export default function ReadMode() {
  const daily = (lvl: string) => lvl === "daily";
  return (
    <div className="read min-h-svh bg-r-bg text-r-text">
      <script dangerouslySetInnerHTML={{ __html: NIGHT_SCRIPT }} />
      <ReadReady />
      <a
        href="#about"
        className="sr-only z-50 rounded-full bg-r-ink px-4 py-2 text-r-bg focus:not-sr-only focus:fixed focus:left-4 focus:top-3"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-r-line bg-r-bg">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-10">
          <a href="#top" className="flex min-w-0 items-center gap-2.5">
            <span
              aria-hidden
              className="grid size-9 shrink-0 place-items-center rounded-full bg-r-ink pb-0.5 font-display text-[18px] font-bold text-r-bg"
            >
              k
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-[15px] font-semibold text-r-ink">{site.name}</span>
              <span className="hidden truncate text-[12.5px] text-r-mute sm:block">Full-stack engineer · AI agents</span>
            </span>
          </a>
          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle />
            <ModeToggle current="read" variant="paper" />
          </div>
        </div>
      </header>

      <div
        id="top"
        className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16 lg:px-10"
      >
        {/* who I am: stays in view on desktop while the right side scrolls */}
        <aside className="read-aside no-scrollbar pt-10 lg:flex lg:flex-col lg:justify-between lg:overflow-y-auto lg:py-8">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-r-mute">{hero.kicker}</p>
            <h1 className="mt-4 font-display text-[clamp(2.5rem,4.6vw,3.7rem)] font-bold leading-[1.02] tracking-[-0.035em] text-r-ink">
              I build <span className="text-r-accent">AI agents</span> that ship to production.
            </h1>
            <p className="mt-5 max-w-[46ch] text-[17px] leading-[1.65]">{hero.intro}</p>
            <p className="mt-5 flex items-center gap-2.5 text-[14.5px] font-medium text-r-text">
              <span aria-hidden className="relative flex size-2.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#22c55e] opacity-60" />
                <span className="relative inline-flex size-2.5 rounded-full bg-[#22c55e]" />
              </span>
              {site.available} · {site.location}, {site.relocate}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <a href={`mailto:${site.email}`} className="r-btn r-btn-primary">
                <Mail aria-hidden className="size-4" strokeWidth={2.2} />
                Email me
              </a>
              <a href={site.linkedin} target="_blank" rel="noreferrer" className="r-btn">
                LinkedIn <ArrowUpRight aria-hidden className="size-4" />
              </a>
              <a href={site.github} target="_blank" rel="noreferrer" className="r-btn">
                GitHub <ArrowUpRight aria-hidden className="size-4" />
              </a>
              {site.resumeUrl && (
                <a href={site.resumeUrl} target="_blank" rel="noreferrer" className="r-btn">
                  Resume <ArrowUpRight aria-hidden className="size-4" />
                </a>
              )}
            </div>
          </div>

          <div className="mt-10 lg:mt-8">
            <div className="short-hide mb-8 hidden lg:block">
              <SectionNav items={SECTIONS} />
            </div>
            <DriveCard />
          </div>
        </aside>

        <main className="pb-10 lg:py-12">
          <Section id="about" title="About">
            <p className="text-[18px] leading-[1.7] text-r-ink">{about.statement}</p>
            <ul className="mt-7 grid grid-cols-3 gap-2.5 sm:gap-3">
              {about.facts.map((f) => (
                <li key={f.label} className="rounded-2xl border border-r-line bg-r-card p-4 sm:p-5">
                  <div className="font-display text-[34px] font-bold leading-none tracking-[-0.02em] text-r-ink sm:text-[40px]">{f.value}</div>
                  <div className="mt-2 text-[13.5px] leading-snug text-r-mute sm:text-[14px]">{f.label}</div>
                </li>
              ))}
            </ul>
            <p className="mt-3 rounded-2xl border border-r-line bg-r-card px-4 py-3.5 text-[15px] leading-snug sm:px-5">
              <span className="font-semibold text-r-ink">Education · </span>
              {about.education}
            </p>
          </Section>

          <Section id="work" title="Selected work" sub="Four things I built that are live and used.">
            <ol className="space-y-4">
              {work.map((w, i) => {
                const place = placeById[WORK_PLACE[i]];
                return (
                  <li
                    key={w.index}
                    data-reveal
                    className="rounded-3xl border border-r-line bg-r-card p-6 sm:p-7"
                    style={{ "--accent": place.accent } as CSSProperties}
                  >
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[13.5px]">
                      <span className="font-display text-[15px] font-bold text-r-ink">{w.index}</span>
                      <span className="text-r-mute">
                        {w.kind} · {w.year}
                      </span>
                      <span
                        className="ml-auto inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12.5px] font-medium text-r-ink"
                        style={{ background: "color-mix(in srgb, var(--accent) 18%, transparent)" }}
                        title="Where this project sits on the island in Drive mode"
                      >
                        <span aria-hidden className="size-2 rounded-full" style={{ background: place.accent }} />
                        {place.name} on the island
                      </span>
                    </div>
                    <h3 className="mt-3 font-display text-[24px] font-semibold leading-[1.15] tracking-[-0.02em] text-r-ink">
                      {w.title}
                    </h3>
                    <p className="mt-3 text-[16px] leading-[1.65]">{w.problem}</p>
                    <h4 className="mb-3 mt-5 text-[13px] font-semibold uppercase tracking-[0.08em] text-r-mute">What I built</h4>
                    <Bullets items={w.built} color={place.accent} />
                    <Chips items={w.stack} />
                  </li>
                );
              })}
            </ol>
            <div className="mt-4 rounded-2xl border border-dashed border-r-line px-5 py-5 sm:px-6">
              <h3 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-r-mute">Side projects</h3>
              <ul className="mt-3 space-y-4">
                {sideProjects.map((p) => (
                  <li key={p.title} className="text-[15px] leading-[1.6] text-r-text">
                    {p.url ? (
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-r-ink underline decoration-r-line decoration-2 underline-offset-4 hover:decoration-r-accent"
                      >
                        {p.title}
                        <ArrowUpRight aria-hidden className="size-4" strokeWidth={2.2} />
                      </a>
                    ) : (
                      <span className="font-semibold text-r-ink">{p.title}</span>
                    )}
                    <span className="mt-1 block">{p.note}</span>
                    <span className="mt-1 block font-mono text-[12.5px] text-r-mute">{p.stack}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Section>

          <Section id="experience" title="Experience" sub="2.5 years full-time, plus a 6-month internship.">
            <ol className="relative ml-1.5 space-y-4 border-l-2 border-r-line pl-6 sm:pl-7">
              {experience.map((r, i) => (
                <li key={r.company} data-reveal className="relative">
                  <span
                    aria-hidden
                    className="absolute -left-[33px] top-7 size-4 rounded-full border-[3px] border-r-bg sm:-left-[37px]"
                    style={{ background: roleColor(i) }}
                  />
                  <div className="rounded-3xl border border-r-line bg-r-card p-6 sm:p-7">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-r-chip px-3 py-1 text-[13px] font-semibold text-r-ink">{r.period}</span>
                      {i === 0 && (
                        <span className="rounded-full bg-[#22c55e]/15 px-3 py-1 text-[13px] font-semibold text-[#15803d] [html[data-night]_&]:text-[#4ade80]">
                          Current
                        </span>
                      )}
                    </div>
                    <h3 className="mt-3 font-display text-[22px] font-semibold leading-tight tracking-[-0.015em] text-r-ink">{r.title}</h3>
                    <p className="mt-0.5 text-[15px] text-r-mute">
                      {r.company} · {r.where}
                    </p>
                    <p className="mt-3 text-[16px] leading-[1.65]">{r.summary}</p>
                    {r.points.length > 0 && (
                      <div className="mt-4">
                        <Bullets items={r.points} color={roleColor(i)} />
                      </div>
                    )}
                    <Chips items={r.stack} />
                  </div>
                </li>
              ))}
            </ol>
          </Section>

          <Section id="stack" title="Stack">
            <p className="-mt-2 mb-5 flex flex-wrap items-center gap-x-5 gap-y-1 text-[14px] text-r-mute">
              <span className="flex items-center gap-2">
                <span aria-hidden className="h-4 w-7 rounded-full bg-r-ink" /> Use daily
              </span>
              <span className="flex items-center gap-2">
                <span aria-hidden className="h-4 w-7 rounded-full border-[1.5px] border-r-mute" /> Working knowledge
              </span>
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {stack.map((g) => (
                <div key={g.name} data-reveal className="rounded-3xl border border-r-line bg-r-card p-5 sm:p-6">
                  <h3 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-r-mute">{g.name}</h3>
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {g.items.map((it) => (
                      <li
                        key={it.label}
                        className={`rounded-full px-3 py-1 text-[14px] font-medium ${
                          daily(it.level) ? "bg-r-ink text-r-bg" : "border-[1.5px] border-r-line text-r-text"
                        }`}
                      >
                        {it.label}
                        <span className="sr-only">{daily(it.level) ? " (daily)" : " (working knowledge)"}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>

          <section id="contact" aria-labelledby="contact-title" className="scroll-mt-20 pt-16">
            <div className="rounded-[28px] bg-r-ink p-7 text-r-bg sm:p-10">
              <div className="flex items-center gap-3">
                <span aria-hidden className="size-3 rounded-full bg-[#fa5785]" />
                <span className="text-[14px] font-semibold uppercase tracking-[0.1em] opacity-70">Contact</span>
              </div>
              <h2
                id="contact-title"
                className="mt-4 font-display text-[clamp(2rem,4.2vw,2.9rem)] font-bold leading-[1.05] tracking-[-0.03em]"
              >
                Let&apos;s build something that ships.
              </h2>
              <p className="mt-3 text-[16.5px] leading-relaxed opacity-80">
                {site.available}. Based in {site.location}
                <span className="whitespace-nowrap">
                  {" "}
                  (<LocalTime zone={site.timeZone} /> IST)
                </span>
                , {site.relocate}.
              </p>
              <a
                href={`mailto:${site.email}`}
                className="mt-6 block break-all font-display text-[clamp(1rem,4.6vw,1.9rem)] font-semibold underline decoration-2 underline-offset-[6px] hover:decoration-[#fa5785]"
              >
                {site.email}
              </a>
              <div className="mt-6 flex flex-wrap gap-2">
                <CopyEmail email={site.email} />
                <a
                  href={site.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center gap-1.5 rounded-full border border-current/25 px-5 text-[15px] font-medium transition-colors hover:border-current/60"
                >
                  LinkedIn <ArrowUpRight aria-hidden className="size-4" />
                </a>
                <a
                  href={site.github}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center gap-1.5 rounded-full border border-current/25 px-5 text-[15px] font-medium transition-colors hover:border-current/60"
                >
                  GitHub <ArrowUpRight aria-hidden className="size-4" />
                </a>
              </div>
            </div>

            <footer className="mt-10 flex flex-col gap-2 border-t border-r-line pt-6 text-[14px] text-r-mute sm:flex-row sm:items-center sm:justify-between">
              <span>
                © {new Date().getFullYear()} {site.name}
              </span>
              <span>
                Built with Next.js and three.js ·{" "}
                <ModeLink to="drive" className="font-medium text-r-ink underline underline-offset-4">
                  Try Drive mode
                </ModeLink>
              </span>
            </footer>
          </section>
        </main>
      </div>
    </div>
  );
}
