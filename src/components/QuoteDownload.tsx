import { useState } from "react";
import type { CreditQuote } from "../lib/credit.ts";
import QuoteIcon from "./QuoteIcon.tsx";

export default function QuoteDownload({ quote }: { quote: CreditQuote }) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    if (downloading) return;
    setDownloading(true);
    setError(null);
    try {
      const { buildQuotePdf } = await import("../lib/quotePdf.ts");
      const generated = await buildQuotePdf(quote, null);

      // Dispara la descarga directa con Data URI y nombre de archivo oficial .pdf
      const link = document.createElement("a");
      link.style.display = "none";
      link.href = generated.dataUri;
      link.download = generated.filename;
      link.setAttribute("download", generated.filename);
      document.body.appendChild(link);
      link.click();

      window.setTimeout(() => {
        try {
          if (link.parentNode) {
            link.parentNode.removeChild(link);
          }
        } catch {
          // Ignorar si ya fue removido
        }
      }, 2000);

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
    <div>
      <button
        type="button"
        id="btn-descargar-cotizacion"
        onClick={handleDownload}
        disabled={downloading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-navy px-4 py-4 text-sm font-semibold text-white shadow-lg shadow-navy/20 transition-all duration-200 hover:bg-navy-soft hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass disabled:cursor-wait disabled:opacity-75 cursor-pointer"
      >
        <QuoteIcon kind={downloading ? "loading" : "download"} />
        <span>
          {downloading ? "Generando cotización en PDF…" : "Descargar cotización oficial (PDF)"}
        </span>
      </button>

      {error && (
        <div
          role="alert"
          className="mt-2.5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-800"
        >
          <span className="material-symbols-outlined shrink-0 text-base text-red-600" aria-hidden="true">
            error
          </span>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
