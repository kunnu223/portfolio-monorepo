import React from "react";
import { motion } from "framer-motion";
import { getImageUrl } from "@/lib/utils";
import { PersonalInfo } from "@/lib/types";

interface HeroProfileCardProps {
  personalInfo: PersonalInfo;
}

export default function HeroProfileCard({ personalInfo }: HeroProfileCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="order-1 lg:order-2 flex justify-center"
    >
      <div className="relative w-full max-w-[320px] xs:max-w-[400px] md:max-w-[450px] aspect-square">
        {/* Animated rings - hidden on very small screens to reduce clutter */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border-2 border-dashed border-primary/20 rounded-full hidden xs:block"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute inset-4 sm:inset-8 border border-secondary/20 rounded-full hidden xs:block"
        />

        {/* Main Content Card */}
        <motion.div
          whileHover={{ y: -5 }}
          className="absolute inset-0 glass rounded-3xl flex flex-col items-center justify-center p-6 sm:p-8 overflow-hidden border border-white/10 shadow-2xl"
        >
          {/* Profile Image/Initial */}
          <motion.div
            animate={{
              boxShadow: [
                "0 0 20px rgba(99, 102, 241, 0.2)",
                "0 0 40px rgba(99, 102, 241, 0.4)",
                "0 0 20px rgba(99, 102, 241, 0.2)",
              ],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-linear-to-br from-primary to-secondary mb-6 flex items-center justify-center text-4xl sm:text-5xl font-black text-white overflow-hidden shadow-2xl"
          >
            {personalInfo.profileImage ? (
              <img
                src={getImageUrl(personalInfo.profileImage)}
                alt={personalInfo.name}
                className="w-full h-full object-cover"
              />
            ) : (
              personalInfo.name.charAt(0)
            )}
          </motion.div>

          <h3 className="text-xl sm:text-2xl font-bold mb-2 text-center">
            {personalInfo.name}
          </h3>
          <p className="text-gray-400 text-sm sm:text-base mb-6 text-center">
            {personalInfo.role}
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full pt-6 border-t border-white/10">
            <div className="text-center">
              <p className="text-lg sm:text-2xl font-bold text-gradient">2+</p>
              <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">
                Years Exp
              </p>
            </div>
            <div className="text-center border-x border-white/10 px-2 sm:px-4">
              <p className="text-lg sm:text-2xl font-bold text-gradient">1k+</p>
              <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">
                Commits
              </p>
            </div>
            <div className="text-center">
              <p className="text-lg sm:text-2xl font-bold text-gradient">100%</p>
              <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">
                Dedication
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
