import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import {
  Bell,
  Building2,
  ChevronRight,
  FileBarChart2,
  Flame,
  LayoutDashboard,
  LogOut,
  Map,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  UserCog,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/store";
import { companies, employees, territories, TODAY } from "@/lib/demo-data";
import { fmtLongDate, timeAgo } from "@/lib/format";
import { ROLE_LABEL, type Role } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV_MAIN = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/debtors", label: "Qarzdorlar", icon: Building2 },
  { to: "/territories", label: "Hududlar", icon: Map },
  { to: "/employees", label: "Mas'ullar", icon: Users },
  { to: "/collections", label: "Undirishlar", icon: Wallet },
] as const;

const NAV_REPORT = [
  { to: "/reports", label: "Hisobotlar", icon: FileBarChart2 },
  { to: "/users", label: "Foydalanuvchilar", icon: UserCog },
  { to: "/settings", label: "Sozlamalar", icon: Settings },
] as const;

export interface Crumb {
  label: string;
  to?: string;
}

export function AppShell({
  title,
  subtitle,
  crumbs = [],
  actions,
  children,
}: {
  title: string;
  subtitle?: ReactNode;
  crumbs?: Crumb[];
  actions?: ReactNode;
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const { currentUser, role, setRole, notifications, markAllRead } = useApp();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const unread = notifications.filter((n) => !n.read).length;

  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  const navLink = (item: { to: string; label: string; icon: typeof Map }) => (
    <Link
      key={item.to}
      to={item.to}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-colors",
        isActive(item.to)
          ? "bg-white/12 font-medium text-white"
          : "text-white/70 hover:bg-white/8 hover:text-white",
        collapsed && "justify-center px-0",
      )}
      title={item.label}
    >
      <item.icon className="size-4 shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <aside
          className={cn(
            "no-print sticky top-0 hidden h-screen shrink-0 flex-col bg-sidebar text-sidebar-foreground transition-[width] duration-200 md:flex",
            collapsed ? "w-16" : "w-60",
          )}
        >
          <div
            className={cn(
              "flex h-16 items-center gap-2.5 border-b border-sidebar-border px-4",
              collapsed && "justify-center px-0",
            )}
          >
            <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-white/40 to-white/5 text-sm font-semibold text-sidebar">
              E
            </div>
            {!collapsed && (
              <div className="leading-tight">
                <p className="text-[13px] font-semibold tracking-tight text-white">E-Energiya</p>
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">Nazorat</p>
              </div>
            )}
          </div>

          <nav className="space-y-0.5 px-3 py-4">
            {!collapsed && (
              <p className="px-2.5 pb-2 text-[10px] uppercase tracking-[0.18em] text-white/35">
                Boshqaruv
              </p>
            )}
            {NAV_MAIN.map(navLink)}
            {!collapsed && (
              <p className="px-2.5 pb-2 pt-4 text-[10px] uppercase tracking-[0.18em] text-white/35">
                Hisobot
              </p>
            )}
            {NAV_REPORT.map(navLink)}
          </nav>

          <div className="mt-auto space-y-0.5 border-t border-sidebar-border px-3 py-3">
            {navLink({ to: "/profile", label: "Profil", icon: UserCog })}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-white/55 transition-colors hover:bg-white/8",
                collapsed && "justify-center px-0",
              )}
            >
              <LogOut className="size-4 shrink-0" />
              {!collapsed && "Chiqish"}
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="no-print sticky top-0 z-20 flex h-16 shrink-0 flex-wrap items-center gap-3 border-b border-border bg-card/85 px-4 backdrop-blur-md md:px-6">
            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              className="hidden size-9 shrink-0 place-items-center rounded-lg text-muted-foreground ring-1 ring-border transition-colors hover:bg-muted md:grid"
              aria-label="Menyuni yig'ish"
            >
              {collapsed ? (
                <PanelLeftOpen className="size-4" />
              ) : (
                <PanelLeftClose className="size-4" />
              )}
            </button>

            <GlobalSearch />

            <div className="ml-auto flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="relative grid size-9 place-items-center rounded-lg text-muted-foreground ring-1 ring-border transition-colors hover:bg-muted"
                    aria-label="Bildirishnomalar"
                  >
                    <Bell className="size-4" />
                    {unread > 0 && (
                      <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-accent text-[9px] font-semibold text-accent-foreground">
                        {unread}
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    Bildirishnomalar
                    <button
                      className="text-[11px] font-normal text-primary hover:underline"
                      onClick={markAllRead}
                    >
                      Barchasini o'qilgan qilish
                    </button>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.slice(0, 6).map((n) => (
                    <DropdownMenuItem key={n.id} asChild>
                      <Link to={n.link ?? "/"} className="flex flex-col items-start gap-0.5 py-2">
                        <span className="flex w-full items-center gap-2 text-[13px] font-medium">
                          {!n.read && <span className="size-1.5 rounded-full bg-accent" />}
                          {n.title}
                        </span>
                        <span className="line-clamp-2 text-[11px] text-muted-foreground">
                          {n.body}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {timeAgo(n.created_at, TODAY)}
                        </span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2.5 rounded-lg py-1 pl-1 pr-2.5 ring-1 ring-border transition-colors hover:bg-muted"
                  >
                    <span className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-brand to-brand-deep text-[11px] font-semibold text-primary-foreground">
                      {currentUser.short_name.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase()}
                    </span>
                    <span className="hidden text-left leading-tight sm:block">
                      <span className="block text-[12px] font-medium">
                        {currentUser.short_name}
                      </span>
                      <span className="block text-[10px] text-muted-foreground">
                        {ROLE_LABEL[role]}
                      </span>
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Rolni almashtirish (demo)</DropdownMenuLabel>
                  {(["super_admin", "nazoratchi", "masul"] as Role[]).map((r) => (
                    <DropdownMenuItem key={r} onClick={() => setRole(r)}>
                      <span className={cn(role === r && "font-semibold text-primary")}>
                        {ROLE_LABEL[r]}
                      </span>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Profil</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="min-w-0 flex-1 space-y-5 p-4 md:p-6">
            <nav className="no-print flex flex-wrap items-center gap-1 text-[12px] text-muted-foreground">
              <Link to="/" className="hover:text-primary">
                Dashboard
              </Link>
              {crumbs.map((c) => (
                <span key={c.label} className="flex items-center gap-1">
                  <ChevronRight className="size-3" />
                  {c.to ? (
                    <Link to={c.to} className="hover:text-primary">
                      {c.label}
                    </Link>
                  ) : (
                    <span className="text-foreground">{c.label}</span>
                  )}
                </span>
              ))}
            </nav>

            <SectorSwitch />

            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="text-balance text-xl font-semibold leading-tight">{title}</h1>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  {subtitle ?? `Jizzax viloyati · ${fmtLongDate(TODAY)}`}
                </p>
              </div>
              {actions && <div className="no-print flex flex-wrap gap-2">{actions}</div>}
            </div>

            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

function SectorSwitch() {
  const { sector, setSector } = useApp();
  const items: { key: "elektr" | "gaz"; label: string; icon: typeof Zap }[] = [
    { key: "elektr", label: "ELEKTR", icon: Zap },
    { key: "gaz", label: "GAZ", icon: Flame },
  ];
  return (
    <div className="no-print inline-flex rounded-xl bg-muted p-1 ring-1 ring-border">
      {items.map((it) => {
        const Icon = it.icon;
        const active = sector === it.key;
        return (
          <button
            key={it.key}
            type="button"
            onClick={() => setSector(it.key)}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold tracking-wide transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

function GlobalSearch() {
  const { sector } = useApp();
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (term.length < 2) return [];
    const out: { label: string; hint: string; to: string }[] = [];
    companies
      .filter((c) => c.sector === sector)
      .forEach((c) => {
        if (c.name.toLowerCase().includes(term) || c.stir.includes(term))
          out.push({ label: c.name, hint: `STIR ${c.stir}`, to: `/debtors/${c.id}` });
      });
    employees
      .filter((e) => e.sector === sector)
      .forEach((e) => {
        if (e.full_name.toLowerCase().includes(term))
          out.push({ label: e.full_name, hint: "Mas'ul xodim", to: `/employees/${e.id}` });
      });
    territories.forEach((t) => {
      if (t.name.toLowerCase().includes(term))
        out.push({ label: t.name, hint: "Hudud", to: `/territories/${t.id}` });
    });
    return out.slice(0, 8);
  }, [q, sector]);

  return (
    <div className="relative min-w-[200px] flex-1 md:max-w-md">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="h-9 w-full rounded-lg border border-border bg-muted pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
        placeholder="Korxona, STIR, mas'ul, hudud bo'yicha qidirish..."
      />
      {results.length > 0 && (
        <div className="absolute left-0 right-0 top-11 z-30 overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
          {results.map((r) => (
            <button
              key={r.to + r.label}
              type="button"
              onMouseDown={() => {
                setQ("");
                navigate({ to: r.to });
              }}
              className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-[13px] hover:bg-muted"
            >
              <span className="truncate">{r.label}</span>
              <span className="shrink-0 font-mono text-[10px] text-muted-foreground">{r.hint}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
