import Reveal from "./Reveal.tsx";
import { location } from "../data/content.ts";

interface InfoCard {
  icon: string;
  title: string;
  lines: readonly string[];
}

/**
 * Ubicación — tarjetas de dirección y horarios junto al mapa embebido
 * de las oficinas en Ciudad de México.
 */
export default function LocationSection() {
  const cards: InfoCard[] = [
    {
      icon: "location_on",
      title: "Dirección",
      lines: location.addressLines,
    },
    {
      icon: "schedule",
      title: "Horarios de atención",
      lines: location.hours,
    },
  ];

  return (
    <section id="ubicacion" className="bg-white py-16 md:py-24">
      <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-8">
        <Reveal>
          <span className="inline-flex items-center gap-3">
            <span className="h-px w-8 bg-brass" aria-hidden="true" />
            <span className="text-sm font-semibold uppercase tracking-widest text-brass">
              Ubicación
            </span>
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold text-navy md:text-5xl">
            Oficinas en Ciudad de México
          </h2>
        </Reveal>

        <div className="mt-12 grid items-stretch gap-8 lg:grid-cols-2">
          <Reveal className="flex flex-col space-y-6">
            {cards.map((card) => (
              <div
                key={card.title}
                className="flex-1 rounded-2xl border border-navy/10 bg-ivory p-8"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full border border-brass/20 bg-white">
                  <span
                    className="material-symbols-outlined text-brass"
                    aria-hidden="true"
                  >
                    {card.icon}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold text-navy">
                  {card.title}
                </h3>
                <div className="mt-3 space-y-1">
                  {card.lines.map((line) => (
                    <p key={line} className="text-muted">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </Reveal>

          <Reveal delay={0.15} className="h-full">
            <iframe
              src={location.mapEmbedUrl}
              title="Mapa de ubicación de Solución créditicia"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              className="h-full min-h-[380px] w-full rounded-2xl border border-brass/20 shadow-ambient"
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
