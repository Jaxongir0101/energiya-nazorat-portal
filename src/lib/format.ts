const nf = (n: number, d = 0) =>
  n
    .toLocaleString("ru-RU", { minimumFractionDigits: d, maximumFractionDigits: d })
    .replace(/\u00a0/g, " ");

/** 1 250 000 000 so'm */
export function fmtSom(n: number): string {
  return `${nf(Math.round(n))} so'm`;
}

export function fmtNumber(n: number): string {
  return nf(Math.round(n));
}

/** 1,25 mlrd / 850 mln */
export function fmtShort(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `${nf(n / 1_000_000_000, 2)} mlrd`;
  if (abs >= 1_000_000) return `${nf(n / 1_000_000, 0)} mln`;
  if (abs >= 1_000) return `${nf(n / 1_000, 0)} ming`;
  return nf(n);
}

/** 1,25 mlrd so'm */
export function fmtShortSom(n: number): string {
  return `${fmtShort(n)} so'm`;
}

export function fmtPct(n: number): string {
  return `${nf(n, 1)}%`;
}

export function pct(part: number, total: number): number {
  if (!total) return 0;
  return (part / total) * 100;
}

export function fmtDate(iso: string): string {
  const d = new Date(iso);
  const p = (x: number) => String(x).padStart(2, "0");
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}`;
}

export function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  const p = (x: number) => String(x).padStart(2, "0");
  return `${fmtDate(iso)} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

const MONTHS = [
  "yanvar",
  "fevral",
  "mart",
  "aprel",
  "may",
  "iyun",
  "iyul",
  "avgust",
  "sentyabr",
  "oktyabr",
  "noyabr",
  "dekabr",
];

export function fmtLongDate(d: Date): string {
  return `${d.getFullYear()}-yil ${d.getDate()}-${MONTHS[d.getMonth()]}`;
}

export function timeAgo(iso: string, now: Date): string {
  const diff = Math.max(0, now.getTime() - new Date(iso).getTime());
  const min = Math.floor(diff / 60000);
  if (min < 1) return "hozirgina";
  if (min < 60) return `${min} daqiqa oldin`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} soat oldin`;
  const d = Math.floor(h / 24);
  return `${d} kun oldin`;
}

export function toISODate(d: Date): string {
  const p = (x: number) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
