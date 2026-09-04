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
type ChartSort = "kop" | "kam" | "hudud";

function Dashboard() {
  const { filteredRows, collections, filter } = useApp();
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
    else if (sortBy === "hudud")
      list.sort((a, b) => a.territory.name.localeCompare(b.territory.name, "uz"));
    else list.sort((a, b) => b.amount - a.amount);
    return list.slice(0, 8);
  }, [collections, filteredRows, empBase, period, sortBy]);

  const maxAmount = Math.max(1, ...empChart.map((e) => e.amount));
  const terrStats = territoryStats(filteredRows).slice(0, 8);

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
      title="Elektr energiyasi qarzdorliklari monitoringi"
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
                <option value="hudud">Hudud bo'yicha</option>
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
                    {fmtShortSom(e.amount)}
                  </span>
                </div>
                <div className="h-6 overflow-hidden rounded-md bg-muted">
                  <div
                    className="bar-grow h-full rounded-md bg-gradient-to-r from-brand-deep to-brand"
                    style={{ width: `${Math.max(2, (e.amount / maxAmount) * 100)}%` }}
                  />
                </div>
              </button>
            ))}
          </div>
        </Panel>

        <section className="card-surface overflow-hidden xl:col-span-2">
          <div className="flex items-center justify-between px-5 pb-3 pt-5">
            <h2 className="text-[15px] font-semibold tracking-tight">Hududlar kesimida</h2>
            <Link to="/territories" className="font-mono text-[11px] text-primary hover:underline">
              13 hudud →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead className="bg-muted/95 text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                <tr>
                  <th className="px-5 py-2 text-left font-medium">Hudud</th>
                  <th className="px-3 py-2 text-right font-medium">Undirilgan</th>
                  <th className="px-5 py-2 text-right font-medium">Samaradorlik</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {terrStats.map((s) => (
                  <tr
                    key={s.territory.id}
                    className="cursor-pointer hover:bg-muted/60"
                    onClick={() => go(`/territories/${s.territory.id}`)}
                  >
                    <td className="px-5 py-2.5 font-medium">{s.territory.name}</td>
                    <td className="px-3 py-2.5 text-right font-mono tnum text-muted-foreground">
                      {fmtShort(s.total)}
                    </td>
                    <td className="px-5 py-2.5">
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-1.5 w-14 rounded-full bg-muted">
                          <div
                            className="h-1.5 rounded-full bg-accent"
                            style={{ width: `${Math.min(100, s.efficiency)}%` }}
                          />
                        </div>
                        <span className="w-11 text-right font-mono tnum text-muted-foreground">
                          {s.efficiency.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
