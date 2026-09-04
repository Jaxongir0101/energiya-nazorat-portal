import { useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown, Columns3 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T, index: number) => ReactNode;
  sortValue?: (row: T) => string | number;
  align?: "left" | "right";
  className?: string;
  hideable?: boolean;
}

export function DataTable<T>({
  rows,
  columns,
  onRowClick,
  toolbar,
  emptyText = "Ma'lumot topilmadi.",
  initialPageSize = 25,
  defaultSortKey,
}: {
  rows: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  toolbar?: ReactNode;
  emptyText?: string;
  initialPageSize?: number;
  defaultSortKey?: string;
}) {
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(
    defaultSortKey ? { key: defaultSortKey, dir: "desc" } : null,
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [hidden, setHidden] = useState<string[]>([]);

  const visibleCols = columns.filter((c) => !hidden.includes(c.key));

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return rows;
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      const r = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv), "uz");
      return sort.dir === "asc" ? r : -r;
    });
    return copy;
  }, [rows, sort, columns]);

  const total = sorted.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(page, pages);
  const slice = sorted.slice((current - 1) * pageSize, current * pageSize);
  const startIdx = total === 0 ? 0 : (current - 1) * pageSize + 1;

  return (
    <div className="card-surface overflow-hidden">
      <div className="no-print flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">{toolbar}</div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-card px-3 text-[13px] ring-1 ring-border hover:bg-muted"
            >
              <Columns3 className="size-4" /> Ustunlar
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="max-h-80 w-56 overflow-y-auto">
            <DropdownMenuLabel>Ustun ko'rinishi</DropdownMenuLabel>
            {columns
              .filter((c) => c.hideable !== false)
              .map((c) => (
                <DropdownMenuCheckboxItem
                  key={c.key}
                  checked={!hidden.includes(c.key)}
                  onCheckedChange={(v) =>
                    setHidden((h) => (v ? h.filter((x) => x !== c.key) : [...h, c.key]))
                  }
                >
                  {c.header}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="max-h-[70vh] overflow-auto">
        <table className="w-full min-w-[860px] text-[12.5px]">
          <thead className="sticky top-0 z-10 bg-muted/95 text-[10px] uppercase tracking-[0.1em] text-muted-foreground backdrop-blur">
            <tr>
              {visibleCols.map((c) => (
                <th
                  key={c.key}
                  className={cn(
                    "whitespace-nowrap px-3 py-2.5 font-medium",
                    c.align === "right" ? "text-right" : "text-left",
                  )}
                >
                  {c.sortValue ? (
                    <button
                      type="button"
                      onClick={() =>
                        setSort((s) =>
                          s?.key === c.key
                            ? { key: c.key, dir: s.dir === "asc" ? "desc" : "asc" }
                            : { key: c.key, dir: "desc" },
                        )
                      }
                      className={cn(
                        "inline-flex items-center gap-1 hover:text-foreground",
                        c.align === "right" && "flex-row-reverse",
                      )}
                    >
                      {c.header}
                      {sort?.key === c.key ? (
                        sort.dir === "asc" ? (
                          <ArrowUp className="size-3" />
                        ) : (
                          <ArrowDown className="size-3" />
                        )
                      ) : (
                        <ChevronsUpDown className="size-3 opacity-40" />
                      )}
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {slice.map((row, i) => (
              <tr
                key={i}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  "transition-colors hover:bg-muted/60",
                  onRowClick && "cursor-pointer",
                )}
              >
                {visibleCols.map((c) => (
                  <td
                    key={c.key}
                    className={cn(
                      "px-3 py-2.5 align-middle",
                      c.align === "right" && "text-right",
                      c.className,
                    )}
                  >
                    {c.cell(row, (current - 1) * pageSize + i)}
                  </td>
                ))}
              </tr>
            ))}
            {slice.length === 0 && (
              <tr>
                <td
                  colSpan={visibleCols.length}
                  className="px-3 py-12 text-center text-muted-foreground"
                >
                  {emptyText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="no-print flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-[12px] text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>Sahifada:</span>
          {[10, 25, 50, 100].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => {
                setPageSize(n);
                setPage(1);
              }}
              className={cn(
                "rounded-md px-2 py-1 font-mono ring-1 ring-border",
                pageSize === n ? "bg-primary text-primary-foreground" : "hover:bg-muted",
              )}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="font-mono tnum">
          {startIdx}–{Math.min(current * pageSize, total)} / {total}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={current <= 1}
            onClick={() => setPage(current - 1)}
            className="rounded-md px-2.5 py-1 ring-1 ring-border disabled:opacity-40 hover:bg-muted"
          >
            Oldingi
          </button>
          <span className="px-2 font-mono">
            {current} / {pages}
          </span>
          <button
            type="button"
            disabled={current >= pages}
            onClick={() => setPage(current + 1)}
            className="rounded-md px-2.5 py-1 ring-1 ring-border disabled:opacity-40 hover:bg-muted"
          >
            Keyingi
          </button>
        </div>
      </div>
    </div>
  );
}

export function TableSearch({
  value,
  onChange,
  placeholder = "Qidirish...",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-9 w-56 rounded-lg border border-border bg-muted px-3 text-[13px] outline-none focus:ring-2 focus:ring-ring"
    />
  );
}

export function TableSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 rounded-lg border border-border bg-muted px-2.5 text-[13px] outline-none focus:ring-2 focus:ring-ring"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
