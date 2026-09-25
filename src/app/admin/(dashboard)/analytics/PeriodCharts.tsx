import { db } from "@/db/client";
import { orders } from "@/db/schema";
import { sql, gte, lt, and } from "drizzle-orm";
import { AnalyticsCharts } from "./AnalyticsCharts";

interface Props {
  periodStart: string;
  periodEnd:   string;
  periodLabel: string;
  groupByDay:  boolean;
}

export async function PeriodCharts({ periodStart, periodEnd, periodLabel, groupByDay }: Props) {
  const [periodData, topProducts, chartRaw] = await Promise.all([
    db.select({
      revenue: sql<number>`coalesce(sum(${orders.total}), 0)`,
      count:   sql<number>`count(*)`,
    }).from(orders).where(
      and(gte(orders.createdAt, periodStart), lt(orders.createdAt, periodEnd))
    ),

    db.select({
      productName: sql<string>`oi.product_name`,
      revenue:     sql<number>`coalesce(sum(oi.price * oi.quantity), 0)`,
      qty:         sql<number>`sum(oi.quantity)`,
    })
    .from(sql`order_items oi JOIN orders o ON oi.order_id = o.id`)
    .where(sql`o.created_at >= ${periodStart} AND o.created_at < ${periodEnd}`)
    .groupBy(sql`oi.product_name`)
    .orderBy(sql`sum(oi.price * oi.quantity) desc`)
    .limit(5),

    groupByDay
      ? db.select({
          label:   sql<string>`date(${orders.createdAt})`,
          revenue: sql<number>`sum(${orders.total})`,
          count:   sql<number>`count(*)`,
        }).from(orders)
          .where(and(gte(orders.createdAt, periodStart), lt(orders.createdAt, periodEnd)))
          .groupBy(sql`date(${orders.createdAt})`)
      : db.select({
          label:   sql<string>`STRFTIME('%Y-%m', ${orders.createdAt})`,
          revenue: sql<number>`sum(${orders.total})`,
          count:   sql<number>`count(*)`,
        }).from(orders)
          .where(and(gte(orders.createdAt, periodStart), lt(orders.createdAt, periodEnd)))
          .groupBy(sql`STRFTIME('%Y-%m', ${orders.createdAt})`),
  ]);

  const periodRevenue = Number(periodData[0]?.revenue ?? 0);
  const periodOrders  = Number(periodData[0]?.count ?? 0);

  // Build a full label sequence so empty days/months still render as 0
  const labels: string[] = [];
  if (groupByDay) {
    const d = new Date(periodStart);
    const endDate = new Date(periodEnd);
    while (d < endDate) {
      labels.push(d.toISOString().slice(0, 10));
      d.setDate(d.getDate() + 1);
    }
  } else {
    const d = new Date(periodStart);
    const endDate = new Date(periodEnd);
    while (d < endDate) {
      labels.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
      d.setMonth(d.getMonth() + 1);
    }
  }

  const dataMap = Object.fromEntries(
    chartRaw.map((r) => [r.label, { revenue: Number(r.revenue), orders: Number(r.count) }])
  );
  const chartData = labels.map((label) => ({
    label,
    revenue: dataMap[label]?.revenue ?? 0,
    orders:  dataMap[label]?.orders  ?? 0,
  }));

  return (
    <>
      <div className="flex items-center gap-6 mb-4 text-sm text-gray-400">
        <span>
          <span className="text-white font-medium">₹{periodRevenue.toLocaleString("en-IN")}</span> revenue
        </span>
        <span>
          <span className="text-white font-medium">{periodOrders}</span> orders
        </span>
        <span className="text-gray-600">— {periodLabel}</span>
      </div>

      <AnalyticsCharts data={chartData} groupByDay={groupByDay} periodLabel={periodLabel} />

      {topProducts.length > 0 && (
        <div className="mt-8 bg-gray-900 border border-gray-800 rounded overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800">
            <h3 className="text-gray-300 text-sm font-medium">Top Products — {periodLabel}</h3>
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
    </>
  );
}
