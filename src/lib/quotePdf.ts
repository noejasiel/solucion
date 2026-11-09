import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import { brand, contactEmail } from "../data/content.ts";
import type { CreditQuote, ProspectData } from "./credit.ts";

const navy = "#0a1f44";
const brass = "#c5a059";
const ivory = "#f8f7f2";
const muted = "#606774";
const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Se carga bajo demanda desde el simulador; no requiere un servicio de PDF. */
export async function buildQuotePdf(
  quote: CreditQuote,
  prospect?: Partial<ProspectData> | null,
  requestId: string = crypto.randomUUID(),
  issuedAt: Date = new Date(),
): Promise<Blob> {
  const logoResponse = await fetch(brand.logoLight, { signal: AbortSignal.timeout(10_000) }).catch(() => {
    throw new Error("No se pudo cargar el logotipo. Intenta descargar la cotización de nuevo.");
  });
  if (!logoResponse.ok) {
    throw new Error("No se pudo cargar el logotipo. Intenta descargar la cotización de nuevo.");
  }
  const logo = new Uint8Array(await logoResponse.arrayBuffer());
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter", compress: true });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const width = pageWidth - margin * 2;
  const folio = `SC-${requestId.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
  const date = new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Mexico_City",
  }).format(issuedAt);
  const logoInfo = doc.getImageProperties(logo);
  const logoSize = 29;
  const logoHeight = Math.min(logoSize, (logoInfo.height / logoInfo.width) * logoSize);
  const logoWidth = (logoInfo.width / logoInfo.height) * logoHeight;

  doc.setProperties({
    title: "Cotización de crédito y tabla de amortización",
    subject: prospect?.name ? `${quote.service} - ${prospect.name}` : quote.service,
    author: "Solución Crediticia",
    creator: "Solución Crediticia",
  });

  doc.setFillColor(navy);
  doc.roundedRect(margin - 2, 14, width + 4, 43, 3, 3, "F");
  doc.addImage(logo, "PNG", margin + 5, 21, logoWidth, logoHeight);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor("#ffffff");
  doc.text("SOLUCIÓN CREDITICIA", margin + 40, 28);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(brass);
  doc.text("Cotización de crédito", margin + 40, 36);
  doc.setFontSize(8);
  doc.setTextColor("#ffffff");
  doc.text(`Folio ${folio}`, margin + 40, 45);
  doc.text(date, margin + 40, 51);

  let y = 68;

  if (prospect?.name && prospect.name.trim().length > 0) {
    doc.setTextColor(navy);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("DATOS DEL SOLICITANTE", margin, 68);

    const infoRows = [
      ["Nombre", prospect.name],
      ...(prospect.email ? [["Correo", prospect.email]] : []),
      ...(prospect.phone ? [["Teléfono", prospect.phone]] : []),
    ];
    const clientLines = infoRows.map(([label, value]) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      return { label, lines: doc.splitTextToSize(value.replace(/\s+/g, " ").trim(), width - 37) as string[] };
    });
    const clientHeight = clientLines.reduce((height, row) => height + Math.max(7, row.lines.length * 4.5 + 2), 8);
    doc.setFillColor(ivory);
    doc.roundedRect(margin - 2, 73, width + 4, clientHeight, 2, 2, "F");
    let clientY = 80;
    for (const row of clientLines) {
      doc.setTextColor(muted);
      doc.setFontSize(8);
      doc.text(row.label, margin + 4, clientY);
      doc.setTextColor(navy);
      doc.setFontSize(10);
      doc.text(row.lines, margin + 32, clientY, { lineHeightFactor: 1.27 });
      clientY += Math.max(7, row.lines.length * 4.5 + 2);
    }
    y = 73 + clientHeight + 11;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(navy);
  doc.text("RESUMEN DEL FINANCIAMIENTO", margin, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const serviceLines = doc.splitTextToSize(quote.service, width) as string[];
  doc.text(serviceLines, margin, y + 7);
  y += 12 + (serviceLines.length - 1) * 4.5;

  const gap = 3;
  const cardWidth = (width - gap * 2) / 3;
  const cardHeight = 20;
  const summary = [
    ["Monto solicitado", money.format(quote.amount)],
    ["Tasa anual estimada", `${quote.rate}%`],
    ["Plazo", `${quote.years} ${quote.years === 1 ? "año" : "años"} / ${quote.months} meses`],
    ["Pago mensual estimado", money.format(quote.monthlyPayment)],
    ["Total de intereses", money.format(quote.totalInterest)],
    ["Total a pagar", money.format(quote.totalPayment)],
  ];
  summary.forEach(([label, value], index) => {
    const x = margin + (index % 3) * (cardWidth + gap);
    const top = y + Math.floor(index / 3) * (cardHeight + gap);
    const emphasize = index === 3;
    doc.setFillColor(emphasize ? navy : ivory);
    doc.roundedRect(x, top, cardWidth, cardHeight, 1.5, 1.5, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(emphasize ? "#ffffff" : muted);
    doc.text(label, x + 4, top + 6);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(index === 2 ? 10 : 11.5);
    doc.setTextColor(emphasize ? "#ffffff" : navy);
    doc.text(value, x + 4, top + 14);
  });

  y += cardHeight * 2 + gap + 11;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(navy);
  doc.text("TABLA DE AMORTIZACIÓN", margin, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(muted);
  const calculationNote = doc.splitTextToSize(
    "Interés simple calculado sobre el monto original. Importes en pesos mexicanos (MXN). El último pago puede variar por ajuste de centavos.",
    width,
  ) as string[];
  doc.text(calculationNote, margin, y + 5, { lineHeightFactor: 1.3 });
  const tableY = y + 8 + calculationNote.length * 3.5;

  autoTable(doc, {
    startY: tableY,
    margin: { top: 32, right: margin, bottom: 32, left: margin },
    tableWidth: width,
    theme: "plain",
    showHead: "everyPage",
    showFoot: "lastPage",
    rowPageBreak: "avoid",
    head: [["Mes", "Saldo inicial", "Interés", "Abono a capital", "Pago mensual", "Saldo final"]],
    body: quote.rows.map((row) => [
      String(row.month),
      money.format(row.openingBalance),
      money.format(row.interest),
      money.format(row.principal),
      money.format(row.payment),
      money.format(row.closingBalance),
    ]),
    foot: [["Totales", "", money.format(quote.totalInterest), money.format(quote.amount), money.format(quote.totalPayment), ""]],
    styles: {
      font: "helvetica",
      fontSize: 8,
      textColor: navy,
      cellPadding: { top: 1.7, right: 2.2, bottom: 1.7, left: 2.2 },
      halign: "right",
      valign: "middle",
      overflow: "linebreak",
      lineWidth: 0,
    },
    headStyles: { fillColor: navy, textColor: "#ffffff", fontStyle: "bold", fontSize: 7.5 },
    footStyles: { fillColor: navy, textColor: "#ffffff", fontStyle: "bold", fontSize: 8 },
    alternateRowStyles: { fillColor: ivory },
    columnStyles: {
      0: { cellWidth: 14, halign: "left" },
      1: { cellWidth: 34 },
      2: { cellWidth: 32 },
      3: { cellWidth: 35 },
      4: { cellWidth: 35 },
      5: { cellWidth: width - 150 },
    },
    willDrawPage: (data) => {
      if (data.pageNumber === 1) return;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(navy);
      doc.text("SOLUCIÓN CREDITICIA", margin, 16);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(`${folio} / Tabla de amortización`, pageWidth - margin, 16, { align: "right" });
      doc.setFontSize(8.5);
      doc.text(quote.service, margin, 23);
      doc.setDrawColor(brass);
      doc.setLineWidth(0.6);
      doc.line(margin, 27, pageWidth - margin, 27);
    },
  });

  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(brass);
    doc.setLineWidth(0.35);
    doc.line(margin, pageHeight - 25, pageWidth - margin, pageHeight - 25);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(muted);
    doc.text(
      doc.splitTextToSize(
        "Simulación informativa, sujeta a evaluación y aprobación. No constituye autorización de crédito ni compromiso de otorgamiento. El último pago puede variar por redondeo.",
        width,
      ),
      margin,
      pageHeight - 21,
      { lineHeightFactor: 1.3 },
    );
    doc.setFontSize(7.5);
    doc.text(contactEmail, margin, pageHeight - 10);
    doc.text(`Página ${page} de ${pages}`, pageWidth - margin, pageHeight - 10, { align: "right" });
  }

  return doc.output("blob");
}
