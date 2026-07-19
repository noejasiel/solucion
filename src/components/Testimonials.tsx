import Reveal from "./Reveal.tsx";
import { testimonials } from "../data/content.ts";
import type { Testimonial } from "../data/content.ts";

const STAR_COUNT = 5;

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <article className="relative rounded-2xl border border-brass/10 bg-ivory p-8 shadow-ambient transition-all duration-300 hover:-translate-y-1 hover:shadow-lifted">
      <span
        className="material-symbols-outlined absolute top-6 right-6 text-6xl text-brass/20"
        aria-hidden="true"
      >
        format_quote
      </span>

      <div className="mb-6 flex items-center gap-4">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-brass bg-white font-bold text-navy"
          aria-hidden="true"
        >
          {testimonial.initials}
        </div>
        <div>
          <p className="text-sm font-bold text-navy">{testimonial.name}</p>
          <p className="text-xs text-muted">{testimonial.role}</p>
        </div>
      </div>

      <div
        className="mb-4 flex items-center text-brass"
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

      <blockquote className="text-sm italic leading-relaxed text-ink/80">
        “{testimonial.quote}”
      </blockquote>
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
