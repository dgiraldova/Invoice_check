import type { VisitRow } from "./types";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";

const toExportRows = (rows: VisitRow[]) =>
  rows.map((row) => ({
    Hora: new Date(row.event.start).toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit"
    }),
    Empresa: row.event.summary,
    Calendario: row.event.calendar ?? "-",
    Estado: row.status,
    "Tipo evidencia": row.billing.type ?? "-",
    "Asunto correo": row.billing.subject ?? "-",
    "Fecha correo": row.billing.receivedAt ?? "-",
    "Informe encontrado": row.report.found ? "Sí" : "No",
    "Nombre informe": row.report.filename ?? "-",
    "Ruta informe": row.report.path ?? "-",
    Observaciones: row.observation
  }));

const encodeCsv = (rows: VisitRow[]) => {
  const data = toExportRows(rows);
  const headers = Object.keys(data[0] ?? {});
  const escapeValue = (value: string) =>
    value.includes(",") || value.includes("\n") || value.includes("\"")
      ? `"${value.replace(/\"/g, '""')}"`
      : value;

  const lines = [headers.join(",")];
  for (const item of data) {
    const line = headers.map((key) => escapeValue(String(item[key as keyof typeof item] ?? "")));
    lines.push(line.join(","));
  }
  return lines.join("\n");
};

export const exportService = {
  async exportCSV(rows: VisitRow[], filePath: string) {
    const csv = encodeCsv(rows);
    await window.electronAPI.writeFile(filePath, csv);
  },

  async exportXLSX(rows: VisitRow[], filePath: string) {
    const worksheet = XLSX.utils.json_to_sheet(toExportRows(rows));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Visitas");
    const buffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
    await window.electronAPI.writeFile(filePath, new Uint8Array(buffer));
  },

  async exportPDF(rows: VisitRow[], filePath: string) {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(12);
    doc.text("Revisión de facturación de visitas", 14, 12);
    doc.setFontSize(9);

    const data = toExportRows(rows);
    const headers = Object.keys(data[0] ?? {});
    let y = 20;

    doc.text(headers.join(" | "), 14, y);
    y += 6;

    for (const row of data) {
      const line = headers.map((key) => String(row[key as keyof typeof row] ?? "-")).join(" | ");
      doc.text(line.slice(0, 250), 14, y);
      y += 6;
      if (y > 190) {
        doc.addPage();
        y = 20;
      }
    }

    const pdfBytes = doc.output("arraybuffer");
    await window.electronAPI.writeFile(filePath, new Uint8Array(pdfBytes));
  }
};
