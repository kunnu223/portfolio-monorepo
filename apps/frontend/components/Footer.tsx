"use client";

import { motion } from "framer-motion";
import { usePortfolio } from "@/context/PortfolioContext";
import { Github, Linkedin, Mail, Heart, ArrowUpRight } from "lucide-react";

export default function Footer() {
  const { data } = usePortfolio();
  const personalInfo = data?.personalInfo;
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "About", href: "#about" },
    { name: "Experience", href: "#experience" },
    { name: "Projects", href: "#projects" },
    { name: "Contact", href: "#contact" },
  ];

  const socials = [
    { name: "GitHub", icon: Github, href: personalInfo?.socials?.github || "#" },
    { name: "LinkedIn", icon: Linkedin, href: personalInfo?.socials?.linkedin || "#" },
    { name: "Email", icon: Mail, href: `mailto:${personalInfo?.email}` },
  ];

  return (
    <footer className="relative pt-24 pb-12 border-t border-white/5 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Top Section */}
        <div className="grid md:grid-cols-3 gap-12 mb-16">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-3xl font-bold text-gradient mb-4">
              {personalInfo?.name?.split(" ")[0] || "Kunal"}.dev
            </h3>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Building exceptional digital experiences with modern technologies.
              Let&apos;s create something amazing together.
            </p>
            <div className="flex gap-3">
              {socials.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target={social.name !== "Email" ? "_blank" : undefined}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="w-10 h-10 rounded-xl glass flex items-center justify-center text-gray-400 hover:text-white hover:border-primary/30 transition-all"
                  aria-label={social.name}
                >
                  <social.icon size={18} />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="text-lg font-bold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    {link.name}
                    <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="text-lg font-bold mb-6">Let&apos;s Work Together</h4>
            <p className="text-gray-400 mb-6">
              Have a project in mind? I&apos;d love to hear about it.
            </p>
            <motion.a
              href="#contact"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold shadow-lg shadow-primary/20"
            >
              Get in Touch
              <ArrowUpRight size={18} />
            </motion.a>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="section-divider mb-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {currentYear} {personalInfo?.name || "Kunal Kumawat"}. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm flex items-center gap-1">
            Made with <Heart size={14} className="text-red-500" /> using Next.js & Tailwind
          </p>
        </div>
      </div>
    </footer>
  );
}
