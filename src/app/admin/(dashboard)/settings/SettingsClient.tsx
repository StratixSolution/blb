"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Setting {
  key: string;
  value: string;
  label: string;
}

const EDITABLE_KEYS = [
  "invoice_prefix",
  "invoice_counter",
  "igst_rate",
  "cgst_rate",
  "sgst_rate",
  "hsn_code",
  "seller_name",
  "seller_address",
  "seller_phone",
  "seller_website",
  "seller_email",
  "seller_gstin",
  "seller_pan",
  "seller_fssai",
  "bank_details",
];

// Fallback labels/defaults for keys that may not yet exist as rows in the DB.
const DEFAULT_LABELS: Record<string, string> = {
  igst_rate: "IGST Rate (%)",
  cgst_rate: "CGST Rate (%)",
  sgst_rate: "SGST Rate (%)",
};
const DEFAULT_VALUES: Record<string, string> = {
  cgst_rate: "2.5",
  sgst_rate: "2.5",
};

export function SettingsClient({ rows }: { rows: Setting[] }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(() => {
    const base = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    // Ensure the tax-rate keys always have a value to edit, even if the row
    // hasn't been created in the DB yet. Saving will upsert them.
    for (const [key, def] of Object.entries(DEFAULT_VALUES)) {
      if (base[key] === undefined) base[key] = def;
    }
    return base;
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const labelMap: Record<string, string> = {
    ...DEFAULT_LABELS,
    ...Object.fromEntries(rows.map((r) => [r.key, r.label])),
  };

  async function save() {
    setSaving(true);
    await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  const inputCls = "w-full bg-gray-800 border border-gray-700 text-gray-200 text-sm px-3 py-2 rounded focus:outline-none focus:border-amber-500";
  const labelCls = "block text-gray-400 text-xs uppercase tracking-wider mb-1";

  const multiline = ["seller_address", "bank_details"];
  const readOnly: string[] = [];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {EDITABLE_KEYS.map((key) => (
          <div key={key} className={multiline.includes(key) ? "md:col-span-2" : ""}>
            <label className={labelCls}>{labelMap[key] ?? key}</label>
            {multiline.includes(key) ? (
              <textarea
                className={inputCls + " resize-none"}
                rows={2}
                value={values[key] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
              />
            ) : (
              <input
                className={inputCls + (readOnly.includes(key) ? " opacity-60 cursor-not-allowed" : "")}
                value={values[key] ?? ""}
                readOnly={readOnly.includes(key)}
                onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
              />
            )}
            {key === "invoice_counter" && (
              <p className="text-yellow-600 text-xs mt-1">
                Next invoice will be {values.invoice_prefix}-{String(parseInt(values.invoice_counter ?? "539")).padStart(4, "0")}.
                Warning: only change this if you need to resync the sequence. Setting it lower than the last used number will cause duplicate invoice numbers.
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 pt-2">
        <button
          onClick={save}
          disabled={saving}
          className="bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium px-6 py-2 rounded disabled:opacity-60 transition-colors"
        >
          {saving ? "Saving..." : saved ? "Saved ✓" : "Save Settings"}
        </button>
        <p className="text-gray-500 text-xs">
          Changes take effect on the next invoice generated.
        </p>
      </div>
    </div>
  );
}
