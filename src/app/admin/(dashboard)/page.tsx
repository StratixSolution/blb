import { db } from "@/db/client";
import { orders, customers } from "@/db/schema";
import { sql, gte } from "drizzle-orm";
import Link from "next/link";

export default async function AdminDashboard() {
  const [allOrders, allCustomers] = await Promise.all([
    db.select().from(orders).orderBy(sql`${orders.createdAt} desc`).limit(5),
    db.select().from(customers),
  ]);

  const totalRevenue = allOrders.reduce((s, o) => s + o.total, 0);
  const revenueAllTime = await db
    .select({ sum: sql<number>`coalesce(sum(${orders.total}), 0)` })
    .from(orders);

  const statusCounts = await db
    .select({ status: orders.status, count: sql<number>`count(*)` })
    .from(orders)
    .groupBy(orders.status);

  const countMap = Object.fromEntries(statusCounts.map((r) => [r.status, r.count]));
  const totalOrders = statusCounts.reduce((s, r) => s + Number(r.count), 0);

  const stats = [
    { label: "Total Revenue", value: `₹${(revenueAllTime[0]?.sum ?? 0).toLocaleString("en-IN")}` },
    { label: "Total Orders", value: totalOrders },
    { label: "Customers", value: allCustomers.length },
    { label: "Pending / Processing", value: (Number(countMap["pending"] ?? 0) + Number(countMap["processing"] ?? 0)) },
  ];

  const statusColor: Record<string, string> = {
    processing: "bg-yellow-900 text-yellow-300",
    shipped: "bg-blue-900 text-blue-300",
    delivered: "bg-green-900 text-green-300",
    cancelled: "bg-red-900 text-red-300",
    pending: "bg-gray-800 text-gray-300",
  };

  return (
    <div className="p-8">
      <h1 className="text-white text-2xl font-semibold mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 p-5 rounded">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">{s.label}</p>
            <p className="text-white text-2xl font-semibold">{s.value}</p>
          </div>
        ))}
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
              {allOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-800 hover:bg-gray-800/40">
                  <td className="px-5 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="text-amber-400 hover:text-amber-300 font-mono text-xs">
                      #{order.id.slice(-8).toUpperCase()}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-gray-200">{order.customerName}</td>
                  <td className="px-5 py-3 text-gray-200">₹{order.total.toLocaleString("en-IN")}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium capitalize ${statusColor[order.status] ?? "bg-gray-800 text-gray-300"}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{order.createdAt.slice(0, 10)}</td>
                </tr>
              ))}
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
