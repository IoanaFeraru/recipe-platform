"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function AuthMotion({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.45,
          ease: [0.42, 0, 0.58, 1],
        },
      }}
      exit={{
        opacity: 0,
        y: -8,
        transition: {
          duration: 0.3,
          ease: "easeInOut",
        },
      }}
    >
      {children}
    </motion.div>
  );
}
