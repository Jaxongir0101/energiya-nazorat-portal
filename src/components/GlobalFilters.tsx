import { CalendarRange, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp, type QuickRange } from "@/lib/store";
import { employees, territories } from "@/lib/demo-data";
import type { DebtType } from "@/lib/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const QUICK: { key: QuickRange; label: string }[] = [
  { key: "bugun", label: "Bugun" },
  { key: "kecha", label: "Kecha" },
  { key: "7kun", label: "Oxirgi 7 kun" },
  { key: "oy", label: "Joriy oy" },
  { key: "tadbir", label: "Tadbir boshidan" },
];

export function GlobalFilters() {
  const { filter, setFilter, resetFilter } = useApp();

  return (
    <div className="no-print flex flex-wrap items-center gap-1.5">
      {QUICK.map((q) => (
        <button
          key={q.key}
          type="button"
          onClick={() => setFilter({ quick: q.key })}
          className={cn(
            "rounded-md px-2.5 py-1.5 font-mono text-[12px] transition-colors",
            filter.quick === q.key
              ? "bg-primary text-primary-foreground"
              : "bg-card text-muted-foreground ring-1 ring-border hover:bg-muted",
          )}
        >
          {q.label}
        </button>
      ))}

      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "inline-flex h-8 items-center gap-2 rounded-md px-2.5 text-[12px] ring-1 ring-border",
              filter.quick === "ixtiyoriy"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:bg-muted",
            )}
          >
            <CalendarRange className="size-3.5" /> Ixtiyoriy davr
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72 space-y-3">
          <div className="space-y-1">
            <label className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Boshlanish sanasi
            </label>
            <input
              type="date"
              value={filter.range.from}
              onChange={(e) => setFilter({ range: { ...filter.range, from: e.target.value } })}
              className="h-9 w-full rounded-lg border border-border bg-muted px-3 text-[13px]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Tugash sanasi
            </label>
            <input
              type="date"
              value={filter.range.to}
              onChange={(e) => setFilter({ range: { ...filter.range, to: e.target.value } })}
              className="h-9 w-full rounded-lg border border-border bg-muted px-3 text-[13px]"
            />
          </div>
        </PopoverContent>
      </Popover>

      <select
        value={filter.territoryId}
        onChange={(e) => setFilter({ territoryId: e.target.value })}
        className="h-8 rounded-md border border-border bg-card px-2 text-[12px] outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="all">Barcha hududlar</option>
        {territories.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>

      <select
        value={filter.employeeId}
        onChange={(e) => setFilter({ employeeId: e.target.value })}
        className="h-8 rounded-md border border-border bg-card px-2 text-[12px] outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="all">Barcha mas'ullar</option>
        {employees.map((e) => (
          <option key={e.id} value={e.id}>
            {e.full_name}
          </option>
        ))}
      </select>

      <select
        value={filter.debtType}
        onChange={(e) => setFilter({ debtType: e.target.value as DebtType | "all" })}
        className="h-8 rounded-md border border-border bg-card px-2 text-[12px] outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="all">Barcha turlar</option>
        <option value="umidsiz">Umidsiz</option>
        <option value="harakatdagi">Harakatdagi</option>
      </select>

      <button
        type="button"
        onClick={resetFilter}
        className="inline-flex h-8 items-center gap-1.5 rounded-md bg-card px-2.5 text-[12px] text-muted-foreground ring-1 ring-border hover:bg-muted"
      >
        <RotateCcw className="size-3.5" /> Tozalash
      </button>
    </div>
  );
}
