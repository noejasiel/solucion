import assert from "node:assert/strict";
import { Readable } from "node:stream";
import test from "node:test";
import type { IncomingMessage, ServerResponse } from "node:http";
import { handleEmailRequest } from "../server/email.ts";
import type { EmailDependencies } from "../server/email.ts";

const requestId = "c12bb826-ae38-4da9-a16a-0ecdd154dabc";
const contact = {
  name: "Luis Ramírez", email: "luis@example.com", phone: "+52 (55) 1234-5678",
  amount: "$500,000", city: "CDMX", service: "Crédito Personal", message: "Quiero información.",
};
const simulator = {
  source: "simulator", requestId,
  name: contact.name, email: contact.email, phone: contact.phone,
  quote: { amount: 250_000, years: 3, rate: 8, service: "Crédito Personal" },
};
type Send = NonNullable<EmailDependencies["sendEmail"]>;

async function run(body: unknown, options: {
  method?: string;
  env?: Record<string, string | undefined>;
  sendEmail?: Send;
  stream?: string[];
  contentLength?: string;
} = {}) {
  const calls: { payload: Parameters<Send>[0]; options: Parameters<Send>[1] }[] = [];
  const req = Object.assign(Readable.from(options.stream ?? []), {
    method: options.method ?? "POST",
    headers: { "content-length": options.contentLength },
    ...(options.stream ? {} : { body }),
  }) as unknown as IncomingMessage & { body?: unknown };
  let raw = "";
  const headers: Record<string, unknown> = {};
  const response = {
    statusCode: 0,
    setHeader(name: string, value: unknown) { headers[name] = value; return this; },
    end(data: unknown) { raw = String(data); return this; },
  };
  const defaultSend: Send = async (payload, sendOptions) => {
    calls.push({ payload, options: sendOptions });
    return { data: { id: "mock-email-id" }, error: null };
  };
  await handleEmailRequest(req, response as unknown as ServerResponse, {
    env: options.env ?? {},
    ...(!options.env || options.sendEmail ? { sendEmail: options.sendEmail ?? defaultSend } : {}),
  });
  return { status: response.statusCode, body: JSON.parse(raw), calls, headers };
}

test("existing contact submission remains compatible", async () => {
  const result = await run(contact);
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { success: true, id: "mock-email-id" });
  assert.equal(result.calls.length, 1);
  assert.equal(result.calls[0].payload.replyTo, contact.email);
  assert.match(result.calls[0].payload.subject, /Nueva solicitud de asesoría/);
  assert.match(result.calls[0].payload.html, /Quiero información/);
  assert.deepEqual(result.calls[0].payload.to, ["informacion@solucioncrediticia.org", "gerencia@solucioncrediticia.org"]);
  assert.equal(result.calls[0].options, undefined);
});

test("simulator recalculates totals and does not require contact message or city", async () => {
  const result = await run({ ...simulator, quote: { ...simulator.quote, totalPayment: 1, monthlyPayment: 1 } });
  assert.equal(result.status, 200);
  const html = result.calls[0].payload.html;
  assert.match(html, /Nuevo prospecto del simulador/);
  assert.match(html, /\$310,000\.00/);
  assert.match(html, /\$60,000\.00/);
  assert.match(html, /\$8,611\.11/);
  assert.match(html, /36 mensualidades/);
});

test("simulator retries reuse provider idempotency key", async () => {
  const first = await run(simulator);
  const retry = await run(simulator);
  assert.deepEqual(first.calls[0].options, { idempotencyKey: `simulator/${requestId}` });
  assert.deepEqual(first.calls[0].options, retry.calls[0].options);
});

