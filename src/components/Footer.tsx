import Reveal from "./Reveal.tsx";
import { brand, contactChannels, footer } from "../data/content.ts";

/**
 * Footer extendido estilo Stitch: navy profundo con filo superior de latón,
 * tres columnas (marca, navegación, contacto) y barra inferior de copyright.
 */
export default function Footer() {
  return (
    <footer className="bg-navy border-t-4 border-brass text-ivory/70">
      <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-8 py-14">
        <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr_1fr]">
          {/* Marca */}
          <Reveal>
            <div className="flex items-center gap-3">
              <img
                src={brand.logoLight}
                alt=""
                aria-hidden="true"
                className="h-14 w-14 object-contain"
              />
              <span className="font-display text-xl font-bold text-brass">{brand.name}</span>
            </div>
            <p className="mt-4 max-w-sm text-sm">{footer.description}</p>
          </Reveal>

          {/* Navegación */}
          <Reveal delay={0.12}>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Navegación
            </h3>
            <ul className="space-y-3">
              {footer.navigation.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm transition-colors duration-300 hover:text-brass"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Contacto */}
          <Reveal delay={0.24}>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Contacto
            </h3>
            <ul className="space-y-4">
              {contactChannels.map((channel) => {
                const isEmail = channel.value.includes("@");
                const valueClass = isEmail ? "break-all" : undefined;

                return (
                  <li key={channel.label} className="text-sm">
                    <p className="text-xs uppercase tracking-wider text-ivory/40">
                      {channel.label}
                    </p>
                    {channel.href ? (
                      <a
                        href={channel.href}
                        className={`transition-colors duration-300 hover:text-brass ${valueClass ?? ""}`.trim()}
                        {...(channel.href.startsWith("https://")
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                      >
                        {channel.value}
                      </a>
                    ) : (
                      <span className={valueClass}>{channel.value}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </Reveal>
        </div>
      </div>

      {/* Barra inferior */}
      <div className="border-t border-white/10">
        <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-8 py-6 text-center text-sm">
          {footer.copyright}
        </div>
      </div>
    </footer>
  );
}
