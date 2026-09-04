import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ExportMenu } from "@/components/ExportMenu";
import { useApp } from "@/lib/store";
import { employees, territories, TODAY, CAMPAIGN_START } from "@/lib/demo-data";
import {
  buildCollectionRows,
  employeeStats,
  inRange,
  isSameDay,
  territoryStats,
  totalsOf,
  type CollectionRow,
  type CompanyRow,
} from "@/lib/derive";
import { fmtDate, fmtDateTime, fmtNumber, fmtPct, fmtShort, fmtSom, toISODate } from "@/lib/format";
import { DEBT_TYPE_LABEL, STATUS_LABEL, type CompanyStatus } from "@/lib/types";
import type { ExportColumn, ExportPayload } from "@/lib/export";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Hisobotlar — E-Energiya Nazorat" },
      {
        name: "description",
        content:
          "Qarzdorlik va undirish bo'yicha hisobotlarni shakllantirish hamda Excel, CSV va PDF formatida yuklab olish.",
      },
      { property: "og:title", content: "Hisobotlar — E-Energiya Nazorat" },
      {
        property: "og:description",
        content: "7 turdagi rasmiy hisobot, moslashuvchan filtrlar va eksport.",
      },
    ],
  }),
  component: ReportsPage,
});

type ReportKind =
  | "umumiy"
  | "undirishlar"
  | "hududlar"
  | "masullar"
  | "umidsiz"
  | "harakatdagi"
  | "kunlik";

const REPORTS: { id: ReportKind; label: string; desc: string }[] = [
  { id: "umumiy", label: "Umumiy qarzdorlik hisoboti", desc: "Korxonalar kesimida to'liq reestr" },
  { id: "undirishlar", label: "Undirishlar hisoboti", desc: "Har bir to'lov yozuvi bo'yicha" },
  { id: "hududlar", label: "Hududlar kesimida hisobot", desc: "13 hudud bo'yicha jamlanma" },
  { id: "masullar", label: "Mas'ullar kesimida hisobot", desc: "Xodimlar samaradorligi" },
  { id: "umidsiz", label: "Umidsiz qarzdorlik hisoboti", desc: "Faqat umidsiz qarzdorliklar" },
  { id: "harakatdagi", label: "Harakatdagi qarzdorlik hisoboti", desc: "Faqat harakatdagi qarzlar" },
  { id: "kunlik", label: "Kunlik undirish hisoboti", desc: "Kunlar kesimida undirish dinamikasi" },
];

interface DayRow {
  date: string;
  count: number;
  amount: number;
  companies: number;
}

