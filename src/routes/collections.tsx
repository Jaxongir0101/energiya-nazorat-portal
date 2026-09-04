import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FileText } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useGo } from "@/components/AppLink";
import { DataTable, TableSearch, TableSelect, type Column } from "@/components/DataTable";
import { DebtTypeBadge } from "@/components/Badges";
import { ExportMenu } from "@/components/ExportMenu";
import { AddCollectionDialog } from "@/components/AddCollectionDialog";
import { useApp } from "@/lib/store";
import { territories, TODAY } from "@/lib/demo-data";
import { buildCollectionRows, inRange, isSameDay, type CollectionRow } from "@/lib/derive";
import { fmtDateTime, fmtNumber, fmtSom, toISODate } from "@/lib/format";
import { DEBT_TYPE_LABEL, PAYMENT_TYPE_LABEL } from "@/lib/types";

export const Route = createFileRoute("/collections")({
  validateSearch: (s: Record<string, unknown>): { period?: string } => ({
    period: typeof s["period"] === "string" ? (s["period"] as string) : "all",
  }),
  head: () => ({
    meta: [
      { title: "Undirishlar — E-Energiya Nazorat" },
      {
        name: "description",
        content: "Barcha undirish va to'lov yozuvlari: sana, korxona, mas'ul va summa kesimida.",
      },
      { property: "og:title", content: "Undirishlar — E-Energiya Nazorat" },
      {
        property: "og:description",
        content: "Markazlashgan undirish tarixi, filtrlar va eksport imkoniyati.",
      },
    ],
  }),
  component: CollectionsPage,
});

