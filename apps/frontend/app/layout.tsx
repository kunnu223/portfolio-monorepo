import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import ModeOverlay from "@/components/mode/ModeOverlay";
import { site } from "@/lib/content";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
// headings: a friendly grotesque with optical sizes, so big titles stay crisp
const display = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"], axes: ["opsz"] });

const title = `${site.name} · Full-stack engineer building AI agents`;
const description =
  "Full-stack engineer (Node.js, TypeScript, React). I build production AI agents and LLM features, and reliable payment and integration back ends.";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title,
  description,
  openGraph: { title, description, type: "website", url: site.url, images: [{ url: "/island-day.webp", width: 960, height: 600 }] },
  twitter: { card: "summary_large_image", title, description, images: ["/island-day.webp"] },
};

export const viewport: Viewport = {
  themeColor: "#f5f1e8",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable} ${display.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        {children}
        <ModeOverlay />
      </body>
    </html>
  );
}
