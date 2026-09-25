"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  orderId: string;
  currentInvoiceNumber: string | null;
}

export function InvoiceSection({ orderId, currentInvoiceNumber }: Props) {
  const [editing, setEditing] = useState(!currentInvoiceNumber);
  const [value, setValue] = useState(currentInvoiceNumber ?? "");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function saveAndOpen() {
    const trimmed = value.trim();
    if (!trimmed) return;
    setSaving(true);
    await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceNumber: trimmed }),
    });
    setSaving(false);
    setEditing(false);
    router.refresh();
    window.open(`/admin/orders/${orderId}/invoice`, "_blank");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") saveAndOpen();
    if (e.key === "Escape" && currentInvoiceNumber) {
      setValue(currentInvoiceNumber);
      setEditing(false);
    }
  }

  if (!editing && currentInvoiceNumber) {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-gray-800 border border-gray-700 flex items-center justify-center text-base flex-shrink-0">
            🧾
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Invoice No.</p>
            <p className="font-mono text-amber-400 text-sm font-semibold leading-none">{currentInvoiceNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-gray-500 hover:text-gray-200 border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded transition-colors"
          >
            Edit
          </button>
          <a
            href={`/admin/orders/${orderId}/invoice`}
            target="_blank"
            className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-black text-xs font-semibold px-4 py-1.5 rounded transition-colors"
          >
            View Invoice →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-gray-500 text-xs mb-2">
        {currentInvoiceNumber ? "Update invoice number:" : "No invoice number assigned yet. Enter one to generate the invoice."}
      </p>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. BLB-WEB-0540"
          autoFocus
          className="flex-1 bg-gray-800 border border-gray-700 text-gray-200 text-sm px-3 py-1.5 rounded font-mono focus:outline-none focus:border-amber-500 placeholder:text-gray-600"
        />
        <button
          onClick={saveAndOpen}
          disabled={!value.trim() || saving}
          className="flex-shrink-0 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-black text-xs font-semibold px-4 py-1.5 rounded transition-colors whitespace-nowrap"
        >
          {saving ? "Saving..." : "Save & Open Invoice"}
        </button>
        {currentInvoiceNumber && (
          <button
            onClick={() => { setValue(currentInvoiceNumber); setEditing(false); }}
            className="text-xs text-gray-500 hover:text-gray-200 border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
