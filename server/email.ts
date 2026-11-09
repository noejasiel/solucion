import type { IncomingMessage, ServerResponse } from "node:http";
import { Resend } from "resend";
import { serviceOptions, simulatorConfig } from "../src/data/content.ts";
import { createCreditQuote, resolveAnnualRate, resolveMaxYears } from "../src/lib/credit.ts";

const MAX_BODY_BYTES = 24 * 1024;
const MONEY = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });
const UUID = /^[\da-f]{8}-[\da-f]{4}-[1-8][\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i;

interface EmailPayload {
  from: string;
  to: string[];
  replyTo: string;
  subject: string;
  html: string;
}

interface SendResult {
  data?: { id: string } | null;
  error?: unknown;
}

export interface EmailDependencies {
  env?: Record<string, string | undefined>;
  sendEmail?: (payload: EmailPayload, options?: { idempotencyKey: string }) => Promise<SendResult>;
}

class RequestError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new RequestError("Los datos enviados no son válidos.");
  }
  return value as Record<string, unknown>;
}

function textField(data: Record<string, unknown>, key: string, max: number, required = true): string {
  const value = data[key];
  if (value === undefined || value === null || value === "") {
    if (!required) return "";
    throw new RequestError(`Completa el campo ${key}.`);
  }
  if (typeof value !== "string" || value.length > max || /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(value)) {
    throw new RequestError(`El campo ${key} no es válido.`);
  }
  const trimmed = value.trim();
  if (required && !trimmed) throw new RequestError(`Completa el campo ${key}.`);
  if (key !== "message" && /[\r\n]/.test(trimmed)) {
    throw new RequestError(`El campo ${key} no es válido.`);
  }
  return trimmed;
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]!);
}

function row(label: string, value: string): string {
  return `<tr><th style="padding:10px;text-align:left;color:#0A192F;border-bottom:1px solid #e9e6dd">${escapeHtml(label)}</th><td style="padding:10px;color:#333;border-bottom:1px solid #e9e6dd;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`;
}

function emailHtml(title: string, introduction: string, rows: string): string {
  return `<div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;padding:24px;border:1px solid #e9e6dd;border-radius:12px"><h2 style="color:#0A192F;border-bottom:2px solid #C5A059;padding-bottom:16px">${escapeHtml(title)}</h2><p>${escapeHtml(introduction)}</p><table style="border-collapse:collapse;width:100%">${rows}</table><p style="font-size:12px;color:#666;margin-top:24px">Solución Crediticia — Notificación automática</p></div>`;
}

function makeEmail(body: Record<string, unknown>): { email: string; subject: string; html: string; idempotencyKey?: string } {
  const name = textField(body, "name", 120);
  const email = textField(body, "email", 254);
  const phone = textField(body, "phone", 40);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new RequestError("Ingresa un correo electrónico válido.");
  }
  const phoneDigits = phone.replace(/\D/g, "");
  if (!/^[+\d()\s.-]+$/.test(phone) || phoneDigits.length < 10 || phoneDigits.length > 15) {
    throw new RequestError("Ingresa un teléfono válido de 10 a 15 dígitos.");
  }

  const contactRows = row("Nombre", name) + row("Correo electrónico", email) + row("Teléfono", phone);
  if (body.source === "simulator") {
    const requestId = textField(body, "requestId", 36);
    if (!UUID.test(requestId)) throw new RequestError("La referencia de la solicitud no es válida.");
    const inputs = record(body.quote);
    const amount = inputs.amount;
    const years = inputs.years;
    const rate = inputs.rate;
    const service = textField(inputs, "service", 80);
    if (
      typeof amount !== "number" ||
      !Number.isInteger(amount) ||
      amount < simulatorConfig.amountMin ||
      amount > simulatorConfig.amountCustomMax ||
      amount % simulatorConfig.amountStep !== 0
    ) {
      throw new RequestError("El monto del crédito no es válido. Debe ser al menos $10,000 y en múltiplos cerrados de $10,000.");
    }
    const maxYears = resolveMaxYears(amount);
    if (
      typeof years !== "number" ||
      !Number.isInteger(years) ||
      years < simulatorConfig.yearsMin ||
      years > maxYears
    ) {
      throw new RequestError(`El plazo del crédito no es válido (de 1 a ${maxYears} años para este monto).`);
    }
    const expectedRate = resolveAnnualRate(amount);
    if (typeof rate !== "number" || rate !== expectedRate) {
      throw new RequestError("La tasa del crédito no corresponde al monto solicitado.");
    }
    if (!serviceOptions.includes(service)) throw new RequestError("Selecciona un tipo de crédito válido.");

    // Calculate on the server; ignore totals supplied by the browser.
    const quote = createCreditQuote({ amount, years, rate, service });
    const rows = contactRows + row("Tipo de crédito", service) + row("Monto solicitado", MONEY.format(amount))
      + row("Plazo", `${years} años (${quote.months} mensualidades)`)
      + row("Tasa anual estimada", `${rate}%`)
      + row("Mensualidad estimada", MONEY.format(quote.monthlyPayment))
      + row("Intereses totales", MONEY.format(quote.totalInterest))
      + row("Total estimado a pagar", MONEY.format(quote.totalPayment))
      + row("Referencia", requestId);
    return {
      email,
      subject: `Nuevo prospecto del simulador — ${service}`,
      html: emailHtml("Nuevo prospecto del simulador", "El prospecto solicitó descargar una cotización. Los importes son informativos y están sujetos a evaluación y aprobación. El último pago puede ajustarse por redondeo.", rows),
      idempotencyKey: `simulator/${requestId}`,
    };
  }
  if (body.source !== undefined && body.source !== "contact") throw new RequestError("El origen de la solicitud no es válido.");
  const message = textField(body, "message", 5000);
  const amount = textField(body, "amount", 80, false);
  const city = textField(body, "city", 100, false);
  const service = textField(body, "service", 80, false) || "General";
  return {
    email,
    subject: `Nueva solicitud de asesoría — ${service}`,
    html: emailHtml("Nueva solicitud de asesoría crediticia", "Enviada desde el formulario de contacto web.",
      contactRows + row("Monto solicitado", amount || "No especificado") + row("Ciudad", city || "No especificada")
      + row("Servicio de interés", service) + row("Mensaje del cliente", message)),
  };
}

