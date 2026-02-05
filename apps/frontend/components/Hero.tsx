"use client";

import { motion } from "framer-motion";
import { usePortfolio } from "@/context/PortfolioContext";
import { Sparkles } from "lucide-react";
import TypewriterText from "./TypewriterText";
import HeroBackground from "./hero/HeroBackground";
import HeroSocialLinks from "./hero/HeroSocialLinks";
import HeroProfileCard from "./hero/HeroProfileCard";
import HeroActionButtons from "./hero/HeroActionButtons";
import ScrollIndicator from "./hero/ScrollIndicator";

export default function Hero() {
  const { data, loading } = usePortfolio();

  if (loading || !data) return null;

  const { personalInfo, resumeUrl } = data;
  
  const roles = [
    personalInfo.role,
    "Problem Solver",
    "Tech Enthusiast",
    "Code Craftsman"
  ];

  return (
    <section className="relative min-h-screen flex items-center pt-24 md:pt-32 pb-16 overflow-hidden">
      <HeroBackground />

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 lg:gap-8 items-center relative z-10 w-full">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center lg:text-left order-2 lg:order-1"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 text-primary font-medium tracking-wide mb-6"
          >
            <Sparkles size={16} className="animate-pulse" />
            AVAILABLE FOR HIRE
          </motion.div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 leading-tight">
            Hi, I&apos;m{" "}
            <motion.span 
              className="text-gradient inline-block"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              {personalInfo.name.split(" ")[0]}
            </motion.span>
          </h1>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-6 text-gray-300 min-h-[1.5em] flex items-center justify-center lg:justify-start">
            I&apos;m a&nbsp;<TypewriterText texts={roles} speed={80} delay={2000} />
          </h2>

          <p className="text-base sm:text-lg text-gray-400 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            {personalInfo.summary}
          </p>

          <HeroActionButtons resumeUrl={resumeUrl} />

          <HeroSocialLinks personalInfo={personalInfo} />
        </motion.div>

        <HeroProfileCard personalInfo={personalInfo} />
      </div>

      <ScrollIndicator />
    </section>
  );
}
