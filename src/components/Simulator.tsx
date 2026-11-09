import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useSpring, useTransform } from "framer-motion";
import Reveal from "./Reveal.tsx";
import QuoteDownload from "./QuoteDownload.tsx";
import QuoteIcon from "./QuoteIcon.tsx";
import { brand, serviceOptions, simulatorConfig } from "../data/content.ts";
import { createCreditQuote, resolveCreditTier } from "../lib/credit.ts";

export const SLIDER_AMOUNTS = [
  // Tramo 1: 10k a 40k (pasos de 10k) - 25% (1 a 3 años)
  10_000, 20_000, 30_000, 40_000,
  // Tramo 2: 50k a 240k - 15% (1 a 6 años)
  50_000, 60_000, 70_000, 80_000, 90_000, 100_000,
  120_000, 140_000, 160_000, 180_000, 200_000,
  // Tramo 3: 250k a 990k - 8% (1 a 6 años)
  250_000, 300_000, 350_000, 400_000, 450_000, 500_000,
  600_000, 700_000, 800_000, 900_000, 990_000,
  // Tramo 4: 1M a 6M - 3% (1 a 20 años)
  1_000_000, 1_500_000, 2_000_000, 2_500_000, 3_000_000, 3_500_000,
  4_000_000, 4_500_000, 5_000_000, 5_500_000, 6_000_000,
];

const money = new Intl.NumberFormat("es-MX", {
  style: "currency", currency: "MXN", currencyDisplay: "narrowSymbol", minimumFractionDigits: 2, maximumFractionDigits: 2,
});
const wholeMoney = new Intl.NumberFormat("es-MX", {
  style: "currency", currency: "MXN", currencyDisplay: "narrowSymbol", maximumFractionDigits: 0,
});

const serviceOptionsMeta = [
  { name: "Crédito Personal", short: "Personal", icon: "person", badge: "Ágil", desc: "Liquidez inmediata para proyectos y metas personales" },
  { name: "Crédito a Negocio", short: "A Negocio", icon: "storefront", badge: "Popular", desc: "Capital de trabajo e inversión comercial" },
  { name: "Crédito Hipotecario", short: "Hipotecario", icon: "real_estate_agent", desc: "Adquisición de vivienda o garantía inmueble" },
  { name: "Crédito Empresarial", short: "Empresarial", icon: "domain", badge: "Mayor monto", desc: "Expansión, maquinaria y corporativos" },
  { name: "Crédito PyME", short: "PyME", icon: "factory", desc: "Financiamiento para pequeñas y medianas empresas" },
  { name: "Crédito Agrícola", short: "Agrícola", icon: "agriculture", desc: "Líneas para agricultura, ganadería y campo" },
  { name: "Cuenta Corriente", short: "Cta. Corriente", icon: "credit_card", desc: "Línea revolvente para liquidez diaria" },
];



