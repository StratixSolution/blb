import { db } from "@/db/client";
import { orders, coupons } from "@/db/schema";
import { sql } from "drizzle-orm";
import Link from "next/link";
import { CouponsTabs } from "../CouponsTabs";

interface AttributionRow {
  attribution: string;
  orders: number;
  revenue: number;
  aov: number;
  uniqueCustomers: number;
  coupons: string;
}

export default async function AttributionPage() {
  const rawRows = await db
    .select({
      attribution:     sql<string>`c.referenced_to`,
      orderCount:      sql<number>`count(distinct o.id)`,
      revenue:         sql<number>`coalesce(sum(o.total), 0)`,
      uniqueCustomers: sql<number>`count(distinct o.customer_email)`,
      couponList:      sql<string>`group_concat(distinct c.code)`,
    })
    .from(sql`orders o JOIN coupons c ON UPPER(o.coupon_code) = c.code`)
    .where(sql`c.referenced_to IS NOT NULL AND c.referenced_to != ''`)
    .groupBy(sql`c.referenced_to`)
    .orderBy(sql`sum(o.total) desc`);

  const rows: AttributionRow[] = rawRows.map((r) => ({
    attribution:     r.attribution,
    orders:          Number(r.orderCount),
    revenue:         Number(r.revenue),
    aov:             r.orderCount > 0 ? Math.round(Number(r.revenue) / Number(r.orderCount)) : 0,
    uniqueCustomers: Number(r.uniqueCustomers),
    coupons:         r.couponList ?? "",
  }));

  const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0);
  const totalOrders  = rows.reduce((s, r) => s + r.orders, 0);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-white text-2xl font-semibold">Coupons</h1>
      </div>

      <CouponsTabs active="attribution" />

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded p-5">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Attributions</p>
          <p className="text-white text-2xl font-semibold">{rows.length}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded p-5">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Attributed Orders</p>
          <p className="text-white text-2xl font-semibold">{totalOrders}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded p-5">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Attributed Revenue</p>
          <p className="text-white text-2xl font-semibold">₹{totalRevenue.toLocaleString("en-IN")}</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded p-12 text-center">
          <p className="text-gray-500 text-sm">No attributed orders yet.</p>
          <p className="text-gray-600 text-xs mt-2">
            Set an &quot;Attribution&quot; on a coupon to track which influencer, campaign, or channel drove orders.
          </p>
          <Link
            href="/admin/coupons"
            className="inline-block mt-4 text-xs text-amber-500 hover:text-amber-400 transition-colors"
          >
            Go to coupons →
          </Link>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Attribution</th>
                <th className="text-left text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Coupon(s)</th>
                <th className="text-right text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Orders</th>
                <th className="text-right text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Reach</th>
                <th className="text-right text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Revenue</th>
                <th className="text-right text-gray-400 text-xs uppercase tracking-wider px-5 py-3">AOV</th>
                <th className="text-right text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Share</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const share = totalRevenue > 0 ? (row.revenue / totalRevenue) * 100 : 0;
                return (
                  <tr key={row.attribution} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/40">
                    <td className="px-5 py-4">
                      <span className="text-white font-medium">{row.attribution}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {row.coupons.split(",").map((code) => (
                          <span key={code} className="font-mono text-amber-400 text-xs bg-amber-900/30 px-2 py-0.5 rounded">
                            {code}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right text-gray-200">{row.orders}</td>
                    <td className="px-5 py-4 text-right text-gray-200">{row.uniqueCustomers}</td>
                    <td className="px-5 py-4 text-right text-white font-medium">₹{row.revenue.toLocaleString("en-IN")}</td>
                    <td className="px-5 py-4 text-right text-gray-400">₹{row.aov.toLocaleString("en-IN")}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min(share, 100)}%` }} />
                        </div>
                        <span className="text-gray-400 text-xs w-10 text-right">{share.toFixed(1)}%</span>
                      </div>
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
