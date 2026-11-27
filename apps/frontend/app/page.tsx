import type { Viewport } from "next";
import Link from "next/link";
import Hud from "@/components/world/Hud";
import WorldLoader from "@/components/world/WorldLoader";
import { hero, site } from "@/lib/content";

export const viewport: Viewport = {
  themeColor: "#9fd3db",
  // draw under the notch / home bar; the overlay pads itself with safe-area insets
  viewportFit: "cover",
};

export default function Home() {
  return (
    <main className="fixed inset-0 overflow-hidden bg-[#9fd3db]">
      <h1 className="sr-only">
        {site.name}, full-stack engineer who builds AI agents that ship to production
      </h1>
      <p className="sr-only">
        {hero.intro} This page is a small island you can drive around. Every place on it opens part of my
        work. The same content is also on the <Link href="/read">read-mode page</Link>.
      </p>
      <WorldLoader />
      <Hud />
      <noscript>
        <div className="fixed inset-0 z-[70] grid place-items-center bg-[#9fd3db] p-6 text-center text-[#23232b]">
          <div>
            <div className="font-display text-5xl font-bold tracking-tight">{site.name}</div>
            <p className="mt-4">The island needs JavaScript.</p>
            <Link href="/read" className="mt-6 inline-block underline underline-offset-4">
              Open the read-mode page
            </Link>
          </div>
        </div>
      </noscript>
    </main>
  );
}
