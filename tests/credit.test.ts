import assert from "node:assert/strict";
import { test } from "node:test";
import { createCreditQuote, resolveAnnualRate, resolveMaxYears } from "../src/lib/credit.ts";
import type { CreditInputs, CreditQuote } from "../src/lib/credit.ts";

const cents = (value: number) => Math.round(value * 100);
const inputs: CreditInputs = {
  amount: 250_000,
  rate: 15,
  years: 3,
  service: "Crédito Personal",
};

function assertReconciles(quote: CreditQuote) {
  assert.equal(quote.rows.length, quote.months);
  assert.equal(quote.rows[0].openingBalance, quote.amount);
  assert.equal(quote.rows.at(-1)?.closingBalance, 0);
  assert.equal(quote.rows.reduce((sum, row) => sum + cents(row.principal), 0), cents(quote.amount));
  assert.equal(quote.rows.reduce((sum, row) => sum + cents(row.interest), 0), cents(quote.totalInterest));
  assert.equal(quote.rows.reduce((sum, row) => sum + cents(row.payment), 0), cents(quote.totalPayment));

  for (const [index, row] of quote.rows.entries()) {
    assert.equal(row.month, index + 1);
    assert.equal(cents(row.principal) + cents(row.interest), cents(row.payment));
    assert.equal(cents(row.openingBalance) - cents(row.principal), cents(row.closingBalance));
    assert.ok(Object.values(row).every((value) => Number.isFinite(value) && value >= 0));
    if (index > 0) {
      assert.equal(row.openingBalance, quote.rows[index - 1].closingBalance);
    }
  }
}

test("conserva el cálculo predeterminado sobre el monto original", () => {
  const quote = createCreditQuote(inputs);
  assert.equal(quote.months, 36);
  assert.equal(quote.totalInterest, 112_500);
  assert.equal(quote.totalPayment, 362_500);
  assert.equal(quote.monthlyPayment, 10_069.44);
  assert.equal(quote.rows[0].interest, 3_125);
  assert.equal(quote.rows[34].interest, 3_125);
  assert.equal(quote.rows.at(-1)?.payment, 10_069.60);
  assertReconciles(quote);
});

test("reproduce la tabla de referencia de $500,000 al 3% a 4 años", () => {
  const quote = createCreditQuote({ ...inputs, amount: 500_000, rate: 3, years: 4 });
  assert.equal(quote.months, 48);
  assert.equal(quote.totalInterest, 60_000);
  assert.equal(quote.totalPayment, 560_000);
  assert.equal(quote.monthlyPayment, 11_666.67);
  assert.equal(quote.rows[0].principal, 10_416.67);
  assert.equal(quote.rows[0].interest, 1_250);
  assert.equal(quote.rows.at(-1)?.payment, 11_666.51);
  assertReconciles(quote);
});

test("prioriza la cuota original cuando redondear componentes por separado difiere un centavo", () => {
  const quote = createCreditQuote({ ...inputs, amount: 100, rate: 13, years: 1 });
  assert.equal(quote.monthlyPayment, 9.42);
  // Capital teórico redondeado 8.33 + interés 1.08 daría 9.41.
  assert.equal(quote.rows[0].interest, 1.08);
  assert.equal(quote.rows[0].principal, 8.34);
  assert.equal(quote.rows[0].payment, 9.42);
  assertReconciles(quote);
});

test("concilia límites del simulador, tasas y todos los plazos", () => {
  for (const amount of [20_000, 250_000, 6_000_000]) {
    for (const rate of [12, 15, 23, 30]) {
      for (let years = 1; years <= 20; years += 1) {
        const quote = createCreditQuote({ ...inputs, amount, rate, years });
        assert.equal(quote.monthlyPayment, Math.round((amount * (1 + (rate / 100) * years) / (years * 12)) * 100) / 100);
        assertReconciles(quote);
      }
    }
  }
});

test("admite tasa cero y pequeños importes sin saldos negativos", () => {
  for (const amount of [0.01, 1.23, 20_000]) {
    for (const rate of [0, 3, 100]) {
      assertReconciles(createCreditQuote({ ...inputs, amount, rate, years: 20 }));
    }
  }
});

test("resuelve la tasa dinámica y plazos máximos por monto según las reglas acordadas", () => {
  // 10k a 40k: 25%, plazo máx 3 años
  assert.equal(resolveAnnualRate(10_000), 25);
  assert.equal(resolveAnnualRate(40_000), 25);
  assert.equal(resolveMaxYears(10_000), 3);
  assert.equal(resolveMaxYears(40_000), 3);

  // 50k a 240k: 15%, plazo máx 6 años
  assert.equal(resolveAnnualRate(50_000), 15);
  assert.equal(resolveAnnualRate(240_000), 15);
  assert.equal(resolveMaxYears(50_000), 6);
  assert.equal(resolveMaxYears(240_000), 6);

  // 250k a casi 1M (990k): 8%, plazo máx 6 años
  assert.equal(resolveAnnualRate(250_000), 8);
  assert.equal(resolveAnnualRate(500_000), 8);
  assert.equal(resolveAnnualRate(700_000), 8);
  assert.equal(resolveAnnualRate(990_000), 8);
  assert.equal(resolveMaxYears(250_000), 6);
  assert.equal(resolveMaxYears(990_000), 6);

  // +1M (1M a 6M y superiores): 3%, plazo máx 20 años
  assert.equal(resolveAnnualRate(1_000_000), 3);
  assert.equal(resolveAnnualRate(6_000_000), 3);
  assert.equal(resolveAnnualRate(10_000_000), 3);
  assert.equal(resolveMaxYears(1_000_000), 20);
  assert.equal(resolveMaxYears(6_000_000), 20);
  assert.equal(resolveMaxYears(10_000_000), 20);
});

test("rechaza montos, plazos y tasas matemáticamente inválidos", () => {
  for (const amount of [0, -1, 0.001, 100_000_001, NaN, Infinity]) {
    assert.throws(() => createCreditQuote({ ...inputs, amount }), RangeError);
  }
  for (const years of [0, -1, 1.5, 21, NaN, Infinity]) {
    assert.throws(() => createCreditQuote({ ...inputs, years }), RangeError);
  }
  for (const rate of [-1, 101, NaN, Infinity]) {
    assert.throws(() => createCreditQuote({ ...inputs, rate }), RangeError);
  }
});
