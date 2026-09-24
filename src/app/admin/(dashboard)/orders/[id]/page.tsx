import { db } from "@/db/client";
import { orders, orderItems, orderNotes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { OrderStatusUpdater } from "./OrderStatusUpdater";
import { OrderNotes } from "./OrderNotes";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!order) notFound();

  const [items, notes] = await Promise.all([
    db.select().from(orderItems).where(eq(orderItems.orderId, id)),
    db.select().from(orderNotes).where(eq(orderNotes.orderId, id)),
  ]);

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/orders" className="text-gray-400 hover:text-white text-sm transition-colors">
          ← Orders
        </Link>
        <h1 className="text-white text-2xl font-semibold">
          Order #{order.id.slice(-8).toUpperCase()}
        </h1>
        <span className="text-gray-500 text-sm">{order.createdAt.slice(0, 10)}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-900 border border-gray-800 rounded p-5">
          <h2 className="text-gray-400 text-xs uppercase tracking-wider mb-4">Customer</h2>
          <p className="text-white font-medium mb-1">{order.customerName}</p>
          <p className="text-gray-400 text-sm">{order.customerEmail}</p>
          {order.customerPhone && <p className="text-gray-400 text-sm">{order.customerPhone}</p>}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded p-5">
          <h2 className="text-gray-400 text-xs uppercase tracking-wider mb-4">Delivery Address</h2>
          <p className="text-white text-sm">{order.address}</p>
          <p className="text-white text-sm">{order.city}{order.state ? `, ${order.state}` : ""} - {order.pincode}</p>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded p-5 mb-6">
        <h2 className="text-gray-400 text-xs uppercase tracking-wider mb-4">Items Ordered</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left text-gray-400 text-xs pb-2">Product</th>
              <th className="text-right text-gray-400 text-xs pb-2">Qty</th>
              <th className="text-right text-gray-400 text-xs pb-2">Price</th>
              <th className="text-right text-gray-400 text-xs pb-2">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-gray-800/50">
                <td className="py-2.5 text-gray-200">{item.productName}</td>
                <td className="py-2.5 text-right text-gray-400">{item.quantity}</td>
                <td className="py-2.5 text-right text-gray-400">₹{item.price.toLocaleString("en-IN")}</td>
                <td className="py-2.5 text-right text-gray-200">₹{(item.price * item.quantity).toLocaleString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            {order.discount > 0 && (
              <tr>
                <td colSpan={3} className="pt-2 text-right text-gray-400 text-sm">Discount{order.couponCode ? ` (${order.couponCode})` : ""}</td>
                <td className="pt-2 text-right text-green-400">-₹{order.discount.toLocaleString("en-IN")}</td>
              </tr>
            )}
            <tr>
              <td colSpan={3} className="pt-3 text-right text-gray-400 font-medium text-sm">Total</td>
              <td className="pt-3 text-right text-white font-semibold">₹{order.total.toLocaleString("en-IN")}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded p-5 mb-6">
        <h2 className="text-gray-400 text-xs uppercase tracking-wider mb-4">Status & Dispatch</h2>
        <div className="grid grid-cols-2 gap-4 mb-5 text-xs">
          <div>
            <p className="text-gray-500 mb-0.5">Razorpay Order ID</p>
            <p className="text-gray-300 font-mono">{order.id}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-0.5">Payment ID</p>
            <p className="text-gray-300 font-mono">{order.paymentId}</p>
          </div>
          {order.trackingRef && (
            <div className="col-span-2">
              <p className="text-gray-500 mb-0.5">Tracking Reference</p>
              <p className="text-amber-400 font-mono text-sm">{order.trackingRef}</p>
            </div>
          )}
        </div>
        <OrderStatusUpdater
          orderId={order.id}
          currentStatus={order.status}
          currentTrackingRef={order.trackingRef ?? null}
        />
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded p-5">
        <h2 className="text-gray-400 text-xs uppercase tracking-wider mb-4">Order Notes</h2>
        <OrderNotes orderId={order.id} notes={notes} />
      </div>
    </div>
  );
}
