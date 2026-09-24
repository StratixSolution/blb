"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;

const statusColor: Record<string, string> = {
  processing: "bg-yellow-900 text-yellow-300",
  shipped: "bg-blue-900 text-blue-300",
  delivered: "bg-green-900 text-green-300",
  cancelled: "bg-red-900 text-red-300",
  pending: "bg-gray-800 text-gray-300",
};

interface Props {
  orderId: string;
  currentStatus: string;
  currentTrackingRef: string | null;
  currentTrackingVendor: string | null;
}

export function OrderStatusUpdater({ orderId, currentStatus, currentTrackingRef, currentTrackingVendor }: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [trackingRef, setTrackingRef] = useState(currentTrackingRef ?? "");
  const [trackingVendor, setTrackingVendor] = useState(currentTrackingVendor ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const isShipped = status === "shipped";
  const changed =
    status !== currentStatus ||
    trackingRef !== (currentTrackingRef ?? "") ||
    trackingVendor !== (currentTrackingVendor ?? "");

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, trackingRef: trackingRef.trim() || null, trackingVendor: trackingVendor.trim() || null }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 focus:outline-none focus:border-amber-500 capitalize"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <span className={`text-xs px-2 py-0.5 rounded font-medium capitalize ${statusColor[status] ?? "bg-gray-800 text-gray-300"}`}>
          {status}
        </span>
        <button
          onClick={handleSave}
          disabled={saving || !changed}
          className="ml-auto bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white text-xs font-medium px-4 py-2 transition-colors"
        >
          {saving ? "Saving..." : saved ? "Saved ✓" : "Update"}
        </button>
      </div>

      {isShipped && (
        <div className="space-y-3">
          <div>
            <label className="block text-gray-400 text-xs uppercase tracking-wider mb-1">
              Tracking Vendor
              <span className="ml-2 text-gray-600 normal-case tracking-normal">
                (courier name - included in dispatch email)
              </span>
            </label>
            <input
              type="text"
              value={trackingVendor}
              onChange={(e) => setTrackingVendor(e.target.value)}
              placeholder="e.g. DTDC, Delhivery, BlueDart"
              className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-sm px-3 py-2 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-xs uppercase tracking-wider mb-1">
              Tracking Reference
              <span className="ml-2 text-gray-600 normal-case tracking-normal">
                (AWB / courier ref - included in dispatch email)
              </span>
            </label>
            <input
              type="text"
              value={trackingRef}
              onChange={(e) => setTrackingRef(e.target.value)}
              placeholder="e.g. DTDC123456789"
              className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-sm px-3 py-2 focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>
        </div>
      )}

      {status === "shipped" && currentStatus !== "shipped" && (
        <p className="text-blue-400 text-xs">
          A dispatch email will be sent to the customer when you click Update.
          {(trackingRef.trim() || trackingVendor.trim()) && " Tracking details will be included."}
        </p>
      )}
    </div>
  );
}
