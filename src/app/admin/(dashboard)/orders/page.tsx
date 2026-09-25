import { db } from "@/db/client";
import { orders } from "@/db/schema";
import { sql, eq, and, or, like, desc } from "drizzle-orm";
import Link from "next/link";
import { SearchInput } from "../_components/SearchInput";
import { Pagination } from "../_components/Pagination";

const PAGE_SIZE = 25;

const STATUS_TABS = [
  { key: "pending",    label: "Pending" },
  { key: "processing", label: "Processing" },
  { key: "shipped",    label: "Shipped" },
  { key: "delivered",  label: "Delivered" },
  { key: "cancelled",  label: "Cancelled" },
  { key: "all",        label: "All Orders" },
] as const;

type StatusKey = (typeof STATUS_TABS)[number]["key"];

const statusColor: Record<string, string> = {
  processing: "bg-yellow-900 text-yellow-300",
  shipped:    "bg-blue-900 text-blue-300",
  delivered:  "bg-green-900 text-green-300",
  cancelled:  "bg-red-900 text-red-300",
  pending:    "bg-gray-800 text-gray-300",
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  const { status: statusParam, q, page: pageParam } = await searchParams;

  const activeTab: StatusKey =
    STATUS_TABS.find((t) => t.key === statusParam)?.key ?? "pending";
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const search = q?.trim() || undefined;

  const statusFilter = activeTab !== "all" ? eq(orders.status, activeTab) : undefined;
  const searchFilter = search
    ? or(
        like(orders.customerName, `%${search}%`),
        like(orders.customerEmail, `%${search}%`),
        like(orders.id, `%${search}%`),
        like(orders.customerPhone, `%${search}%`),
      )
    : undefined;
  const where = and(statusFilter, searchFilter);

  const [rows, [{ count: rawCount }], statusCounts] = await Promise.all([
    db.select().from(orders)
      .where(where)
      .orderBy(desc(orders.createdAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ count: sql<number>`count(*)` }).from(orders).where(where),
    db.select({ status: orders.status, count: sql<number>`count(*)` })
      .from(orders)
      .groupBy(orders.status),
  ]);

  const total = Number(rawCount);
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const countMap = Object.fromEntries(statusCounts.map((r) => [r.status, Number(r.count)]));
  const totalCount = statusCounts.reduce((s, r) => s + Number(r.count), 0);
  const pendingCount = countMap["pending"] ?? 0;

  // baseParams for SearchInput (all except q and page)
  const baseParamsForSearch = activeTab !== "all" ? `status=${activeTab}` : "";
  // baseParams for Pagination (all except page)
  const baseParamsForPagination = new URLSearchParams();
  if (activeTab !== "all") baseParamsForPagination.set("status", activeTab);
  if (search) baseParamsForPagination.set("q", search);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-white text-2xl font-semibold">Orders</h1>
        <div className="flex items-center gap-2">
          <SearchInput
            placeholder="Search name, email, order ID…"
            defaultValue={search}
            pathname="/admin/orders"
            baseParams={baseParamsForSearch}
          />
          <a
            href="/api/admin/orders/export"
            className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded border border-gray-700 transition-colors whitespace-nowrap"
          >
            Export CSV
          </a>
        </div>
      </div>

      <div className="flex items-center gap-1 mb-6 border-b border-gray-800">
        {STATUS_TABS.map((tab) => {
          const count = tab.key === "all" ? totalCount : (countMap[tab.key] ?? 0);
          const isActive = tab.key === activeTab;
          const isPending = tab.key === "pending" && pendingCount > 0;
          const tabHref = `/admin/orders?status=${tab.key}${search ? `&q=${encodeURIComponent(search)}` : ""}`;
          return (
            <Link
              key={tab.key}
              href={tabHref}
              className={`relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                isActive
                  ? "border-amber-500 text-white"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                    isActive
                      ? isPending
                        ? "bg-amber-600 text-white"
                        : "bg-gray-700 text-gray-200"
                      : isPending
                        ? "bg-red-700 text-white"
                        : "bg-gray-800 text-gray-400"
                  }`}
                >
                  {count}
                </span>
              )}
              {isPending && !isActive && (
                <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              )}
            </Link>
          );
        })}
      </div>

      {search && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-gray-400 text-xs">
            {total} result{total !== 1 ? "s" : ""} for &ldquo;{search}&rdquo;
          </span>
          <Link
            href={`/admin/orders${activeTab !== "all" ? `?status=${activeTab}` : ""}`}
            className="text-amber-500 hover:text-amber-400 text-xs transition-colors"
          >
            Clear
          </Link>
        </div>
      )}

      {rows.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded p-12 text-center">
          <p className="text-gray-500 text-sm">
            {search
              ? `No results for "${search}"`
              : `No ${activeTab === "all" ? "" : activeTab} orders.`}
          </p>
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
                {activeTab === "all" && (
                  <th className="text-left text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Status</th>
                )}
                <th className="text-left text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Date</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((order) => {
                const href = `/admin/orders/${order.id}`;
                const cell = "p-0";
                const inner = "flex items-center px-5 py-3 h-full";
                return (
                  <tr key={order.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/40 cursor-pointer">
                    <td className={cell}>
                      <Link href={href} className={`${inner} text-amber-400 font-mono text-xs`}>
                        {order.orderNumber ?? `#${order.id.slice(-8).toUpperCase()}`}
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
                    {activeTab === "all" && (
                      <td className={cell}>
                        <Link href={href} className={inner}>
                          <span className={`text-xs px-2 py-0.5 rounded font-medium capitalize ${statusColor[order.status] ?? "bg-gray-800 text-gray-300"}`}>
                            {order.status}
                          </span>
                        </Link>
                      </td>
                    )}
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
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={PAGE_SIZE}
            pathname="/admin/orders"
            baseParams={baseParamsForPagination.toString()}
          />
        </div>
      )}
    </div>
  );
}
