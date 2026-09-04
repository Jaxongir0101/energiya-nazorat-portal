import { createFileRoute } from "@tanstack/react-router";
import { Phone } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AppLink, useGo } from "@/components/AppLink";
import { KpiCard, Panel } from "@/components/Kpi";
import { DataTable, type Column } from "@/components/DataTable";
import { DebtTypeBadge, Progress, StatusBadge } from "@/components/Badges";
import { ExportMenu } from "@/components/ExportMenu";
import { useApp } from "@/lib/store";
import { territories } from "@/lib/demo-data";
import { employeeStats, totalsOf, type CompanyRow } from "@/lib/derive";
import { fmtNumber, fmtPct, fmtShort, fmtSom } from "@/lib/format";
import { DEBT_TYPE_LABEL } from "@/lib/types";

export const Route = createFileRoute("/territories/$id")({
  head: () => ({
    meta: [
      { title: "Hudud kesimi — E-Energiya Nazorat" },
      {
        name: "description",
        content: "Hudud bo'yicha qarzdorlik, mas'ul xodimlar va qarzdor korxonalar ro'yxati.",
      },
      { property: "og:title", content: "Hudud kesimi — E-Energiya Nazorat" },
      {
        property: "og:description",
        content: "Hududdagi undirish natijalari va mas'ul xodimlar samaradorligi.",
      },
    ],
  }),
  component: TerritoryDetail,
});

function TerritoryDetail() {
  const { id } = Route.useParams();
  const { rows, sectorEmployees } = useApp();
  const go = useGo();
  const territory = territories.find((t) => t.id === id);

  if (!territory) {
    return (
      <AppShell title="Hudud topilmadi" crumbs={[{ label: "Hududlar", to: "/territories" }]}>
        <p className="text-sm text-muted-foreground">Bunday hudud mavjud emas.</p>
      </AppShell>
    );
  }

  const list = rows.filter((r) => r.territory_id === territory.id);
  const t = totalsOf(list);
  const emps = employeeStats(list).filter((e) =>
    sectorEmployees.some((x) => x.id === e.employee.id && x.territory_id === territory.id),
  );

  const columns: Column<CompanyRow>[] = [
    {
      key: "no",
      header: "№",
      cell: (_r, i) => <span className="font-mono text-muted-foreground">{i + 1}</span>,
      className: "w-12",
    },
    {
      key: "name",
      header: "Korxona",
      cell: (r) => <span className="font-medium">{r.name}</span>,
      sortValue: (r) => r.name,
    },
    { key: "stir", header: "STIR", cell: (r) => <span className="font-mono">{r.stir}</span> },
    { key: "emp", header: "Mas'ul", cell: (r) => r.employee.short_name, hideable: true },
    { key: "type", header: "Turi", cell: (r) => <DebtTypeBadge type={r.debt_type} /> },
    {
      key: "initial",
      header: "Boshlang'ich",
      align: "right",
      cell: (r) => <span className="font-mono tnum">{fmtNumber(r.initial_debt)}</span>,
      sortValue: (r) => r.initial_debt,
    },
    {
      key: "collected",
      header: "Undirilgan",
      align: "right",
      cell: (r) => <span className="font-mono tnum text-accent">{fmtNumber(r.collected)}</span>,
      sortValue: (r) => r.collected,
    },
    {
      key: "remaining",
      header: "Qoldiq",
      align: "right",
      cell: (r) => <span className="font-mono tnum">{fmtNumber(r.remaining)}</span>,
      sortValue: (r) => r.remaining,
    },
    {
      key: "pct",
      header: "Samaradorlik",
      cell: (r) => <Progress value={r.percentage} />,
      sortValue: (r) => r.percentage,
      className: "w-36",
    },
    { key: "status", header: "Holati", cell: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <AppShell
      title={territory.name}
      subtitle={`${list.length} ta qarzdor korxona · ${emps.length} ta mas'ul xodim`}
      crumbs={[
        { label: "Hududlar", to: "/territories" },
        { label: territory.name },
      ]}
      actions={
        <ExportMenu
          payload={() => ({
            title: `Umumiy qarzdorlik hisoboti — ${territory.name}`,
            fileName: `hudud-${territory.id}`,
            rows: list,
            columns: [
              { key: "n", header: "Korxona", value: (r: CompanyRow) => r.name },
              { key: "s", header: "STIR", value: (r: CompanyRow) => r.stir },
              { key: "e", header: "Mas'ul", value: (r: CompanyRow) => r.employee.full_name },
              {
                key: "t",
                header: "Qarzdorlik turi",
                value: (r: CompanyRow) => DEBT_TYPE_LABEL[r.debt_type],
              },
              {
                key: "i",
                header: "Boshlang'ich qarzdorlik",
                value: (r: CompanyRow) => r.initial_debt,
                numeric: true,
              },
              { key: "c", header: "Undirilgan", value: (r: CompanyRow) => r.collected, numeric: true },
              { key: "r", header: "Qoldiq", value: (r: CompanyRow) => r.remaining, numeric: true },
              {
                key: "p",
                header: "Samaradorlik %",
                value: (r: CompanyRow) => Number(r.percentage.toFixed(1)),
                numeric: true,
              },
            ],
            meta: [{ label: "Hudud", value: territory.name }],
            totals: [
              { label: "Jami qarzdorlik", value: fmtSom(t.initial) },
              { label: "Jami undirildi", value: fmtSom(t.collected) },
              { label: "Jami qoldiq", value: fmtSom(t.remaining) },
            ],
          })}
        />
      }
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Jami qarzdorlik" value={fmtShort(t.initial)} />
        <KpiCard label="Umidsiz" value={fmtShort(t.umidsiz)} tone="deep" />
        <KpiCard label="Harakatdagi" value={fmtShort(t.harakatdagi)} />
        <KpiCard label="Bugun undirildi" value={fmtShort(t.collected_today)} tone="accent" accent />
        <KpiCard label="Tadbir boshidan" value={fmtShort(t.collected)} />
        <KpiCard label="Qoldiq" value={fmtShort(t.remaining)} />
      </div>

      <Panel title="Mas'ul xodimlar">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {emps.map((e) => (
            <AppLink
              key={e.employee.id}
              to={`/employees/${e.employee.id}`}
              className="block rounded-xl p-4 ring-1 ring-border transition-transform hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-semibold">{e.employee.full_name}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                    <Phone className="size-3" /> {e.employee.phone}
                  </p>
                </div>
                <span className="rounded-md bg-muted px-2 py-1 font-mono text-[11px]">
                  {e.companies} ta korxona
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-[12px] sm:grid-cols-4">
                <Cell label="Qarzdorlik" value={fmtShort(e.initial)} />
                <Cell label="Bugun" value={fmtShort(e.today)} />
                <Cell label="Jami undirildi" value={fmtShort(e.total)} />
                <Cell label="Qoldiq" value={fmtShort(e.remaining)} />
              </div>
              <div className="mt-3">
                <Progress value={e.efficiency} />
              </div>
              <p className="mt-2 text-right font-mono text-[11px] text-muted-foreground">
                Samaradorlik: {fmtPct(e.efficiency)}
              </p>
            </AppLink>
          ))}
        </div>
      </Panel>

      <DataTable
        rows={list}
        columns={columns}
        defaultSortKey="initial"
        onRowClick={(r) => go(`/debtors/${r.id}`)}
      />
    </AppShell>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted px-2.5 py-2">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-mono text-[13px] font-medium tnum">{value}</p>
    </div>
  );
}
