"use client";

import { motion } from "framer-motion";
import { usePortfolio } from "@/context/PortfolioContext";
import { Project } from "@/lib/types";
import { ExternalLink, Github, Folder, Code, ArrowRight } from "lucide-react";

export default function Projects() {
  const { data, loading } = usePortfolio();

  if (loading || !data) return null;

  const { projects } = data;
  
  return (
    <section id="projects" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center sm:items-end mb-16 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-center md:text-left"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 text-primary font-medium tracking-wide mb-6">
              <Folder size={16} />
              PORTFOLIO
            </span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Featured Projects</h2>
          </motion.div>
          
          <motion.a 
            href={data.personalInfo.socials.github}
            target="_blank"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="group flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all duration-300"
          >
            View GitHub Repositories <ExternalLink size={18} />
          </motion.a>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {projects.map((project: Project, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="group glass rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-primary/20 transition-all duration-500 shadow-2xl relative flex flex-col h-full"
            >
              {/* Image/Visual Area */}
              <div className="relative aspect-[16/10] sm:aspect-video overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/30 group-hover:scale-110 transition-transform duration-700 ease-out" />
                
                {/* Visual Placeholder */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                   <div className="relative">
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="w-32 h-32 sm:w-48 sm:h-48 border border-white/10 rounded-full flex items-center justify-center"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Code size={48} className="text-white/20" />
                      </div>
                   </div>
                </div>

                {/* Content Overlay - Hidden by default, visible on hover */}
                <div className="absolute inset-0 bg-background/90 backdrop-blur-md flex flex-col items-center justify-center p-8 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                  <h4 className="text-white font-black text-2xl mb-6 text-center">{project.title}</h4>
                  <div className="flex gap-4">
                    <motion.a 
                      href={project.link} 
                      target="_blank" 
                      whileHover={{ scale: 1.1, y: -5 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-xl shadow-primary/30"
                      aria-label="Live Demo"
                    >
                      <ExternalLink size={24} />
                    </motion.a>
                    <motion.a 
                      href="#" 
                      whileHover={{ scale: 1.1, y: -5 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-14 h-14 bg-white/10 text-white rounded-2xl flex items-center justify-center border border-white/20 backdrop-blur-sm"
                      aria-label="GitHub Repository"
                    >
                      <Github size={24} />
                    </motion.a>
                  </div>
                  <p className="mt-8 text-gray-400 text-sm text-center line-clamp-2">{project.description}</p>
                </div>
              </div>

              {/* Text Content */}
              <div className="p-8 sm:p-10 flex flex-col flex-1">
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.technologies.map((tech: string) => (
                    <span 
                      key={tech} 
                      className="px-3 py-1 bg-primary/5 text-primary border border-primary/10 rounded-lg text-[10px] sm:text-xs font-bold tracking-wider uppercase"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-4 group-hover:text-primary transition-colors">{project.title}</h3>
                <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-8 line-clamp-3">
                  {project.description}
                </p>
                
                <div className="mt-auto flex items-center justify-between">
                   <a 
                    href={project.link} 
                    target="_blank" 
                    className="group/link inline-flex items-center gap-2 font-bold text-sm tracking-tight text-white hover:text-primary transition-colors"
                  >
                    VIEW PROJECT <ArrowRight className="group-hover/link:translate-x-1 transition-transform" size={16} />
                  </a>
                  <Github size={18} className="text-gray-600 group-hover:text-white transition-colors" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
