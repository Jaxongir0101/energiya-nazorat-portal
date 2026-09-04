import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  unit = "so'm",
  hint,
  to,
  accent,
  tone = "default",
}: {
  label: string;
  value: string;
  unit?: string;
  hint?: ReactNode;
  to?: string;
  accent?: boolean;
  tone?: "default" | "accent" | "deep";
}) {
  const body = (
    <>
      {accent && (
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
      )}
      <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-2 whitespace-nowrap font-mono text-[22px] font-semibold leading-none tracking-tight tnum",
          tone === "accent" && "text-accent",
          tone === "deep" && "text-brand-deep",
        )}
      >
        {value}
        <span className="text-[13px] font-medium text-muted-foreground"> {unit}</span>
      </p>
      {hint && <p className="mt-2 font-mono text-[11px] text-muted-foreground">{hint}</p>}
    </>
  );

  const cls =
    "card-surface relative overflow-hidden p-4 transition-transform hover:-translate-y-0.5";

  return to ? (
    <Link to={to} className={cn(cls, "block")}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

export function Panel({
  title,
  right,
  children,
  className,
}: {
  title: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("card-surface p-5", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[15px] font-semibold tracking-tight">{title}</h2>
        {right}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
