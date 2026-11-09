import { useState, useEffect, useRef } from "react";
import type { CreditQuote } from "../lib/credit.ts";
import QuoteIcon from "./QuoteIcon.tsx";

function downloadPdfBlob(blob: Blob, filename: string): string {
  // Aseguramos tipo MIME application/pdf
  const pdfBlob = blob.type === "application/pdf"
    ? blob
    : new Blob([blob], { type: "application/pdf" });

  const url = URL.createObjectURL(pdfBlob);

  const link = document.createElement("a");
  link.style.position = "fixed";
  link.style.left = "-9999px";
  link.style.top = "-9999px";
  link.style.opacity = "0";
  link.href = url;
  link.setAttribute("download", filename);
  link.download = filename;
  link.target = "_self";

  document.body.appendChild(link);

  // Ejecuta la descarga con evento de clic en el DOM
  link.click();

  // Mantiene el enlace en el DOM durante 20 segundos antes de desmontarlo,
  // permitiendo que Chromium/Chrome procese el atributo download sin carrera.
  window.setTimeout(() => {
    try {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    } catch {
      // Ignora si ya fue desmontado
    }
  }, 20_000);

  return url;
}

export default function QuoteDownload({ quote }: { quote: CreditQuote }) {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [filename, setFilename] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const activeUrlRef = useRef<string | null>(null);

  // Limpia el ObjectURL cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (activeUrlRef.current) {
        URL.revokeObjectURL(activeUrlRef.current);
      }
    };
  }, []);

  // Si cambian los parámetros de la cotización, resetea el URL previo para regenerar cuando haga clic
  useEffect(() => {
    if (activeUrlRef.current) {
      URL.revokeObjectURL(activeUrlRef.current);
      activeUrlRef.current = null;
    }
    setPdfUrl(null);
    setDownloaded(false);
  }, [quote.amount, quote.years, quote.rate, quote.service]);

  async function handleDownload() {
    if (downloading) return;
    setDownloading(true);
    setError(null);
    try {
      const { buildQuotePdf } = await import("../lib/quotePdf.ts");
      const id = crypto.randomUUID();
      const blob = await buildQuotePdf(quote, null, id, new Date());
      const folio = id.slice(0, 8);
      const generatedFilename = `cotizacion-solucion-crediticia-${folio}.pdf`;

      // Libera URL anterior si existía
      if (activeUrlRef.current) {
        URL.revokeObjectURL(activeUrlRef.current);
      }

      const url = downloadPdfBlob(blob, generatedFilename);
      activeUrlRef.current = url;
      setPdfUrl(url);
      setFilename(generatedFilename);
      setDownloaded(true);

      const win = window as unknown as { dataLayer?: Record<string, unknown>[] };
      win.dataLayer = win.dataLayer || [];
      win.dataLayer.push({
        event: "quote_downloaded",
        service: quote.service,
        amount: quote.amount,
        rate: quote.rate,
        months: quote.months,
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No pudimos generar tu cotización. Inténtalo de nuevo.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        id="btn-descargar-cotizacion"
        onClick={handleDownload}
        disabled={downloading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-navy px-4 py-4 text-sm font-semibold text-white shadow-lg shadow-navy/20 transition-all duration-200 hover:bg-navy-soft hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass disabled:cursor-wait disabled:opacity-75 cursor-pointer"
      >
        <QuoteIcon kind={downloading ? "loading" : "download"} />
        <span>
          {downloading
            ? "Generando cotización oficial…"
            : downloaded
            ? "Volver a generar y descargar cotización"
            : "Descargar cotización oficial (PDF)"}
        </span>
      </button>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-800"
        >
          <span className="material-symbols-outlined shrink-0 text-base text-red-600" aria-hidden="true">
            error
          </span>
          <p>{error}</p>
        </div>
      )}

      {downloaded && pdfUrl && !downloading && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50/80 p-3.5 text-xs text-emerald-950 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-1.5 font-bold text-emerald-900">
            <span className="material-symbols-outlined text-base text-emerald-600" aria-hidden="true">
              check_circle
            </span>
            <span>¡Cotización en PDF generada exitosamente!</span>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-emerald-800">
            La descarga inició automáticamente. Si tu navegador no la guardó con la extensión .pdf, pulsa directamente aquí:
          </p>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <a
              href={pdfUrl}
              download={filename}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-emerald-800 focus-visible:outline-emerald-700"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              Guardar archivo PDF
            </a>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-900 shadow-sm transition hover:bg-emerald-100/60 focus-visible:outline-emerald-700"
            >
              <span className="material-symbols-outlined text-sm">open_in_new</span>
              Ver PDF en pantalla
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
