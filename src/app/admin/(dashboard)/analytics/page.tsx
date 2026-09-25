import { Suspense } from "react";
import { db } from "@/db/client";
import { orders } from "@/db/schema";
import { sql, gte, lt, and } from "drizzle-orm";
import { PeriodCharts } from "./PeriodCharts";
import Link from "next/link";

type Preset = "this-month" | "last-month" | "3-months" | "6-months";

const PRESETS: { key: Preset; label: string }[] = [
  { key: "this-month",  label: "This Month"    },
  { key: "last-month",  label: "Last Month"    },
  { key: "3-months",    label: "Last 3 Months" },
  { key: "6-months",    label: "Last 6 Months" },
];

function getRange(preset: Preset, now: Date): { start: string; end: string; label: string; groupByDay: boolean } {
  const y = now.getFullYear(), m = now.getMonth();

  if (preset === "this-month") {
    const start = new Date(y, m, 1).toISOString().slice(0, 10);
    const end   = new Date(y, m + 1, 1).toISOString().slice(0, 10);
    return { start, end, label: now.toLocaleString("default", { month: "long", year: "numeric" }), groupByDay: true };
  }
  if (preset === "last-month") {
    const start = new Date(y, m - 1, 1).toISOString().slice(0, 10);
    const end   = new Date(y, m,     1).toISOString().slice(0, 10);
    const d     = new Date(y, m - 1, 1);
    return { start, end, label: d.toLocaleString("default", { month: "long", year: "numeric" }), groupByDay: true };
  }
  if (preset === "3-months") {
    const start = new Date(y, m - 2, 1).toISOString().slice(0, 10);
    const end   = new Date(y, m + 1, 1).toISOString().slice(0, 10);
    return { start, end, label: "Last 3 Months", groupByDay: false };
  }
  // 6-months
  const start = new Date(y, m - 5, 1).toISOString().slice(0, 10);
  const end   = new Date(y, m + 1, 1).toISOString().slice(0, 10);
  return { start, end, label: "Last 6 Months", groupByDay: false };
}

function ChartsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-gray-900 border border-gray-800 rounded p-5 h-72 animate-pulse" />
      <div className="bg-gray-900 border border-gray-800 rounded h-48 animate-pulse" />
    </div>
  );
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ preset?: string }>;
}) {
  const { preset: presetParam } = await searchParams;
  const preset: Preset = (PRESETS.find((p) => p.key === presetParam)?.key) ?? "this-month";
  const now = new Date();

  const { start, end, label, groupByDay } = getRange(preset, now);

  // AOV and this-month orders (always current, not affected by filter)
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const nextMonthStart    = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().slice(0, 10);

  const [allTime, thisMonth] = await Promise.all([
    db.select({
      revenue: sql<number>`coalesce(sum(${orders.total}), 0)`,
      count:   sql<number>`count(*)`,
    }).from(orders),
    db.select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(and(gte(orders.createdAt, currentMonthStart), lt(orders.createdAt, nextMonthStart))),
  ]);

  const totalRevenue    = Number(allTime[0]?.revenue ?? 0);
  const totalOrders     = Number(allTime[0]?.count ?? 0);
  const aov             = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const thisMonthOrders = Number(thisMonth[0]?.count ?? 0);
  const monthLabel      = now.toLocaleString("default", { month: "short", year: "numeric" });

  return (
    <div className="p-8">
      <h1 className="text-white text-2xl font-semibold mb-8">Analytics</h1>

      {/* Key metrics - always current */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-gray-900 border border-gray-800 p-5 rounded">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Avg Order Value</p>
          <p className="text-white text-2xl font-semibold">₹{aov.toLocaleString("en-IN")}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 p-5 rounded">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Orders — {monthLabel}</p>
          <p className="text-white text-2xl font-semibold">{thisMonthOrders}</p>
        </div>
      </div>

      {/* Preset filter */}
      <div className="flex items-center gap-1 mb-6">
        {PRESETS.map((p) => (
          <Link
            key={p.key}
            href={`/admin/analytics?preset=${p.key}`}
            className={`text-xs px-3 py-1.5 rounded border transition-colors ${
              p.key === preset
                ? "bg-amber-600 border-amber-600 text-black font-semibold"
                : "bg-transparent border-gray-700 text-gray-400 hover:text-white"
            }`}
          >
            {p.label}
          </Link>
        ))}
      </div>

      <Suspense fallback={<ChartsSkeleton />}>
        <PeriodCharts
          periodStart={start}
          periodEnd={end}
          periodLabel={label}
          groupByDay={groupByDay}
        />
      </Suspense>
    </div>
  );
}
