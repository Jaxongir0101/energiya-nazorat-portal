import { companies, employees, territories, TODAY } from "./demo-data";
import { pct } from "./format";
import type { Collection, Company, CompanyStatus, Employee, Sector, Territory } from "./types";

export interface CompanyRow extends Company {
  territory: Territory;
  employee: Employee;
  collected: number;
  collected_in_range: number;
  collected_today: number;
  remaining: number;
  percentage: number;
  status: CompanyStatus;
  last_payment: string | null;
}

export interface DateRange {
  from: string; // yyyy-mm-dd
  to: string; // yyyy-mm-dd
}

export const territoryById = (id: string) => territories.find((t) => t.id === id)!;
export const employeeById = (id: string) => employees.find((e) => e.id === id);
export const companyById = (id: string) => companies.find((c) => c.id === id);

export function isSameDay(iso: string, day: Date) {
  const d = new Date(iso);
  return (
    d.getFullYear() === day.getFullYear() &&
    d.getMonth() === day.getMonth() &&
    d.getDate() === day.getDate()
  );
}

export function inRange(iso: string, range: DateRange) {
  const t = new Date(iso).getTime();
  const from = new Date(`${range.from}T00:00:00`).getTime();
  const to = new Date(`${range.to}T23:59:59`).getTime();
  return t >= from && t <= to;
}

export function statusOf(initial: number, collected: number): CompanyStatus {
  if (collected <= 0) return "ozgarishsiz";
  if (collected >= initial) return "toliq";
  if (collected / initial >= 0.5) return "qisman";
  return "undirilmoqda";
}

export function buildCompanyRows(allCollections: Collection[], range: DateRange): CompanyRow[] {
  const byCompany = new Map<string, Collection[]>();
  for (const c of allCollections) {
    const list = byCompany.get(c.company_id);
    if (list) list.push(c);
    else byCompany.set(c.company_id, [c]);
  }

  return companies.map((c) => {
    const list = byCompany.get(c.id) ?? [];
    const collected = list.reduce((s, x) => s + x.amount, 0);
    const collected_in_range = list
      .filter((x) => inRange(x.collection_date, range))
      .reduce((s, x) => s + x.amount, 0);
    const collected_today = list
      .filter((x) => isSameDay(x.collection_date, TODAY))
      .reduce((s, x) => s + x.amount, 0);
    const remaining = Math.max(0, c.initial_debt - collected);
    const last = list.reduce<string | null>(
      (acc, x) => (!acc || new Date(x.collection_date) > new Date(acc) ? x.collection_date : acc),
      null,
    );
    return {
      ...c,
      territory: territoryById(c.territory_id),
      employee: employeeById(c.responsible_employee_id)!,
      collected,
      collected_in_range,
      collected_today,
      remaining,
      percentage: pct(collected, c.initial_debt),
      status: statusOf(c.initial_debt, collected),
      last_payment: last,
    };
  });
}

export interface Totals {
  companies: number;
  initial: number;
  umidsiz: number;
  harakatdagi: number;
  collected: number;
  collected_today: number;
  collected_in_range: number;
  remaining: number;
  efficiency: number;
}

export function totalsOf(rows: CompanyRow[]): Totals {
  const initial = rows.reduce((s, r) => s + r.initial_debt, 0);
  const collected = rows.reduce((s, r) => s + r.collected, 0);
  return {
    companies: rows.length,
    initial,
    umidsiz: rows.filter((r) => r.debt_type === "umidsiz").reduce((s, r) => s + r.remaining, 0),
    harakatdagi: rows
      .filter((r) => r.debt_type === "harakatdagi")
      .reduce((s, r) => s + r.remaining, 0),
    collected,
    collected_today: rows.reduce((s, r) => s + r.collected_today, 0),
    collected_in_range: rows.reduce((s, r) => s + r.collected_in_range, 0),
    remaining: rows.reduce((s, r) => s + r.remaining, 0),
    efficiency: pct(collected, initial),
  };
}

export interface CollectionRow extends Collection {
  company: Company;
  territory: Territory;
  employee: Employee;
}

export function buildCollectionRows(all: Collection[]): CollectionRow[] {
  return all
    .map((c) => {
      const company = companyById(c.company_id)!;
      return {
        ...c,
        company,
        territory: territoryById(company.territory_id),
        employee: employeeById(c.employee_id) ?? employeeById(company.responsible_employee_id)!,
      };
    })
    .sort((a, b) => new Date(b.collection_date).getTime() - new Date(a.collection_date).getTime());
}

export interface EmployeeStat {
  employee: Employee;
  territory: Territory;
  companies: number;
  initial: number;
  umidsiz: number;
  harakatdagi: number;
  today: number;
  in_range: number;
  total: number;
  remaining: number;
  efficiency: number;
}

export function employeeStats(rows: CompanyRow[], sector?: Sector): EmployeeStat[] {
  const present = new Set(rows.map((r) => r.sector));
  const list = employees.filter((e) =>
    sector ? e.sector === sector : present.size ? present.has(e.sector) : true,
  );
  return list
    .map((e) => {
      const mine = rows.filter((r) => r.responsible_employee_id === e.id);
      const t = totalsOf(mine);
      return {
        employee: e,
        territory: territoryById(e.territory_id),
        companies: mine.length,
        initial: t.initial,
        umidsiz: t.umidsiz,
        harakatdagi: t.harakatdagi,
        today: t.collected_today,
        in_range: t.collected_in_range,
        total: t.collected,
        remaining: t.remaining,
        efficiency: t.efficiency,
      };
    })
    .sort((a, b) => b.total - a.total);
}

export interface TerritoryStat {
  territory: Territory;
  companies: number;
  initial: number;
  umidsiz: number;
  harakatdagi: number;
  today: number;
  in_range: number;
  total: number;
  remaining: number;
  efficiency: number;
}

export function territoryStats(rows: CompanyRow[]): TerritoryStat[] {
  return territories
    .map((tr) => {
      const mine = rows.filter((r) => r.territory_id === tr.id);
      const t = totalsOf(mine);
      return {
        territory: tr,
        companies: mine.length,
        initial: t.initial,
        umidsiz: t.umidsiz,
        harakatdagi: t.harakatdagi,
        today: t.collected_today,
        in_range: t.collected_in_range,
        total: t.collected,
        remaining: t.remaining,
        efficiency: t.efficiency,
      };
    })
    .sort((a, b) => b.total - a.total);
}
