import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { brand, navLinks } from "../data/content.ts";

/**
 * Barra de navegación fija — transparente sobre el hero navy y sólida
 * (blanca con blur) al hacer scroll. Incluye menú móvil animado.
 */
export default function Navbar() {
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = scrolled || menuOpen;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        solid ? "bg-white/95 shadow-ambient backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-20 w-full max-w-[1280px] items-center justify-between px-5 sm:px-8">
        {/* Marca */}
        <a href="#inicio" className="flex items-center gap-3" aria-label={brand.name}>
          <img
            src={solid ? brand.logoPrimary : brand.logoLight}
            alt=""
            aria-hidden="true"
            className="h-12 w-12 object-contain"
          />
          <span className="leading-tight">
            <span
              className={`block font-display text-lg font-bold transition-colors duration-300 ${
                solid ? "text-navy" : "text-white"
              }`}
            >
              {brand.name}
            </span>
            <span
              className={`block text-[11px] uppercase tracking-widest transition-colors duration-300 ${
                solid ? "text-brass" : "text-brass-light"
              }`}
            >
              {brand.tagline}
            </span>
          </span>
        </a>

        {/* Navegación de escritorio */}
        <nav aria-label="Principal" className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors duration-300 hover:text-brass ${
                solid ? "text-navy" : "text-ivory/90"
              }`}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contacto"
            className="inline-flex items-center gap-2 rounded-lg bg-brass px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brass/30 transition hover:brightness-95"
          >
            <span className="material-symbols-outlined text-base" aria-hidden="true">
              support_agent
            </span>
            Contacto
          </a>
        </nav>

        {/* Botón menú móvil */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="menu-movil"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          className={`flex h-11 w-11 items-center justify-center rounded-lg transition-colors duration-300 lg:hidden ${
            solid ? "text-navy hover:bg-navy/5" : "text-white hover:bg-white/10"
          }`}
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            {menuOpen ? "close" : "menu"}
          </span>
        </button>
      </div>

      {/* Panel móvil */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            id="menu-movil"
            aria-label="Principal móvil"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden border-t border-navy/10 bg-white lg:hidden"
          >
            <ul className="space-y-1 px-5 py-4 sm:px-8">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-3 py-3 text-sm font-medium text-navy transition-colors hover:bg-ivory hover:text-brass"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li className="pt-2">
                <a
                  href="#contacto"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-lg bg-brass px-5 py-3 text-sm font-semibold text-white transition hover:brightness-95"
                >
                  <span className="material-symbols-outlined text-base" aria-hidden="true">
                    support_agent
                  </span>
                  Contacto
                </a>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
