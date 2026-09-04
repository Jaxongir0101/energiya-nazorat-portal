import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  CAMPAIGN_START,
  TODAY,
  adminUser,
  collections as seedCollections,
  employees,
  initialAuditLogs,
  initialNotifications,
  supervisorUser,
} from "./demo-data";
import { toISODate } from "./format";
import type { AppNotification, AuditLog, Collection, DebtType, Employee, Role } from "./types";
import { buildCompanyRows, type CompanyRow, type DateRange } from "./derive";

export type QuickRange = "bugun" | "kecha" | "7kun" | "oy" | "tadbir" | "ixtiyoriy";

export interface GlobalFilter {
  quick: QuickRange;
  range: DateRange;
  territoryId: string;
  employeeId: string;
  debtType: DebtType | "all";
}

const CAMPAIGN_RANGE: DateRange = { from: toISODate(CAMPAIGN_START), to: toISODate(TODAY) };

export function rangeFor(quick: QuickRange, current: DateRange): DateRange {
  const today = toISODate(TODAY);
  switch (quick) {
    case "bugun":
      return { from: today, to: today };
    case "kecha": {
      const y = new Date(TODAY);
      y.setDate(y.getDate() - 1);
      return { from: toISODate(y), to: toISODate(y) };
    }
    case "7kun": {
      const s = new Date(TODAY);
      s.setDate(s.getDate() - 6);
      return { from: toISODate(s), to: today };
    }
    case "oy": {
      const s = new Date(TODAY.getFullYear(), TODAY.getMonth(), 1);
      return { from: toISODate(s), to: today };
    }
    case "tadbir":
      return CAMPAIGN_RANGE;
    default:
      return current;
  }
}

export interface NewCollectionInput {
  company_id: string;
  employee_id: string;
  amount: number;
  collection_date: string;
  payment_type: Collection["payment_type"];
  comment: string;
  document_name: string | null;
}

interface Ctx {
  currentUser: Employee;
  role: Role;
  setRole: (r: Role) => void;
  collections: Collection[];
  addCollection: (input: NewCollectionInput) => void;
  auditLogs: AuditLog[];
  notifications: AppNotification[];
  markAllRead: () => void;
  filter: GlobalFilter;
  setFilter: (f: Partial<GlobalFilter>) => void;
  resetFilter: () => void;
  /** Barcha korxonalar (rol bo'yicha cheklangan) */
  rows: CompanyRow[];
  /** Global filtrga mos korxonalar */
  filteredRows: CompanyRow[];
  visibleCollections: Collection[];
}

const AppCtx = createContext<Ctx | null>(null);

const DEFAULT_FILTER: GlobalFilter = {
  quick: "tadbir",
  range: CAMPAIGN_RANGE,
  territoryId: "all",
  employeeId: "all",
  debtType: "all",
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("super_admin");
  const [collections, setCollections] = useState<Collection[]>(seedCollections);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);
  const [filter, setFilterState] = useState<GlobalFilter>(DEFAULT_FILTER);

  const currentUser: Employee =
    role === "super_admin" ? adminUser : role === "nazoratchi" ? supervisorUser : employees[0]!;

  const allRows = useMemo(
    () => buildCompanyRows(collections, filter.range),
    [collections, filter.range],
  );

  const rows = useMemo(
    () =>
      role === "masul"
        ? allRows.filter((r) => r.responsible_employee_id === currentUser.id)
        : allRows,
    [allRows, role, currentUser.id],
  );

  const filteredRows = useMemo(
    () =>
      rows.filter(
        (r) =>
          (filter.territoryId === "all" || r.territory_id === filter.territoryId) &&
          (filter.employeeId === "all" || r.responsible_employee_id === filter.employeeId) &&
          (filter.debtType === "all" || r.debt_type === filter.debtType),
      ),
    [rows, filter.territoryId, filter.employeeId, filter.debtType],
  );

  const visibleCollections = useMemo(() => {
    const ids = new Set(rows.map((r) => r.id));
    return collections.filter((c) => ids.has(c.company_id));
  }, [collections, rows]);

  const value: Ctx = {
    currentUser,
    role,
    setRole,
    collections,
    auditLogs,
    notifications,
    filter,
    rows,
    filteredRows,
    visibleCollections,
    setFilter: (f) =>
      setFilterState((prev) => {
        const next = { ...prev, ...f };
        if (f.quick && f.quick !== "ixtiyoriy") next.range = rangeFor(f.quick, prev.range);
        if (f.range) next.quick = "ixtiyoriy";
        return next;
      }),
    resetFilter: () => setFilterState(DEFAULT_FILTER),
    markAllRead: () => setNotifications((n) => n.map((x) => ({ ...x, read: true }))),
    addCollection: (input) => {
      const id = `col-new-${Date.now()}`;
      const now = new Date().toISOString();
      const record: Collection = {
        id,
        company_id: input.company_id,
        employee_id: input.employee_id,
        amount: input.amount,
        collection_date: input.collection_date,
        payment_type: input.payment_type,
        comment: input.comment,
        document_url: input.document_name ? "#" : null,
        document_name: input.document_name,
        created_at: now,
        created_by: input.employee_id,
      };
      setCollections((prev) => [record, ...prev]);
      setAuditLogs((prev) => [
        {
          id: `a-${id}`,
          user_id: currentUser.id,
          action: "yaratildi",
          entity_type: "collections",
          entity_id: id,
          old_data: null,
          new_data: JSON.stringify({ amount: input.amount, company_id: input.company_id }),
          created_at: now,
        },
        ...prev,
      ]);
      setNotifications((prev) => [
        {
          id: `n-${id}`,
          title: "Yangi undirish kiritildi",
          body: `${input.amount.toLocaleString("ru-RU")} so'm miqdorida to'lov qayd etildi.`,
          created_at: now,
          read: false,
          link: `/debtors/${input.company_id}`,
        },
        ...prev,
      ]);
    },
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp AppProvider ichida ishlatilishi kerak");
  return ctx;
}
