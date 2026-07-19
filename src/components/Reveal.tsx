import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  /** Retraso en segundos para escalonar entradas */
  delay?: number;
  /** Desplazamiento vertical inicial en px */
  y?: number;
  className?: string;
}

/**
 * Envoltorio de aparición al hacer scroll: fade + slide-up sutil,
 * una sola vez, con easing premium. Respeta prefers-reduced-motion.
 */
export default function Reveal({ children, delay = 0, y = 28, className }: RevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
