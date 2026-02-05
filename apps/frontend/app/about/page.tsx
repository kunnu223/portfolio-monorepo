"use client";

import { motion } from "framer-motion";
import { usePortfolio } from "@/context/PortfolioContext";
import { 
  User, 
  Rocket, 
  Heart, 
  Target, 
  Compass, 
  Zap,
  ArrowLeft,
  Github,
  Linkedin,
  Mail,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParticleBackground from "@/components/ParticleBackground";
import { getImageUrl, cn } from "@/lib/utils";

export default function AboutPage() {
  const { data, loading } = usePortfolio();

  if (loading || !data) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const { personalInfo } = data;

  const stats = [
    { icon: Rocket, label: "Projects Delivered", value: "10+", color: "from-blue-500 to-cyan-400" },
    { icon: Zap, label: "Experience", value: "2+ Years", color: "from-purple-500 to-pink-500" },
    { icon: Target, label: "Code Quality", value: "99.9%", color: "from-orange-500 to-yellow-500" },
    { icon: Heart, label: "Developer Bliss", value: "100%", color: "from-green-500 to-emerald-500" },
  ];

  const highlights = [
    {
      title: "My Philosophy",
      icon: Compass,
      desc: "I believe that every line of code should contribute to a better user experience. Performance and accessibility are not 'features', they are requirements.",
      color: "text-blue-400"
    },
    {
      title: "Problem Solver",
      icon: Target,
      desc: "Give me a complex bug and a cup of coffee, and I'll give you a clean, optimized solution. I thrive on challenges that push my technical boundaries.",
      color: "text-purple-400"
    },
    {
      title: "Continuous Learner",
      icon: Zap,
      desc: "The tech world moves fast. I spend my free time exploring AI, decentralized systems, and the latest frontend patterns to stay ahead of the curve.",
      color: "text-yellow-400"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30">
      <ParticleBackground />
      <Navbar />
      
      <main className="relative z-10 pt-32 pb-20 overflow-hidden">
        {/* Decorative Shapes */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -mr-64 -mt-64" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] -ml-64 -mb-64" />

        <div className="max-w-7xl mx-auto px-6">
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center mb-20 text-center"
          >
            <Link 
              href="/" 
              className="group mb-8 flex items-center gap-2 text-gray-500 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
            <span className="inline-flex items-center gap-2 px-6 py-2 rounded-full glass border border-primary/20 text-primary font-bold tracking-widest text-xs uppercase mb-6">
              <User size={14} />
              The Story Behind The Code
            </span>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-none">
              Passion Meets <br />
              <span className="text-gradient">Precision</span>
            </h1>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-12 gap-12 items-start mb-32">
            {/* Image/Visual Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-5 relative group"
            >
              <div className="absolute inset-0 bg-linear-to-tr from-primary/20 to-secondary/20 rounded-[3rem] blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-50" />
              <div className="glass p-2 rounded-[3.5rem] border border-white/10 relative overflow-hidden aspect-4/5 flex items-center justify-center">
                <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-transparent" />
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-48 h-48 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center text-8xl font-black text-white shadow-2xl overflow-hidden">
                    {personalInfo.profileImage ? (
                      <img src={getImageUrl(personalInfo.profileImage)} alt={personalInfo.name} className="w-full h-full object-cover" />
                    ) : (
                      personalInfo.name.charAt(0)
                    )}
                  </div>
                  <div className="mt-12 text-center">
                    <h3 className="text-3xl font-bold mb-2">{personalInfo.name}</h3>
                    <p className="text-primary font-medium tracking-widest uppercase text-sm mb-6">{personalInfo.role}</p>
                    <div className="flex gap-4 justify-center">
                      {[
                        { icon: Github, href: personalInfo.socials.github },
                        { icon: Linkedin, href: personalInfo.socials.linkedin },
                        { icon: Mail, href: `mailto:${personalInfo.email}` }
                      ].map((social, i) => (
                        <a 
                          key={i}
                          href={social.href} 
                          className="w-12 h-12 rounded-2xl glass border border-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                        >
                          <social.icon size={20} />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Content Text */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-7 space-y-8"
            >
              <div className="glass p-10 rounded-[3rem] border border-white/5 bg-white/2">
                <h2 className="text-3xl font-bold mb-8 flex items-center gap-4">
                  <span className="w-12 h-1 bg-primary rounded-full" />
                  My Journey
                </h2>
                <div className="space-y-6 text-gray-300 text-lg md:text-xl leading-relaxed whitespace-pre-line font-medium">
                  {personalInfo.about}
                </div>
              </div>

              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {stats.map((stat, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ y: -5 }}
                      className="glass p-6 rounded-3xl border border-white/5 text-center group"
                    >
                      <div className={`w-12 h-12 rounded-2xl bg-linear-to-br ${stat.color} flex items-center justify-center mb-4 mx-auto shadow-lg group-hover:scale-110 transition-transform`}>
                        <stat.icon size={22} className="text-white" />
                      </div>
                      <div className="text-2xl font-bold mb-1 tracking-tight">{stat.value}</div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Highlights Section */}
          <div className="grid md:grid-cols-3 gap-8 mb-32">
            {highlights.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="glass p-8 rounded-[2.5rem] border border-white/5 hover:border-primary/20 transition-all group"
              >
                <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 ${item.color} group-hover:bg-primary/10 transition-colors`}>
                  <item.icon size={28} />
                </div>
                <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed font-medium">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* CTA Section */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-[4rem] overflow-hidden p-12 md:p-20 text-center"
          >
            <div className="absolute inset-0 bg-linear-to-r from-primary/20 via-secondary/20 to-primary/20 blur-3xl" />
            <div className="absolute inset-0 glass border border-white/10 rounded-[4rem]" />
            <div className="relative z-10 flex flex-col items-center">
              <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tighter">
                Ready to build something <br />
                <span className="text-gradient">Legendary?</span>
              </h2>
              <div className="flex flex-col sm:flex-row gap-6">
                <Link 
                  href="/#contact" 
                  className="px-12 py-5 rounded-2xl bg-white text-black font-black text-lg hover:bg-gray-200 transition-colors flex items-center gap-3 group"
                >
                  Start a Project
                  <ExternalLink size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Link>
                <a 
                  href={getImageUrl(data.resumeUrl)} 
                  download
                  className="px-12 py-5 rounded-2xl glass border border-white/10 font-bold text-lg hover:bg-white/5 transition-colors"
                >
                  Download CV
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
