import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useGo } from "@/components/AppLink";
import { DataTable, TableSearch, TableSelect, type Column } from "@/components/DataTable";
import { DebtTypeBadge, StatusBadge } from "@/components/Badges";
import { ExportMenu } from "@/components/ExportMenu";
import { AddCollectionDialog } from "@/components/AddCollectionDialog";
import { useApp } from "@/lib/store";
import { territories } from "@/lib/demo-data";
import { fmtDate, fmtNumber, fmtSom } from "@/lib/format";
import { totalsOf, type CompanyRow } from "@/lib/derive";
import { DEBT_TYPE_LABEL, STATUS_LABEL, type CompanyStatus, type DebtType } from "@/lib/types";

export const Route = createFileRoute("/debtors/")({
  validateSearch: (s: Record<string, unknown>): { type?: string } => ({
    type: typeof s["type"] === "string" ? (s["type"] as string) : "all",
  }),
  head: () => ({
    meta: [
      { title: "Qarzdorlar — E-Energiya Nazorat" },
      {
        name: "description",
        content: "Elektr energiyasi bo'yicha qarzdor korxonalar ro'yxati, filtrlar va eksport.",
      },
      { property: "og:title", content: "Qarzdorlar — E-Energiya Nazorat" },
      {
        property: "og:description",
        content: "Qarzdor korxonalar reestri: qarzdorlik, undirilgan summa, qoldiq va samaradorlik.",
      },
    ],
  }),
  component: DebtorsPage,
});

