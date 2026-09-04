import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { AppLink } from "@/components/AppLink";
import { Panel } from "@/components/Kpi";
import { useApp } from "@/lib/store";
import { territoryById } from "@/lib/derive";
import { fmtDateTime } from "@/lib/format";
import { ROLE_LABEL } from "@/lib/types";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profil — E-Energiya Nazorat" },
      {
        name: "description",
        content: "Foydalanuvchi profili, roli va tizimdagi so'nggi harakatlari.",
      },
      { property: "og:title", content: "Profil — E-Energiya Nazorat" },
      { property: "og:description", content: "Shaxsiy ma'lumotlar va faoliyat tarixi." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { currentUser, auditLogs, notifications } = useApp();
  const territory = currentUser.territory_id ? territoryById(currentUser.territory_id) : null;
  const mine = auditLogs.filter((l) => l.user_name === currentUser.full_name).slice(0, 10);

  return (
    <AppShell
      title={currentUser.full_name}
      subtitle={`${ROLE_LABEL[currentUser.role]} · ${currentUser.position}`}
      crumbs={[{ label: "Dashboard", to: "/" }, { label: "Profil" }]}
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="card-surface p-5">
          <h2 className="text-[15px] font-semibold tracking-tight">Shaxsiy ma'lumotlar</h2>
          <dl className="mt-4 space-y-2.5 text-[13px]">
            <Row label="F.I.Sh." value={currentUser.full_name} />
            <Row label="Lavozim" value={currentUser.position} />
            <Row label="Rol" value={ROLE_LABEL[currentUser.role]} />
            <Row label="Telefon" value={currentUser.phone} mono />
            <Row label="Email" value={currentUser.email} mono />
            {territory && (
              <div className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                <dt className="text-muted-foreground">Hudud</dt>
                <dd>
                  <AppLink
                    to={`/territories/${territory.id}`}
                    className="text-primary hover:underline"
                  >
                    {territory.name}
                  </AppLink>
                </dd>
              </div>
            )}
            <Row
              label="Holati"
              value={currentUser.status === "active" ? "Faol" : "Nofaol"}
            />
          </dl>
        </section>

        <Panel title="So'nggi bildirishnomalar" className="lg:col-span-2">
          <div className="space-y-2">
            {notifications.slice(0, 8).map((n) => (
              <div key={n.id} className="rounded-lg px-3 py-2.5 ring-1 ring-border">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[13px] font-medium">{n.title}</p>
                    <p className="mt-0.5 text-[12px] text-muted-foreground">{n.body}</p>
                  </div>
                  <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                    {fmtDateTime(n.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="Mening harakatlarim">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-[12px]">
            <thead className="bg-muted text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Sana</th>
                <th className="px-3 py-2 text-left font-medium">Amal</th>
                <th className="px-3 py-2 text-left font-medium">Obyekt</th>
                <th className="px-3 py-2 text-left font-medium">Yangi qiymat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mine.map((l) => (
                <tr key={l.id}>
                  <td className="px-3 py-2 font-mono text-muted-foreground">
                    {fmtDateTime(l.created_at)}
                  </td>
                  <td className="px-3 py-2">{l.action}</td>
                  <td className="px-3 py-2 text-muted-foreground">{l.entity_label}</td>
                  <td className="px-3 py-2 font-mono text-accent">{l.new_value ?? "—"}</td>
                </tr>
              ))}
              {mine.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-8 text-center text-muted-foreground">
                    Harakatlar tarixi bo'sh.
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

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-2 last:border-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={mono ? "font-mono" : ""}>{value}</dd>
    </div>
  );
}
