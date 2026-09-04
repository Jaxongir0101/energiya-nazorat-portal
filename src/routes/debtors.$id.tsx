import { createFileRoute } from "@tanstack/react-router";
import { FileText, Phone, User2, MapPin } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AppLink } from "@/components/AppLink";
import { KpiCard, Panel } from "@/components/Kpi";
import { DebtTypeBadge, Progress, StatusBadge } from "@/components/Badges";
import { AddCollectionDialog } from "@/components/AddCollectionDialog";
import { ExportMenu } from "@/components/ExportMenu";
import { useApp } from "@/lib/store";
import { buildCollectionRows, type CollectionRow } from "@/lib/derive";
import { fmtDateTime, fmtNumber, fmtPct, fmtShort, fmtSom } from "@/lib/format";
import { PAYMENT_TYPE_LABEL } from "@/lib/types";

export const Route = createFileRoute("/debtors/$id")({
  head: () => ({
    meta: [
      { title: "Korxona ma'lumotlari — E-Energiya Nazorat" },
      {
        name: "description",
        content: "Qarzdor korxona profili, moliyaviy ko'rsatkichlari va undirish tarixi.",
      },
      { property: "og:title", content: "Korxona ma'lumotlari — E-Energiya Nazorat" },
      {
        property: "og:description",
        content: "Boshlang'ich qarzdorlik, undirilgan summa, qoldiq va to'lovlar tarixi.",
      },
    ],
  }),
  component: DebtorDetail,
  errorComponent: ({ error }) => (
    <div className="p-10 text-center text-sm text-muted-foreground" role="alert">
      {error.message}
    </div>
  ),
  notFoundComponent: () => (
    <div className="p-10 text-center text-sm text-muted-foreground">Korxona topilmadi.</div>
  ),
});

function DebtorDetail() {
  const { id } = Route.useParams();
  const { rows, collections } = useApp();
  const row = rows.find((r) => r.id === id);

  if (!row) {
    return (
      <AppShell title="Korxona topilmadi" crumbs={[{ label: "Qarzdorlar", to: "/debtors" }]}>
        <p className="text-sm text-muted-foreground">
          Bunday korxona mavjud emas yoki sizga biriktirilmagan.
        </p>
      </AppShell>
    );
  }

  const history = buildCollectionRows(collections.filter((c) => c.company_id === row.id));

  return (
    <AppShell
      title={row.name}
      subtitle={
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-mono">STIR: {row.stir}</span>
          <DebtTypeBadge type={row.debt_type} />
          <StatusBadge status={row.status} />
        </span>
      }
      crumbs={[
        { label: "Dashboard", to: "/" },
        { label: row.territory.name, to: `/territories/${row.territory_id}` },
        { label: row.name },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <ExportMenu
            payload={() => ({
              title: `Undirishlar hisoboti — ${row.name}`,
              fileName: `korxona-${row.stir}`,
              rows: history,
              columns: [
                {
                  key: "date",
                  header: "Sana",
                  value: (c: CollectionRow) => fmtDateTime(c.collection_date),
                },
                { key: "amount", header: "Summa", value: (c: CollectionRow) => c.amount, numeric: true },
                { key: "emp", header: "Mas'ul", value: (c: CollectionRow) => c.employee.full_name },
                {
                  key: "type",
                  header: "To'lov turi",
                  value: (c: CollectionRow) => PAYMENT_TYPE_LABEL[c.payment_type],
                },
                { key: "comment", header: "Izoh", value: (c: CollectionRow) => c.comment },
              ],
              meta: [
                { label: "Korxona", value: row.name },
                { label: "STIR", value: row.stir },
                { label: "Hudud", value: row.territory.name },
              ],
              totals: [
                { label: "Boshlang'ich qarzdorlik", value: fmtSom(row.initial_debt) },
                { label: "Jami undirildi", value: fmtSom(row.collected) },
                { label: "Qoldiq", value: fmtSom(row.remaining) },
              ],
            })}
          />
          <AddCollectionDialog companyId={row.id} />
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="card-surface p-5 lg:col-span-1">
          <h2 className="text-[15px] font-semibold tracking-tight">Korxona ma'lumotlari</h2>
          <dl className="mt-4 space-y-3 text-[13px]">
            <Info icon={<FileText className="size-3.5" />} label="STIR" value={row.stir} mono />
            <Info
              icon={<MapPin className="size-3.5" />}
              label="Hudud"
              value={row.territory.name}
              link={`/territories/${row.territory_id}`}
            />
            <Info icon={<MapPin className="size-3.5" />} label="Manzil" value={row.address} />
            <Info icon={<User2 className="size-3.5" />} label="Rahbar" value={row.director_name} />
            <Info icon={<Phone className="size-3.5" />} label="Telefon" value={row.phone} mono />
            <Info
              icon={<User2 className="size-3.5" />}
              label="Mas'ul xodim"
              value={row.employee.full_name}
              link={`/employees/${row.employee.id}`}
            />
          </dl>
        </section>

        <div className="space-y-4 lg:col-span-2">
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <KpiCard label="Boshlang'ich" value={fmtShort(row.initial_debt)} />
            <KpiCard label="Undirilgan" value={fmtShort(row.collected)} tone="accent" accent />
            <KpiCard label="Qoldiq" value={fmtShort(row.remaining)} tone="deep" />
            <KpiCard label="Samaradorlik" value={fmtPct(row.percentage)} unit="" />
          </div>

          <section className="card-surface p-5">
            <div className="flex items-center justify-between text-[12px] text-muted-foreground">
              <span>Undirish darajasi</span>
              <span className="font-mono">
                {fmtSom(row.collected)} / {fmtSom(row.initial_debt)}
              </span>
            </div>
            <div className="mt-3">
              <Progress value={row.percentage} />
            </div>
          </section>
        </div>
      </div>

      <Panel
        title="Undirish tarixi"
        right={
          <span className="font-mono text-[12px] text-muted-foreground">
            {history.length} ta yozuv · {fmtSom(row.collected)}
          </span>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-[13px]">
            <thead className="bg-muted text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Sana</th>
                <th className="px-3 py-2 text-right font-medium">Summa</th>
                <th className="px-3 py-2 text-left font-medium">Mas'ul</th>
                <th className="px-3 py-2 text-left font-medium">To'lov turi</th>
                <th className="px-3 py-2 text-left font-medium">Izoh</th>
                <th className="px-3 py-2 text-left font-medium">Hujjat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {history.map((c) => (
                <tr key={c.id} className="hover:bg-muted/50">
                  <td className="px-3 py-2.5 font-mono text-muted-foreground">
                    {fmtDateTime(c.collection_date)}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono font-medium tnum text-accent">
                    +{fmtNumber(c.amount)}
                  </td>
                  <td className="px-3 py-2.5">
                    <AppLink to={`/employees/${c.employee.id}`} className="hover:underline">
                      {c.employee.short_name}
                    </AppLink>
                  </td>
                  <td className="px-3 py-2.5">{PAYMENT_TYPE_LABEL[c.payment_type]}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{c.comment || "—"}</td>
                  <td className="px-3 py-2.5">
                    {c.document_name ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px]">
                        <FileText className="size-3" /> {c.document_name}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                    Hozircha undirish yozuvlari yo'q.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </AppShell>
  );
}

function Info({
  icon,
  label,
  value,
  mono,
  link,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
  link?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border pb-2.5 last:border-0">
      <dt className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className={`text-right ${mono ? "font-mono" : ""}`}>
        {link ? (
          <AppLink to={link} className="text-primary hover:underline">
            {value}
          </AppLink>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}