function DebtorsPage() {
  const { type } = Route.useSearch();
  const { rows, sectorEmployees } = useApp();
  const go = useGo();

  const [q, setQ] = useState("");
  const [stir, setStir] = useState("");
  const [terr, setTerr] = useState("all");
  const [emp, setEmp] = useState("all");
  const [debt, setDebt] = useState<string>(type === "umidsiz" || type === "harakatdagi" ? type : "all");
  const [status, setStatus] = useState("all");
  const [minSum, setMinSum] = useState("");

  const data = useMemo(
    () =>
      rows.filter(
        (r) =>
          (!q || r.name.toLowerCase().includes(q.toLowerCase())) &&
          (!stir || r.stir.includes(stir)) &&
          (terr === "all" || r.territory_id === terr) &&
          (emp === "all" || r.responsible_employee_id === emp) &&
          (debt === "all" || r.debt_type === debt) &&
          (status === "all" || r.status === status) &&
          (!minSum || r.initial_debt >= Number(minSum.replace(/\s/g, "")) * 1_000_000),
      ),
    [rows, q, stir, terr, emp, debt, status, minSum],
  );

  const t = totalsOf(data);

  const columns: Column<CompanyRow>[] = [
    {
      key: "no",
      header: "№",
      cell: (_r, i) => <span className="font-mono text-muted-foreground">{i + 1}</span>,
      className: "w-12",
    },
    {
      key: "name",
      header: "Korxona nomi",
      cell: (r) => <span className="font-medium">{r.name}</span>,
      sortValue: (r) => r.name,
    },
    { key: "stir", header: "STIR", cell: (r) => <span className="font-mono">{r.stir}</span> },
    {
      key: "territory",
      header: "Hudud",
      cell: (r) => r.territory.name,
      sortValue: (r) => r.territory.name,
      hideable: true,
    },
    {
      key: "employee",
      header: "Mas'ul",
      cell: (r) => r.employee.short_name,
      sortValue: (r) => r.employee.short_name,
      hideable: true,
    },
    { key: "debt_type", header: "Turi", cell: (r) => <DebtTypeBadge type={r.debt_type} /> },
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
      cell: (r) => (
        <span className="font-mono tnum">{r.percentage.toFixed(1)}%</span>
      ),
      sortValue: (r) => r.percentage,
      className: "w-36",
    },
    {
      key: "last",
      header: "Oxirgi to'lov",
      cell: (r) => (
        <span className="font-mono text-muted-foreground">
          {r.last_payment ? fmtDate(r.last_payment) : "—"}
        </span>
      ),
      sortValue: (r) => r.last_payment ?? "",
      hideable: true,
    },
    { key: "status", header: "Holati", cell: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <AppShell
      title="Qarzdorlar"
      subtitle={`${data.length} ta korxona · jami ${fmtSom(t.initial)} · qoldiq ${fmtSom(t.remaining)}`}
      crumbs={[{ label: "Qarzdorlar" }]}
      actions={
        <div className="flex items-center gap-2">
          <ExportMenu
            payload={() => ({
              title: "Umumiy qarzdorlik hisoboti",
              fileName: "qarzdorlar",
              rows: data,
              columns: [
                { key: "name", header: "Korxona", value: (r: CompanyRow) => r.name },
                { key: "stir", header: "STIR", value: (r: CompanyRow) => r.stir },
                { key: "terr", header: "Hudud", value: (r: CompanyRow) => r.territory.name },
                { key: "emp", header: "Mas'ul", value: (r: CompanyRow) => r.employee.full_name },
                {
                  key: "type",
                  header: "Qarzdorlik turi",
                  value: (r: CompanyRow) => DEBT_TYPE_LABEL[r.debt_type],
                },
                {
                  key: "initial",
                  header: "Boshlang'ich qarzdorlik",
                  value: (r: CompanyRow) => r.initial_debt,
                  numeric: true,
                },
                {
                  key: "collected",
                  header: "Undirilgan",
                  value: (r: CompanyRow) => r.collected,
                  numeric: true,
                },
                {
                  key: "remaining",
                  header: "Qoldiq",
                  value: (r: CompanyRow) => r.remaining,
                  numeric: true,
                },
                {
                  key: "pct",
                  header: "Samaradorlik %",
                  value: (r: CompanyRow) => Number(r.percentage.toFixed(1)),
                  numeric: true,
                },
              ],
              meta: [
                { label: "Hudud", value: terr === "all" ? "Barchasi" : (territories.find((x) => x.id === terr)?.name ?? "") },
                { label: "Mas'ul", value: emp === "all" ? "Barchasi" : (sectorEmployees.find((x) => x.id === emp)?.full_name ?? "") },
                {
                  label: "Qarzdorlik turi",
                  value: debt === "all" ? "Barchasi" : DEBT_TYPE_LABEL[debt as DebtType],
                },
              ],
              totals: [
                { label: "Jami qarzdorlik", value: fmtSom(t.initial) },
                { label: "Jami undirildi", value: fmtSom(t.collected) },
                { label: "Jami qoldiq", value: fmtSom(t.remaining) },
              ],
            })}
          />
          <AddCollectionDialog />
        </div>
      }
    >
      <DataTable
        rows={data}
        columns={columns}
        defaultSortKey="initial"
        onRowClick={(r) => go(`/debtors/${r.id}`)}
        toolbar={
          <div className="flex flex-wrap items-center gap-2">
            <TableSearch value={q} onChange={setQ} placeholder="Korxona nomi..." />
            <TableSearch value={stir} onChange={setStir} placeholder="STIR..." />
            <TableSelect
              value={terr}
              onChange={setTerr}
              options={[
                { value: "all", label: "Barcha hududlar" },
                ...territories.map((x) => ({ value: x.id, label: x.name })),
              ]}
            />
            <TableSelect
              value={emp}
              onChange={setEmp}
              options={[
                { value: "all", label: "Barcha mas'ullar" },
                ...sectorEmployees.map((x) => ({ value: x.id, label: x.short_name })),
              ]}
            />
            <TableSelect
              value={debt}
              onChange={setDebt}
              options={[
                { value: "all", label: "Qarzdorlik turi" },
                { value: "umidsiz", label: "Umidsiz" },
                { value: "harakatdagi", label: "Harakatdagi" },
              ]}
            />
            <TableSelect
              value={status}
              onChange={setStatus}
              options={[
                { value: "all", label: "Holati" },
                ...(Object.keys(STATUS_LABEL) as CompanyStatus[]).map((s) => ({
                  value: s,
                  label: STATUS_LABEL[s],
                })),
              ]}
            />
            <input
              value={minSum}
              onChange={(e) => setMinSum(e.target.value.replace(/\D/g, ""))}
              placeholder="Min. summa (mln)"
              className="h-9 w-36 rounded-lg border border-border bg-muted px-3 text-[13px] outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        }
      />
    </AppShell>
  );
}