function ReportsPage() {
  const { rows, collections } = useApp();

  const [kind, setKind] = useState<ReportKind>("umumiy");
  const [from, setFrom] = useState(toISODate(CAMPAIGN_START));
  const [to, setTo] = useState(toISODate(TODAY));
  const [terr, setTerr] = useState("all");
  const [emp, setEmp] = useState("all");
  const [company, setCompany] = useState("");
  const [stir, setStir] = useState("");
  const [debt, setDebt] = useState("all");
  const [status, setStatus] = useState("all");
  const [generated, setGenerated] = useState(true);

  const range = { from, to };

  const baseCompanies = useMemo(
    () =>
      rows.filter(
        (r) =>
          (terr === "all" || r.territory_id === terr) &&
          (emp === "all" || r.responsible_employee_id === emp) &&
          (!company || r.name.toLowerCase().includes(company.toLowerCase())) &&
          (!stir || r.stir.includes(stir)) &&
          (debt === "all" || r.debt_type === debt) &&
          (status === "all" || r.status === status),
      ),
    [rows, terr, emp, company, stir, debt, status],
  );

  const companyRows = useMemo(() => {
    if (kind === "umidsiz") return baseCompanies.filter((r) => r.debt_type === "umidsiz");
    if (kind === "harakatdagi") return baseCompanies.filter((r) => r.debt_type === "harakatdagi");
    return baseCompanies;
  }, [baseCompanies, kind]);

  const collectionRows = useMemo(() => {
    const ids = new Set(baseCompanies.map((r) => r.id));
    return buildCollectionRows(
      collections.filter(
        (c) =>
          ids.has(c.company_id) &&
          inRange(c.collection_date, range) &&
          (emp === "all" || c.employee_id === emp),
      ),
    );
  }, [baseCompanies, collections, range.from, range.to, emp]);

  const dayRows = useMemo<DayRow[]>(() => {
    const map = new Map<string, { amount: number; count: number; comps: Set<string> }>();
    collectionRows.forEach((c) => {
      const key = toISODate(new Date(c.collection_date));
      const e = map.get(key) ?? { amount: 0, count: 0, comps: new Set<string>() };
      e.amount += c.amount;
      e.count += 1;
      e.comps.add(c.company_id);
      map.set(key, e);
    });
    return [...map.entries()]
      .map(([date, v]) => ({ date, amount: v.amount, count: v.count, companies: v.comps.size }))
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [collectionRows]);

  const t = totalsOf(companyRows);
  const periodTotal = collectionRows.reduce((s, c) => s + c.amount, 0);
  const tStats = territoryStats(baseCompanies).filter((s) => s.companies > 0);
  const eStats = employeeStats(baseCompanies).filter((s) => s.companies > 0);

  const meta = [
    { label: "Hisobot davri", value: `${fmtDate(`${from}T00:00:00`)} — ${fmtDate(`${to}T00:00:00`)}` },
    {
      label: "Hudud",
      value: terr === "all" ? "Barchasi" : (territories.find((x) => x.id === terr)?.name ?? ""),
    },
    {
      label: "Mas'ul",
      value: emp === "all" ? "Barchasi" : (employees.find((x) => x.id === emp)?.full_name ?? ""),
    },
    { label: "Hisobot shakllantirilgan sana", value: fmtDateTime(TODAY.toISOString()) },
  ];

  const totalsBlock = [
    { label: "Jami qarzdorlik", value: fmtSom(t.initial) },
    { label: "Jami undirildi", value: fmtSom(t.collected) },
    { label: "Jami qoldiq", value: fmtSom(t.remaining) },
  ];

  const companyCols: ExportColumn<CompanyRow>[] = [
    { key: "n", header: "Korxona", value: (r) => r.name },
    { key: "s", header: "STIR", value: (r) => r.stir },
    { key: "h", header: "Hudud", value: (r) => r.territory.name },
    { key: "e", header: "Mas'ul", value: (r) => r.employee.full_name },
    { key: "t", header: "Qarzdorlik turi", value: (r) => DEBT_TYPE_LABEL[r.debt_type] },
    { key: "i", header: "Boshlang'ich qarzdorlik", value: (r) => r.initial_debt, numeric: true },
    { key: "c", header: "Undirilgan", value: (r) => r.collected, numeric: true },
    { key: "r", header: "Qoldiq", value: (r) => r.remaining, numeric: true },
    { key: "p", header: "Samaradorlik %", value: (r) => Number(r.percentage.toFixed(1)), numeric: true },
  ];

  const collectionCols: ExportColumn<CollectionRow>[] = [
    { key: "d", header: "Sana", value: (c) => fmtDateTime(c.collection_date) },
    { key: "n", header: "Korxona", value: (c) => c.company.name },
    { key: "s", header: "STIR", value: (c) => c.company.stir },
    { key: "h", header: "Hudud", value: (c) => c.territory.name },
    { key: "e", header: "Mas'ul", value: (c) => c.employee.full_name },
    { key: "a", header: "Undirilgan summa", value: (c) => c.amount, numeric: true },
    { key: "t", header: "Qarzdorlik turi", value: (c) => DEBT_TYPE_LABEL[c.company.debt_type] },
    { key: "c", header: "Izoh", value: (c) => c.comment },
  ];

  const active = REPORTS.find((r) => r.id === kind)!;

  const payload = (): ExportPayload<never> => {
    const base = { title: active.label, fileName: `hisobot-${kind}`, meta, totals: totalsBlock };
    if (kind === "undirishlar")
      return {
        ...base,
        totals: [{ label: "Tanlangan davrda undirildi", value: fmtSom(periodTotal) }],
        columns: collectionCols as unknown as ExportColumn<never>[],
        rows: collectionRows as unknown as never[],
      };
    if (kind === "kunlik")
      return {
        ...base,
        totals: [{ label: "Tanlangan davrda undirildi", value: fmtSom(periodTotal) }],
        columns: [
          { key: "d", header: "Sana", value: (r: DayRow) => fmtDate(`${r.date}T00:00:00`) },
          { key: "c", header: "To'lovlar soni", value: (r: DayRow) => r.count, numeric: true },
          { key: "k", header: "Korxonalar", value: (r: DayRow) => r.companies, numeric: true },
          { key: "a", header: "Undirilgan summa", value: (r: DayRow) => r.amount, numeric: true },
        ] as unknown as ExportColumn<never>[],
        rows: dayRows as unknown as never[],
      };
    if (kind === "hududlar")
      return {
        ...base,
        columns: [
          { key: "t", header: "Hudud", value: (r: (typeof tStats)[number]) => r.territory.name },
          { key: "c", header: "Korxonalar soni", value: (r: (typeof tStats)[number]) => r.companies, numeric: true },
          { key: "i", header: "Jami qarzdorlik", value: (r: (typeof tStats)[number]) => r.initial, numeric: true },
          { key: "u", header: "Umidsiz", value: (r: (typeof tStats)[number]) => r.umidsiz, numeric: true },
          { key: "h", header: "Harakatdagi", value: (r: (typeof tStats)[number]) => r.harakatdagi, numeric: true },
          { key: "td", header: "Bugun undirildi", value: (r: (typeof tStats)[number]) => r.today, numeric: true },
          { key: "ir", header: "Tanlangan davrda", value: (r: (typeof tStats)[number]) => r.in_range, numeric: true },
          { key: "tot", header: "Tadbir boshidan", value: (r: (typeof tStats)[number]) => r.total, numeric: true },
          { key: "r", header: "Qoldiq", value: (r: (typeof tStats)[number]) => r.remaining, numeric: true },
          { key: "p", header: "Samaradorlik %", value: (r: (typeof tStats)[number]) => Number(r.efficiency.toFixed(1)), numeric: true },
        ] as unknown as ExportColumn<never>[],
        rows: tStats as unknown as never[],
      };
    if (kind === "masullar")
      return {
        ...base,
        columns: [
          { key: "e", header: "Mas'ul", value: (r: (typeof eStats)[number]) => r.employee.full_name },
          { key: "t", header: "Hudud", value: (r: (typeof eStats)[number]) => r.territory.name },
          { key: "c", header: "Korxonalar soni", value: (r: (typeof eStats)[number]) => r.companies, numeric: true },
          { key: "i", header: "Biriktirilgan qarzdorlik", value: (r: (typeof eStats)[number]) => r.initial, numeric: true },
          { key: "td", header: "Bugun undirildi", value: (r: (typeof eStats)[number]) => r.today, numeric: true },
          { key: "ir", header: "Tanlangan davrda", value: (r: (typeof eStats)[number]) => r.in_range, numeric: true },
          { key: "tot", header: "Tadbir boshidan", value: (r: (typeof eStats)[number]) => r.total, numeric: true },
          { key: "r", header: "Qoldiq", value: (r: (typeof eStats)[number]) => r.remaining, numeric: true },
          { key: "p", header: "Samaradorlik %", value: (r: (typeof eStats)[number]) => Number(r.efficiency.toFixed(1)), numeric: true },
        ] as unknown as ExportColumn<never>[],
        rows: eStats as unknown as never[],
      };
    return {
      ...base,
      columns: companyCols as unknown as ExportColumn<never>[],
      rows: companyRows as unknown as never[],
    };
  };

  const reset = () => {
    setFrom(toISODate(CAMPAIGN_START));
    setTo(toISODate(TODAY));
    setTerr("all");
    setEmp("all");
    setCompany("");
    setStir("");
    setDebt("all");
    setStatus("all");
  };

  const inputCls = "h-9 w-full rounded-lg border border-border bg-muted px-2.5 text-[13px]";

  return (
    <AppShell
      title="Hisobotlar"
      subtitle="Filtrlar asosida rasmiy hisobotlarni shakllantiring va yuklab oling"
      crumbs={[{ label: "Dashboard", to: "/" }, { label: "Hisobotlar" }]}
      actions={generated ? <ExportMenu payload={payload} /> : undefined}
    >
      <div className="no-print grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-7">
        {REPORTS.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => {
              setKind(r.id);
              setGenerated(true);
            }}
            className={cn(
              "rounded-xl p-3 text-left ring-1 transition-colors",
              kind === r.id
                ? "bg-primary text-primary-foreground ring-primary"
                : "bg-card ring-border hover:bg-muted",
            )}
          >
            <p className="text-[12px] font-medium leading-tight">{r.label}</p>
            <p
              className={cn(
                "mt-1 text-[10px] leading-tight",
                kind === r.id ? "text-primary-foreground/70" : "text-muted-foreground",
              )}
            >
              {r.desc}
            </p>
          </button>
        ))}
      </div>

      <section className="card-surface no-print p-5">
        <h2 className="text-[15px] font-semibold tracking-tight">Hisobot filtrlari</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Field label="Boshlanish sanasi">
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Tugash sanasi">
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Hudud">
            <select value={terr} onChange={(e) => setTerr(e.target.value)} className={inputCls}>
              <option value="all">Barchasi</option>
              {territories.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Mas'ul">
            <select value={emp} onChange={(e) => setEmp(e.target.value)} className={inputCls}>
              <option value="all">Barchasi</option>
              {employees.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.full_name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Korxona">
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Korxona nomi"
              className={inputCls}
            />
          </Field>
          <Field label="STIR">
            <input
              value={stir}
              onChange={(e) => setStir(e.target.value.replace(/\D/g, ""))}
              placeholder="STIR"
              className={inputCls}
            />
          </Field>
          <Field label="Qarzdorlik turi">
            <select value={debt} onChange={(e) => setDebt(e.target.value)} className={inputCls}>
              <option value="all">Barchasi</option>
              <option value="umidsiz">Umidsiz</option>
              <option value="harakatdagi">Harakatdagi</option>
            </select>
          </Field>
          <Field label="Holati">
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
              <option value="all">Barchasi</option>
              {(Object.keys(STATUS_LABEL) as CompanyStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setGenerated(true)}
            className="h-9 rounded-lg bg-primary px-4 text-[13px] font-medium text-primary-foreground hover:opacity-90"
          >
            Filtrlash
          </button>
          <button
            type="button"
            onClick={reset}
            className="h-9 rounded-lg px-4 text-[13px] ring-1 ring-border hover:bg-muted"
          >
            Tozalash
          </button>
          <button
            type="button"
            onClick={() => setGenerated(true)}
            className="h-9 rounded-lg bg-accent px-4 text-[13px] font-medium text-accent-foreground hover:opacity-90"
          >
            Hisobotni shakllantirish
          </button>
        </div>
      </section>

      {generated && (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            <Summary label="Korxonalar" value={`${companyRows.length} ta`} />
            <Summary label="Jami qarzdorlik" value={fmtShort(t.initial)} />
            <Summary label="Undirildi" value={fmtShort(t.collected)} accent />
            <Summary label="Qoldiq" value={fmtShort(t.remaining)} />
            <Summary label="Samaradorlik" value={fmtPct(t.efficiency)} />
          </div>

          <section className="card-surface overflow-hidden">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-[15px] font-semibold tracking-tight">{active.label}</h2>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                {meta.map((m) => `${m.label}: ${m.value}`).join(" · ")}
              </p>
            </div>
            <div className="max-h-[560px] overflow-auto">
              {kind === "undirishlar" && (
                <ReportTable
                  head={["Sana", "Korxona", "STIR", "Hudud", "Mas'ul", "Summa", "Izoh"]}
                  rows={collectionRows.slice(0, 300).map((c) => [
                    fmtDateTime(c.collection_date),
                    c.company.name,
                    c.company.stir,
                    c.territory.name,
                    c.employee.short_name,
                    fmtNumber(c.amount),
                    c.comment,
                  ])}
                  numericFrom={5}
                />
              )}
              {kind === "kunlik" && (
                <ReportTable
                  head={["Sana", "To'lovlar soni", "Korxonalar", "Undirilgan summa"]}
                  rows={dayRows.map((d) => [
                    fmtDate(`${d.date}T00:00:00`),
                    String(d.count),
                    String(d.companies),
                    fmtNumber(d.amount),
                  ])}
                  numericFrom={1}
                />
              )}
              {kind === "hududlar" && (
                <ReportTable
                  head={[
                    "Hudud",
                    "Korxonalar",
                    "Jami qarzdorlik",
                    "Umidsiz",
                    "Harakatdagi",
                    "Bugun",
                    "Davrda",
                    "Qoldiq",
                    "Samaradorlik %",
                  ]}
                  rows={tStats.map((s) => [
                    s.territory.name,
                    String(s.companies),
                    fmtNumber(s.initial),
                    fmtNumber(s.umidsiz),
                    fmtNumber(s.harakatdagi),
                    fmtNumber(s.today),
                    fmtNumber(s.in_range),
                    fmtNumber(s.remaining),
                    s.efficiency.toFixed(1),
                  ])}
                  numericFrom={1}
                />
              )}
              {kind === "masullar" && (
                <ReportTable
                  head={[
                    "Mas'ul",
                    "Hudud",
                    "Korxonalar",
                    "Qarzdorlik",
                    "Bugun",
                    "Davrda",
                    "Tadbir boshidan",
                    "Qoldiq",
                    "Samaradorlik %",
                  ]}
                  rows={eStats.map((s) => [
                    s.employee.full_name,
                    s.territory.name,
                    String(s.companies),
                    fmtNumber(s.initial),
                    fmtNumber(s.today),
                    fmtNumber(s.in_range),
                    fmtNumber(s.total),
                    fmtNumber(s.remaining),
                    s.efficiency.toFixed(1),
                  ])}
                  numericFrom={2}
                />
              )}
              {(kind === "umumiy" || kind === "umidsiz" || kind === "harakatdagi") && (
                <ReportTable
                  head={[
                    "Korxona",
                    "STIR",
                    "Hudud",
                    "Mas'ul",
                    "Turi",
                    "Boshlang'ich",
                    "Undirilgan",
                    "Qoldiq",
                    "Samaradorlik %",
                  ]}
                  rows={companyRows.map((r) => [
                    r.name,
                    r.stir,
                    r.territory.name,
                    r.employee.short_name,
                    DEBT_TYPE_LABEL[r.debt_type],
                    fmtNumber(r.initial_debt),
                    fmtNumber(r.collected),
                    fmtNumber(r.remaining),
                    r.percentage.toFixed(1),
                  ])}
                  numericFrom={5}
                />
              )}
            </div>
            <div className="flex flex-wrap justify-end gap-6 border-t border-border bg-muted/60 px-5 py-3 font-mono text-[12px]">
              <span>Jami qarzdorlik: {fmtSom(t.initial)}</span>
              <span className="text-accent">Jami undirildi: {fmtSom(t.collected)}</span>
              <span>Jami qoldiq: {fmtSom(t.remaining)}</span>
            </div>
          </section>
        </>
      )}
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Summary({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="card-surface p-4">
      <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1.5 font-mono text-[20px] font-semibold tnum",
          accent && "text-accent",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function ReportTable({
  head,
  rows,
  numericFrom,
}: {
  head: string[];
  rows: string[][];
  numericFrom: number;
}) {
  return (
    <table className="w-full min-w-[900px] text-[12px]">
      <thead className="sticky top-0 bg-muted text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
        <tr>
          {head.map((h, i) => (
            <th
              key={h}
              className={cn("px-3 py-2 font-medium", i >= numericFrom ? "text-right" : "text-left")}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {rows.map((r, i) => (
          <tr key={i} className="hover:bg-muted/50">
            {r.map((c, j) => (
              <td
                key={j}
                className={cn(
                  "px-3 py-2",
                  j >= numericFrom ? "text-right font-mono tnum" : "",
                  j === 0 ? "font-medium" : "",
                )}
              >
                {c}
              </td>
            ))}
          </tr>
        ))}
        {rows.length === 0 && (
          <tr>
            <td colSpan={head.length} className="px-3 py-10 text-center text-muted-foreground">
              Tanlangan filtrlar bo'yicha ma'lumot topilmadi.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
