import { db } from "@/db/client";
import { orders } from "@/db/schema";
import { sql, gte } from "drizzle-orm";
import { AnalyticsCharts } from "./AnalyticsCharts";

function last30Days(): string[] {
  const days: string[] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

export default async function AnalyticsPage() {
  const cutoff = last30Days()[0];

  const [allTime, monthly, topProducts, dailyRaw] = await Promise.all([
    db
      .select({
        revenue: sql<number>`coalesce(sum(${orders.total}), 0)`,
        count: sql<number>`count(*)`,
      })
      .from(orders),

    db
      .select({
        revenue: sql<number>`coalesce(sum(${orders.total}), 0)`,
        count: sql<number>`count(*)`,
      })
      .from(orders)
      .where(gte(orders.createdAt, cutoff)),

    db
      .select({
        productName: sql<string>`oi.product_name`,
        revenue: sql<number>`coalesce(sum(oi.price * oi.quantity), 0)`,
        qty: sql<number>`sum(oi.quantity)`,
      })
      .from(sql`order_items oi`)
      .groupBy(sql`oi.product_name`)
      .orderBy(sql`sum(oi.price * oi.quantity) desc`)
      .limit(5),

    db
      .select({
        date: sql<string>`date(${orders.createdAt})`,
        revenue: sql<number>`sum(${orders.total})`,
        count: sql<number>`count(*)`,
      })
      .from(orders)
      .where(gte(orders.createdAt, cutoff))
      .groupBy(sql`date(${orders.createdAt})`),
  ]);

  const dailyMap = Object.fromEntries(
    dailyRaw.map((r) => [r.date, { revenue: r.revenue, orders: r.count }])
  );
  const chartData = last30Days().map((date) => ({
    date,
    revenue: dailyMap[date]?.revenue ?? 0,
    orders: dailyMap[date]?.orders ?? 0,
  }));

  const stats = [
    { label: "All-Time Revenue", value: `₹${Number(allTime[0]?.revenue ?? 0).toLocaleString("en-IN")}` },
    { label: "All-Time Orders", value: Number(allTime[0]?.count ?? 0) },
    { label: "Revenue (30d)", value: `₹${Number(monthly[0]?.revenue ?? 0).toLocaleString("en-IN")}` },
    { label: "Orders (30d)", value: Number(monthly[0]?.count ?? 0) },
  ];

  return (
    <div className="p-8">
      <h1 className="text-white text-2xl font-semibold mb-8">Analytics</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 p-5 rounded">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">{s.label}</p>
            <p className="text-white text-2xl font-semibold">{s.value}</p>
          </div>
        ))}
      </div>

      <AnalyticsCharts data={chartData} />

      {topProducts.length > 0 && (
        <div className="mt-8 bg-gray-900 border border-gray-800 rounded overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800">
            <h3 className="text-gray-300 text-sm font-medium">Top Products by Revenue</h3>
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
                <tr key={`${p.productName}-${i}`} className="border-b border-gray-800 hover:bg-gray-800/40">
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
