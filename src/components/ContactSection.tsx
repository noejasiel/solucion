import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Reveal from "./Reveal.tsx";
import { contactChannels, contactEmail, serviceOptions } from "../data/content.ts";

interface ContactFormData {
  name: string;
  amount: string;
  city: string;
  phone: string;
  email: string;
  service: string;
  message: string;
}

const initialForm: ContactFormData = {
  name: "",
  amount: "",
  city: "",
  phone: "",
  email: "",
  service: serviceOptions[0],
  message: "",
};

const EMAIL_HREF = `mailto:${contactEmail}`;

const inputClass =
  "w-full rounded-lg border border-navy/15 bg-white px-4 py-3 text-ink placeholder:text-muted/60 transition focus:border-brass focus:outline-none focus:ring-2 focus:ring-brass/30";

/**
 * Sección de contacto — tarjeta dividida: panel navy con canales de atención
 * sobre fotografía fundida y formulario blanco que redacta el correo de solicitud.
 */
export default function ContactSection() {
  const [form, setForm] = useState<ContactFormData>(initialForm);
  const [sent, setSent] = useState<boolean>(false);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSent(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const subject = `Solicitud de asesoría — ${form.service}`;
    const body = [
      `Nombre: ${form.name}`,
      `Cantidad que necesita: ${form.amount}`,
      `Ciudad: ${form.city}`,
      `Teléfono: ${form.phone}`,
      `Correo: ${form.email}`,
      `Servicio de interés: ${form.service}`,
      "",
      form.message,
    ].join("\n");
    window.location.href = `${EMAIL_HREF}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  return (
    <section id="contacto" className="bg-ivory py-16 md:py-24">
      <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-8">
        <Reveal>
          <div className="grid overflow-hidden rounded-3xl border border-brass/20 shadow-lifted lg:grid-cols-[0.95fr_1.05fr]">
            {/* Panel de canales */}
            <div className="relative isolate overflow-hidden bg-gradient-to-br from-navy to-navy-soft p-8 text-ivory/80 md:p-12">
              <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 bg-[url('/photos/contact-bg.jpg')] bg-cover bg-center opacity-15 mix-blend-overlay"
              />
              <img
                src="/brand/logo-light.png"
                alt=""
                aria-hidden="true"
                className="absolute -bottom-14 -right-12 -z-10 w-56 opacity-10"
              />
              <div className="inline-flex items-center gap-3">
                <span className="h-px w-8 bg-brass" aria-hidden="true" />
                <span className="text-sm font-semibold uppercase tracking-widest text-brass">
                  Contacto
                </span>
              </div>
              <h2 className="mt-5 font-display text-3xl text-white md:text-4xl lg:text-5xl">
                Tu crédito está a un <span className="text-brass-gradient">clic</span>
              </h2>
              <p className="mt-5 text-ivory/75">
                Completa tus datos y un asesor revisará tu caso para ayudarte a elegir el camino
                financiero adecuado.
              </p>

              <ul className="mt-10 space-y-6">
                {contactChannels.map((channel) => {
                  const valueClass = channel.value.includes("@") ? "break-all" : "";

                  return (
                    <li key={channel.label} className="flex items-start gap-4">
                      <span
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brass/15 text-brass-light"
                        aria-hidden="true"
                      >
                        <span className="material-symbols-outlined">{channel.icon}</span>
                      </span>
                      <div className="text-sm">
                        <p className="text-xs uppercase tracking-wider text-ivory/50">
                          {channel.label}
                        </p>
                        {channel.href ? (
                          <a
                            href={channel.href}
                            className={`text-white transition-colors duration-300 hover:text-brass-light ${valueClass}`.trim()}
                            {...(channel.href.startsWith("https://")
                              ? { target: "_blank", rel: "noopener noreferrer" }
                              : {})}
                          >
                            {channel.value}
                          </a>
                        ) : (
                          <span className={`text-white ${valueClass}`.trim()}>{channel.value}</span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="bg-white p-8 md:p-12">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="contacto-nombre" className="mb-2 block text-sm font-semibold text-navy">
                    Nombre completo
                  </label>
                  <input
                    id="contacto-nombre"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Tu nombre completo"
                    value={form.name}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="contacto-cantidad" className="mb-2 block text-sm font-semibold text-navy">
                    Cantidad que necesitas
                  </label>
                  <input
                    id="contacto-cantidad"
                    name="amount"
                    type="text"
                    required
                    inputMode="numeric"
                    placeholder="Ej. $250,000"
                    value={form.amount}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="contacto-ciudad" className="mb-2 block text-sm font-semibold text-navy">
                    Ciudad
                  </label>
                  <input
                    id="contacto-ciudad"
                    name="city"
                    type="text"
                    required
                    autoComplete="address-level2"
                    placeholder="Tu ciudad"
                    value={form.city}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="contacto-telefono" className="mb-2 block text-sm font-semibold text-navy">
                    Teléfono
                  </label>
                  <input
                    id="contacto-telefono"
                    name="phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    placeholder="10 dígitos"
                    value={form.phone}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="contacto-correo" className="mb-2 block text-sm font-semibold text-navy">
                    Correo electrónico
                  </label>
                  <input
                    id="contacto-correo"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="tucorreo@ejemplo.com"
                    value={form.email}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="contacto-servicio" className="mb-2 block text-sm font-semibold text-navy">
                    Servicio de interés
                  </label>
                  <select
                    id="contacto-servicio"
                    name="service"
                    value={form.service}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    {serviceOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-5">
                <label htmlFor="contacto-mensaje" className="mb-2 block text-sm font-semibold text-navy">
                  Mensaje
                </label>
                <textarea
                  id="contacto-mensaje"
                  name="message"
                  required
                  rows={4}
                  placeholder="Cuéntanos brevemente tu situación u objetivo…"
                  value={form.message}
                  onChange={handleChange}
                  className={`${inputClass} resize-y`}
                />
              </div>

              <button
                type="submit"
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-navy py-4 text-sm font-semibold text-white transition hover:bg-navy-soft"
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  send
                </span>
                Enviar solicitud
              </button>

              <p aria-live="polite" role="status" className="mt-4 text-center text-xs text-muted">
                {sent
                  ? "Se abrió tu aplicación de correo con la solicitud lista para enviar."
                  : "Al enviar este formulario aceptas ser contactado para recibir información sobre los servicios."}
              </p>
            </form>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
