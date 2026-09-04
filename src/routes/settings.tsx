import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Panel } from "@/components/Kpi";
import { useApp } from "@/lib/store";
import { CAMPAIGN_START, TODAY, territories, employees, companies } from "@/lib/demo-data";
import { fmtDate, fmtNumber } from "@/lib/format";
import { ROLE_LABEL, type Role } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Sozlamalar — E-Energiya Nazorat" },
      {
        name: "description",
        content: "Tadbir davri, hududlar, mas'ullar va tizim parametrlari bo'yicha sozlamalar.",
      },
      { property: "og:title", content: "Sozlamalar — E-Energiya Nazorat" },
      {
        property: "og:description",
        content: "Monitoring platformasi parametrlari va rol sozlamalari.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { role, setRole, collections } = useApp();

  return (
    <AppShell
      title="Sozlamalar"
      subtitle="Tizim parametrlari va tadbir ma'lumotlari"
      crumbs={[{ label: "Dashboard", to: "/" }, { label: "Sozlamalar" }]}
    >
      <Panel title="Tadbir parametrlari">
        <dl className="grid grid-cols-2 gap-3 text-[13px] md:grid-cols-4">
          <Item label="Tadbir boshlanishi" value={fmtDate(CAMPAIGN_START.toISOString())} />
          <Item label="Joriy sana" value={fmtDate(TODAY.toISOString())} />
          <Item label="Hududlar" value={`${territories.length} ta`} />
          <Item label="Mas'ul xodimlar" value={`${employees.length} ta`} />
          <Item label="Qarzdor korxonalar" value={`${companies.length} ta`} />
          <Item label="Undirish yozuvlari" value={`${fmtNumber(collections.length)} ta`} />
          <Item label="Valyuta" value="so'm (UZS)" />
          <Item label="Interfeys tili" value="O'zbek (lotin)" />
        </dl>
      </Panel>

      <Panel title="Rolni almashtirish (demo rejimi)">
        <p className="text-[12px] text-muted-foreground">
          Rolga qarab ko'rinadigan ma'lumotlar va ruxsatlar o'zgaradi. Mas'ul xodim faqat o'ziga
          biriktirilgan korxonalarni ko'radi.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(["super_admin", "nazoratchi", "masul"] as Role[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={cn(
                "rounded-lg px-3.5 py-2 text-[13px] ring-1 transition-colors",
                role === r
                  ? "bg-primary text-primary-foreground ring-primary"
                  : "ring-border hover:bg-muted",
              )}
            >
              {ROLE_LABEL[r]}
            </button>
          ))}
        </div>
      </Panel>

      <Panel title="Hisoblash qoidalari">
        <ul className="space-y-2 text-[13px] text-muted-foreground">
          <li>• Boshlang'ich qarzdorlik undirish kiritilganda hech qachon o'zgarmaydi.</li>
          <li>• Undirilgan summa = barcha undirish yozuvlari yig'indisi.</li>
          <li>• Qoldiq = boshlang'ich qarzdorlik − undirilgan summa (manfiy bo'lmaydi).</li>
          <li>• Samaradorlik = undirilgan / boshlang'ich × 100%.</li>
          <li>• Barcha hisobotlar bir xil manba ma'lumotlaridan hisoblanadi.</li>
        </ul>
      </Panel>
    </AppShell>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted px-3 py-2.5">
      <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-mono text-[14px] font-medium">{value}</dd>
    </div>
  );
}
