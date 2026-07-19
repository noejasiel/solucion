import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Reveal from "./Reveal.tsx";
import { brand, credits } from "../data/content.ts";
import type { CreditProduct } from "../data/content.ts";

interface CreditCardProps {
  credit: CreditProduct;
}

/** Elevación con física de spring para las tarjetas del bento. */
const cardLift = {
  whileHover: { y: -8 },
  transition: { type: "spring", stiffness: 300, damping: 20 },
} as const;

/**
 * Fotografía de fondo con parallax al hacer scroll (la imagen viaja dentro
 * de su marco) + zoom suave al hover. Sobredimensionada verticalmente para
 * que el desplazamiento nunca descubra bordes.
 */
function CardParallaxPhoto({ src }: { src: string }) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-7%", "7%"]);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <motion.div
        style={reduceMotion ? undefined : { y }}
        className="absolute inset-x-0 -inset-y-[12%]"
      >
        <img
          src={src}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </motion.div>
    </div>
  );
}

/** Lista de beneficios con check dorado, compartida entre variantes. */
function BulletList({
  bullets,
  textClassName,
}: {
  bullets: string[];
  textClassName: string;
}) {
  return (
    <ul className="mt-4 space-y-2">
      {bullets.map((bullet) => (
        <li key={bullet} className="flex items-start gap-2">
          <span
            className="material-symbols-outlined mt-0.5 text-base text-brass"
            aria-hidden="true"
          >
            check_circle
          </span>
          <span className={textClassName}>{bullet}</span>
        </li>
      ))}
    </ul>
  );
}

/** Tarjeta protagonista del bento: imagen a sangre + velo navy. */
function FeaturedCreditCard({ credit }: CreditCardProps) {
  return (
    <article className="group relative h-full min-h-[400px] cursor-default overflow-hidden rounded-2xl">
      <CardParallaxPhoto src={credit.image} />
      <div
        className="absolute inset-0 bg-gradient-to-t from-navy via-navy/80 to-navy/20"
        aria-hidden="true"
      />
      <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
        <span
          className="material-symbols-outlined mb-4 text-3xl text-brass"
          aria-hidden="true"
        >
          {credit.icon}
        </span>
        <h3 className="mb-3 font-display text-2xl md:text-3xl">{credit.title}</h3>
        <p className="max-w-lg text-ivory/90">{credit.description}</p>
        <BulletList bullets={credit.bullets} textClassName="text-sm text-ivory/80" />
        <a
          href="#contacto"
          className="mt-6 inline-flex items-center gap-2 self-start font-semibold text-brass transition-colors hover:text-brass-light"
        >
          {credit.cta}
          <span
            className="material-symbols-outlined text-base transition-transform duration-300 group-hover:translate-x-2"
            aria-hidden="true"
          >
            arrow_forward
          </span>
        </a>
      </div>
    </article>
  );
}

/** Tarjeta clara: fotografía sutil bajo velo blanco, texto navy intacto. */
function LightCreditCard({ credit }: CreditCardProps) {
  return (
    <motion.article
      {...cardLift}
      className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-navy/5 bg-white p-8 shadow-ambient transition-[border-color,box-shadow] duration-300 hover:border-brass/30 hover:shadow-lifted"
    >
      <CardParallaxPhoto src={credit.image} />
      <div
        className="absolute inset-0 bg-gradient-to-b from-white/97 via-white/90 to-white/70"
        aria-hidden="true"
      />
      <div className="relative z-10">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-brass/20 bg-ivory">
          <span className="material-symbols-outlined text-brass" aria-hidden="true">
            {credit.icon}
          </span>
        </div>
        <h3 className="mb-2 font-display text-xl text-navy">{credit.title}</h3>
        <p className="text-sm text-muted">{credit.description}</p>
        <BulletList bullets={credit.bullets} textClassName="text-sm text-ink/70" />
      </div>
      <div className="relative z-10 mt-8 flex items-center text-sm font-semibold text-brass">
        <a
          href="#contacto"
          className="border-b border-brass/30 pb-1 transition-colors hover:border-brass group-hover:border-brass"
        >
          {credit.cta}
        </a>
      </div>
    </motion.article>
  );
}

