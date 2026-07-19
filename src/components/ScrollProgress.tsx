import { motion, useScroll, useSpring } from "framer-motion";

/**
 * Hilo de progreso dorado en el borde superior — indicador minimalista
 * de avance de lectura, suavizado con spring.
 */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.4 });

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-brass to-brass-light"
    />
  );
}
