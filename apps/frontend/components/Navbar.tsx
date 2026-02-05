"use client";

import { useState, useEffect } from "react";
import { usePortfolio } from "@/context/PortfolioContext";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const navLinks = [
  { name: "About", href: "/about" },
  { name: "Experience", href: "/#experience" },
  { name: "Skills", href: "/#skills" },
  { name: "Projects", href: "/#projects" },
  { name: "Contact", href: "/#contact" },
];

export default function Navbar() {
  const { data } = usePortfolio();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [mobileMenuOpen]);

  const logoName = data?.personalInfo?.name ? `${data.personalInfo.name.split(' ')[0]}.dev` : "Kunal.dev";

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-6",
        isScrolled ? "py-4" : "py-6"
      )}
    >
      {/* Background blur/glass effect when scrolled */}
      <div 
        className={cn(
          "absolute inset-0 transition-all duration-500",
          isScrolled ? "glass opacity-100" : "opacity-0"
        )} 
      />

      <div className="max-w-7xl mx-auto flex justify-between items-center relative z-10">
        <Link
          href="/"
          className="text-2xl font-bold text-gradient group"
        >
          {logoName}
          <div className="h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-primary to-secondary transition-all duration-300" />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 items-center">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-semibold uppercase tracking-widest hover:text-primary transition-all duration-300 relative group"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
            </Link>
          ))}
          <motion.a
            href="#contact"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
          >
            Hire Me
          </motion.a>
        </div>

        {/* Mobile Toggle */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden w-12 h-12 rounded-xl glass border border-white/10 flex items-center justify-center relative overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {mobileMenuOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                <X size={24} />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
              >
                <Menu size={24} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[90] md:hidden"
          >
            {/* Backdrop Blur */}
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-2xl px-6 pt-32 pb-12 flex flex-col justify-between"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex flex-col gap-6" onClick={(e) => e.stopPropagation()}>
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-4xl font-black uppercase tracking-tighter hover:text-primary transition-colors flex items-center justify-between group"
                  >
                    <span>{link.name}</span>
                    <ArrowRight className="opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" size={32} />
                  </Link>
                ))}
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="pt-12 border-t border-white/10"
                onClick={(e) => e.stopPropagation()}
              >
                <a
                  href="#contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-5 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-black text-xl flex items-center justify-center gap-3 shadow-2xl shadow-primary/40"
                >
                  HIRE ME NOW <ArrowRight size={24} />
                </a>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
