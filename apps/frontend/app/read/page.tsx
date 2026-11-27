import type { Metadata, Viewport } from "next";
import ReadMode from "@/components/read/ReadMode";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: `${site.name} · Work, experience and stack`,
  alternates: { canonical: "/read" },
};

export const viewport: Viewport = {
  themeColor: "#f5f1e8",
};

export default function ReadPage() {
  return <ReadMode />;
}
