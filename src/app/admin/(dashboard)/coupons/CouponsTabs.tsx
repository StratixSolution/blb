import Link from "next/link";

type Tab = "coupons" | "attribution";

export function CouponsTabs({ active }: { active: Tab }) {
  return (
    <div className="flex gap-1 border-b border-gray-800 mb-6">
      <Link
        href="/admin/coupons"
        className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
          active === "coupons"
            ? "border-amber-500 text-white"
            : "border-transparent text-gray-500 hover:text-gray-300"
        }`}
      >
        Coupons
      </Link>
      <Link
        href="/admin/coupons/attribution"
        className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
          active === "attribution"
            ? "border-amber-500 text-white"
            : "border-transparent text-gray-500 hover:text-gray-300"
        }`}
      >
        Attribution
      </Link>
    </div>
  );
}
