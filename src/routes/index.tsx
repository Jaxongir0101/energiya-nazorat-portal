import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AppLink, useGo } from "@/components/AppLink";
import { GlobalFilters } from "@/components/GlobalFilters";
import { KpiCard, Panel } from "@/components/Kpi";
import { AddCollectionDialog } from "@/components/AddCollectionDialog";
import { useApp } from "@/lib/store";
import {
  buildCollectionRows,
  employeeStats,
  inRange,
  isSameDay,
  territoryStats,
  totalsOf,
} from "@/lib/derive";
import { TODAY } from "@/lib/demo-data";
import { fmtLongDate, fmtPct, fmtShort, fmtShortSom, fmtSom, pct, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — E-Energiya Nazorat" },
      {
        name: "description",
        content:
          "Jizzax viloyati bo'yicha elektr energiyasi qarzdorliklari va undirish natijalarining real vaqtdagi monitoringi.",
      },
      { property: "og:title", content: "Dashboard — E-Energiya Nazorat" },
      {
        property: "og:description",
        content: "Qarzdorlik, undirish va samaradorlik ko'rsatkichlari bo'yicha boshqaruv paneli.",
      },
    ],
  }),
  component: Dashboard,
});

type ChartPeriod = "bugun" | "hafta" | "oy" | "tadbir";
type ChartSort = "kop" | "kam";

