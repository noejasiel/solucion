import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { motion, useReducedMotion, useSpring, useTransform } from "framer-motion";
import Reveal from "./Reveal.tsx";
import { brand, simulatorConfig } from "../data/content.ts";

/** Moneda MXN sin decimales (montos y totales). */
const currencyWhole = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** Moneda MXN con 2 decimales (pago mensual). */
const currencyExact = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Caption compacto para extremos del slider de monto ("$20 mil", "$6 millones"). */
function compactAmount(value: number): string {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `$${millions} ${millions === 1 ? "millón" : "millones"}`;
  }
  return `$${value / 1_000} mil`;
}

/** Caption de plazo en años ("1 año", "20 años"). */
function yearsCaption(value: number): string {
  return `${value} ${value === 1 ? "año" : "años"}`;
}

interface SliderGroupProps {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  /** Valor actual formateado, mostrado junto al label y usado como aria-valuetext */
  displayValue: string;
  minCaption: string;
  maxCaption: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

/** Grupo de slider con pista rellena en dorado hasta la posición actual. */
function SliderGroup({
  id,
  label,
  min,
  max,
  step,
  value,
  displayValue,
  minCaption,
  maxCaption,
  onChange,
}: SliderGroupProps) {
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div>
      <div className="flex items-center justify-between text-sm font-semibold text-navy">
        <label htmlFor={id}>{label}</label>
        <span className="font-bold text-brass">{displayValue}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        aria-valuetext={displayValue}
        className="mt-3"
        style={{
          background: `linear-gradient(to right, #C5A059 0%, #C5A059 ${percent}%, #e9e6dd ${percent}%, #e9e6dd 100%)`,
        }}
      />
      <div className="mt-2 flex justify-between text-xs text-muted">
        <span>{minCaption}</span>
        <span>{maxCaption}</span>
      </div>
    </div>
  );
}

/**
 * Simulador de crédito — superficie navy con tarjeta blanca al estilo
 * "Sovereign Heritage": sliders con pista dorada y panel de resultado
 * en ivory con cifra animada por resorte.
 */
export default function Simulator() {
  const [amount, setAmount] = useState<number>(simulatorConfig.amountDefault);
  const [years, setYears] = useState<number>(simulatorConfig.yearsDefault);
  const [rate, setRate] = useState<number>(simulatorConfig.rateDefault);
  const reduceMotion = useReducedMotion();

  const months = years * 12;
  const total = amount * (1 + (rate / 100) * years);
  const monthly = total / months;

  // Cifra principal: rueda suavemente hacia el nuevo valor.
  const monthlySpring = useSpring(monthly, { stiffness: 110, damping: 24, mass: 0.6 });

  useEffect(() => {
    if (reduceMotion) {
      monthlySpring.jump(monthly);
    } else {
      monthlySpring.set(monthly);
    }
  }, [monthly, monthlySpring, reduceMotion]);

  const monthlyDisplay = useTransform(monthlySpring, (value) => currencyExact.format(value));

  const amountLabel = currencyWhole.format(amount);
  const yearsLabel = yearsCaption(years);
  const rateLabel = `${rate}%`;

  return (
    <section id="simulador" className="relative overflow-hidden bg-navy py-16 md:py-24">
      {/* Decoración: fotografía corporativa fundida sobre el navy */}
      <div
        aria-hidden="true"
        className="absolute right-0 top-0 h-full w-1/2 bg-[url('/photos/simulator-bg.jpg')] bg-cover opacity-10 mix-blend-overlay"
      />
      {/* Decoración: marca de agua con el logotipo claro */}
      <img
        src={brand.logoLight}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-16 -left-16 w-72 select-none opacity-[0.06]"
      />

      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-5 sm:px-8">
        <Reveal>
          <div className="text-center">
            <h2 className="font-display text-3xl text-white md:text-5xl">Simulador de Crédito</h2>
            <div className="mx-auto mt-4 h-1 w-16 bg-brass" aria-hidden="true" />
            <p className="mx-auto mt-6 max-w-2xl text-ivory/80">
              Estima un pago mensual de referencia. Los valores son informativos y dependen de
              evaluación, institución, perfil y documentación.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mx-auto mt-14 grid max-w-4xl gap-10 rounded-2xl border border-brass/30 bg-white p-8 shadow-lifted md:grid-cols-2 md:p-12 lg:gap-12">
            {/* Controles */}
            <div className="space-y-8">
              <SliderGroup
                id="simulador-monto"
                label="Monto requerido"
                min={simulatorConfig.amountMin}
                max={simulatorConfig.amountMax}
                step={simulatorConfig.amountStep}
                value={amount}
                displayValue={amountLabel}
                minCaption={compactAmount(simulatorConfig.amountMin)}
                maxCaption={compactAmount(simulatorConfig.amountMax)}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setAmount(Number(event.target.value))
                }
              />
              <SliderGroup
                id="simulador-plazo"
                label="Plazo para pagar"
                min={simulatorConfig.yearsMin}
                max={simulatorConfig.yearsMax}
                step={1}
                value={years}
                displayValue={yearsLabel}
                minCaption={yearsCaption(simulatorConfig.yearsMin)}
                maxCaption={yearsCaption(simulatorConfig.yearsMax)}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setYears(Number(event.target.value))
                }
              />
              <SliderGroup
                id="simulador-tasa"
                label="Tasa anual estimada"
                min={simulatorConfig.rateMin}
                max={simulatorConfig.rateMax}
                step={1}
                value={rate}
                displayValue={rateLabel}
                minCaption={`${simulatorConfig.rateMin}%`}
                maxCaption={`${simulatorConfig.rateMax}%`}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setRate(Number(event.target.value))
                }
              />
            </div>

            {/* Resultado */}
            <div className="flex flex-col justify-center rounded-xl border border-navy/5 bg-ivory p-8">
              <p className="text-center text-xs font-semibold uppercase tracking-wider text-muted">
                Pago mensual estimado
              </p>
              <p className="mt-3 text-center font-display text-5xl text-navy lg:text-6xl">
                <motion.span>{monthlyDisplay}</motion.span>
              </p>

              <ul className="mt-8 divide-y divide-navy/10 text-sm">
                <li className="flex items-center justify-between py-3">
                  <span className="text-muted">Total estimado</span>
                  <span className="font-bold text-navy">{currencyWhole.format(total)}</span>
                </li>
                <li className="flex items-center justify-between py-3">
                  <span className="text-muted">Mensualidades</span>
                  <span className="font-semibold text-navy">{months}</span>
                </li>
                <li className="flex items-center justify-between py-3">
                  <span className="text-muted">Tipo de cálculo</span>
                  <span className="font-semibold text-navy">Informativo</span>
                </li>
              </ul>

              <a
                href="#contacto"
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brass py-4 text-center font-semibold text-white shadow-lg shadow-brass/30 transition hover:brightness-95"
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  send
                </span>
                Solicitar ahora
              </a>
              <p className="mt-4 text-center text-xs text-muted">
                *Valores informativos sujetos a aprobación.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
