import React from "react";
import { motion } from "framer-motion";
import { Github, Linkedin, Mail } from "lucide-react";
import { PersonalInfo } from "@/lib/types";

interface HeroSocialLinksProps {
  personalInfo: PersonalInfo;
}

export default function HeroSocialLinks({ personalInfo }: HeroSocialLinksProps) {
  const socials = [
    { icon: Github, href: personalInfo.socials.github, label: "GitHub" },
    { icon: Linkedin, href: personalInfo.socials.linkedin, label: "LinkedIn" },
    { icon: Mail, href: `mailto:${personalInfo.email}`, label: "Email" },
  ];

  return (
    <div className="flex justify-center lg:justify-start gap-4">
      {socials.map((social, index) => (
        <motion.a
          key={social.label}
          href={social.href}
          target={social.label !== "Email" ? "_blank" : undefined}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 + index * 0.1 }}
          whileHover={{ scale: 1.2, rotate: 8 }}
          className="w-12 h-12 rounded-xl glass border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-primary/30 transition-all shadow-lg"
          aria-label={social.label}
        >
          <social.icon size={20} />
        </motion.a>
      ))}
    </div>
  );
}
