import * as XLSX from "xlsx";
import { fmtDate, fmtNumber } from "./format";

export interface ExportColumn<T> {
  key: string;
  header: string;
  value: (row: T) => string | number;
  numeric?: boolean;
}

export interface ExportPayload<T> {
  title: string;
  fileName: string;
  columns: ExportColumn<T>[];
  rows: T[];
  meta?: { label: string; value: string }[];
  totals?: { label: string; value: string }[];
}

function matrix<T>(p: ExportPayload<T>) {
  const head = p.columns.map((c) => c.header);
  const body = p.rows.map((r) => p.columns.map((c) => c.value(r)));
  return { head, body };
}

export function exportCSV<T>(p: ExportPayload<T>) {
  const { head, body } = matrix(p);
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = [head.map(esc).join(";"), ...body.map((r) => r.map(esc).join(";"))];
  if (p.totals?.length) lines.push("", ...p.totals.map((t) => `${esc(t.label)};${esc(t.value)}`));
  const blob = new Blob(["\uFEFF" + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
  download(blob, `${p.fileName}.csv`);
}

export function exportXLSX<T>(p: ExportPayload<T>) {
  const { head, body } = matrix(p);
  const aoa: (string | number)[][] = [];
  aoa.push([p.title]);
  if (p.meta?.length) p.meta.forEach((m) => aoa.push([`${m.label}: ${m.value}`]));
  aoa.push([]);
  aoa.push(head);
  body.forEach((r) => aoa.push(r));
  if (p.totals?.length) {
    aoa.push([]);
    p.totals.forEach((t) => aoa.push([t.label, t.value]));
  }
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = head.map((h, i) => ({
    wch: Math.max(
      12,
      Math.min(42, Math.max(h.length + 2, ...body.map((r) => String(r[i] ?? "").length + 2))),
    ),
  }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Hisobot");
  XLSX.writeFile(wb, `${p.fileName}.xlsx`);
}

export async function exportPDF<T>(p: ExportPayload<T>) {
  const [{ jsPDF }, autoTableMod] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  const autoTable = autoTableMod.default;
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const { head, body } = matrix(p);

  doc.setFontSize(13);
  doc.text("Elektr energiyasi qarzdorliklarini undirish bo'yicha HISOBOT", 40, 40);
  doc.setFontSize(10);
  doc.text(p.title, 40, 58);

  let y = 76;
  doc.setFontSize(9);
  (p.meta ?? []).forEach((m) => {
    doc.text(`${m.label}: ${m.value}`, 40, y);
    y += 13;
  });
  doc.text(`Hisobot shakllantirilgan sana: ${fmtDate(new Date().toISOString())}`, 40, y);
  y += 10;

  autoTable(doc, {
    head: [head],
    body: body.map((r) => r.map((v) => String(v))),
    startY: y + 6,
    styles: { fontSize: 7.5, cellPadding: 3 },
    headStyles: { fillColor: [13, 94, 99], textColor: 255, fontSize: 7.5 },
    alternateRowStyles: { fillColor: [238, 242, 243] },
    margin: { left: 40, right: 40, bottom: 40 },
  });

  const finalY =
    (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y;
  let ty = finalY + 18;
  doc.setFontSize(9);
  (p.totals ?? []).forEach((t) => {
    doc.text(`${t.label}: ${t.value}`, 40, ty);
    ty += 13;
  });

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `${i} / ${pages}`,
      doc.internal.pageSize.getWidth() - 60,
      doc.internal.pageSize.getHeight() - 20,
    );
  }
  doc.save(`${p.fileName}.pdf`);
}

export function printReport<T>(p: ExportPayload<T>) {
  const { head, body } = matrix(p);
  const win = window.open("", "_blank", "width=1100,height=800");
  if (!win) return;
  const meta = (p.meta ?? []).map((m) => `<div><b>${m.label}:</b> ${m.value}</div>`).join("");
  const totals = (p.totals ?? [])
    .map((t) => `<div><b>${t.label}:</b> ${t.value}</div>`)
    .join("");
  win.document.write(`<!doctype html><html lang="uz"><head><meta charset="utf-8">
  <title>${p.title}</title>
  <style>
    body{font-family:'IBM Plex Sans',Arial,sans-serif;padding:24px;color:#18232a}
    h1{font-size:16px;margin:0 0 4px} h2{font-size:13px;font-weight:500;color:#4b5a63;margin:0 0 12px}
    .meta{font-size:11px;display:flex;gap:18px;flex-wrap:wrap;margin-bottom:14px}
    table{width:100%;border-collapse:collapse;font-size:10px}
    th{background:#0d5e63;color:#fff;text-align:left;padding:6px;border:1px solid #0a4a4e}
    td{padding:5px 6px;border:1px solid #dde3e5}
    tr:nth-child(even) td{background:#f4f7f8}
    .totals{margin-top:14px;font-size:11px;display:flex;gap:18px;flex-wrap:wrap}
  </style></head><body>
  <h1>Elektr energiyasi qarzdorliklarini undirish bo'yicha HISOBOT</h1>
  <h2>${p.title}</h2>
  <div class="meta">${meta}<div><b>Shakllantirilgan:</b> ${fmtDate(new Date().toISOString())}</div></div>
  <table><thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
  <tbody>${body.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>
  <div class="totals">${totals}</div>
  </body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 350);
}

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export const num = (n: number) => fmtNumber(n);
