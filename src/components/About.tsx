import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Reveal from "./Reveal.tsx";
import { about, brand } from "../data/content.ts";

/**
 * Sección "Sobre Nosotros" — estilo Sovereign Heritage:
 * visual editorial con parallax sutil, badge de vidrio y checklist escalonada.
 */
export default function About() {
  const reduceMotion = useReducedMotion();
  const visualRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: visualRef,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <section id="sobre-nosotros" className="bg-white py-16 md:py-24">
      <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-8">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Visual izquierdo */}
          <Reveal className="order-2 md:order-1">
            <div
              ref={visualRef}
              className="relative rounded-3xl overflow-hidden shadow-lifted h-[480px] lg:h-[560px]"
            >
              <motion.img
                src={about.image}
                alt="Asesoría a dueños de negocio"
                style={reduceMotion ? undefined : { y: imageY, scale: 1.22 }}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div
                className="absolute inset-0 bg-gradient-to-tr from-navy/80 via-navy/30 to-transparent"
                aria-hidden="true"
              />
              <img
                src={brand.logoPrimary}
                alt=""
                aria-hidden="true"
                className="w-14 absolute top-6 right-6 drop-shadow-lg"
              />
              <div className="absolute bottom-8 left-8 right-8 bg-white/95 backdrop-blur-md p-6 rounded-2xl border border-brass/20">
                <p className="font-display text-navy text-xl font-semibold mb-1">
                  {about.badge.title}
                </p>
                <p className="text-sm text-muted">{about.badge.subtitle}</p>
              </div>
            </div>
          </Reveal>

          {/* Contenido derecho */}
          <div className="order-1 md:order-2">
            <Reveal delay={0.05}>
              <div className="inline-flex items-center gap-3 mb-6">
                <span className="w-8 h-px bg-brass" aria-hidden="true" />
                <span className="uppercase tracking-widest text-brass text-sm font-semibold">
                  {about.eyebrow}
                </span>
              </div>
              <h2 className="font-display text-navy text-3xl md:text-5xl leading-tight mb-6">
                {about.titleStart}
                <span className="text-brass-gradient">{about.titleAccent}</span>
              </h2>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="space-y-6 mb-8">
                {about.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="text-muted text-lg">
                    {paragraph}
                  </p>
                ))}
              </div>
            </Reveal>

            <ul className="space-y-4 mb-10">
              {about.checklist.map((item, index) => (
                <li key={item.text}>
                  <Reveal
                    delay={0.15 + index * 0.08}
                    y={16}
                    className="flex items-start gap-3"
                  >
                    <span
                      className="material-symbols-outlined text-brass mt-0.5"
                      aria-hidden="true"
                    >
                      check_circle
                    </span>
                    <span className="text-ink">{item.text}</span>
                  </Reveal>
                </li>
              ))}
            </ul>

            <Reveal delay={0.35}>
              <a
                href={about.cta.href}
                className="bg-navy text-white px-8 py-4 rounded-lg font-semibold text-sm inline-flex items-center gap-2 hover:bg-navy-soft transition"
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  support_agent
                </span>
                {about.cta.label}
              </a>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
