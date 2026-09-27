import { db } from "@/db/client";
import { orders, coupons } from "@/db/schema";
import { sql, isNotNull, ne } from "drizzle-orm";
import Link from "next/link";

interface InfluencerRow {
  influencer: string;
  orders: number;
  revenue: number;
  aov: number;
  uniqueCustomers: number;
  coupons: string;
}

export default async function InfluencersPage() {
  // Aggregate orders grouped by influencer via coupon referenced_to
  const rawRows = await db
    .select({
      influencer:      sql<string>`c.referenced_to`,
      orderCount:      sql<number>`count(distinct o.id)`,
      revenue:         sql<number>`coalesce(sum(o.total), 0)`,
      uniqueCustomers: sql<number>`count(distinct o.customer_email)`,
      couponList:      sql<string>`group_concat(distinct c.code)`,
    })
    .from(sql`orders o JOIN coupons c ON UPPER(o.coupon_code) = c.code`)
    .where(sql`c.referenced_to IS NOT NULL AND c.referenced_to != ''`)
    .groupBy(sql`c.referenced_to`)
    .orderBy(sql`sum(o.total) desc`);

  const influencers: InfluencerRow[] = rawRows.map((r) => ({
    influencer:      r.influencer,
    orders:          Number(r.orderCount),
    revenue:         Number(r.revenue),
    aov:             r.orderCount > 0 ? Math.round(Number(r.revenue) / Number(r.orderCount)) : 0,
    uniqueCustomers: Number(r.uniqueCustomers),
    coupons:         r.couponList ?? "",
  }));

  // Total across all influencer-driven orders
  const totalRevenue = influencers.reduce((s, r) => s + r.revenue, 0);
  const totalOrders  = influencers.reduce((s, r) => s + r.orders, 0);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-white text-2xl font-semibold">Influencers</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Orders placed using influencer-linked coupon codes.{" "}
          <Link href="/admin/coupons" className="text-amber-500 hover:text-amber-400 transition-colors">
            Manage coupons →
          </Link>
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded p-5">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Influencers</p>
          <p className="text-white text-2xl font-semibold">{influencers.length}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded p-5">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Influencer-Driven Orders</p>
          <p className="text-white text-2xl font-semibold">{totalOrders}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded p-5">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Influencer Revenue</p>
          <p className="text-white text-2xl font-semibold">₹{totalRevenue.toLocaleString("en-IN")}</p>
        </div>
      </div>

      {influencers.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded p-12 text-center">
          <p className="text-gray-500 text-sm">No influencer-driven orders yet.</p>
          <p className="text-gray-600 text-xs mt-2">
            Create coupons with an &quot;Influencer / Referenced To&quot; value and share them with influencers.
          </p>
          <Link
            href="/admin/coupons"
            className="inline-block mt-4 text-xs text-amber-500 hover:text-amber-400 transition-colors"
          >
            Create a coupon →
          </Link>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Influencer</th>
                <th className="text-left text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Coupon(s)</th>
                <th className="text-right text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Orders</th>
                <th className="text-right text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Reach (Customers)</th>
                <th className="text-right text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Revenue</th>
                <th className="text-right text-gray-400 text-xs uppercase tracking-wider px-5 py-3">AOV</th>
                <th className="text-right text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Share</th>
              </tr>
            </thead>
            <tbody>
              {influencers.map((row) => {
                const share = totalRevenue > 0 ? (row.revenue / totalRevenue) * 100 : 0;
                return (
                  <tr key={row.influencer} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/40">
                    <td className="px-5 py-4">
                      <span className="text-white font-medium">{row.influencer}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {row.coupons.split(",").map((code) => (
                          <span
                            key={code}
                            className="font-mono text-amber-400 text-xs bg-amber-900/30 px-2 py-0.5 rounded"
                          >
                            {code}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right text-gray-200">{row.orders}</td>
                    <td className="px-5 py-4 text-right text-gray-200">{row.uniqueCustomers}</td>
                    <td className="px-5 py-4 text-right text-white font-medium">
                      ₹{row.revenue.toLocaleString("en-IN")}
                    </td>
                    <td className="px-5 py-4 text-right text-gray-400">₹{row.aov.toLocaleString("en-IN")}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${Math.min(share, 100)}%` }}
                          />
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
