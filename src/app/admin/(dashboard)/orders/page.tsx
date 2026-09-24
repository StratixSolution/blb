import { db } from "@/db/client";
import { orders } from "@/db/schema";
import { sql } from "drizzle-orm";
import Link from "next/link";

const statusColor: Record<string, string> = {
  processing: "bg-yellow-900 text-yellow-300",
  shipped: "bg-blue-900 text-blue-300",
  delivered: "bg-green-900 text-green-300",
  cancelled: "bg-red-900 text-red-300",
  pending: "bg-gray-800 text-gray-300",
};

export default async function OrdersPage() {
  const allOrders = await db
    .select()
    .from(orders)
    .orderBy(sql`${orders.createdAt} desc`);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-white text-2xl font-semibold">Orders</h1>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm">{allOrders.length} total</span>
          <a
            href="/api/admin/orders/export"
            className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded border border-gray-700 transition-colors"
          >
            Export CSV
          </a>
        </div>
      </div>

      {allOrders.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded p-12 text-center">
          <p className="text-gray-500">No orders yet.</p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Order</th>
                <th className="text-left text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Customer</th>
                <th className="text-left text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Email</th>
                <th className="text-left text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Amount</th>
                <th className="text-left text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-left text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Date</th>
                <th className="px-5 py-3"></th>
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
                        #{order.id.slice(-8).toUpperCase()}
                      </Link>
                    </td>
                    <td className={cell}>
                      <Link href={href} className={`${inner} text-gray-200`}>{order.customerName}</Link>
                    </td>
                    <td className={cell}>
                      <Link href={href} className={`${inner} text-gray-400 text-xs`}>{order.customerEmail}</Link>
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
                    <td className={cell}>
                      <Link href={href} className={`${inner} text-gray-400 text-xs hover:text-white transition-colors justify-end`}>
                        View →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
