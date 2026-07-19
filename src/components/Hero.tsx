import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { hero } from "../data/content.ts";

const ctaSpring = { type: "spring", stiffness: 380, damping: 22 } as const;

/**
 * Hero — fotografía corporativa a plena visibilidad con velo navy lateral
 * (intenso a la izquierda, disuelto a la derecha), parallax de profundidad
 * al hacer scroll y entradas escalonadas al montar.
 */
export default function Hero() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Capas a distinta velocidad: la foto se acerca y baja, el texto sube y se desvanece.
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.24]);
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const contentYRaw = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const contentY = useSpring(contentYRaw, { stiffness: 120, damping: 24, mass: 0.4 });
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  const entrance = (delay: number, y = 28) => ({
    initial: reduceMotion ? false : ({ opacity: 0, y } as const),
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <section
      ref={sectionRef}
      aria-label="Presentación"
      className="relative isolate flex min-h-screen items-center overflow-hidden bg-navy"
    >
      {/* Fondo fotográfico con parallax + velo lateral */}
      <motion.img
        src={hero.image}
        alt=""
        aria-hidden="true"
        style={reduceMotion ? undefined : { scale: imageScale, y: imageY }}
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 h-full w-full object-cover object-[70%_center]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, #071634 0%, rgba(10,31,68,0.94) 28%, rgba(10,31,68,0.55) 55%, rgba(10,31,68,0.08) 82%, rgba(10,31,68,0) 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-36"
        style={{
          background: "linear-gradient(to top, rgba(7,22,52,0.7), rgba(7,22,52,0))",
        }}
      />

      <motion.div
        style={reduceMotion ? undefined : { y: contentY, opacity: contentOpacity }}
        className="relative z-10 mx-auto w-full max-w-[1280px] px-5 pb-28 pt-36 sm:px-8"
      >
        <div className="max-w-3xl">
          <motion.div {...entrance(0, 20)}>
            <div className="mb-6 inline-flex items-center gap-3">
              <span className="h-px w-8 bg-brass" aria-hidden="true" />
              <span className="text-sm font-semibold uppercase tracking-widest text-brass-light">
                {hero.eyebrow}
              </span>
            </div>
          </motion.div>

          <motion.div {...entrance(0.1)}>
            <h1 className="font-display text-4xl leading-tight text-white sm:text-5xl lg:text-6xl">
              {hero.titleStart}
              <span className="text-brass-gradient">{hero.titleAccent}</span>
              {hero.titleEnd}
            </h1>
          </motion.div>

          <motion.div {...entrance(0.2)}>
            <p className="mt-6 max-w-2xl text-lg text-ivory/80 md:text-xl">
              {hero.subtitle}
              <span className="font-semibold text-brass-light">{hero.subtitleAccent}</span>.
            </p>
          </motion.div>

          <motion.div {...entrance(0.3)}>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <motion.a
                href={hero.ctaPrimary.href}
                whileHover={reduceMotion ? undefined : { y: -3, scale: 1.03 }}
                whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                transition={ctaSpring}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brass px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-brass/30 transition-[filter] hover:brightness-105"
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  calculate
                </span>
                {hero.ctaPrimary.label}
              </motion.a>
              <motion.a
                href={hero.ctaSecondary.href}
                whileHover={reduceMotion ? undefined : { y: -3, scale: 1.03 }}
                whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                transition={ctaSpring}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/40 bg-white/5 px-8 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:border-brass hover:text-brass-light"
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  event
                </span>
                {hero.ctaSecondary.label}
              </motion.a>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Indicador de scroll */}
      <motion.a
        href="#creditos"
        aria-label="Bajar al contenido"
        style={reduceMotion ? undefined : { opacity: contentOpacity }}
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-ivory/70 transition-colors hover:text-brass-light"
      >
        <motion.span
          animate={reduceMotion ? undefined : { y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="material-symbols-outlined block text-3xl"
          aria-hidden="true"
        >
          keyboard_arrow_down
        </motion.span>
      </motion.a>
    </section>
  );
}