/** Tarjeta oscura: fotografía bajo velo navy con halo brass difuminado. */
function DarkCreditCard({ credit }: CreditCardProps) {
  return (
    <motion.article
      {...cardLift}
      className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-brass/30 bg-navy p-8 text-white shadow-ambient transition-[box-shadow] duration-300 hover:shadow-lifted"
    >
      <CardParallaxPhoto src={credit.image} />
      <div
        className="absolute inset-0 bg-gradient-to-t from-navy via-navy/85 to-navy/55"
        aria-hidden="true"
      />
      <div
        className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brass/20 blur-2xl"
        aria-hidden="true"
      />
      <div className="relative z-10">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-brass/50 bg-white/10">
          <span className="material-symbols-outlined text-brass" aria-hidden="true">
            {credit.icon}
          </span>
        </div>
        <h3 className="mb-2 font-display text-xl text-white">{credit.title}</h3>
        <p className="text-sm text-ivory/70">{credit.description}</p>
        <BulletList bullets={credit.bullets} textClassName="text-sm text-ivory/75" />
      </div>
      <div className="relative z-10 mt-8 flex items-center text-sm font-semibold text-brass">
        <a
          href="#contacto"
          className="border-b border-brass/50 pb-1 transition-colors hover:border-brass group-hover:border-brass"
        >
          {credit.cta}
        </a>
      </div>
    </motion.article>
  );
}

function renderCreditCard(credit: CreditProduct) {
  switch (credit.variant) {
    case "featured":
      return <FeaturedCreditCard credit={credit} />;
    case "dark":
      return <DarkCreditCard credit={credit} />;
    case "light":
      return <LightCreditCard credit={credit} />;
  }
}

/**
 * Bento grid "Soluciones de Crédito" — 7 productos reales de content.ts
 * más una tarjeta de orientación, siguiendo el lenguaje visual Stitch
 * "Sovereign Heritage".
 */
export default function CreditSolutions() {
  return (
    <section id="creditos" className="bg-ivory py-16 md:py-24">
      <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-8">
        <Reveal>
          <div className="text-center">
            <span className="inline-flex items-center gap-3">
              <span className="h-px w-8 bg-brass" aria-hidden="true" />
              <span className="text-sm font-semibold uppercase tracking-widest text-brass">
                Productos financieros
              </span>
              <span className="h-px w-8 bg-brass" aria-hidden="true" />
            </span>
            <h2 className="mt-4 font-display text-3xl text-navy md:text-5xl">
              Soluciones de <span className="text-brass-gradient">Crédito</span>
            </h2>
            <div className="mx-auto mt-4 h-1 w-16 bg-brass" aria-hidden="true" />
            <p className="mx-auto mt-6 max-w-2xl text-muted">
              Opciones para personas, negocios, vivienda, empresas, PyMES y sector
              agropecuario, con orientación para elegir el crédito que mejor se
              ajuste a tu perfil.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-12">
          {credits.map((credit, index) => (
            <Reveal
              key={credit.id}
              delay={index * 0.06}
              className={
                credit.variant === "featured" ? "md:col-span-8" : "md:col-span-4"
              }
            >
              {renderCreditCard(credit)}
            </Reveal>
          ))}

          <Reveal delay={credits.length * 0.06} className="md:col-span-4">
            <div className="flex h-full flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-brass/40 bg-white/60 p-8 text-center">
              <img
                src={brand.logoPrimary}
                alt=""
                aria-hidden="true"
                className="w-16 opacity-90"
              />
              <p className="font-display text-xl text-navy">¿No sabes cuál elegir?</p>
              <span className="text-sm text-muted">
                Un asesor revisa tu caso sin costo.
              </span>
              <a
                href="#contacto"
                className="rounded-lg bg-navy px-6 py-3 text-sm font-semibold text-white transition hover:bg-navy-soft"
              >
                Hablar con un asesor
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
