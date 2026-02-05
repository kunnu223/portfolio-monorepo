import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Download } from "lucide-react";
import { getImageUrl } from "@/lib/utils";

interface HeroActionButtonsProps {
  resumeUrl: string;
}

export default function HeroActionButtons({
  resumeUrl,
}: HeroActionButtonsProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10">
      <motion.a
        href="#contact"
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        className="w-full sm:w-auto px-8 py-4 rounded-xl bg-linear-to-r from-primary to-secondary text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary/25 relative overflow-hidden group"
      >
        <span className="relative z-10 flex items-center gap-2">
          Work with me <ArrowRight size={18} />
        </span>
        <div className="absolute inset-0 bg-linear-to-r from-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </motion.a>
      <motion.a
        href={getImageUrl(resumeUrl)}
        download
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        className="w-full sm:w-auto px-8 py-4 rounded-xl glass border border-white/10 font-semibold flex items-center justify-center gap-2 hover:border-primary/30 transition-all"
      >
        Resume <Download size={18} />
      </motion.a>
    </div>
  );
}
