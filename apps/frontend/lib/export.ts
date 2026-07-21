// Module G — Share & Export everywhere. A single tabular model (title + headers +
// rows) renders to CSV / Excel (.xlsx) / PDF / Word (.docx) so any analytics,
// report, or list across the platform can offer all four. The heavy libs (xlsx,
// jspdf, docx) are imported DYNAMICALLY inside each exporter so they never weigh
// down the initial bundle — only the chosen format is loaded, on click.

export type Cell = string | number | null | undefined;
export type ExportFormat = "csv" | "xlsx" | "pdf" | "docx";

export interface ExportTable {
  /** Base file name WITHOUT extension (e.g. "candidates-2026-06"). */
  filename: string;
  /** Human title rendered on the PDF / Word doc + the sheet name. */
  title?: string;
  headers: string[];
  rows: Cell[][];
}

const cell = (v: Cell): string => (v === null || v === undefined ? "" : String(v));

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── CSV (kept backward-compatible) ───────────────────────────────────────────
export function exportToCSV(filename: string, headers: string[], rows: Cell[][]) {
  const escape = (v: Cell) => {
    const s = cell(v);
    return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers, ...rows].map((r) => r.map(escape).join(",")).join("\n");
  download(new Blob([csv], { type: "text/csv;charset=utf-8;" }), filename.endsWith(".csv") ? filename : `${filename}.csv`);
}

// ── Excel ────────────────────────────────────────────────────────────────────
export async function exportToXLSX(table: ExportTable) {
  const XLSX = await import("xlsx");
  const ws = XLSX.utils.aoa_to_sheet([table.headers, ...table.rows.map((r) => r.map(cell))]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, (table.title ?? "Export").slice(0, 31));
  const out = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  download(new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `${table.filename}.xlsx`);
}

// ── PDF ──────────────────────────────────────────────────────────────────────
export async function exportToPDF(table: ExportTable) {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  const doc = new jsPDF({ orientation: table.headers.length > 5 ? "landscape" : "portrait" });
  if (table.title) {
    doc.setFontSize(14);
    doc.text(table.title, 14, 16);
  }
  autoTable(doc, {
    head: [table.headers],
    body: table.rows.map((r) => r.map(cell)),
    startY: table.title ? 22 : 14,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [16, 122, 87] },
  });
  download(doc.output("blob"), `${table.filename}.pdf`);
}

// ── Word ─────────────────────────────────────────────────────────────────────
export async function exportToDOCX(table: ExportTable) {
  const { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, HeadingLevel, WidthType } = await import("docx");
  const headerRow = new TableRow({
    children: table.headers.map((h) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: h, bold: true })] })] })),
  });
  const bodyRows = table.rows.map(
    (r) => new TableRow({ children: r.map((c) => new TableCell({ children: [new Paragraph(cell(c))] })) }),
  );
  const doc = new Document({
    sections: [{
      children: [
        ...(table.title ? [new Paragraph({ text: table.title, heading: HeadingLevel.HEADING_1 })] : []),
        new Table({ rows: [headerRow, ...bodyRows], width: { size: 100, type: WidthType.PERCENTAGE } }),
      ],
    }],
  });
  const blob = await Packer.toBlob(doc);
  download(blob, `${table.filename}.docx`);
}

/** Dispatch to the chosen format. */
export async function exportTable(format: ExportFormat, table: ExportTable): Promise<void> {
  switch (format) {
    case "csv":  return exportToCSV(table.filename, table.headers, table.rows);
    case "xlsx": return exportToXLSX(table);
    case "pdf":  return exportToPDF(table);
    case "docx": return exportToDOCX(table);
  }
}

// ── Multi-table report ───────────────────────────────────────────────────────
// Some exports are not one table but a REPORT of several (e.g. an analytics page:
// KPIs + funnel + sources + inflow). This renders all of them into ONE artifact:
//   xlsx → one worksheet per section    pdf/docx → titled sections stacked
//   csv  → sections concatenated with a title line + blank-line separators
// Empty sections (no rows) are dropped so an export never contains a blank table.
export interface ExportReport {
  /** Base file name WITHOUT extension. */
  filename: string;
  /** Document title (top of PDF/Word, first CSV line). */
  title: string;
  /** Optional secondary line under the title (e.g. "Generated 2026-07-17"). */
  subtitle?: string;
  /** Each section is a titled table; its `title` becomes the sheet/section name. */
  sections: ExportTable[];
}

const sanitizeSheet = (name: string, i: number): string =>
  (name || `Sheet ${i + 1}`).replace(/[\\/?*[\]:]/g, " ").trim().slice(0, 31) || `Sheet ${i + 1}`;

