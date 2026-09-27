import { db } from "@/db/client";
import { coupons } from "@/db/schema";
import { desc } from "drizzle-orm";
import { CreateCouponForm, DeleteCouponButton, ToggleCouponButton } from "./CouponActions";
import { CouponsTabs } from "./CouponsTabs";

export default async function CouponsPage() {
  const allCoupons = await db.select().from(coupons).orderBy(desc(coupons.createdAt));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-white text-2xl font-semibold">Coupons</h1>
        <CreateCouponForm />
      </div>

      <CouponsTabs active="coupons" />

      {allCoupons.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded p-12 text-center">
          <p className="text-gray-500 text-sm">No coupons yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Code</th>
                <th className="text-left text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Attribution</th>
                <th className="text-left text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Type</th>
                <th className="text-left text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Amount</th>
                <th className="text-left text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Min Order</th>
                <th className="text-left text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Usage</th>
                <th className="text-left text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Expires</th>
                <th className="text-left text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {allCoupons.map((coupon) => {
                const expired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date();
                return (
                  <tr key={coupon.id} className="border-b border-gray-800 hover:bg-gray-800/40">
                    <td className="px-5 py-3">
                      <span className="font-mono text-amber-400 font-medium text-xs tracking-wider">
                        {coupon.code}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {coupon.referencedTo ? (
                        <span className="text-purple-400 text-xs font-medium">{coupon.referencedTo}</span>
                      ) : (
                        <span className="text-gray-700 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-400 capitalize">{coupon.type}</td>
                    <td className="px-5 py-3 text-gray-200">
                      {coupon.type === "percentage" ? `${coupon.amount}%` : `₹${coupon.amount}`}
                    </td>
                    <td className="px-5 py-3 text-gray-400">
                      {coupon.minOrderAmount > 0 ? `₹${coupon.minOrderAmount}` : "-"}
                    </td>
                    <td className="px-5 py-3 text-gray-400">
                      {coupon.usesCount}
                      {coupon.maxUses !== null ? ` / ${coupon.maxUses}` : " / ∞"}
                    </td>
                    <td className="px-5 py-3">
                      {coupon.expiresAt ? (
                        <span className={expired ? "text-red-400 text-xs" : "text-gray-400 text-xs"}>
                          {coupon.expiresAt}
                        </span>
                      ) : (
                        <span className="text-gray-600 text-xs">Never</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <ToggleCouponButton id={coupon.id} active={coupon.active} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <DeleteCouponButton id={coupon.id} />
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