async function readBody(req: IncomingMessage & { body?: unknown }): Promise<Record<string, unknown>> {
  const declaredSize = Number(req.headers?.["content-length"] || 0);
  if (declaredSize > MAX_BODY_BYTES) throw new RequestError("La solicitud excede el tamaño permitido.", 413);
  let input = req.body;
  if (input === undefined) {
    const chunks: Buffer[] = [];
    let size = 0;
    for await (const chunk of req) {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      size += buffer.length;
      if (size > MAX_BODY_BYTES) throw new RequestError("La solicitud excede el tamaño permitido.", 413);
      chunks.push(buffer);
    }
    input = Buffer.concat(chunks).toString("utf8");
  }
  if (typeof input === "string" || Buffer.isBuffer(input)) {
    if (Buffer.byteLength(input) > MAX_BODY_BYTES) throw new RequestError("La solicitud excede el tamaño permitido.", 413);
    try { input = JSON.parse(input.toString()); }
    catch { throw new RequestError("El formato de la solicitud no es válido."); }
  } else {
    let size: number;
    try { size = Buffer.byteLength(JSON.stringify(input) || ""); }
    catch { throw new RequestError("Los datos enviados no son válidos."); }
    if (size > MAX_BODY_BYTES) throw new RequestError("La solicitud excede el tamaño permitido.", 413);
  }
  return record(input);
}

export async function handleEmailRequest(
  req: IncomingMessage & { body?: unknown },
  res: Pick<ServerResponse, "statusCode" | "setHeader" | "end">,
  dependencies: EmailDependencies = {},
): Promise<void> {
  const respond = (status: number, body: unknown) => {
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.end(JSON.stringify(body));
  };
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    respond(405, { error: "Método no permitido." });
    return;
  }
  try {
    const body = await readBody(req);
    const email = makeEmail(body);
    const env = dependencies.env ?? process.env;
    if (!dependencies.sendEmail && !env.RESEND_API_KEY) {
      respond(503, { error: "El servicio de correo no está disponible. Inténtalo más tarde." });
      return;
    }
    const from = env.RESEND_FROM_EMAIL || "Solución Crediticia <informacion@solucioncrediticia.org>";
    const to = (env.RESEND_TO_EMAIL || "informacion@solucioncrediticia.org, gerencia@solucioncrediticia.org")
      .split(",").map((address) => address.trim()).filter(Boolean);
    if (!to.length) {
      respond(503, { error: "El servicio de correo no está disponible. Inténtalo más tarde." });
      return;
    }
    const send = dependencies.sendEmail ?? ((payload, options) => new Resend(env.RESEND_API_KEY).emails.send(payload, options));
    const result = await send({ from, to, replyTo: email.email, subject: email.subject, html: email.html },
      email.idempotencyKey ? { idempotencyKey: email.idempotencyKey } : undefined);
    if (result.error || !result.data?.id) {
      respond(502, { error: "No se pudo enviar la solicitud. Inténtalo nuevamente." });
      return;
    }
    respond(200, { success: true, id: result.data.id });
  } catch (error) {
    respond(error instanceof RequestError ? error.status : 502, {
      error: error instanceof RequestError ? error.message : "No se pudo enviar la solicitud. Inténtalo nuevamente.",
    });
  }
}
