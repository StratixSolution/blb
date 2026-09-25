import { Suspense } from "react";
import { db } from "@/db/client";
import { orders } from "@/db/schema";
import { sql, gte, lt, and } from "drizzle-orm";
import Link from "next/link";
import { PeriodCharts } from "./PeriodCharts";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function ChartsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-4 w-56 bg-gray-800 rounded animate-pulse" />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded p-5 h-64 animate-pulse" />
        <div className="bg-gray-900 border border-gray-800 rounded p-5 h-64 animate-pulse" />
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded h-48 animate-pulse" />
    </div>
  );
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const { year: yearParam, month: monthParam } = await searchParams;
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const selectedYear = yearParam ? parseInt(yearParam, 10) : currentYear;
  const selectedMonth = monthParam ? parseInt(monthParam, 10) : null;

  // Date range for the selected period
  const periodStart = selectedMonth
    ? `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-01`
    : `${selectedYear}-01-01`;
  const periodEnd = selectedMonth
    ? new Date(selectedYear, selectedMonth, 1).toISOString().slice(0, 10)
    : `${String(selectedYear + 1)}-01-01`;

  // Month start for "this month" card (always current calendar month)
  const thisMonthStart = `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`;
  const nextMonthStart = new Date(currentYear, currentMonth, 1).toISOString().slice(0, 10);

  // Stable queries — don't depend on selected period
  const [yearRows, allTime, thisMonth] = await Promise.all([
    db.select({ yr: sql<string>`STRFTIME('%Y', ${orders.createdAt})` })
      .from(orders)
      .groupBy(sql`STRFTIME('%Y', ${orders.createdAt})`),
    db.select({
      revenue: sql<number>`coalesce(sum(${orders.total}), 0)`,
      count: sql<number>`count(*)`,
    }).from(orders),
    db.select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(and(gte(orders.createdAt, thisMonthStart), lt(orders.createdAt, nextMonthStart))),
  ]);

  const availableYears = [...new Set(yearRows.map((r) => Number(r.yr)))]
    .filter(Boolean)
    .sort((a, b) => b - a);
  if (!availableYears.includes(currentYear)) availableYears.unshift(currentYear);

  const totalRevenue = Number(allTime[0]?.revenue ?? 0);
  const totalOrders = Number(allTime[0]?.count ?? 0);
  const aov = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const thisMonthOrders = Number(thisMonth[0]?.count ?? 0);

  const periodLabel = selectedMonth
    ? `${MONTH_LABELS[selectedMonth - 1]} ${selectedYear}`
    : String(selectedYear);

  const stats = [
    { label: "All-Time Revenue",    value: `₹${totalRevenue.toLocaleString("en-IN")}` },
    { label: "All-Time Orders",     value: totalOrders },
    { label: "Avg Order Value",     value: `₹${aov.toLocaleString("en-IN")}` },
    { label: `Orders — ${MONTH_LABELS[currentMonth - 1]} ${currentYear}`, value: thisMonthOrders },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-white text-2xl font-semibold">Analytics</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 p-5 rounded">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">{s.label}</p>
            <p className="text-white text-2xl font-semibold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Year / Month filter */}
      <div className="flex items-center gap-6 mb-6">
        <div className="flex items-center gap-1">
          {availableYears.map((yr) => (
            <Link
              key={yr}
              href={`/admin/analytics?year=${yr}`}
              className={`text-xs px-3 py-1.5 rounded border transition-colors ${
                yr === selectedYear && !monthParam
                  ? "bg-amber-600 border-amber-600 text-black font-semibold"
                  : yr === selectedYear
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-transparent border-gray-700 text-gray-400 hover:text-white"
              }`}
            >
              {yr}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1 flex-wrap">
          {MONTH_LABELS.map((label, i) => {
            const m = i + 1;
            const isActive = selectedMonth === m;
            return (
              <Link
                key={m}
                href={
                  isActive
                    ? `/admin/analytics?year=${selectedYear}`
                    : `/admin/analytics?year=${selectedYear}&month=${String(m).padStart(2, "0")}`
                }
                className={`text-xs px-2.5 py-1 rounded border transition-colors ${
                  isActive
                    ? "bg-amber-600 border-amber-600 text-black font-semibold"
                    : "bg-transparent border-gray-700 text-gray-500 hover:text-gray-200"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Period-specific content streams in independently */}
      <Suspense fallback={<ChartsSkeleton />}>
        <PeriodCharts
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          periodStart={periodStart}
          periodEnd={periodEnd}
          periodLabel={periodLabel}
        />
      </Suspense>
    </div>
  );
}