export default function Simulator() {
  const [service, setService] = useState(serviceOptions[0]);
  const [isExpanded, setIsExpanded] = useState(false);
  const activeMeta = serviceOptionsMeta.find((item) => item.name === service) || serviceOptionsMeta[0];
  const selectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isExpanded) return;
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isExpanded]);
  const [amount, setAmount] = useState(simulatorConfig.amountDefault);
  const [years, setYears] = useState(simulatorConfig.yearsDefault);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customInput, setCustomInput] = useState(simulatorConfig.amountDefault.toLocaleString("es-MX"));
  const [customError, setCustomError] = useState<string | null>(null);

  const tier = useMemo(() => resolveCreditTier(amount), [amount]);
  const rate = tier.rate;
  const maxYears = tier.maxYears;

  useEffect(() => {
    if (years > maxYears) {
      setYears(maxYears);
    }
  }, [maxYears, years]);

  const quote = useMemo(() => createCreditQuote({ amount, years, rate, service }), [amount, years, rate, service]);

  const sliderIndex = useMemo(() => {
    let closest = 0;
    let minDiff = Math.abs(SLIDER_AMOUNTS[0] - amount);
    for (let i = 1; i < SLIDER_AMOUNTS.length; i++) {
      const diff = Math.abs(SLIDER_AMOUNTS[i] - amount);
      if (diff < minDiff) {
        minDiff = diff;
        closest = i;
      }
    }
    return closest;
  }, [amount]);

  const sliderPercent = (sliderIndex / (SLIDER_AMOUNTS.length - 1)) * 100;

  function handleCustomInputApply() {
    const rawDigits = customInput.replace(/\D/g, "");
    if (!rawDigits) {
      setCustomError("Ingresa un monto en pesos.");
      return;
    }
    const parsed = parseInt(rawDigits, 10);
    if (parsed < 10_000) {
      setCustomError("El monto mínimo de financiamiento es de $10,000.");
      return;
    }
    if (parsed > 100_000_000) {
      setCustomError("El monto máximo es de $100,000,000.");
      return;
    }
    if (parsed % 10_000 !== 0) {
      const suggested = Math.round(parsed / 10_000) * 10_000;
      setCustomError(`Solo cantidades cerradas de 10 en 10 mil (ej. $${suggested.toLocaleString("es-MX")}).`);
      return;
    }
    setAmount(parsed);
    setCustomInput(parsed.toLocaleString("es-MX"));
    setCustomError(null);
  }

  const reduceMotion = useReducedMotion();
  const monthlySpring = useSpring(quote.monthlyPayment, { stiffness: 180, damping: 26, mass: 0.45 });
  useEffect(() => {
    if (reduceMotion) monthlySpring.jump(quote.monthlyPayment);
    else monthlySpring.set(quote.monthlyPayment);
  }, [quote.monthlyPayment, monthlySpring, reduceMotion]);
  const monthlyDisplay = useTransform(monthlySpring, (value) => money.format(value));

  return (
    <section id="simulador" className="relative overflow-hidden bg-navy py-16 md:py-24">
      <div aria-hidden="true" className="absolute right-0 top-0 h-full w-1/2 bg-[url('/photos/simulator-bg.jpg')] bg-cover opacity-10 mix-blend-overlay" />
      <img src={brand.logoLight} alt="" aria-hidden="true" className="pointer-events-none absolute -bottom-16 -left-16 w-72 select-none opacity-[0.06]" />
      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-5 sm:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brass-light">Simulador de crédito</p>
            <h2 className="mt-3 font-display text-3xl text-white md:text-5xl">Calcula tu financiamiento</h2>
            <div className="mx-auto mt-5 h-1 w-16 bg-brass" aria-hidden="true" />
            <p className="mt-6 text-ivory/80">Elige tu crédito, ajusta el monto y el plazo, y descarga tu cotización con la tabla completa de amortización.</p>
          </div>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="relative mx-auto mt-10 grid max-w-5xl rounded-2xl border border-brass/30 bg-white shadow-lifted md:grid-cols-[1.05fr_1fr]">
            <div className="space-y-7 p-6 sm:p-9 md:p-10 rounded-t-2xl md:rounded-t-none md:rounded-l-2xl">
              {/* Selector interactivo y compacto de Tipo de Crédito con Menú Flotante */}
              <div ref={selectorRef} className="relative z-30">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brass/20 text-brass text-[11px] font-bold ring-1 ring-brass/40">
                      1
                    </span>
                    <label id="simulador-tipo-label" className="text-sm font-bold text-navy tracking-tight">
                      Tipo de crédito
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsExpanded((prev) => !prev)}
                    aria-expanded={isExpanded}
                    aria-controls="simulador-grid-opciones"
                    className="group inline-flex items-center gap-1.5 rounded-full border border-brass/35 bg-brass/10 px-3 py-1 text-xs font-semibold text-brass transition hover:border-brass hover:bg-brass hover:text-navy cursor-pointer focus-visible:ring-2 focus-visible:ring-brass"
                  >
                    <span className="material-symbols-outlined text-sm transition-transform duration-200 group-hover:rotate-180">
                      swap_horiz
                    </span>
                    <span>{isExpanded ? "Cerrar opciones" : "Cambiar crédito"}</span>
                  </button>
                </div>

                {/* Tarjeta compacta del crédito actualmente seleccionado */}
                <div
                  onClick={() => setIsExpanded((prev) => !prev)}
                  className={`group mt-2.5 flex items-center justify-between gap-3 rounded-xl border bg-gradient-to-r from-ivory via-white to-ivory p-3.5 shadow-sm transition hover:shadow-md cursor-pointer ${isExpanded ? "border-brass ring-2 ring-brass/30" : "border-brass/35 hover:border-brass/70"
                    }`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setIsExpanded((prev) => !prev);
                    }
                  }}
                  aria-label={`Crédito seleccionado: ${activeMeta.name}. Haz clic para cambiar.`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy text-brass shadow-sm group-hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined text-2xl">{activeMeta.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-navy truncate">{activeMeta.name}</span>
                        {activeMeta.badge && (
                          <span className="rounded-full bg-brass/15 px-2 py-0.5 text-[10px] font-bold text-navy border border-brass/30 shrink-0">
                            {activeMeta.badge}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-muted truncate">{activeMeta.desc}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 rounded-lg bg-navy/5 px-2.5 py-1.5 text-xs font-semibold text-navy group-hover:bg-navy group-hover:text-white transition-colors">
                    <span className="hidden sm:inline text-[11px]">Cambiar</span>
                    <span
                      className={`material-symbols-outlined text-base transition-transform duration-200 ${isExpanded ? "rotate-180 text-brass" : ""
                        }`}
                    >
                      expand_more
                    </span>
                  </div>
                </div>

                {/* Menú flotante (Overlay / Popover que sale por encima sin mover la UI) */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      id="simulador-grid-opciones"
                      initial={{ opacity: 0, y: -6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.98 }}
                      transition={{ duration: reduceMotion ? 0 : 0.16, ease: "easeOut" }}
                      className="absolute left-0 right-0 top-full mt-2 z-50 max-h-[min(480px,calc(100vh-160px))] overflow-y-auto rounded-2xl border border-brass/50 bg-white/98 p-4 shadow-2xl backdrop-blur-xl ring-1 ring-navy/10"
                    >
                      <div className="mb-3 flex items-center justify-between border-b border-navy/10 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-base text-brass" aria-hidden="true">
                            verified
                          </span>
                          <span className="text-xs font-bold text-navy">Selecciona tu producto de crédito:</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsExpanded(false)}
                          className="rounded-full p-1 text-muted hover:bg-navy/10 hover:text-navy transition cursor-pointer"
                          aria-label="Cerrar opciones"
                        >
                          <span className="material-symbols-outlined text-base">close</span>
                        </button>
                      </div>

                      <div
                        role="radiogroup"
                        aria-label="Opciones de tipo de crédito"
                        className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5"
                      >
                        {serviceOptionsMeta.map((item) => {
                          const isSelected = service === item.name;
                          const isFullWidth = item.name === "Cuenta Corriente";
                          return (
                            <button
                              key={item.name}
                              type="button"
                              role="radio"
                              aria-checked={isSelected}
                              onClick={() => {
                                setService(item.name);
                                setIsExpanded(false);
                              }}
                              className={`group relative flex rounded-xl p-2.5 sm:p-3 text-left transition-all duration-150 cursor-pointer ${isFullWidth
                                  ? "col-span-2 sm:col-span-3 flex-row items-center justify-between gap-3"
                                  : "flex-col justify-between"
                                } ${isSelected
                                  ? "bg-navy text-white shadow-md shadow-navy/30 ring-2 ring-brass border border-brass scale-[1.01]"
                                  : "border border-navy/15 bg-ivory/60 text-navy hover:border-brass/60 hover:bg-white hover:shadow-sm"
                                }`}
                            >
                              {item.badge && !isFullWidth && (
                                <span
                                  className={`absolute -top-1.5 right-1.5 rounded-full px-1.5 py-0.5 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider ${isSelected
                                      ? "bg-brass text-navy shadow-sm"
                                      : "bg-brass/20 text-navy border border-brass/40"
                                    }`}
                                >
                                  {item.badge}
                                </span>
                              )}

                              {isFullWidth ? (
                                <>
                                  <div className="flex items-center gap-3 min-w-0">
                                    <span
                                      className={`material-symbols-outlined text-2xl transition-colors shrink-0 ${isSelected ? "text-brass" : "text-navy/70 group-hover:text-brass"
                                        }`}
                                      aria-hidden="true"
                                    >
                                      {item.icon}
                                    </span>
                                    <div className="min-w-0">
                                      <span
                                        className={`block text-xs font-bold leading-tight ${isSelected ? "text-white" : "text-navy"
                                          }`}
                                      >
                                        {item.name}
                                      </span>
                                      <span
                                        className={`mt-0.5 block text-[10px] leading-tight truncate ${isSelected ? "text-ivory/70" : "text-muted"
                                          }`}
                                      >
                                        {item.desc}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    {isSelected && (
                                      <span className="material-symbols-outlined text-base text-brass" aria-hidden="true">
                                        check_circle
                                      </span>
                                    )}
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="flex items-center justify-between gap-1">
                                    <span
                                      className={`material-symbols-outlined text-xl sm:text-2xl transition-colors ${isSelected ? "text-brass" : "text-navy/70 group-hover:text-brass"
                                        }`}
                                      aria-hidden="true"
                                    >
                                      {item.icon}
                                    </span>
                                    {isSelected && (
                                      <span
                                        className="material-symbols-outlined text-sm sm:text-base text-brass"
                                        aria-hidden="true"
                                      >
                                        check_circle
                                      </span>
                                    )}
                                  </div>

                                  <div className="mt-2">
                                    <span
                                      className={`block text-xs font-bold leading-tight ${isSelected ? "text-white" : "text-navy"
                                        }`}
                                    >
                                      {item.short}
                                    </span>
                                    <span
                                      className={`mt-0.5 block text-[10px] leading-tight truncate ${isSelected ? "text-ivory/70" : "text-muted"
                                        }`}
                                    >
                                      {item.name}
                                    </span>
                                  </div>
                                </>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-navy/10 pt-2.5 text-[11px] text-muted">
                        <span>💡 Haz clic en una opción para seleccionarla</span>
                        <button
                          type="button"
                          onClick={() => setIsExpanded(false)}
                          className="font-semibold text-brass hover:text-navy cursor-pointer"
                        >
                          Listo
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Select accesible para lectores de pantalla */}
                <select
                  id="simulador-tipo"
                  value={service}
                  onChange={(event) => setService(event.target.value)}
                  className="sr-only"
                  aria-label="Seleccionar tipo de crédito"
                >
                  {serviceOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              {/* Paso 2: Monto requerido con avance progresivo y modo personalizado */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-semibold text-navy">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brass/20 text-brass text-[11px] font-bold ring-1 ring-brass/40">
                      2
                    </span>
                    <label htmlFor="simulador-monto">Monto requerido</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomMode((prev) => !prev);
                        setCustomInput(amount.toLocaleString("es-MX"));
                        setCustomError(null);
                      }}
                      className={`group inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${isCustomMode || amount > 6_000_000
                          ? "border-navy bg-navy text-white shadow-sm"
                          : "border-brass/40 bg-brass/10 text-brass hover:border-brass hover:bg-brass hover:text-navy"
                        }`}
                      aria-expanded={isCustomMode}
                    >
                      <span className="material-symbols-outlined text-xs">
                        {isCustomMode ? "tune" : "edit"}
                      </span>
                      <span>{isCustomMode ? "Usar barra" : "Pon tu monto"}</span>
                    </button>
                    <span className="rounded-md bg-navy/5 px-3 py-1.5 text-base font-bold tabular-nums text-navy">
                      {wholeMoney.format(amount)}
                    </span>
                  </div>
                </div>

                {/* Slider no lineal con avance progresivo */}
                <div className="mt-4">
                  <input
                    id="simulador-monto"
                    type="range"
                    min={0}
                    max={SLIDER_AMOUNTS.length - 1}
                    step={1}
                    value={sliderIndex}
                    onChange={(event) => {
                      const idx = Number(event.target.value);
                      const newAmount = SLIDER_AMOUNTS[idx];
                      setAmount(newAmount);
                      setCustomInput(newAmount.toLocaleString("es-MX"));
                      setCustomError(null);
                    }}
                    aria-valuetext={wholeMoney.format(amount)}
                    className="focus-visible:ring-4 focus-visible:ring-brass/40 focus-visible:ring-offset-4"
                    style={{
                      background: `linear-gradient(to right, #C5A059 ${sliderPercent}%, #e9e6dd ${sliderPercent}%)`,
                    }}
                  />
                  <div className="mt-2.5 flex justify-between text-xs text-muted">
                    <span>$10 mil</span>
                    <span>$6 millones</span>
                  </div>
                </div>

                {/* Apartado interactivo: PON TU MONTO / Personalizado */}
                <AnimatePresence>
                  {isCustomMode && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3.5 rounded-xl border border-brass/40 bg-gradient-to-r from-ivory via-white to-ivory p-4 shadow-sm">
                        <div className="flex items-center justify-between gap-2">
                          <label
                            htmlFor="monto-personalizado-input"
                            className="text-xs font-bold text-navy flex items-center gap-1.5"
                          >
                            <span className="material-symbols-outlined text-base text-brass">edit_note</span>
                            Escribe tu monto exacto (o más de $6M):
                          </label>
                          <span className="text-[11px] text-muted">Múltiplos de $10,000</span>
                        </div>

                        <div className="relative mt-2">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-navy text-lg">$</span>
                          <input
                            id="monto-personalizado-input"
                            type="text"
                            inputMode="numeric"
                            value={customInput}
                            onChange={(e) => {
                              setCustomInput(e.target.value);
                              setCustomError(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleCustomInputApply();
                              }
                            }}
                            placeholder="Ej. 50,000 o 8,000,000"
                            className="w-full rounded-lg border border-brass/40 bg-white py-2.5 pl-8 pr-24 text-base font-bold text-navy placeholder:text-muted/40 focus:border-brass focus:ring-2 focus:ring-brass/30"
                          />
                          <button
                            type="button"
                            onClick={handleCustomInputApply}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-navy px-3 py-1.5 text-xs font-semibold text-brass hover:bg-brass hover:text-navy transition cursor-pointer"
                          >
                            Aplicar
                          </button>
                        </div>

                        {customError && (
                          <p className="mt-2 text-xs font-semibold text-rose-600 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">error</span>
                            {customError}
                          </p>
                        )}

                        {/* Atajos rápidos para montos representativos */}
                        <div className="mt-3 flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] text-muted mr-1 font-semibold">Montos rápidos:</span>
                          {[
                            { label: "$50k", val: 50_000 },
                            { label: "$250k", val: 250_000 },
                            { label: "$500k", val: 500_000 },
                            { label: "$1M", val: 1_000_000 },
                            { label: "$3M", val: 3_000_000 },
                            { label: "$6M", val: 6_000_000 },
                            { label: "$8M (+6M)", val: 8_000_000 },
                            { label: "$10M (+6M)", val: 10_000_000 },
                          ].map((btn) => (
                            <button
                              key={btn.val}
                              type="button"
                              onClick={() => {
                                setAmount(btn.val);
                                setCustomInput(btn.val.toLocaleString("es-MX"));
                                setCustomError(null);
                              }}
                              className={`rounded-md px-2 py-1 text-[11px] font-semibold transition cursor-pointer ${amount === btn.val
                                  ? "bg-navy text-brass ring-1 ring-brass"
                                  : "bg-white border border-navy/15 text-navy hover:border-brass"
                                }`}
                            >
                              {btn.label}
                            </button>
                          ))}
                        </div>

                        {amount > 6_000_000 && (
                          <div className="mt-3 flex items-center gap-2 rounded-lg bg-brass/15 p-2.5 text-xs text-navy border border-brass/35">
                            <span className="material-symbols-outlined text-brass text-base shrink-0">diamond</span>
                            <span>
                              <strong>Financiamiento Corporativo (+6M):</strong> Tasa preferencial corporativa del 3% anual fija y plazos hasta 20 años.
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Paso 3: Plazo dinámico según el monto */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-semibold text-navy">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brass/20 text-brass text-[11px] font-bold ring-1 ring-brass/40">
                      3
                    </span>
                    <label htmlFor="simulador-plazo">Plazo para pagar</label>
                  </div>
                  <span className="rounded-md bg-navy/5 px-3 py-1.5 text-base tabular-nums">
                    {`${years} ${years === 1 ? "año" : "años"}`}
                  </span>
                </div>
                <input
                  id="simulador-plazo"
                  type="range"
                  min={1}
                  max={maxYears}
                  step={1}
                  value={Math.min(years, maxYears)}
                  onChange={(event) => setYears(Number(event.target.value))}
                  aria-valuetext={`${years} ${years === 1 ? "año" : "años"}`}
                  className="mt-5 focus-visible:ring-4 focus-visible:ring-brass/40 focus-visible:ring-offset-4"
                  style={{
                    background: `linear-gradient(to right, #C5A059 ${maxYears === 1 ? 100 : ((Math.min(years, maxYears) - 1) / (maxYears - 1)) * 100
                      }%, #e9e6dd ${maxYears === 1 ? 100 : ((Math.min(years, maxYears) - 1) / (maxYears - 1)) * 100
                      }%)`,
                  }}
                />
                <div className="mt-3 flex justify-between text-xs text-muted">
                  <span>1 año</span>
                  <span>{`${maxYears} ${maxYears === 1 ? "año" : "años"}`}</span>
                </div>
              </div>

              {/* Paso 4: Tasa anual fija dinámica asignada automáticamente */}
              <div>
                <div className="flex items-center justify-between text-sm font-semibold text-navy">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brass/20 text-brass text-[11px] font-bold ring-1 ring-brass/40">
                      4
                    </span>
                    <span>Tasa anual asignada</span>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
                    <span className="material-symbols-outlined text-xs">lock</span> Tasa fija y congelada
                  </span>
                </div>

                <div className="mt-3 rounded-xl border border-brass/35 bg-gradient-to-br from-ivory via-white to-brass/10 p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy text-brass shadow-sm">
                        <span className="material-symbols-outlined text-2xl">percent</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold font-display text-navy tracking-tight">{rate}%</span>
                          <span className="rounded-full bg-brass/20 px-2 py-0.5 text-[10px] font-bold text-navy border border-brass/40">
                            {tier.badge}
                          </span>
                        </div>
                        <p className="text-xs text-muted">Tasa de interés simple anual fija</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-start gap-2 border-t border-navy/10 pt-2.5 text-xs text-muted">
                    <span className="material-symbols-outlined text-sm text-brass shrink-0 mt-0.5">verified</span>
                    <span>{tier.description}. La tasa se calcula automáticamente según el monto.</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-between border-t border-navy/10 bg-ivory p-6 sm:p-9 md:border-l md:border-t-0 md:p-10 rounded-b-2xl md:rounded-b-none md:rounded-r-2xl">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Tu pago mensual estimado</p>
                <div className="mt-3 flex flex-wrap items-baseline gap-2.5">
                  <p className="break-words font-display text-[clamp(2rem,4.3vw,3.5rem)] leading-tight text-navy tabular-nums" aria-live="polite">
                    <motion.span>{monthlyDisplay}</motion.span>
                  </p>
                  <span className="rounded-md bg-brass/15 px-2 py-0.5 text-xs sm:text-sm font-bold text-navy border border-brass/35">
                    MXN
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted">{quote.months} mensualidades · Pesos mexicanos (MXN)</p>
                <dl className="mt-7 divide-y divide-navy/10 text-sm">
                  <div className="flex justify-between gap-4 py-3"><dt className="text-muted">Monto solicitado</dt><dd className="font-semibold text-navy tabular-nums">{money.format(amount)} MXN</dd></div>
                  <div className="flex justify-between gap-4 py-3"><dt className="text-muted">Tasa anual fija</dt><dd className="font-semibold text-emerald-700 tabular-nums">{rate}% anual</dd></div>
                  <div className="flex justify-between gap-4 py-3"><dt className="text-muted">Intereses estimados</dt><dd className="font-semibold text-navy tabular-nums">{money.format(quote.totalInterest)} MXN</dd></div>
                  <div className="flex justify-between gap-4 py-3"><dt className="font-semibold text-navy">Total a pagar</dt><dd className="font-bold text-navy tabular-nums">{money.format(quote.totalPayment)} MXN</dd></div>
                </dl>
              </div>
              <div className="mt-7">
                <div className="mb-5 flex items-start gap-3 rounded-lg border border-brass/25 bg-white p-4">
                  <QuoteIcon kind="document" className="text-brass" />
                  <p className="text-xs leading-relaxed text-muted"><span className="block font-semibold text-navy">Tu cotización, mes a mes</span>Descarga un PDF con el desglose de capital, intereses y saldo de cada mensualidad.</p>
                </div>
                <QuoteDownload quote={quote} />
                <a href="#contacto" className="mt-4 block text-center text-sm font-semibold text-navy underline decoration-brass/60 underline-offset-4 hover:decoration-navy">Hablar con un asesor</a>
                <p className="mt-5 text-xs leading-relaxed text-muted">Simulación informativa con interés sobre el monto original. El último pago puede variar por redondeo. No incluye comisiones ni seguros. Sujeto a evaluación y aprobación.</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
