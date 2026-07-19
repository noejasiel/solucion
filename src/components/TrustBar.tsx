import { motion, useReducedMotion } from "framer-motion";
import Reveal from "./Reveal.tsx";
import { trustItems } from "../data/content.ts";

/**
 * Barra de confianza — tres pilares de servicio sobre fondo blanco,
 * separados por líneas fantasma, fiel al Trust Bar del diseño Stitch.
 */
export default function TrustBar() {
  const reduceMotion = useReducedMotion();

  return (
    <section aria-label="Pilares de servicio" className="bg-white py-12 border-y border-navy/5">
      <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-8">
        <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-navy/10">
          {trustItems.map((item, i) => (
            <Reveal
              key={item.title}
              delay={i * 0.12}
              className="group flex flex-col items-center text-center p-6"
            >
              <motion.div
                whileHover={reduceMotion ? undefined : { scale: 1.12, rotate: -4 }}
                transition={{ type: "spring", stiffness: 320, damping: 18 }}
                className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-ivory transition-colors duration-300 group-hover:bg-brass/10"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-3xl text-brass">
                  {item.icon}
                </span>
              </motion.div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-widest text-navy">
                {item.title}
              </h3>
              <p className="text-muted">{item.description}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
