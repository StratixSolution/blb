import { db } from "@/db/client";
import { customers } from "@/db/schema";
import { desc } from "drizzle-orm";

export default async function CustomersPage() {
  const allCustomers = await db
    .select()
    .from(customers)
    .orderBy(desc(customers.lastOrderAt));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-white text-2xl font-semibold">Customers</h1>
          <p className="text-gray-500 text-sm mt-0.5">{allCustomers.length} total</p>
        </div>
      </div>

      {allCustomers.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded p-12 text-center">
          <p className="text-gray-500">No customers yet.</p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Name</th>
                <th className="text-left text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Email</th>
                <th className="text-left text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Phone</th>
                <th className="text-left text-gray-400 text-xs uppercase tracking-wider px-5 py-3">City</th>
                <th className="text-left text-gray-400 text-xs uppercase tracking-wider px-5 py-3">State</th>
                <th className="text-left text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Pincode</th>
                <th className="text-left text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Orders</th>
                <th className="text-left text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Total Spend</th>
                <th className="text-left text-gray-400 text-xs uppercase tracking-wider px-5 py-3">AOV</th>
                <th className="text-left text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Last Order</th>
                <th className="text-left text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Since</th>
              </tr>
            </thead>
            <tbody>
              {allCustomers.map((customer) => {
                const aov = customer.orderCount > 0
                  ? Math.round(customer.totalSpend / customer.orderCount)
                  : 0;
                return (
                  <tr key={customer.id} className="border-b border-gray-800 hover:bg-gray-800/40">
                    <td className="px-5 py-3 text-gray-200 font-medium">{customer.name}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{customer.email}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{customer.phone || "-"}</td>
                    <td className="px-5 py-3 text-gray-400">{customer.city || "-"}</td>
                    <td className="px-5 py-3 text-gray-400">{customer.state || "-"}</td>
                    <td className="px-5 py-3 text-gray-400 font-mono text-xs">{customer.pincode || "-"}</td>
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
      )}
    </div>
  );
}