test("HTML values are escaped", async () => {
  const result = await run({ ...contact, name: '<img src=x onerror="alert(1)">', message: "<script>alert('x')</script> &" });
  assert.equal(result.status, 200);
  const html = result.calls[0].payload.html;
  assert.ok(!html.includes("<img src=x"));
  assert.ok(!html.includes("<script>"));
  assert.match(html, /&lt;img/);
  assert.match(html, /&lt;script&gt;alert\(&#39;x&#39;\)&lt;\/script&gt; &amp;/);
});

test("provider rejection or exception never returns success or exposes error details", async () => {
  for (const sendEmail of [
    async () => ({ data: null, error: { message: "private-provider-secret" } }),
    async () => { throw new Error("private-provider-secret"); },
    async () => ({ data: null, error: null }),
  ]) {
    const result = await run(simulator, { sendEmail });
    assert.equal(result.status, 502);
    assert.equal(result.body.success, undefined);
    assert.ok(!JSON.stringify(result.body).includes("private-provider-secret"));
  }
});

test("missing provider configuration gives a safe error", async () => {
  const result = await run(simulator, { env: {} });
  assert.equal(result.status, 503);
  assert.equal(result.calls.length, 0);
  assert.ok(!JSON.stringify(result.body).includes("RESEND_API_KEY"));
});

test("custom configured recipients and sender are reused", async () => {
  let payload: Parameters<Send>[0] | undefined;
  const result = await run(simulator, {
    env: { RESEND_TO_EMAIL: " sales@example.com, director@example.com ", RESEND_FROM_EMAIL: "Brand <mail@example.com>" },
    sendEmail: async (data) => { payload = data; return { data: { id: "configured" } }; },
  });
  assert.equal(result.status, 200);
  assert.deepEqual(payload?.to, ["sales@example.com", "director@example.com"]);
  assert.equal(payload?.from, "Brand <mail@example.com>");
});

test("rejects invalid identity fields and missing contact message", async () => {
  for (const invalid of [
    { ...simulator, name: "   " },
    { ...simulator, name: "x".repeat(121) },
    { ...simulator, email: "not-an-email" },
    { ...simulator, email: "user@example.com\nBcc:bad@example.com" },
    { ...simulator, phone: "123" },
    { ...simulator, phone: "abcdefghijkl" },
    { ...simulator, phone: "1234567890123456" },
    { ...contact, message: "" },
    { ...contact, message: "x".repeat(5001) },
    { ...contact, source: "unknown" },
  ]) {
    const result = await run(invalid);
    assert.equal(result.status, 400);
    assert.equal(result.calls.length, 0);
  }
});

test("rejects invalid simulator references and quote ranges", async () => {
  const invalidQuotes = [
    null, [], {},
    { ...simulator.quote, amount: 5_000 },
    { ...simulator.quote, amount: 25_000 },
    { ...simulator.quote, amount: 35_000 },
    { ...simulator.quote, amount: 125_000 },
    { ...simulator.quote, amount: 100_010_000 },
    { ...simulator.quote, amount: "250000" },
    { ...simulator.quote, years: 0 },
    { ...simulator.quote, years: 21 },
    { ...simulator.quote, years: 1.5 },
    { ...simulator.quote, years: 7 },
    { ...simulator.quote, amount: 30_000, years: 4, rate: 25 },
    { ...simulator.quote, rate: 11 },
    { ...simulator.quote, rate: 15 },
    { ...simulator.quote, rate: 15.5 },
    { ...simulator.quote, rate: Infinity },
    { ...simulator.quote, service: "Inventado" },
  ];
  for (const quote of invalidQuotes) {
    const result = await run({ ...simulator, quote });
    assert.equal(result.status, 400, JSON.stringify(quote));
    assert.equal(result.calls.length, 0);
  }
  assert.equal((await run({ ...simulator, requestId: "bad-ref" })).status, 400);
});

test("accepts simulator range boundaries and dynamic rates", async () => {
  for (const quote of [
    { ...simulator.quote, amount: 10_000, years: 3, rate: 25 },
    { ...simulator.quote, amount: 40_000, years: 1, rate: 25 },
    { ...simulator.quote, amount: 50_000, years: 6, rate: 15 },
    { ...simulator.quote, amount: 200_000, years: 6, rate: 15 },
    { ...simulator.quote, amount: 240_000, years: 6, rate: 15 },
    { ...simulator.quote, amount: 250_000, years: 6, rate: 8 },
    { ...simulator.quote, amount: 500_000, years: 6, rate: 8 },
    { ...simulator.quote, amount: 700_000, years: 6, rate: 8 },
    { ...simulator.quote, amount: 990_000, years: 6, rate: 8 },
    { ...simulator.quote, amount: 1_000_000, years: 20, rate: 3 },
    { ...simulator.quote, amount: 6_000_000, years: 20, rate: 3 },
    { ...simulator.quote, amount: 10_000_000, years: 20, rate: 3 },
  ]) assert.equal((await run({ ...simulator, quote })).status, 200, JSON.stringify(quote));
});

test("method, malformed JSON and body size are checked before sending", async () => {
  const method = await run(simulator, { method: "GET" });
  assert.equal(method.status, 405);
  assert.equal(method.headers.Allow, "POST");
  assert.equal((await run("{invalid")).status, 400);
  assert.equal((await run("x".repeat(25_000))).status, 413);
  assert.equal((await run(simulator, { contentLength: "25000" })).status, 413);
  assert.equal((await run({ huge: "x".repeat(25_000) })).status, 413);
});

test("development raw stream and parsed production body share behavior", async () => {
  const json = JSON.stringify(simulator);
  const streamResult = await run(undefined, { stream: [json.slice(0, 25), json.slice(25)] });
  const parsedResult = await run(simulator);
  assert.equal(streamResult.status, 200);
  assert.deepEqual(streamResult.calls, parsedResult.calls);
  assert.equal((await run(undefined, { stream: ["x".repeat(25_000)] })).status, 413);
});