function CollectionsPage() {
  const { period } = Route.useSearch();
  const { rows, collections, sectorEmployees } = useApp();
  const go = useGo();

  const today = toISODate(TODAY);
  const [from, setFrom] = useState(period === "bugun" ? today : "");
  const [to, setTo] = useState(period === "bugun" ? today : "");
  const [terr, setTerr] = useState("all");
  const [emp, setEmp] = useState("all");
  const [q, setQ] = useState("");
  const [debt, setDebt] = useState("all");
  const [minSum, setMinSum] = useState("");

  const all = useMemo(() => {
    const ids = new Set(rows.map((r) => r.id));
    return buildCollectionRows(collections.filter((c) => ids.has(c.company_id)));
  }, [rows, collections]);

  const data = useMemo(
    () =>
      all.filter(
        (c) =>
          (!from || !to || inRange(c.collection_date, { from, to })) &&
          (terr === "all" || c.territory.id === terr) &&
          (emp === "all" || c.employee_id === emp) &&
          (!q ||
            c.company.name.toLowerCase().includes(q.toLowerCase()) ||
            c.company.stir.includes(q)) &&
          (debt === "all" || c.company.debt_type === debt) &&
          (!minSum || c.amount >= Number(minSum) * 1_000_000),
      ),
    [all, from, to, terr, emp, q, debt, minSum],
  );

  const total = data.reduce((s, c) => s + c.amount, 0);
  const todayTotal = data
    .filter((c) => isSameDay(c.collection_date, TODAY))
    .reduce((s, c) => s + c.amount, 0);

  const columns: Column<CollectionRow>[] = [
    {
      key: "no",
      header: "№",
      cell: (_r, i) => <span className="font-mono text-muted-foreground">{i + 1}</span>,
      className: "w-12",
    },
    {
      key: "date",
      header: "Sana va vaqt",
      cell: (c) => <span className="font-mono">{fmtDateTime(c.collection_date)}</span>,
      sortValue: (c) => c.collection_date,
    },
    {
      key: "company",
      header: "Korxona",
      cell: (c) => <span className="font-medium">{c.company.name}</span>,
      sortValue: (c) => c.company.name,
    },
    {
      key: "stir",
      header: "STIR",
      cell: (c) => <span className="font-mono">{c.company.stir}</span>,
      hideable: true,
    },
    { key: "terr", header: "Hudud", cell: (c) => c.territory.name, hideable: true },
    { key: "emp", header: "Mas'ul", cell: (c) => c.employee.short_name },
    { key: "type", header: "Turi", cell: (c) => <DebtTypeBadge type={c.company.debt_type} /> },
    {
      key: "amount",
      header: "Undirilgan summa",
      align: "right",
      cell: (c) => (
        <span className="font-mono font-medium tnum text-accent">+{fmtNumber(c.amount)}</span>
      ),
      sortValue: (c) => c.amount,
    },
    {
      key: "payment",
      header: "To'lov turi",
      cell: (c) => PAYMENT_TYPE_LABEL[c.payment_type],
      hideable: true,
    },
    {
      key: "comment",
      header: "Izoh",
      cell: (c) => <span className="text-muted-foreground">{c.comment || "—"}</span>,
      hideable: true,
    },
    {
      key: "doc",
      header: "Hujjat",
      cell: (c) =>
        c.document_name ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px]">
            <FileText className="size-3" /> PDF
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
      hideable: true,
    },
  ];

  return (
    <AppShell
      title="Undirishlar"
      subtitle={
        <span>
          Tanlangan davrda undirildi:{" "}
          <span className="font-mono font-semibold text-accent">{fmtSom(total)}</span> · bugun{" "}
          <span className="font-mono">{fmtSom(todayTotal)}</span>
        </span>
      }
      crumbs={[{ label: "Undirishlar" }]}
      actions={
        <div className="flex items-center gap-2">
          <ExportMenu
            payload={() => ({
              title: "Undirishlar hisoboti",
              fileName: "undirishlar",
              rows: data,
              columns: [
                {
                  key: "d",
                  header: "Sana",
                  value: (c: CollectionRow) => fmtDateTime(c.collection_date),
                },
                { key: "n", header: "Korxona", value: (c: CollectionRow) => c.company.name },
                { key: "s", header: "STIR", value: (c: CollectionRow) => c.company.stir },
                { key: "h", header: "Hudud", value: (c: CollectionRow) => c.territory.name },
                { key: "e", header: "Mas'ul", value: (c: CollectionRow) => c.employee.full_name },
                {
                  key: "a",
                  header: "Undirilgan summa",
                  value: (c: CollectionRow) => c.amount,
                  numeric: true,
                },
                {
                  key: "t",
                  header: "Qarzdorlik turi",
                  value: (c: CollectionRow) => DEBT_TYPE_LABEL[c.company.debt_type],
                },
                { key: "c", header: "Izoh", value: (c: CollectionRow) => c.comment },
              ],
              meta: [
                { label: "Hisobot davri", value: from && to ? `${from} — ${to}` : "Butun davr" },
                {
                  label: "Hudud",
                  value:
                    terr === "all" ? "Barchasi" : (territories.find((x) => x.id === terr)?.name ?? ""),
                },
                {
                  label: "Mas'ul",
                  value:
                    emp === "all" ? "Barchasi" : (sectorEmployees.find((x) => x.id === emp)?.full_name ?? ""),
                },
              ],
              totals: [{ label: "Jami undirildi", value: fmtSom(total) }],
            })}
          />
          <AddCollectionDialog />
        </div>
      }
    >
      <DataTable
        rows={data}
        columns={columns}
        defaultSortKey="date"
        onRowClick={(c) => go(`/debtors/${c.company_id}`)}
        toolbar={
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="h-9 rounded-lg border border-border bg-muted px-2.5 text-[13px]"
            />
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="h-9 rounded-lg border border-border bg-muted px-2.5 text-[13px]"
            />
            <TableSearch value={q} onChange={setQ} placeholder="Korxona / STIR..." />
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
            <input
              value={minSum}
              onChange={(e) => setMinSum(e.target.value.replace(/\D/g, ""))}
              placeholder="Min. summa (mln)"
              className="h-9 w-36 rounded-lg border border-border bg-muted px-3 text-[13px]"
            />
          </div>
        }
      />
    </AppShell>
  );
}