export async function exportReport(format: ExportFormat, report: ExportReport): Promise<void> {
  const sections = report.sections.filter((s) => s.rows.length > 0);
  if (sections.length === 0) return;

  if (format === "csv") {
    const esc = (v: Cell) => {
      const s = cell(v);
      return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const head = report.title + (report.subtitle ? `\n${report.subtitle}` : "");
    const blocks = sections.map((s) =>
      `${s.title ?? ""}\n${[s.headers, ...s.rows].map((r) => r.map(esc).join(",")).join("\n")}`,
    );
    const csv = `${head}\n\n${blocks.join("\n\n")}\n`;
    download(new Blob([csv], { type: "text/csv;charset=utf-8;" }), `${report.filename}.csv`);
    return;
  }

  if (format === "xlsx") {
    const XLSX = await import("xlsx");
    const wb = XLSX.utils.book_new();
    const used = new Set<string>();
    sections.forEach((s, i) => {
      let name = sanitizeSheet(s.title ?? "", i);
      while (used.has(name.toLowerCase())) name = `${name.slice(0, 28)}~${i}`;
      used.add(name.toLowerCase());
      const aoa = [s.headers, ...s.rows.map((r) => r.map(cell))];
      const ws = XLSX.utils.aoa_to_sheet(aoa);
      // Auto-size each column to its longest cell so labels aren't truncated.
      const widths: number[] = [];
      aoa.forEach((r) => r.forEach((c, ci) => { const len = String(c ?? "").length; if (len > (widths[ci] ?? 0)) widths[ci] = len; }));
      ws["!cols"] = widths.map((w) => ({ wch: Math.min(60, Math.max(12, w + 2)) }));
      XLSX.utils.book_append_sheet(wb, ws, name);
    });
    const out = XLSX.write(wb, { type: "array", bookType: "xlsx" });
    download(new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `${report.filename}.xlsx`);
    return;
  }

  if (format === "pdf") {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const doc = new jsPDF();
    let y = 16;
    doc.setFontSize(15); doc.text(report.title, 14, y); y += 6;
    if (report.subtitle) { doc.setFontSize(10); doc.setTextColor(120); doc.text(report.subtitle, 14, y); doc.setTextColor(0); y += 4; }
    for (const s of sections) {
      if (y > 255) { doc.addPage(); y = 16; }
      if (s.title) { y += 4; doc.setFontSize(12); doc.text(s.title, 14, y); y += 2; }
      autoTable(doc, {
        head: [s.headers], body: s.rows.map((r) => r.map(cell)), startY: y + 2,
        styles: { fontSize: 8, cellPadding: 2 }, headStyles: { fillColor: [16, 122, 87] },
      });
      y = ((doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y) + 6;
    }
    download(doc.output("blob"), `${report.filename}.pdf`);
    return;
  }

  // docx
  const { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, HeadingLevel, WidthType } = await import("docx");
  const children: object[] = [new Paragraph({ text: report.title, heading: HeadingLevel.TITLE })];
  if (report.subtitle) children.push(new Paragraph({ children: [new TextRun({ text: report.subtitle, italics: true, color: "777777" })] }));
  for (const s of sections) {
    if (s.title) children.push(new Paragraph({ text: s.title, heading: HeadingLevel.HEADING_2 }));
    const headerRow = new TableRow({ children: s.headers.map((h) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: h, bold: true })] })] })) });
    const bodyRows = s.rows.map((r) => new TableRow({ children: r.map((c) => new TableCell({ children: [new Paragraph(cell(c))] })) }));
    children.push(new Table({ rows: [headerRow, ...bodyRows], width: { size: 100, type: WidthType.PERCENTAGE } }));
    children.push(new Paragraph(""));
  }
  const blob = await Packer.toBlob(new Document({ sections: [{ children: children as never }] }));
  download(blob, `${report.filename}.docx`);
}

// ── Free-form document export (candidate summary, interview record) ───────────
// Not every export is a table. A "section" doc renders titled paragraphs to PDF
// or Word — used by the candidate summary + interview-record exports.
export interface DocSection {
  heading: string;
  /** Lines of body text under the heading. */
  lines: string[];
}
export interface ExportDoc {
  filename: string;
  title: string;
  subtitle?: string;
  sections: DocSection[];
}

export async function exportDocToPDF(d: ExportDoc) {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  const margin = 14;
  let y = 18;
  doc.setFontSize(16); doc.text(d.title, margin, y); y += 7;
  if (d.subtitle) { doc.setFontSize(10); doc.setTextColor(120); doc.text(d.subtitle, margin, y); doc.setTextColor(0); y += 8; }
  for (const s of d.sections) {
    if (y > 270) { doc.addPage(); y = 18; }
    doc.setFontSize(12); doc.setFont(undefined as any, "bold"); doc.text(s.heading, margin, y); doc.setFont(undefined as any, "normal"); y += 6;
    doc.setFontSize(10);
    for (const line of s.lines) {
      const wrapped = doc.splitTextToSize(line, 180) as string[];
      for (const w of wrapped) {
        if (y > 285) { doc.addPage(); y = 18; }
        doc.text(w, margin, y); y += 5;
      }
    }
    y += 3;
  }
  download(doc.output("blob"), `${d.filename}.pdf`);
}

export async function exportDocToDOCX(d: ExportDoc) {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import("docx");
  const children: any[] = [new Paragraph({ text: d.title, heading: HeadingLevel.TITLE })];
  if (d.subtitle) children.push(new Paragraph({ children: [new TextRun({ text: d.subtitle, italics: true, color: "777777" })] }));
  for (const s of d.sections) {
    children.push(new Paragraph({ text: s.heading, heading: HeadingLevel.HEADING_2 }));
    for (const line of s.lines) children.push(new Paragraph(line));
  }
  const blob = await Packer.toBlob(new Document({ sections: [{ children }] }));
  download(blob, `${d.filename}.docx`);
}
