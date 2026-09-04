import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useGo } from "@/components/AppLink";
import { DataTable, TableSearch, TableSelect, type Column } from "@/components/DataTable";
import { Panel } from "@/components/Kpi";
import { useApp } from "@/lib/store";
import { adminUser, employees, supervisorUser } from "@/lib/demo-data";
import { fmtDateTime } from "@/lib/format";
import { ROLE_LABEL, type Employee } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/users")({
  head: () => ({
    meta: [
      { title: "Foydalanuvchilar — E-Energiya Nazorat" },
      {
        name: "description",
        content: "Tizim foydalanuvchilari, rollari va ma'lumotlar o'zgarishi bo'yicha audit tarixi.",
      },
      { property: "og:title", content: "Foydalanuvchilar — E-Energiya Nazorat" },
      {
        property: "og:description",
        content: "Rollar boshqaruvi va moliyaviy ma'lumotlar o'zgarishlari tarixi.",
      },
    ],
  }),
  component: UsersPage,
});

const userName = (id: string) =>
  [adminUser, supervisorUser, ...employees].find((u) => u.id === id)?.full_name ?? id;

function UsersPage() {
  const { auditLogs, role, sectorEmployees } = useApp();
  const go = useGo();
  const [q, setQ] = useState("");
  const [r, setR] = useState("all");

  const all: Employee[] = [adminUser, supervisorUser, ...sectorEmployees];
  const data = all.filter(
    (u) =>
      (!q || u.full_name.toLowerCase().includes(q.toLowerCase()) || u.email.includes(q)) &&
      (r === "all" || u.role === r),
  );

  const columns: Column<Employee>[] = [
    {
      key: "no",
      header: "№",
      cell: (_u, i) => <span className="font-mono text-muted-foreground">{i + 1}</span>,
      className: "w-12",
    },
    {
      key: "name",
      header: "F.I.Sh.",
      cell: (u) => <span className="font-medium">{u.full_name}</span>,
      sortValue: (u) => u.full_name,
    },
    { key: "email", header: "Email", cell: (u) => <span className="font-mono">{u.email}</span> },
    { key: "phone", header: "Telefon", cell: (u) => <span className="font-mono">{u.phone}</span> },
    {
      key: "role",
      header: "Rol",
      cell: (u) => (
        <span
          className={cn(
            "rounded-md px-2 py-0.5 text-[11px] font-medium",
            u.role === "super_admin"
              ? "bg-brand/15 text-brand-deep"
              : u.role === "nazoratchi"
                ? "bg-accent/15 text-accent"
                : "bg-muted text-muted-foreground",
          )}
        >
          {ROLE_LABEL[u.role]}
        </span>
      ),
      sortValue: (u) => u.role,
    },
    { key: "pos", header: "Lavozim", cell: (u) => u.position, hideable: true },
    {
      key: "status",
      header: "Holati",
      cell: (u) => (
        <span
          className={cn(
            "rounded-md px-2 py-0.5 text-[11px]",
            u.status === "faol" ? "bg-positive/12 text-positive" : "bg-muted text-muted-foreground",
          )}
        >
          {u.status === "faol" ? "Faol" : "Nofaol"}
        </span>
      ),
    },
  ];

  return (
    <AppShell
      title="Foydalanuvchilar"
      subtitle={`${all.length} ta foydalanuvchi · rollar va audit tarixi`}
      crumbs={[{ label: "Foydalanuvchilar" }]}
    >
      {role !== "super_admin" && (
        <p className="rounded-lg bg-muted px-4 py-2.5 text-[12px] text-muted-foreground">
          Sizning rolingizda foydalanuvchilarni tahrirlash imkoniyati cheklangan.
        </p>
      )}

      <DataTable
        rows={data}
        columns={columns}
        onRowClick={(u) => (u.role === "masul" ? go(`/employees/${u.id}`) : undefined)}
        toolbar={
          <div className="flex flex-wrap items-center gap-2">
            <TableSearch value={q} onChange={setQ} placeholder="F.I.Sh. yoki email..." />
            <TableSelect
              value={r}
              onChange={setR}
              options={[
                { value: "all", label: "Barcha rollar" },
                { value: "super_admin", label: "Super Admin" },
                { value: "nazoratchi", label: "Nazoratchi" },
                { value: "masul", label: "Mas'ul xodim" },
              ]}
            />
          </div>
        }
      />

      <Panel title="Audit tarixi (ma'lumotlar o'zgarishi)">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-[12px]">
            <thead className="bg-muted text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Sana va vaqt</th>
                <th className="px-3 py-2 text-left font-medium">Foydalanuvchi</th>
                <th className="px-3 py-2 text-left font-medium">Amal</th>
                <th className="px-3 py-2 text-left font-medium">Obyekt</th>
                <th className="px-3 py-2 text-left font-medium">Oldingi qiymat</th>
                <th className="px-3 py-2 text-left font-medium">Yangi qiymat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {auditLogs.slice(0, 40).map((l) => (
                <tr key={l.id} className="hover:bg-muted/50">
                  <td className="px-3 py-2 font-mono text-muted-foreground">
                    {fmtDateTime(l.created_at)}
                  </td>
                  <td className="px-3 py-2">{userName(l.user_id)}</td>
                  <td className="px-3 py-2">{l.action}</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {l.entity_type} · {l.entity_id}
                  </td>
                  <td className="px-3 py-2 font-mono text-muted-foreground">{l.old_data ?? "—"}</td>
                  <td className="px-3 py-2 font-mono text-accent">{l.new_data ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </AppShell>
  );
}
