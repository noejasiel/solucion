import Reveal from "./Reveal.tsx";
import { testimonials } from "../data/content.ts";
import type { Testimonial } from "../data/content.ts";

const STAR_COUNT = 5;

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <article className="group relative flex h-full flex-col justify-between rounded-2xl border border-brass/20 bg-gradient-to-b from-white via-ivory/40 to-white p-8 shadow-ambient transition-all duration-300 hover:-translate-y-1 hover:border-brass/50 hover:shadow-lifted">
      <div>
        <div className="flex items-center justify-between gap-2 mb-6">
          <div className="flex items-center gap-3.5">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-navy text-brass font-bold text-sm ring-2 ring-brass/40 shadow-sm"
              aria-hidden="true"
            >
              {testimonial.initials}
            </div>
            <div>
              <p className="text-sm font-bold text-navy">{testimonial.name}</p>
              <p className="text-xs text-muted">{testimonial.role}</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-brass/10 px-2.5 py-0.5 text-[10px] font-semibold text-navy border border-brass/30">
            <span className="material-symbols-outlined text-xs text-brass">verified</span>
            Verificado
          </span>
        </div>

        <div
          className="mb-4 flex items-center gap-0.5 text-brass"
          role="img"
          aria-label="5 de 5 estrellas"
        >
          {Array.from({ length: STAR_COUNT }, (_, star) => (
            <span
              key={star}
              className="material-symbols-outlined text-base"
              aria-hidden="true"
            >
              star
            </span>
          ))}
        </div>

        <blockquote className="text-sm leading-relaxed text-ink/85 italic">
          “{testimonial.quote}”
        </blockquote>
      </div>

      <div className="mt-6 flex items-center gap-2 border-t border-navy/5 pt-4 text-xs text-muted">
        <span className="material-symbols-outlined text-sm text-brass">recommend</span>
        <span>Recomendación respaldada</span>
      </div>
    </article>
  );
}

export default function Testimonials() {
  return (
    <section id="testimonios" className="bg-white py-16 md:py-24">
      <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-8">
        <Reveal className="text-center">
          <div className="inline-flex items-center gap-3">
            <span
              className="material-symbols-outlined text-base text-brass"
              aria-hidden="true"
            >
              star
            </span>
            <span className="text-sm font-semibold uppercase tracking-widest text-brass">
              Casos de Éxito
            </span>
            <span
              className="material-symbols-outlined text-base text-brass"
              aria-hidden="true"
            >
              star
            </span>
          </div>
          <h2 className="mt-4 font-display text-3xl text-navy md:text-5xl">
            Confianza que se traduce en{" "}
            <span className="text-brass-gradient">resultados</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted">
            Historias representativas de clientes que buscaron capital,
            consolidación o crecimiento.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, i) => (
            <Reveal key={testimonial.name} delay={i * 0.12}>
              <TestimonialCard testimonial={testimonial} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
