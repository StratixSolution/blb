import { db } from "@/db/client";
import { customers } from "@/db/schema";
import { desc, or, like, and, sql } from "drizzle-orm";
import { SearchInput } from "../_components/SearchInput";
import { Pagination } from "../_components/Pagination";

const PAGE_SIZE = 25;

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: pageParam } = await searchParams;
  const search = q?.trim() || undefined;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const searchFilter = search
    ? or(
        like(customers.name, `%${search}%`),
        like(customers.email, `%${search}%`),
        like(customers.phone, `%${search}%`),
        like(customers.city, `%${search}%`),
      )
    : undefined;

  const [rows, [{ count: rawTotal }]] = await Promise.all([
    db.select()
      .from(customers)
      .where(searchFilter)
      .orderBy(desc(customers.lastOrderAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ count: sql<number>`count(*)` }).from(customers).where(searchFilter),
  ]);

  const total = Number(rawTotal);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const baseParamsForPagination = new URLSearchParams();
  if (search) baseParamsForPagination.set("q", search);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-white text-2xl font-semibold">Customers</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {search ? `${total} result${total !== 1 ? "s" : ""} for "${search}"` : `${total.toLocaleString()} total`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SearchInput
            placeholder="Search name, email, city…"
            defaultValue={search}
            pathname="/admin/customers"
            baseParams=""
          />
        </div>
      </div>

      {search && (
        <div className="flex items-center gap-2 mb-4">
          <a href="/admin/customers" className="text-amber-500 hover:text-amber-400 text-xs transition-colors">
            Clear search
          </a>
        </div>
      )}

      {rows.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded p-12 text-center">
          <p className="text-gray-500">
            {search ? `No customers matching "${search}"` : "No customers yet."}
          </p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Name</th>
                  <th className="text-left text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Email</th>
                  <th className="text-left text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Phone</th>
                  <th className="text-left text-gray-400 text-xs uppercase tracking-wider px-5 py-3">City</th>
                  <th className="text-left text-gray-400 text-xs uppercase tracking-wider px-5 py-3">State</th>
                  <th className="text-left text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Orders</th>
                  <th className="text-left text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Total Spend</th>
                  <th className="text-left text-gray-400 text-xs uppercase tracking-wider px-5 py-3">AOV</th>
                  <th className="text-left text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Last Order</th>
                  <th className="text-left text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Since</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((customer) => {
                  const aov = customer.orderCount > 0
                    ? Math.round(customer.totalSpend / customer.orderCount)
                    : 0;
                  return (
                    <tr key={customer.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/40">
                      <td className="px-5 py-3 text-gray-200 font-medium">{customer.name}</td>
                      <td className="px-5 py-3 text-gray-400 text-xs">{customer.email}</td>
                      <td className="px-5 py-3 text-gray-400 text-xs">{customer.phone || "-"}</td>
                      <td className="px-5 py-3 text-gray-400">{customer.city || "-"}</td>
                      <td className="px-5 py-3 text-gray-400">{customer.state || "-"}</td>
                      <td className="px-5 py-3">
                        <span className="bg-gray-800 text-gray-300 text-xs px-2 py-0.5 rounded">
                          {customer.orderCount}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-200">₹{customer.totalSpend.toLocaleString("en-IN")}</td>
                      <td className="px-5 py-3 text-amber-400">₹{aov.toLocaleString("en-IN")}</td>
                      <td className="px-5 py-3 text-gray-400 text-xs">
                        {customer.lastOrderAt ? customer.lastOrderAt.slice(0, 10) : "-"}
                      </td>
                      <td className="px-5 py-3 text-gray-400 text-xs">{customer.createdAt.slice(0, 10)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={PAGE_SIZE}
            pathname="/admin/customers"
            baseParams={baseParamsForPagination.toString()}
          />
        </div>
      )}
    </div>
  );
}
