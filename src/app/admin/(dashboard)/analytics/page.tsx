import { db } from "@/db/client";
import { orders } from "@/db/schema";
import { sql, gte, lt, and } from "drizzle-orm";
import Link from "next/link";
import { AnalyticsCharts } from "./AnalyticsCharts";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function daysInMonth(year: number, month: number): string[] {
  const days: string[] = [];
  const d = new Date(year, month - 1, 1);
  while (d.getMonth() === month - 1) {
    days.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

function monthsInYear(year: number): string[] {
  return Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, "0")}`);
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

  // Available years from DB
  const yearRows = await db
    .select({ yr: sql<string>`STRFTIME('%Y', ${orders.createdAt})` })
    .from(orders)
    .groupBy(sql`STRFTIME('%Y', ${orders.createdAt})`);
  const availableYears = [...new Set(yearRows.map((r) => Number(r.yr)))]
    .filter(Boolean)
    .sort((a, b) => b - a);
  if (!availableYears.includes(currentYear)) availableYears.unshift(currentYear);

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

  const [allTime, thisMonth, periodData, topProducts, chartRaw] = await Promise.all([
    // All-time totals
    db.select({
      revenue: sql<number>`coalesce(sum(${orders.total}), 0)`,
      count: sql<number>`count(*)`,
    }).from(orders),

    // This calendar month (always current)
    db.select({
      count: sql<number>`count(*)`,
    }).from(orders).where(
      and(gte(orders.createdAt, thisMonthStart), lt(orders.createdAt, nextMonthStart))
    ),

    // Selected period stats
    db.select({
      revenue: sql<number>`coalesce(sum(${orders.total}), 0)`,
      count: sql<number>`count(*)`,
    }).from(orders).where(
      and(gte(orders.createdAt, periodStart), lt(orders.createdAt, periodEnd))
    ),

    // Top 5 products for selected period
    db.select({
      productName: sql<string>`oi.product_name`,
      revenue: sql<number>`coalesce(sum(oi.price * oi.quantity), 0)`,
      qty: sql<number>`sum(oi.quantity)`,
    })
    .from(sql`order_items oi`)
    .innerJoin(sql`orders o`, sql`oi.order_id = o.id`)
    .where(sql`o.created_at >= ${periodStart} AND o.created_at < ${periodEnd}`)
    .groupBy(sql`oi.product_name`)
    .orderBy(sql`sum(oi.price * oi.quantity) desc`)
    .limit(5),

    // Chart data: daily (month selected) or monthly (year only)
    selectedMonth
      ? db.select({
          label: sql<string>`date(${orders.createdAt})`,
          revenue: sql<number>`sum(${orders.total})`,
          count: sql<number>`count(*)`,
        }).from(orders)
          .where(and(gte(orders.createdAt, periodStart), lt(orders.createdAt, periodEnd)))
          .groupBy(sql`date(${orders.createdAt})`)
      : db.select({
          label: sql<string>`STRFTIME('%Y-%m', ${orders.createdAt})`,
          revenue: sql<number>`sum(${orders.total})`,
          count: sql<number>`count(*)`,
        }).from(orders)
          .where(and(gte(orders.createdAt, periodStart), lt(orders.createdAt, periodEnd)))
          .groupBy(sql`STRFTIME('%Y-%m', ${orders.createdAt})`),
  ]);

  const totalRevenue = Number(allTime[0]?.revenue ?? 0);
  const totalOrders = Number(allTime[0]?.count ?? 0);
  const aov = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const thisMonthOrders = Number(thisMonth[0]?.count ?? 0);
  const periodRevenue = Number(periodData[0]?.revenue ?? 0);
  const periodOrders = Number(periodData[0]?.count ?? 0);

  // Build full chart series with zero-fill
  const dataMap = Object.fromEntries(
    chartRaw.map((r) => [r.label, { revenue: Number(r.revenue), orders: Number(r.count) }])
  );
  const labels = selectedMonth
    ? daysInMonth(selectedYear, selectedMonth)
    : monthsInYear(selectedYear);
  const chartData = labels.map((label) => ({
    label,
    revenue: dataMap[label]?.revenue ?? 0,
    orders: dataMap[label]?.orders ?? 0,
  }));

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

      {/* Period summary */}
      <div className="flex items-center gap-6 mb-6 text-sm text-gray-400">
        <span>
          <span className="text-white font-medium">₹{periodRevenue.toLocaleString("en-IN")}</span> revenue
        </span>
        <span>
          <span className="text-white font-medium">{periodOrders}</span> orders
        </span>
        <span className="text-gray-600">— {periodLabel}</span>
      </div>

      <AnalyticsCharts
        data={chartData}
        isMonthly={!selectedMonth}
        periodLabel={periodLabel}
      />

      {topProducts.length > 0 && (
        <div className="mt-8 bg-gray-900 border border-gray-800 rounded overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800">
            <h3 className="text-gray-300 text-sm font-medium">
              Top Products — {periodLabel}
            </h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Product</th>
                <th className="text-left text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Units Sold</th>
                <th className="text-left text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p, i) => (
                <tr key={`${p.productName}-${i}`} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/40">
                  <td className="px-5 py-3 text-gray-200">{p.productName}</td>
                  <td className="px-5 py-3 text-gray-400">{p.qty}</td>
                  <td className="px-5 py-3 text-amber-400">₹{Number(p.revenue).toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
