import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { AppLink, useGo } from "@/components/AppLink";
import { KpiCard, Panel } from "@/components/Kpi";
import { DataTable, type Column } from "@/components/DataTable";
import { DebtTypeBadge, Progress, StatusBadge } from "@/components/Badges";
import { ExportMenu } from "@/components/ExportMenu";
import { useApp } from "@/lib/store";
import { employees, TODAY } from "@/lib/demo-data";
import { buildCollectionRows, territoryById, totalsOf, type CompanyRow } from "@/lib/derive";
import { fmtDateTime, fmtNumber, fmtShort, fmtSom, timeAgo } from "@/lib/format";
import { DEBT_TYPE_LABEL, ROLE_LABEL } from "@/lib/types";

export const Route = createFileRoute("/employees/$id")({
  head: () => ({
    meta: [
      { title: "Mas'ul xodim — E-Energiya Nazorat" },
      {
        name: "description",
        content: "Mas'ul xodimning biriktirilgan korxonalari, undirish natijalari va samaradorligi.",
      },
      { property: "og:title", content: "Mas'ul xodim — E-Energiya Nazorat" },
      {
        property: "og:description",
        content: "Xodim kesimida KPI, undirish dinamikasi va oxirgi to'lovlar.",
      },
    ],
  }),
  component: EmployeeDetail,
});

function EmployeeDetail() {
  const { id } = Route.useParams();
  const { rows, collections } = useApp();
  const go = useGo();
  const employee = employees.find((e) => e.id === id);

  const list = useMemo(
    () => rows.filter((r) => r.responsible_employee_id === id),
    [rows, id],
  );

  const daily = useMemo(() => {
    const days: { label: string; amount: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(TODAY);
      d.setDate(d.getDate() - i);
      const amount = collections
        .filter((c) => {
          const x = new Date(c.collection_date);
          return (
            c.employee_id === id &&
            x.getFullYear() === d.getFullYear() &&
            x.getMonth() === d.getMonth() &&
            x.getDate() === d.getDate()
          );
        })
        .reduce((s, c) => s + c.amount, 0);
      days.push({ label: `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, "0")}`, amount });
    }
    return days;
  }, [collections, id]);

  const recent = useMemo(
    () => buildCollectionRows(collections.filter((c) => c.employee_id === id)).slice(0, 8),
    [collections, id],
  );

  if (!employee) {
    return (
      <AppShell title="Xodim topilmadi" crumbs={[{ label: "Mas'ullar", to: "/employees" }]}>
        <p className="text-sm text-muted-foreground">Bunday mas'ul xodim mavjud emas.</p>
      </AppShell>
    );
  }

  const territory = territoryById(employee.territory_id);
  const t = totalsOf(list);
  const maxDay = Math.max(1, ...daily.map((d) => d.amount));

  const columns: Column<CompanyRow>[] = [
    {
      key: "name",
      header: "Korxona",
      cell: (r) => <span className="font-medium">{r.name}</span>,
      sortValue: (r) => r.name,
    },
    { key: "stir", header: "STIR", cell: (r) => <span className="font-mono">{r.stir}</span> },
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
      title={employee.full_name}
      subtitle={`${ROLE_LABEL[employee.role]} · ${territory.name} · ${employee.phone} · ${list.length} ta korxona`}
      crumbs={[
        { label: "Mas'ullar", to: "/employees" },
        { label: employee.short_name },
      ]}
      actions={
        <ExportMenu
          payload={() => ({
            title: `Biriktirilgan korxonalar — ${employee.full_name}`,
            fileName: `masul-${employee.id}`,
            rows: list,
            columns: [
              { key: "n", header: "Korxona", value: (r: CompanyRow) => r.name },
              { key: "s", header: "STIR", value: (r: CompanyRow) => r.stir },
              { key: "h", header: "Hudud", value: (r: CompanyRow) => r.territory.name },
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
            ],
            meta: [
              { label: "Mas'ul", value: employee.full_name },
              { label: "Hudud", value: territory.name },
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
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-7">
        <KpiCard label="Biriktirilgan qarzdorlik" value={fmtShort(t.initial)} />
        <KpiCard label="Umidsiz" value={fmtShort(t.umidsiz)} tone="deep" />
        <KpiCard label="Harakatdagi" value={fmtShort(t.harakatdagi)} />
        <KpiCard label="Bugun undirildi" value={fmtShort(t.collected_today)} tone="accent" accent />
        <KpiCard label="Tadbir boshidan" value={fmtShort(t.collected)} />
        <KpiCard label="Qoldiq" value={fmtShort(t.remaining)} />
        <KpiCard label="Samaradorlik" value={t.efficiency.toFixed(1)} unit="%" />
      </div>

      <Panel title="Undirish dinamikasi (oxirgi 14 kun)">
        <div className="flex h-44 items-end gap-1.5">
          {daily.map((d) => (
            <div key={d.label} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="flex w-full flex-1 items-end">
                <div
                  className="w-full rounded-t bg-gradient-to-t from-brand-deep to-brand"
                  style={{ height: `${Math.max(2, (d.amount / maxDay) * 100)}%` }}
                  title={fmtSom(d.amount)}
                />
              </div>
              <span className="font-mono text-[9px] text-muted-foreground">{d.label}</span>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Oxirgi undirishlar">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {recent.map((c) => (
            <AppLink
              key={c.id}
              to={`/debtors/${c.company_id}`}
              className="flex items-center justify-between rounded-lg px-3 py-2.5 ring-1 ring-border hover:bg-muted/60"
            >
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium">{c.company.name}</p>
                <p className="font-mono text-[11px] text-muted-foreground">
                  {fmtDateTime(c.collection_date)} · {timeAgo(c.collection_date, TODAY)}
                </p>
              </div>
              <p className="ml-3 shrink-0 font-mono text-[13px] font-semibold tnum text-accent">
                +{fmtNumber(c.amount)}
              </p>
            </AppLink>
          ))}
          {recent.length === 0 && (
            <p className="text-sm text-muted-foreground">Undirish yozuvlari yo'q.</p>
          )}
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
