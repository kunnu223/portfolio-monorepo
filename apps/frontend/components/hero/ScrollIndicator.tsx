import React from "react";
import { motion } from "framer-motion";

export default function ScrollIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5 }}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden sm:block"
    >
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2"
      >
        <motion.div className="w-1 h-2 bg-primary rounded-full" />
      </motion.div>
    </motion.div>
  );
}
