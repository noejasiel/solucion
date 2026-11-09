import { motion, useReducedMotion } from "framer-motion";
import Reveal from "./Reveal.tsx";
import { trustItems } from "../data/content.ts";

/**
 * Barra de confianza — tres pilares de servicio sobre fondo blanco,
 * separados por líneas fantasma, fiel al Trust Bar del diseño Stitch.
 */
const trustBadges = [
  "Condiciones claras desde el inicio",
  "Acompañamiento especializado",
  "Instituciones financieras formales",
];

export default function TrustBar() {
  const reduceMotion = useReducedMotion();

  return (
    <section aria-label="Pilares de servicio" className="bg-white py-14 border-y border-navy/5">
      <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {trustItems.map((item, i) => (
            <Reveal
              key={item.title}
              delay={i * 0.1}
              className="h-full"
            >
              <article className="group relative flex h-full flex-col items-center justify-between rounded-2xl border border-brass/20 bg-gradient-to-b from-white via-ivory/40 to-white p-8 text-center shadow-ambient transition-all duration-300 hover:-translate-y-1 hover:border-brass/50 hover:shadow-lifted">
                <div className="flex flex-col items-center">
                  <motion.div
                    whileHover={reduceMotion ? undefined : { scale: 1.1, rotate: -3 }}
                    transition={{ type: "spring", stiffness: 320, damping: 18 }}
                    className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-navy text-brass shadow-md ring-4 ring-brass/20 transition-all duration-300 group-hover:bg-brass group-hover:text-navy group-hover:ring-navy/10"
                  >
                    <span aria-hidden="true" className="material-symbols-outlined text-3xl">
                      {item.icon}
                    </span>
                  </motion.div>
                  <h3 className="mb-2 font-display text-lg font-bold text-navy">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted">{item.description}</p>
                </div>

                <div className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-brass/10 px-3 py-1 text-[11px] font-semibold text-brass border border-brass/25">
                  <span className="material-symbols-outlined text-xs">verified</span>
                  <span>{trustBadges[i]}</span>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
