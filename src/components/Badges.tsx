import { cn } from "@/lib/utils";
import { DEBT_TYPE_LABEL, STATUS_LABEL, type CompanyStatus, type DebtType } from "@/lib/types";

export function DebtTypeBadge({ type }: { type: DebtType }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ring-1",
        type === "umidsiz"
          ? "bg-destructive/8 text-destructive ring-destructive/20"
          : "bg-brand/8 text-brand ring-brand/20",
      )}
    >
      {DEBT_TYPE_LABEL[type]}
    </span>
  );
}

const STATUS_STYLE: Record<CompanyStatus, string> = {
  undirilmoqda: "bg-accent/10 text-accent ring-accent/25",
  qisman: "bg-brand/10 text-brand ring-brand/25",
  toliq: "bg-positive/10 text-positive ring-positive/25",
  ozgarishsiz: "bg-muted text-muted-foreground ring-border",
};

export function StatusBadge({ status }: { status: CompanyStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ring-1",
        STATUS_STYLE[status],
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export function Progress({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div
          className="bar-grow h-full rounded-full bg-accent"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      <span className="w-11 text-right font-mono text-[11px] tnum text-muted-foreground">
        {value.toFixed(1)}%
      </span>
    </div>
  );
}
