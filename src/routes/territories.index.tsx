import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useGo } from "@/components/AppLink";
import { GlobalFilters } from "@/components/GlobalFilters";
import { DataTable, type Column } from "@/components/DataTable";
import { Progress } from "@/components/Badges";
import { ExportMenu } from "@/components/ExportMenu";
import { useApp } from "@/lib/store";
import { territoryStats, totalsOf, type TerritoryStat } from "@/lib/derive";
import { fmtNumber, fmtShort, fmtSom } from "@/lib/format";

export const Route = createFileRoute("/territories/")({
  head: () => ({
    meta: [
      { title: "Hududlar — E-Energiya Nazorat" },
      {
        name: "description",
        content: "Jizzax viloyatining 13 hududi bo'yicha qarzdorlik va undirish samaradorligi.",
      },
      { property: "og:title", content: "Hududlar — E-Energiya Nazorat" },
      {
        property: "og:description",
        content: "Hududlar kesimida qarzdorlik, undirilgan summa, qoldiq va samaradorlik.",
      },
    ],
  }),
  component: TerritoriesPage,
});

function TerritoriesPage() {
  const { filteredRows } = useApp();
  const go = useGo();
  const stats = territoryStats(filteredRows);
  const t = totalsOf(filteredRows);
  const max = Math.max(1, ...stats.map((s) => s.initial));

  const columns: Column<TerritoryStat>[] = [
    {
      key: "name",
      header: "Hudud",
      cell: (r) => <span className="font-medium">{r.territory.name}</span>,
      sortValue: (r) => r.territory.name,
    },
    {
      key: "companies",
      header: "Korxonalar",
      align: "right",
      cell: (r) => <span className="font-mono tnum">{r.companies}</span>,
      sortValue: (r) => r.companies,
    },
    {
      key: "initial",
      header: "Boshlang'ich qarzdorlik",
      align: "right",
      cell: (r) => <span className="font-mono tnum">{fmtNumber(r.initial)}</span>,
      sortValue: (r) => r.initial,
    },
    {
      key: "today",
      header: "Bugun undirildi",
      align: "right",
      cell: (r) => <span className="font-mono tnum text-accent">{fmtNumber(r.today)}</span>,
      sortValue: (r) => r.today,
      hideable: true,
    },
    {
      key: "total",
      header: "Undirilgan",
      align: "right",
      cell: (r) => <span className="font-mono tnum text-accent">{fmtNumber(r.total)}</span>,
      sortValue: (r) => r.total,
    },
    {
      key: "remaining",
      header: "Qoldiq",
      align: "right",
      cell: (r) => <span className="font-mono tnum">{fmtNumber(r.remaining)}</span>,
      sortValue: (r) => r.remaining,
    },
    {
      key: "eff",
      header: "Samaradorlik %",
      cell: (r) => <Progress value={r.efficiency} />,
      sortValue: (r) => r.efficiency,
      className: "w-40",
    },
  ];

  return (
    <AppShell
      title="Hududlar kesimida"
      subtitle={`13 hudud · jami ${fmtSom(t.initial)} · undirildi ${fmtSom(t.collected)}`}
      crumbs={[{ label: "Dashboard", to: "/" }, { label: "Hududlar" }]}
      actions={
        <ExportMenu
          payload={() => ({
            title: "Hududlar kesimida hisobot",
            fileName: "hududlar",
            rows: stats,
            columns: [
              { key: "t", header: "Hudud", value: (r: TerritoryStat) => r.territory.name },
              {
                key: "c",
                header: "Korxonalar soni",
                value: (r: TerritoryStat) => r.companies,
                numeric: true,
              },
              {
                key: "i",
                header: "Jami qarzdorlik",
                value: (r: TerritoryStat) => r.initial,
                numeric: true,
              },
              { key: "u", header: "Umidsiz", value: (r: TerritoryStat) => r.umidsiz, numeric: true },
              {
                key: "h",
                header: "Harakatdagi",
                value: (r: TerritoryStat) => r.harakatdagi,
                numeric: true,
              },
              {
                key: "td",
                header: "Bugun undirildi",
                value: (r: TerritoryStat) => r.today,
                numeric: true,
              },
              {
                key: "ir",
                header: "Tanlangan davrda",
                value: (r: TerritoryStat) => r.in_range,
                numeric: true,
              },
              {
                key: "tot",
                header: "Tadbir boshidan",
                value: (r: TerritoryStat) => r.total,
                numeric: true,
              },
              { key: "r", header: "Qoldiq", value: (r: TerritoryStat) => r.remaining, numeric: true },
              {
                key: "e",
                header: "Samaradorlik %",
                value: (r: TerritoryStat) => Number(r.efficiency.toFixed(1)),
                numeric: true,
              },
            ],
            totals: [
              { label: "Jami qarzdorlik", value: fmtSom(t.initial) },
              { label: "Jami undirildi", value: fmtSom(t.collected) },
              { label: "Jami qoldiq", value: fmtSom(t.remaining) },
            ],
          })}
        />
      }
    >
      <GlobalFilters />

      <section className="card-surface p-5">
        <h2 className="text-[15px] font-semibold tracking-tight">
          Qarzdorlik va undirish taqsimoti
        </h2>
        <div className="mt-4 space-y-3">
          {stats.map((s) => (
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
                  style={{ width: `${(s.initial / max) * 100}%` }}
                />
                <div
                  className="bar-grow absolute inset-y-0 left-0 rounded-md bg-accent"
                  style={{ width: `${((s.total / max) * 100).toFixed(2)}%` }}
                />
              </div>
            </button>
          ))}
        </div>
      </section>

      <DataTable
        rows={stats}
        columns={columns}
        defaultSortKey="initial"
        initialPageSize={25}
        onRowClick={(r) => go(`/territories/${r.territory.id}`)}
      />
    </AppShell>
  );
}
