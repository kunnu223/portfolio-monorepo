"use client";

import { motion } from "framer-motion";
import { usePortfolio } from "@/context/PortfolioContext";
import { EducationItem } from "@/lib/types";
import { GraduationCap, BookOpen, Calendar } from "lucide-react";

export default function Education() {
  const { data, loading } = usePortfolio();

  if (loading || !data) return null;

  const { education } = data;
  
  return (
    <section id="education" className="py-24 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div 
          className="flex flex-col items-center mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 text-primary font-medium tracking-wide mb-6">
            <BookOpen size={16} />
            ACADEMIC
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Education Background</h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6 lg:gap-8">
          {education.map((edu: EducationItem, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -5 }}
              className="glass p-8 sm:p-10 rounded-[2.5rem] border border-white/5 relative overflow-hidden group hover:border-primary/20 transition-all duration-500 shadow-xl h-full flex flex-col justify-center"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-700">
                <GraduationCap size={120} />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 text-primary font-mono text-sm mb-4">
                  <Calendar size={14} />
                  {edu.period}
                </div>
                
                <h3 className="text-2xl sm:text-3xl font-black mb-3 group-hover:text-primary transition-colors pr-12">
                  {edu.degree}
                </h3>
                
                <div className="text-gray-400 font-bold text-lg flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-secondary rounded-full" />
                  {edu.institution}
                </div>
              </div>

              {/* Shimmer on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
