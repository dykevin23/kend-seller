import { useState } from "react";
import { Link } from "react-router";
import { Wallet, ArrowUpRight } from "lucide-react";
import Card from "./card";
import { cn } from "~/lib/utils";
import { formatNumber } from "~/common/utils/format";
import type { DailySales } from "~/features/orders/queries";

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2.5 mt-1 text-[12.5px] font-bold text-muted-foreground">
      {children}
    </div>
  );
}

export function KpiTile({
  label,
  value,
  note,
  tone = "default",
  to,
}: {
  label: string;
  value: string;
  note: string;
  tone?: "default" | "warn" | "danger";
  to?: string;
}) {
  const toneClass =
    tone === "warn" ? "text-warning" : tone === "danger" ? "text-destructive" : "";

  return (
    <Card className={cn("relative", to && "transition-colors hover:bg-muted/40")}>
      {to && (
        <Link to={to} className="absolute inset-0 rounded-2xl" aria-label={label}>
          <span className="sr-only">{label} 바로가기</span>
        </Link>
      )}
      {to && (
        <ArrowUpRight className="pointer-events-none absolute right-4 top-4 size-3.5 text-muted-foreground/50" />
      )}
      <p className="text-[12.5px] font-medium text-muted-foreground">{label}</p>
      <p className={`mt-1.5 text-[22px] font-bold tabular-nums tracking-tight ${toneClass}`}>
        {value}
      </p>
      <p className="mt-1.5 text-xs text-muted-foreground/80">{note}</p>
    </Card>
  );
}

export function OpsHead({
  icon: Icon,
  title,
  period,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  period: string;
}) {
  return (
    <div className="mb-3.5 flex items-center justify-between">
      <span className="flex items-center gap-1.5 text-[14.5px] font-bold">
        <Icon className="size-4 text-muted-foreground" />
        {title}
      </span>
      <span className="text-[11.5px] font-medium text-muted-foreground/70">{period}</span>
    </div>
  );
}

export function StatItem({
  to,
  value,
  label,
  tone = "default",
  badge,
}: {
  to: string;
  value: number | string;
  label: string;
  tone?: "default" | "warn" | "danger";
  badge?: string;
}) {
  const isZero = value === 0 || value === "0";
  const toneClass =
    tone === "warn"
      ? "text-warning"
      : tone === "danger"
        ? "text-destructive"
        : isZero
          ? "text-muted-foreground/50"
          : "text-foreground";

  const content = (
    <>
      <div className={`text-[20px] font-bold tabular-nums leading-tight ${toneClass}`}>
        {value}
        {badge && (
          <span className="ml-1 rounded border border-warning-border bg-warning-background px-1 py-px align-middle text-[10px] font-bold text-warning">
            {badge}
          </span>
        )}
      </div>
      <div className="mt-1 text-[11.5px] text-muted-foreground">{label}</div>
    </>
  );

  if (isZero) {
    return (
      <div className="flex-1 rounded-lg py-1 text-center border-l border-border first:border-l-0">
        {content}
      </div>
    );
  }

  return (
    <Link
      to={to}
      className="flex-1 rounded-lg py-1 text-center transition-colors hover:bg-muted/60 border-l border-border first:border-l-0"
    >
      {content}
    </Link>
  );
}

export function SalesTrendCard({
  trend,
  title = "매출 추이",
}: {
  trend: DailySales[];
  title?: string;
}) {
  const [metric, setMetric] = useState<"sales" | "orders">("sales");
  const values = trend.map((d) => (metric === "sales" ? d.sales : d.orders));
  const max = Math.max(1, ...values);
  const total = values.reduce((a, b) => a + b, 0);
  const todayIndex = trend.length - 1;

  return (
    <Card>
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-2.5">
          <span className="flex items-center gap-1.5 text-[14.5px] font-bold">
            <Wallet className="size-4 text-muted-foreground" />
            {title}
          </span>
          <span className="text-[11.5px] font-medium text-muted-foreground/70">
            최근 {trend.length}일
          </span>
        </span>
        <div className="inline-flex rounded-lg bg-muted p-0.5">
          {(["sales", "orders"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                metric === m
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              {m === "sales" ? "매출금액" : "주문건수"}
            </button>
          ))}
        </div>
      </div>

      <p className="text-lg font-bold tabular-nums">
        {formatNumber(total)}
        <span className="ml-1 text-xs font-medium text-muted-foreground">
          {metric === "sales" ? "원" : "건"} 합계
        </span>
      </p>

      <div className="mt-4 flex h-36 items-end gap-1.5">
        {trend.map((d, i) => {
          const v = metric === "sales" ? d.sales : d.orders;
          const heightPct = Math.max(3, (v / max) * 100);
          return (
            <div key={d.date} className="group relative flex h-full flex-1 flex-col justify-end">
              <div
                className={`w-full rounded-t-sm transition-colors ${
                  i === todayIndex
                    ? "bg-primary"
                    : "bg-secondary group-hover:bg-primary/60"
                }`}
                style={{ height: `${heightPct}%` }}
              />
              <div className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[11px] font-semibold text-background opacity-0 transition-opacity group-hover:opacity-100">
                {d.date.slice(5)} · {formatNumber(v)}
                {metric === "sales" ? "원" : "건"}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-1.5 flex gap-1.5">
        {trend.map((d, i) => (
          <div key={d.date} className="flex-1 text-center text-[10px] text-muted-foreground/70">
            {(i % 2 === 0 || i === todayIndex) ? d.date.slice(5) : " "}
          </div>
        ))}
      </div>
    </Card>
  );
}