function Dashboard() {
  const { filteredRows, collections, filter, sector } = useApp();
  const go = useGo();
  const [period, setPeriod] = useState<ChartPeriod>("tadbir");
  const [sortBy, setSortBy] = useState<ChartSort>("kop");

  const t = totalsOf(filteredRows);

  const yesterdayTotal = useMemo(() => {
    const y = new Date(TODAY);
    y.setDate(y.getDate() - 1);
    const ids = new Set(filteredRows.map((r) => r.id));
    return collections
      .filter((c) => ids.has(c.company_id) && isSameDay(c.collection_date, y))
      .reduce((s, c) => s + c.amount, 0);
  }, [collections, filteredRows]);

  const delta = yesterdayTotal ? ((t.collected_today - yesterdayTotal) / yesterdayTotal) * 100 : 0;

  const empBase = employeeStats(filteredRows);
  const empChart = useMemo(() => {
    const ids = new Set(filteredRows.map((r) => r.id));
    const weekStart = new Date(TODAY);
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);
    const monthStart = new Date(TODAY.getFullYear(), TODAY.getMonth(), 1);

    const inPeriod = (iso: string) => {
      if (period === "bugun") return isSameDay(iso, TODAY);
      if (period === "tadbir") return true;
      const d = new Date(iso);
      return period === "hafta" ? d >= weekStart : d >= monthStart;
    };

    const map = new Map<string, number>();
    collections
      .filter((c) => ids.has(c.company_id) && inPeriod(c.collection_date))
      .forEach((c) => map.set(c.employee_id, (map.get(c.employee_id) ?? 0) + c.amount));

    const list = empBase.map((e) => ({ ...e, amount: map.get(e.employee.id) ?? 0 }));
    if (sortBy === "kam") list.sort((a, b) => a.amount - b.amount);
    else list.sort((a, b) => b.amount - a.amount);
    return list.slice(0, 8);
  }, [collections, filteredRows, empBase, period, sortBy]);

  const terrStats = territoryStats(filteredRows);
  const terrMax = Math.max(1, ...terrStats.map((s) => s.initial));


  const recent = useMemo(() => {
    const ids = new Set(filteredRows.map((r) => r.id));
    return buildCollectionRows(collections.filter((c) => ids.has(c.company_id))).slice(0, 6);
  }, [collections, filteredRows]);

  const inRangeTotal = useMemo(() => {
    const ids = new Set(filteredRows.map((r) => r.id));
    return collections
      .filter((c) => ids.has(c.company_id) && inRange(c.collection_date, filter.range))
      .reduce((s, c) => s + c.amount, 0);
  }, [collections, filteredRows, filter.range]);

  return (
    <AppShell
      title={`${sector === "gaz" ? "Tabiiy gaz" : "Elektr energiyasi"} qarzdorliklari monitoringi`}
      subtitle={`Jizzax viloyati · 13 hudud · 26 mas'ul xodim · ${fmtLongDate(TODAY)}`}
      actions={<AddCollectionDialog />}
    >
      <GlobalFilters />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          label="Jami qarzdorlik"
          value={fmtShort(t.initial)}
          hint={`${t.companies.toLocaleString("ru-RU")} ta qarzdor korxona`}
          to="/debtors"
        />
        <KpiCard
          label="Umidsiz"
          value={fmtShort(t.umidsiz)}
          tone="deep"
          hint={`${fmtPct(pct(t.umidsiz, t.remaining))} ulush`}
          to="/debtors?type=umidsiz"
        />
        <KpiCard
          label="Harakatdagi"
          value={fmtShort(t.harakatdagi)}
          hint={`${fmtPct(pct(t.harakatdagi, t.remaining))} ulush`}
          to="/debtors?type=harakatdagi"
        />
        <KpiCard
          label="Bugun undirildi"
          value={fmtShort(t.collected_today)}
          tone="accent"
          accent
          hint={
            <span>
              <span className={delta >= 0 ? "text-positive" : "text-negative"}>
                {delta >= 0 ? "▲" : "▼"} {fmtPct(Math.abs(delta))}
              </span>{" "}
              <span className="text-muted-foreground">kechagiga nisbatan</span>
            </span>
          }
          to="/collections?period=bugun"
        />
        <KpiCard
          label="Tadbir boshidan"
          value={fmtShort(t.collected)}
          hint={`${fmtPct(t.efficiency)} undirildi`}
          to="/collections"
        />
        <KpiCard
          label="Qolgan qarzdorlik"
          value={fmtShort(t.remaining)}
          hint={`${fmtPct(pct(t.remaining, t.initial))} qoldi`}
          to="/debtors"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <Panel
          className="xl:col-span-3"
          title="Mas'ullar kesimida undirish natijalari"
          right={
            <div className="flex flex-wrap items-center gap-1 font-mono text-[11px]">
              {(["bugun", "hafta", "oy", "tadbir"] as ChartPeriod[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "rounded px-2 py-1",
                    period === p ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                  )}
                >
                  {p === "tadbir"
                    ? "Tadbir boshidan"
                    : p === "bugun"
                      ? "Bugun"
                      : p === "hafta"
                        ? "Hafta"
                        : "Oy"}
                </button>
              ))}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as ChartSort)}
                className="ml-1 h-7 rounded border border-border bg-card px-1.5"
              >
                <option value="kop">Eng ko'p undirgan</option>
                <option value="kam">Eng kam undirgan</option>
              </select>
            </div>
          }
        >
          <div className="space-y-3.5">
            {empChart.map((e) => (
              <button
                key={e.employee.id}
                type="button"
                onClick={() => go(`/employees/${e.employee.id}`)}
                className="block w-full text-left"
              >
                <div className="mb-1 flex justify-between text-[12px]">
                  <span className="font-medium">
                    {e.employee.short_name}
                    <span className="ml-1.5 text-muted-foreground">· {e.territory.name}</span>
                  </span>
                  <span className="font-mono tnum text-muted-foreground">
                    {fmtShort(e.amount)} / {fmtShort(e.initial)} so'm
                  </span>
                </div>
                <div className="relative h-6 overflow-hidden rounded-md bg-muted">
                  <div
                    className="bar-grow flex h-full items-center justify-end rounded-md bg-gradient-to-r from-brand-deep to-brand pr-2"
                    style={{ width: `${Math.max(6, Math.min(100, pct(e.amount, e.initial)))}%` }}
                  >
                    <span className="font-mono text-[10px] font-semibold tnum text-primary-foreground">
                      {fmtPct(pct(e.amount, e.initial))}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Panel>

        <section className="card-surface overflow-hidden p-5 xl:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold tracking-tight">
              Qarzdorlik va undirish taqsimoti
            </h2>
            <Link to="/territories" className="font-mono text-[11px] text-primary hover:underline">
              13 hudud →
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {terrStats.map((s) => (
              <button
                key={s.territory.id}
                type="button"
                onClick={() => go(`/territories/${s.territory.id}`)}
                className="block w-full text-left"
              >
                <div className="mb-1 flex justify-between text-[12px]">
                  <span className="font-medium">{s.territory.name}</span>
                  <span className="font-mono tnum text-muted-foreground">
                    {fmtShort(s.total)} / {fmtShort(s.initial)}
                  </span>
                </div>
                <div className="relative h-5 overflow-hidden rounded-md bg-muted">
                  <div
                    className="absolute inset-y-0 left-0 rounded-md bg-brand/25"
                    style={{ width: `${(s.initial / terrMax) * 100}%` }}
                  />
                  <div
                    className="bar-grow absolute inset-y-0 left-0 rounded-md bg-accent"
                    style={{ width: `${((s.total / terrMax) * 100).toFixed(2)}%` }}
                  />
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

      <Panel
        title="So'nggi undirishlar"
        right={
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] text-muted-foreground">
              Tanlangan davrda: {fmtSom(inRangeTotal)}
            </span>
            <Link to="/collections" className="font-mono text-[12px] text-primary hover:underline">
              Barchasi →
            </Link>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {recent.map((c) => (
            <AppLink
              key={c.id}
              to={`/debtors/${c.company_id}`}
              className="block rounded-lg p-3.5 ring-1 ring-border transition-transform hover:-translate-y-0.5"
            >
              <p className="truncate text-[13px] font-medium">{c.company.name}</p>
              <p className="mt-1 font-mono text-[15px] font-semibold tnum text-accent">
                +{fmtSom(c.amount)}
              </p>
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                {c.employee.short_name} · {timeAgo(c.collection_date, TODAY)}
              </p>
            </AppLink>
          ))}
        </div>
      </Panel>
    </AppShell>
  );
}
