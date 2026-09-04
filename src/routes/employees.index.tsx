import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { AppLink, useGo } from "@/components/AppLink";
import { GlobalFilters } from "@/components/GlobalFilters";
import { DataTable, type Column } from "@/components/DataTable";
import { Progress } from "@/components/Badges";
import { ExportMenu } from "@/components/ExportMenu";
import { useApp } from "@/lib/store";
import { employeeStats, totalsOf, type EmployeeStat } from "@/lib/derive";
import { fmtNumber, fmtShort, fmtSom } from "@/lib/format";

export const Route = createFileRoute("/employees/")({
  head: () => ({
    meta: [
      { title: "Mas'ullar — E-Energiya Nazorat" },
      {
        name: "description",
        content: "Mas'ul xodimlarning undirish natijalari va samaradorlik reytingi.",
      },
      { property: "og:title", content: "Mas'ullar — E-Energiya Nazorat" },
      {
        property: "og:description",
        content: "26 nafar mas'ul xodim kesimida undirish natijalari va samaradorlik.",
      },
    ],
  }),
  component: EmployeesPage,
});

function EmployeesPage() {
  const { filteredRows } = useApp();
  const go = useGo();
  const stats = employeeStats(filteredRows);
  const t = totalsOf(filteredRows);
  const top = stats.slice(0, 3);
  const maxTop = Math.max(1, ...top.map((s) => s.total));

  const columns: Column<EmployeeStat>[] = [
    {
      key: "no",
      header: "№",
      cell: (_r, i) => <span className="font-mono text-muted-foreground">{i + 1}</span>,
      className: "w-12",
    },
    {
      key: "name",
      header: "F.I.Sh.",
      cell: (r) => <span className="font-medium">{r.employee.full_name}</span>,
      sortValue: (r) => r.employee.full_name,
    },
    {
      key: "terr",
      header: "Hudud",
      cell: (r) => r.territory.name,
      sortValue: (r) => r.territory.name,
    },
    {
      key: "phone",
      header: "Telefon",
      cell: (r) => <span className="font-mono text-muted-foreground">{r.employee.phone}</span>,
      hideable: true,
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
      header: "Jami qarzdorlik",
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
    },
    {
      key: "total",
      header: "Tadbir boshidan",
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
      title="Mas'ullar"
      subtitle={`${stats.length} ta mas'ul xodim · jami undirildi ${fmtSom(t.collected)}`}
      crumbs={[{ label: "Dashboard", to: "/" }, { label: "Mas'ullar" }]}
      actions={
        <ExportMenu
          payload={() => ({
            title: "Mas'ullar kesimida hisobot",
            fileName: "masullar",
            rows: stats,
            columns: [
              { key: "e", header: "Mas'ul", value: (r: EmployeeStat) => r.employee.full_name },
              { key: "t", header: "Hudud", value: (r: EmployeeStat) => r.territory.name },
              {
                key: "c",
                header: "Korxonalar soni",
                value: (r: EmployeeStat) => r.companies,
                numeric: true,
              },
              {
                key: "i",
                header: "Biriktirilgan qarzdorlik",
                value: (r: EmployeeStat) => r.initial,
                numeric: true,
              },
              {
                key: "td",
                header: "Bugun undirildi",
                value: (r: EmployeeStat) => r.today,
                numeric: true,
              },
              {
                key: "ir",
                header: "Tanlangan davrda",
                value: (r: EmployeeStat) => r.in_range,
                numeric: true,
              },
              {
                key: "tot",
                header: "Tadbir boshidan",
                value: (r: EmployeeStat) => r.total,
                numeric: true,
              },
              { key: "r", header: "Qoldiq", value: (r: EmployeeStat) => r.remaining, numeric: true },
              {
                key: "p",
                header: "Samaradorlik %",
                value: (r: EmployeeStat) => Number(r.efficiency.toFixed(1)),
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

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {top.map((s, i) => (
          <AppLink
            key={s.employee.id}
            to={`/employees/${s.employee.id}`}
            className="card-surface block p-4 transition-transform hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  {i + 1}-o'rin
                </p>
                <p className="mt-1 text-[14px] font-semibold">{s.employee.full_name}</p>
                <p className="text-[11px] text-muted-foreground">{s.territory.name}</p>
              </div>
              <p className="font-mono text-[18px] font-semibold tnum text-accent">
                {fmtShort(s.total)}
              </p>
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-muted">
              <div
                className="bar-grow h-1.5 rounded-full bg-gradient-to-r from-brand-deep to-accent"
                style={{ width: `${(s.total / maxTop) * 100}%` }}
              />
            </div>
          </AppLink>
        ))}
      </div>

      <DataTable
        rows={stats}
        columns={columns}
        defaultSortKey="total"
        onRowClick={(r) => go(`/employees/${r.employee.id}`)}
      />
    </AppShell>
  );
}
