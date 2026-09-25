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

const NEXT_STATUS: Record<string, { key: string; label: string }> = {
  pending:    { key: "processing", label: "Move to Processing" },
  processing: { key: "shipped",    label: "Mark as Shipped" },
  shipped:    { key: "delivered",  label: "Mark as Delivered" },
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
  // when true, the "Mark as Shipped" prompt is open
  const [shippingPrompt, setShippingPrompt] = useState(false);
  const [promptRef, setPromptRef] = useState("");
  const [promptVendor, setPromptVendor] = useState("");
  const router = useRouter();

  const isShipped = status === "shipped";
  const changed =
    status !== currentStatus ||
    trackingRef !== (currentTrackingRef ?? "") ||
    trackingVendor !== (currentTrackingVendor ?? "");

  async function save(overrides?: { status?: string; trackingRef?: string; trackingVendor?: string }) {
    setSaving(true);
    const nextStatus = overrides?.status ?? status;
    await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: nextStatus,
        trackingRef: (overrides?.trackingRef ?? trackingRef).trim() || null,
        trackingVendor: (overrides?.trackingVendor ?? trackingVendor).trim() || null,
      }),
    });
    if (overrides?.status) setStatus(overrides.status);
    if (overrides?.trackingRef !== undefined) setTrackingRef(overrides.trackingRef);
    if (overrides?.trackingVendor !== undefined) setTrackingVendor(overrides.trackingVendor);
    setSaving(false);
    setSaved(true);
    setShippingPrompt(false);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  const suggestion = NEXT_STATUS[currentStatus];

  return (
    <div className="space-y-4">
      {/* Shipping prompt - shown instead of instant save when clicking Mark as Shipped */}
      {shippingPrompt ? (
        <div className="border border-blue-800/60 bg-blue-950/30 rounded p-4 space-y-3">
          <p className="text-blue-300 text-xs font-medium uppercase tracking-wider">Enter Shipment Details</p>
          <div>
            <label className="block text-gray-400 text-xs mb-1">
              Courier / Tracking Provider
              <span className="ml-1 text-gray-600 normal-case">(e.g. DTDC, Delhivery, BlueDart)</span>
            </label>
            <input
              type="text"
              value={promptVendor}
              onChange={(e) => setPromptVendor(e.target.value)}
              placeholder="e.g. Delhivery"
              className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-sm px-3 py-2 focus:outline-none focus:border-blue-500"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1">
              Tracking Number / AWB
            </label>
            <input
              type="text"
              value={promptRef}
              onChange={(e) => setPromptRef(e.target.value)}
              placeholder="e.g. DTDC123456789"
              className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-sm px-3 py-2 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
          <p className="text-gray-500 text-xs">
            A dispatch email will be sent to the customer
            {(promptRef.trim() || promptVendor.trim()) ? " with tracking details." : " (add tracking details above to include them)."}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => save({ status: "shipped", trackingRef: promptRef, trackingVendor: promptVendor })}
              disabled={saving}
              className="bg-blue-700 hover:bg-blue-600 disabled:opacity-40 text-white text-xs font-medium px-4 py-2 transition-colors"
            >
              {saving ? "Saving..." : "Confirm Shipment →"}
            </button>
            <button
              onClick={() => { setShippingPrompt(false); setPromptRef(""); setPromptVendor(""); }}
              className="text-gray-500 hover:text-gray-300 text-xs transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : suggestion && (
        <div className="flex items-center gap-3 p-3 bg-gray-800/50 border border-gray-700/50 rounded">
          <span className="text-gray-500 text-xs">Next step:</span>
          <button
            onClick={() => {
              if (suggestion.key === "shipped") {
                setShippingPrompt(true);
              } else {
                save({ status: suggestion.key });
              }
            }}
            disabled={saving}
            className="text-xs font-medium text-amber-400 hover:text-amber-300 disabled:opacity-40 transition-colors"
          >
            {suggestion.label} →
          </button>
        </div>
      )}

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
        <button
          onClick={() => save()}
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
              Tracking Provider
              <span className="ml-2 text-gray-600 normal-case tracking-normal">
                (included in dispatch email)
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
              Tracking Number / AWB
              <span className="ml-2 text-gray-600 normal-case tracking-normal">
                (included in dispatch email)
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
    </div>
  );
}
