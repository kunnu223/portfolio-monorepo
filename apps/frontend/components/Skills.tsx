"use client";

import { motion } from "framer-motion";
import { usePortfolio } from "@/context/PortfolioContext";
import { 
  Code2, 
  Monitor, 
  Database, 
  Globe, 
  Server, 
  Cpu, 
  Layers, 
  Smartphone,
  Terminal,
  LucideIcon
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  frontend: Monitor,
  backend: Server,
  databases: Database,
  languages: Code2,
  tools: Terminal,
  mobile: Smartphone,
  cloud: Globe,
  other: Cpu
};

export default function Skills() {
  const { data, loading } = usePortfolio();

  if (loading || !data) return null;

  const { skills } = data;
  
  return (
    <section id="skills" className="py-24 relative">
      {/* Background decoration */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div 
          className="flex flex-col mb-16 items-center sm:items-start"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 text-primary font-medium tracking-wide mb-6">
            <Layers size={16} />
            STACK
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-center sm:text-left">Technical Arsenal</h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Object.entries(skills).map(([category, items], index) => {
            const Icon = iconMap[category.toLowerCase()] || Cpu;
            
            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -8 }}
                className="glass p-8 rounded-[2rem] border border-white/5 hover:border-primary/30 transition-all duration-500 group relative flex flex-col h-full overflow-hidden"
              >
                {/* Background glow pattern */}
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-inner">
                    <Icon size={28} className="text-primary group-hover:text-secondary transition-colors" />
                  </div>
                  <h3 className="text-xl font-black capitalize tracking-tight">{category}</h3>
                </div>

                <div className="flex flex-wrap gap-2 mt-auto">
                  {(items as string[]).map((skill: string, si: number) => (
                    <motion.span
                      key={skill}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: (index * 0.1) + (si * 0.05) }}
                      className="px-4 py-1.5 bg-white/5 hover:bg-primary/10 rounded-xl text-xs sm:text-sm font-medium text-gray-300 border border-white/5 hover:border-primary/20 transition-all duration-300"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
                
                {/* Decoration */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-secondary/50 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
