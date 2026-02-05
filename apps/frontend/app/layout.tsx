import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PortfolioProvider } from "@/context/PortfolioContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kunal Kumawat | MERN Stack Developer",
  description: "Portfolio of Kunal Kumawat, a Full Stack MERN Developer specializing in building scalable web applications and SaaS solutions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <PortfolioProvider>
          {children}
        </PortfolioProvider>
      </body>
    </html>
  );
}
