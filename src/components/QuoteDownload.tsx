import { useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { CreditQuote, ProspectData } from "../lib/credit.ts";
import QuoteIcon from "./QuoteIcon.tsx";

interface QuoteRequest { id: string; key: string; quote: CreditQuote; issuedAt: Date }
const initialProspect: ProspectData = { name: "", email: "", phone: "" };
const fieldClass = "mt-2 w-full rounded-lg border border-navy/20 bg-white px-4 py-3 text-base text-navy outline-none placeholder:text-muted/50 focus:border-brass focus:ring-2 focus:ring-brass/30 read-only:bg-ivory";

function quoteKey(quote: CreditQuote): string {
  return JSON.stringify([quote.service, quote.amount, quote.years, quote.rate]);
}

function downloadPdf(blob: Blob, request: QuoteRequest) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `cotizacion-solucion-crediticia-${request.id.slice(0, 8)}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Mobile browsers may take a moment to start the download.
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export default function QuoteDownload({ quote }: { quote: CreditQuote }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const inFlight = useRef(false);
  const notifiedRef = useRef(false);
  const [request, setRequest] = useState<QuoteRequest | null>(null);
  const [prospect, setProspect] = useState(initialProspect);
  const [pdf, setPdf] = useState<Blob | null>(null);
  const [notified, setNotified] = useState(false);
  const [working, setWorking] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);

  function open() {
    const key = quoteKey(quote);
    if (!request || request.key !== key) {
      setRequest({ id: crypto.randomUUID(), key, quote, issuedAt: new Date() });
      setPdf(null);
      setNotified(false);
      notifiedRef.current = false;
    }
    setError(null);
    dialog.current?.showModal();
  }

  function changeProspect(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setProspect((previous) => ({ ...previous, [name]: value }));
    setPdf(null);
    setError(null);
    // A modified request gets a fresh key; an unchanged retry keeps its key.
    setRequest((previous) => previous ? { ...previous, id: crypto.randomUUID() } : previous);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current || !request) return;
    const details = { name: prospect.name.trim(), email: prospect.email.trim(), phone: prospect.phone.trim() };
    if (!details.name || !details.email || !details.phone) { setError("Completa tu nombre, correo y teléfono."); return; }
    const phoneDigits = details.phone.replace(/\D/g, "");
    if (phoneDigits.length < 10 || phoneDigits.length > 15) { setError("Escribe un teléfono de 10 a 15 dígitos, incluyendo la clave de país si corresponde."); return; }

    inFlight.current = true;
    setWorking(true);
    setError(null);
    try {
      let readyPdf = pdf;
      if (!readyPdf) {
        setProgress("Preparando tu PDF…");
        const { buildQuotePdf } = await import("../lib/quotePdf.ts");
        readyPdf = await buildQuotePdf(request.quote, details, request.id, request.issuedAt);
        setPdf(readyPdf);
      }
      if (!notifiedRef.current) {
        setProgress("Registrando tu solicitud…");
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 20_000);
        try {
          const response = await fetch("/api/send-email", {
            method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, signal: controller.signal,
            body: JSON.stringify({ source: "simulator", requestId: request.id, ...details, quote: { amount: request.quote.amount, years: request.quote.years, rate: request.quote.rate, service: request.quote.service } }),
          });
          const result = await response.json().catch(() => ({}));
          if (!response.ok || !result.success) throw new Error(result.error || "No pudimos registrar tu solicitud. Inténtalo de nuevo.");
        } finally { window.clearTimeout(timeout); }
        notifiedRef.current = true;
        setNotified(true);
        const win = window as unknown as { dataLayer?: Record<string, unknown>[] };
        win.dataLayer = win.dataLayer || [];
        win.dataLayer.push({ event: "quote_requested", service: request.quote.service, amount: request.quote.amount });
      }
      downloadPdf(readyPdf, request);
    } catch (cause) {
      const timedOut = cause instanceof DOMException && cause.name === "AbortError";
      setError(timedOut ? "La solicitud está tardando más de lo esperado. Puedes volver a intentarlo." : cause instanceof Error ? cause.message : "No pudimos preparar tu cotización. Inténtalo de nuevo.");
    } finally { inFlight.current = false; setWorking(false); setProgress(""); }
  }

  return (
    <>
      <button type="button" onClick={open} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-navy px-4 py-4 text-sm font-semibold text-white shadow-lg shadow-navy/15 transition hover:bg-navy-soft focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass">
        <QuoteIcon kind="download" />Descargar cotización
      </button>
      <dialog
        ref={dialog}
        aria-labelledby="cotizacion-titulo"
        aria-describedby="cotizacion-descripcion"
        onCancel={(event) => { if (inFlight.current) event.preventDefault(); }}
        className="m-auto max-h-[92dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl border border-brass/40 bg-white p-0 text-navy shadow-2xl backdrop:bg-navy-deep/80 backdrop:backdrop-blur-md"
        data-lenis-prevent
      >
        <div className="border-b border-navy/10 bg-gradient-to-b from-ivory to-white p-6 sm:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lg text-brass" aria-hidden="true">
                  verified_user
                </span>
                <p className="text-xs font-bold uppercase tracking-widest text-brass">Cotización personalizada</p>
              </div>
              <h3 id="cotizacion-titulo" className="mt-1 font-display text-2xl text-navy">Tu tabla de amortización</h3>
            </div>
            <button
              type="button"
              aria-label="Cerrar cotización"
              disabled={working}
              onClick={() => dialog.current?.close()}
              className="-mr-2 -mt-2 rounded-full p-2 transition hover:bg-navy/10 focus-visible:outline-brass disabled:opacity-40 cursor-pointer"
            >
              <QuoteIcon kind="close" />
            </button>
          </div>

          <p id="cotizacion-descripcion" className="mt-2.5 text-xs sm:text-sm leading-relaxed text-muted">
            Completa tus datos para descargar tu cotización oficial en PDF. Nuestro equipo recibirá una notificación para dar seguimiento personalizado a tu financiamiento.
          </p>

          {request && (
            <div className="mt-4 rounded-xl border border-brass/35 bg-brass/5 p-3.5">
              <div className="flex items-center justify-between text-xs font-bold text-navy">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-brass" aria-hidden="true">description</span>
                  {request.quote.service}
                </span>
                <span className="text-brass font-bold">
                  {request.quote.rate}% anual
                </span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-navy/10 pt-2 text-[11px] text-muted">
                <div>
                  Monto: <strong className="text-navy">{new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(request.quote.amount)}</strong>
                </div>
                <div className="text-right">
                  Plazo: <strong className="text-navy">{request.quote.months} meses ({request.quote.years} {request.quote.years === 1 ? "año" : "años"})</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={submit} className="space-y-4 p-6 sm:px-8">
          <fieldset disabled={working} className="space-y-3.5">
            <div>
              <label htmlFor="cotizacion-nombre" className="flex items-center justify-between text-xs font-semibold text-navy">
                <span>Nombre completo</span>
                <span className="text-[10px] text-muted">Obligatorio</span>
              </label>
              <input
                id="cotizacion-nombre"
                name="name"
                autoComplete="name"
                required
                maxLength={100}
                value={prospect.name}
                onChange={changeProspect}
                readOnly={notified}
                className={fieldClass}
                placeholder="Ej. Juan Pérez González"
              />
            </div>
            <div>
              <label htmlFor="cotizacion-correo" className="flex items-center justify-between text-xs font-semibold text-navy">
                <span>Correo electrónico</span>
                <span className="text-[10px] text-muted">Obligatorio</span>
              </label>
              <input
                id="cotizacion-correo"
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                value={prospect.email}
                onChange={changeProspect}
                readOnly={notified}
                className={fieldClass}
                placeholder="ejemplo@correo.com"
              />
            </div>
            <div>
              <label htmlFor="cotizacion-telefono" className="flex items-center justify-between text-xs font-semibold text-navy">
                <span>Teléfono de contacto</span>
                <span className="text-[10px] text-muted">10 dígitos</span>
              </label>
              <input
                id="cotizacion-telefono"
                name="phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                required
                maxLength={30}
                pattern="[+0-9\(\) .\-]{10,30}"
                title="Teléfono de 10 a 15 dígitos; puedes incluir la clave de país, espacios o guiones."
                value={prospect.phone}
                onChange={changeProspect}
                readOnly={notified}
                className={fieldClass}
                placeholder="55 1234 5678"
              />
            </div>
          </fieldset>

          {error && (
            <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-800">
              <span className="material-symbols-outlined shrink-0 text-base text-red-600" aria-hidden="true">error</span>
              <p>{error}</p>
            </div>
          )}

          {notified && (
            <div role="status" className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-900">
              <span className="material-symbols-outlined shrink-0 text-base text-emerald-600" aria-hidden="true">check_circle</span>
              <div>
                <strong className="block font-semibold">¡Solicitud recibida y notificada con éxito!</strong>
                <p className="mt-0.5 text-[11px] text-emerald-800">
                  Tu tabla de amortización se descargó. Nuestro equipo te contactará para asesorarte. Si la descarga no inició, pulsa el botón abajo.
                </p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={working}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-navy px-4 py-4 text-sm font-semibold text-white shadow-lg shadow-navy/20 transition-all duration-200 hover:bg-navy-soft hover:shadow-xl focus-visible:outline-brass disabled:cursor-wait disabled:opacity-75 cursor-pointer"
          >
            <QuoteIcon kind={working ? "loading" : "download"} />
            {working ? progress : notified ? "Volver a descargar PDF" : "Obtener mi cotización PDF"}
          </button>
          <p role="status" aria-live="polite" className="sr-only">{working ? progress : ""}</p>
          <div className="flex items-center justify-center gap-1.5 text-center text-[11px] leading-relaxed text-muted">
            <span className="material-symbols-outlined text-xs text-brass" aria-hidden="true">lock</span>
            <span>Tus datos están protegidos. La simulación es informativa y sin compromiso.</span>
          </div>
        </form>
      </dialog>
    </>
  );
}
