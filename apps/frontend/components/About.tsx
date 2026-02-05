"use client";

import { motion } from "framer-motion";
import { usePortfolio } from "@/context/PortfolioContext";
import { User, Rocket, Heart, Coffee } from "lucide-react";

export default function About() {
  const { data, loading } = usePortfolio();

  if (loading || !data || !data.personalInfo.about) return null;

  const { personalInfo } = data;

  const stats = [
    { icon: Rocket, label: "Projects Completed", value: "10+" },
    { icon: Heart, label: "Happy Clients", value: "100%" },
    { icon: Coffee, label: "Cups of Coffee", value: "Unlimited" },
  ];

  return (
    <section id="about" className="py-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div 
          className="flex flex-col mb-16 items-center sm:items-start"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 text-primary font-medium tracking-wide mb-6">
            <User size={16} />
            ABOUT ME
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-center sm:text-left">Building Digital Adventures</h2>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-12 items-start">
          <motion.div 
            className="lg:col-span-3 space-y-6"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="glass p-8 rounded-[2rem] border border-white/5 relative group bg-white/5">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <User size={120} />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-6 text-primary">My Story</h3>
                <div className="space-y-4 text-gray-300 leading-relaxed text-lg whitespace-pre-line">
                  {personalInfo.about}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass p-6 rounded-2xl border border-white/5 flex flex-col items-center text-center group hover:border-primary/30 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <stat.icon size={24} className="text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-gradient mb-1">{stat.value}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-widest">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="glass p-8 rounded-[2rem] border border-white/5 bg-gradient-to-br from-primary/5 to-secondary/5 h-full">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Rocket size={20} className="text-primary" />
                What Drives Me
              </h3>
              <ul className="space-y-6">
                {[
                  { title: "User-Centric Design", desc: "Crafting interfaces that are intuitive and joyful to use." },
                  { title: "Scalable Architecture", desc: "Building systems that grow with your business needs." },
                  { title: "Clean Code", desc: "Writing maintainable, well-documented code for the long term." },
                  { title: "AI Innovation", desc: "Leveraging cutting-edge AI tools to build smarter solutions." }
                ].map((item, i) => (
                  <motion.li 
                    key={item.title}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + (i * 0.1) }}
                    className="flex gap-4"
                  >
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-gray-200 mb-1">{item.title}</h4>
                      <p className="text-sm text-gray-400">{item.desc}</p>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
