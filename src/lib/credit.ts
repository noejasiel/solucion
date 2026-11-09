export interface CreditInputs {
  amount: number;
  years: number;
  rate: number;
  service: string;
}

export interface AmortizationRow {
  month: number;
  openingBalance: number;
  interest: number;
  principal: number;
  payment: number;
  closingBalance: number;
}

export interface CreditQuote extends CreditInputs {
  months: number;
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
  rows: AmortizationRow[];
}

export interface ProspectData {
  name: string;
  email: string;
  phone: string;
}

export interface CreditTier {
  minAmount: number;
  maxAmount: number | null;
  rate: number;
  maxYears: number;
  badge: string;
  description: string;
}

export const CREDIT_TIERS: CreditTier[] = [
  {
    minAmount: 10_000,
    maxAmount: 40_000,
    rate: 25,
    maxYears: 3,
    badge: "Crédito Ágil (10k a 40k)",
    description: "Tasa fija del 25% anual · Plazos de 1 a 3 años · Trámite rápido",
  },
  {
    minAmount: 50_000,
    maxAmount: 240_000,
    rate: 15,
    maxYears: 6,
    badge: "Negocio & PyME (50k a 240k)",
    description: "Tasa fija del 15% anual · Plazos de 1 a 6 años · Impulso comercial",
  },
  {
    minAmount: 250_000,
    maxAmount: 990_000,
    rate: 8,
    maxYears: 6,
    badge: "Tasa Preferencial (250k a casi 1M)",
    description: "Tasa preferencial del 8% anual fija · Plazos de 1 a 6 años",
  },
  {
    minAmount: 1_000_000,
    maxAmount: null,
    rate: 3,
    maxYears: 20,
    badge: "Tasa Institucional (+1M)",
    description: "Tasa institucional del 3% anual fija · Plazos patrimoniales de 1 a 20 años",
  },
];

export function resolveCreditTier(amountOrInputs: Pick<CreditInputs, "amount"> | number): CreditTier {
  const amount = typeof amountOrInputs === "number" ? amountOrInputs : amountOrInputs.amount;
  if (amount < 50_000) return CREDIT_TIERS[0];
  if (amount < 250_000) return CREDIT_TIERS[1];
  if (amount < 1_000_000) return CREDIT_TIERS[2];
  return CREDIT_TIERS[3];
}

/** Tasa dinámica por monto acordada para el simulador. */
export function resolveAnnualRate(amountOrInputs: Pick<CreditInputs, "amount"> | number): number {
  return resolveCreditTier(amountOrInputs).rate;
}

/** Plazo máximo permitido según el monto. */
export function resolveMaxYears(amountOrInputs: Pick<CreditInputs, "amount"> | number): number {
  return resolveCreditTier(amountOrInputs).maxYears;
}

/**
 * Interés simple sobre el monto original, igual que el simulador existente.
 * Todo el reparto se hace en centavos para que la tabla concilie exactamente.
 */
export function createCreditQuote(inputs: CreditInputs): CreditQuote {
  const rate = inputs.rate !== undefined
    ? inputs.rate
    : resolveAnnualRate(inputs.amount);

  if (!Number.isFinite(inputs.amount) || inputs.amount <= 0 || inputs.amount > 100_000_000) {
    throw new RangeError("El monto debe ser mayor a cero y no superar $100,000,000.");
  }
  if (!Number.isInteger(inputs.years) || inputs.years < 1 || inputs.years > 20) {
    throw new RangeError("El plazo debe ser un número entero entre 1 y 20 años.");
  }
  if (!Number.isFinite(rate) || rate < 0 || rate > 100) {
    throw new RangeError("La tasa anual debe estar entre 0% y 100%.");
  }

  const amountCents = Math.round(inputs.amount * 100);
  if (amountCents < 1) {
    throw new RangeError("El monto mínimo de cálculo es un centavo.");
  }

  const months = inputs.years * 12;
  const interestCents = Math.round((amountCents * rate * inputs.years) / 100);
  const totalCents = amountCents + interestCents;
  const paymentCents = Math.round(totalCents / months);
  const regularInterestCents = Math.round(interestCents / months);

  // Prima la cuota de la fórmula original. Ante un centavo de diferencia
  // entre componentes redondeados, capital = cuota - interés.
  const regularPrincipalCents = paymentCents - regularInterestCents;
  let balanceCents = amountCents;
  let remainingInterestCents = interestCents;
  const rows: AmortizationRow[] = [];

  for (let month = 1; month <= months; month += 1) {
    const last = month === months;
    const principal = last ? balanceCents : Math.min(regularPrincipalCents, balanceCents);
    const interest = last
      ? remainingInterestCents
      : Math.min(regularInterestCents, remainingInterestCents);
    const closingBalance = balanceCents - principal;

    rows.push({
      month,
      openingBalance: balanceCents / 100,
      interest: interest / 100,
      principal: principal / 100,
      payment: (principal + interest) / 100,
      closingBalance: closingBalance / 100,
    });

    balanceCents = closingBalance;
    remainingInterestCents -= interest;
  }

  return {
    ...inputs,
    amount: amountCents / 100,
    rate,
    months,
    monthlyPayment: paymentCents / 100,
    totalInterest: interestCents / 100,
    totalPayment: totalCents / 100,
    rows,
  };
}
