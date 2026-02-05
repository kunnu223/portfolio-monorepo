"use client";

import { motion } from "framer-motion";
import { usePortfolio } from "@/context/PortfolioContext";
import { Experience as ExperienceType } from "@/lib/types";
import { Briefcase, Calendar, Building2 } from "lucide-react";

export default function Experience() {
  const { data, loading } = usePortfolio();

  if (loading || !data) return null;

  const { experiences } = data;
  
  return (
    <section id="experience" className="py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div 
          className="flex flex-col items-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 text-primary font-medium tracking-wide mb-6">
            <Briefcase size={16} />
            JOURNEY
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-center tracking-tight">Work Experience</h2>
        </motion.div>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 via-secondary/50 to-transparent md:-ml-px hidden sm:block" />

          <div className="space-y-12">
            {experiences.map((exp: ExperienceType, index: number) => (
              <div key={index} className="relative">
                {/* Timeline Dot */}
                <motion.div 
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  className="absolute left-4 md:left-1/2 top-8 w-4 h-4 rounded-full bg-primary border-4 border-background z-20 -ml-2 hidden sm:block shadow-[0_0_15px_rgba(99,102,241,0.5)]" 
                />
                
                <motion.div
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className={`relative flex flex-col md:flex-row ${index % 2 === 0 ? "md:flex-row-reverse" : ""}`}
                >
                  {/* Content Container */}
                  <div className="md:w-1/2 pl-12 sm:pl-16 md:pl-0">
                    <div className={`p-1 pt-0 ${index % 2 === 0 ? "md:pr-12" : "md:pl-12"}`}>
                      <div className="glass p-8 rounded-3xl border border-white/5 hover:border-primary/20 transition-all duration-500 glow-card group relative">
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 rounded-3xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
                        </div>

                        <div className={`flex flex-col ${index % 2 === 0 ? "md:items-end text-left md:text-right" : "text-left"}`}>
                          <div className="flex items-center gap-2 text-primary font-mono text-sm mb-3">
                            <Calendar size={14} />
                            {exp.period}
                          </div>
                          
                          <h3 className="text-2xl font-bold mb-1 group-hover:text-primary transition-colors">{exp.role}</h3>
                          
                          <div className={`flex items-center gap-2 text-gray-300 font-semibold mb-6 ${index % 2 === 0 ? "md:flex-row-reverse" : ""}`}>
                            <Building2 size={16} className="text-secondary" />
                            {exp.company}
                          </div>

                          <ul className={`space-y-3 text-gray-400 text-sm leading-relaxed flex flex-col ${index % 2 === 0 ? "md:items-end" : ""}`}>
                            {exp.description.map((item: string, i: number) => (
                              <li key={i} className={`flex gap-3 ${index % 2 === 0 ? "md:flex-row-reverse" : ""}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Empty half for spacing on desktop */}
                  <div className="md:w-1/2" />
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
