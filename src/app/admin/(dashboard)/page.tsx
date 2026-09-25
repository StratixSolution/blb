import { db } from "@/db/client";
import { orders, customers } from "@/db/schema";
import { sql, gte } from "drizzle-orm";
import Link from "next/link";
import { OrderPipeline } from "./OrderPipeline";
import { RevenueOrdersWidget } from "./RevenueOrdersWidget";

export default async function AdminDashboard() {
  const now = new Date();
  const startCurrent = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const start1m = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).toISOString();
  const start3m = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()).toISOString();

  const [allOrders, [{ customerCount }], statusStats, periodCurrent, period1m, period3m] = await Promise.all([
    db.select().from(orders).orderBy(sql`${orders.createdAt} desc`).limit(5),
    db.select({ customerCount: sql<number>`count(*)` }).from(customers),
    db.select({
      status: orders.status,
      count: sql<number>`count(*)`,
      total: sql<number>`coalesce(sum(${orders.total}), 0)`,
    }).from(orders).groupBy(orders.status),
    db.select({
      revenue: sql<number>`coalesce(sum(${orders.total}), 0)`,
      orders: sql<number>`count(*)`,
    }).from(orders).where(gte(orders.createdAt, startCurrent)),
    db.select({
      revenue: sql<number>`coalesce(sum(${orders.total}), 0)`,
      orders: sql<number>`count(*)`,
    }).from(orders).where(gte(orders.createdAt, start1m)),
    db.select({
      revenue: sql<number>`coalesce(sum(${orders.total}), 0)`,
      orders: sql<number>`count(*)`,
    }).from(orders).where(gte(orders.createdAt, start3m)),
  ]);

  const byStatus = Object.fromEntries(
    statusStats.map((r) => [r.status, { count: Number(r.count), total: Number(r.total) }])
  );

  const periodData = {
    "current": { revenue: Number(periodCurrent[0]?.revenue ?? 0), orders: Number(periodCurrent[0]?.orders ?? 0) },
    "1m": { revenue: Number(period1m[0]?.revenue ?? 0), orders: Number(period1m[0]?.orders ?? 0) },
    "3m": { revenue: Number(period3m[0]?.revenue ?? 0), orders: Number(period3m[0]?.orders ?? 0) },
  };


  const pipelineStages = [
    { key: "pending",    label: "Pending",    count: byStatus["pending"]?.count    ?? 0, total: byStatus["pending"]?.total    ?? 0 },
    { key: "processing", label: "Processing", count: byStatus["processing"]?.count ?? 0, total: byStatus["processing"]?.total ?? 0 },
    { key: "shipped",    label: "Shipped",    count: byStatus["shipped"]?.count    ?? 0, total: byStatus["shipped"]?.total    ?? 0 },
  ];

  const statusColor: Record<string, string> = {
    processing: "bg-yellow-900 text-yellow-300",
    shipped:    "bg-blue-900 text-blue-300",
    delivered:  "bg-green-900 text-green-300",
    cancelled:  "bg-red-900 text-red-300",
    pending:    "bg-gray-800 text-gray-300",
  };

  return (
    <div className="p-8">
      <h1 className="text-white text-2xl font-semibold mb-8">Dashboard</h1>

      <div className="mb-10">
        <RevenueOrdersWidget data={periodData} />
      </div>

      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-lg font-medium">Order Pipeline</h2>
          <Link href="/admin/orders?status=all" className="text-amber-400 hover:text-amber-300 text-xs">
            View all →
          </Link>
        </div>
        <OrderPipeline stages={pipelineStages} />
      </div>

      <h2 className="text-white text-lg font-medium mb-4">Recent Orders</h2>
      {allOrders.length === 0 ? (
        <p className="text-gray-500 text-sm">No orders yet.</p>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Order ID</th>
                <th className="text-left text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Customer</th>
                <th className="text-left text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Amount</th>
                <th className="text-left text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-left text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {allOrders.map((order) => {
                const href = `/admin/orders/${order.id}`;
                const cell = "p-0";
                const inner = "flex items-center px-5 py-3 h-full";
                return (
                  <tr key={order.id} className="border-b border-gray-800 hover:bg-gray-800/40 cursor-pointer">
                    <td className={cell}>
                      <Link href={href} className={`${inner} text-amber-400 font-mono text-xs`}>
                        {order.orderNumber ?? `#${order.id.slice(-8).toUpperCase()}`}
                      </Link>
                    </td>
                    <td className={cell}>
                      <Link href={href} className={`${inner} text-gray-200`}>{order.customerName}</Link>
                    </td>
                    <td className={cell}>
                      <Link href={href} className={`${inner} text-gray-200`}>₹{order.total.toLocaleString("en-IN")}</Link>
                    </td>
                    <td className={cell}>
                      <Link href={href} className={inner}>
                        <span className={`text-xs px-2 py-0.5 rounded font-medium capitalize ${statusColor[order.status] ?? "bg-gray-800 text-gray-300"}`}>
                          {order.status}
                        </span>
                      </Link>
                    </td>
                    <td className={cell}>
                      <Link href={href} className={`${inner} text-gray-400 text-xs`}>{order.createdAt.slice(0, 10)}</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-5 py-3 border-t border-gray-800">
            <Link href="/admin/orders" className="text-amber-400 hover:text-amber-300 text-xs">View all orders →</Link>
          </div>
        </div>
      )}
    </div>
  );
}
