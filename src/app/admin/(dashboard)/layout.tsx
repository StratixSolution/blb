import Link from "next/link";
import { AdminLogout } from "./AdminLogout";
import { db } from "@/db/client";
import { orders } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

// Admin dashboard must always reflect the latest DB state (orders, coupons, etc.).
// Without this, these pages are prerendered/cached and show stale data after edits.
export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(eq(orders.status, "pending"));
  const pendingCount = Number(count);

  const navItems = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/analytics", label: "Analytics" },
    { href: "/admin/orders", label: "Orders", badge: pendingCount > 0 ? pendingCount : null },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/customers", label: "Customers" },
    { href: "/admin/coupons", label: "Coupons" },
    { href: "/admin/settings", label: "Settings" },
  ];

  return (
    <div className="fixed inset-0 bg-gray-950 flex overflow-hidden">
      <aside className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col flex-shrink-0">
        <div className="px-5 py-5 border-b border-gray-800">
          <p className="text-white font-semibold text-sm">Bean Leaf Brew</p>
          <p className="text-gray-500 text-xs mt-0.5">Admin Panel</p>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-colors"
            >
              <span>{item.label}</span>
              {"badge" in item && item.badge ? (
                <span className="bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-gray-800">
          <Link
            href="/"
            target="_blank"
            className="block px-3 py-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            ← View site
          </Link>
          <AdminLogout />
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-gray-950">
        {children}
      </main>
    </div>
  );
}
