"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CreateCouponForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    code: "",
    type: "percentage" as "percentage" | "fixed" | "flat_total",
    amount: "",
    minOrderAmount: "",
    maxUses: "",
    expiresAt: "",
    referencedTo: "",
  });

  function set(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setOpen(false);
      setForm({ code: "", type: "percentage" as "percentage" | "fixed" | "flat_total", amount: "", minOrderAmount: "", maxUses: "", expiresAt: "", referencedTo: "" });
      router.refresh();
    } else {
      const d = await res.json();
      setError(d.error ?? "Failed to create coupon");
    }
    setLoading(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium px-4 py-2 transition-colors"
      >
        + Add Coupon
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded w-full max-w-md p-6">
        <h2 className="text-white text-lg font-semibold mb-5">Create Coupon</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider block mb-1">Code</label>
            <input
              value={form.code}
              onChange={(e) => set("code", e.target.value.toUpperCase())}
              required
              placeholder="e.g. SAVE20"
              className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider block mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => set("type", e.target.value as "percentage" | "fixed" | "flat_total")}
                className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 focus:outline-none focus:border-amber-500"
              >
                <option value="percentage">Percentage %</option>
                <option value="fixed">Fixed ₹</option>
                <option value="flat_total">Flat Total ₹</option>
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider block mb-1">
                {form.type === "percentage" ? "Discount %" : "Amount ₹"}
              </label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => set("amount", e.target.value)}
                required
                min="0"
                max={form.type === "percentage" ? "100" : undefined}
                className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider block mb-1">Min Order ₹</label>
              <input
                type="number"
                value={form.minOrderAmount}
                onChange={(e) => set("minOrderAmount", e.target.value)}
                placeholder="0"
                min="0"
                className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider block mb-1">Max Uses</label>
              <input
                type="number"
                value={form.maxUses}
                onChange={(e) => set("maxUses", e.target.value)}
                placeholder="Unlimited"
                min="1"
                className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider block mb-1">Attribution</label>
            <input
              value={form.referencedTo}
              onChange={(e) => set("referencedTo", e.target.value)}
              placeholder="e.g. @john_doe, Diwali2026, Google Ads"
              className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider block mb-1">Expires At</label>
            <input
              type="date"
              value={form.expiresAt}
              onChange={(e) => set("expiresAt", e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 focus:outline-none focus:border-amber-500"
            />
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium py-2 transition-colors disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Coupon"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm py-2 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface CouponData {
  id: number;
  code: string;
  type: "percentage" | "fixed" | "flat_total";
  amount: number;
  minOrderAmount: number;
  maxUses: number | null;
  expiresAt: string | null;
  referencedTo: string | null;
}

export function EditCouponButton({ coupon }: { coupon: CouponData }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    code: coupon.code,
    type: coupon.type as "percentage" | "fixed" | "flat_total",
    amount: String(coupon.amount),
    minOrderAmount: String(coupon.minOrderAmount),
    maxUses: coupon.maxUses != null ? String(coupon.maxUses) : "",
    expiresAt: coupon.expiresAt ?? "",
    referencedTo: coupon.referencedTo ?? "",
  });

  function set(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: form.code.toUpperCase().trim(),
        type: form.type,
        amount: Number(form.amount),
        minOrderAmount: Number(form.minOrderAmount || 0),
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        expiresAt: form.expiresAt || null,
        referencedTo: form.referencedTo.trim() || null,
      }),
    });
    if (res.ok) {
      setOpen(false);
      router.refresh();
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Failed to save");
    }
    setLoading(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-gray-400 hover:text-white text-xs transition-colors"
      >
        Edit
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded w-full max-w-md p-6">
            <h2 className="text-white text-lg font-semibold mb-5">Edit Coupon</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider block mb-1">Code</label>
                <input
                  value={form.code}
                  onChange={(e) => set("code", e.target.value.toUpperCase())}
                  required
                  className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-wider block mb-1">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => set("type", e.target.value as "percentage" | "fixed" | "flat_total")}
                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 focus:outline-none focus:border-amber-500"
                  >
                    <option value="percentage">Percentage %</option>
                    <option value="fixed">Fixed ₹</option>
                    <option value="flat_total">Flat Total ₹</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-wider block mb-1">
                    {form.type === "percentage" ? "Discount %" : "Amount ₹"}
                  </label>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) => set("amount", e.target.value)}
                    required
                    min="0"
                    max={form.type === "percentage" ? "100" : undefined}
                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-wider block mb-1">Min Order ₹</label>
                  <input
                    type="number"
                    value={form.minOrderAmount}
                    onChange={(e) => set("minOrderAmount", e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-wider block mb-1">Max Uses</label>
                  <input
                    type="number"
                    value={form.maxUses}
                    onChange={(e) => set("maxUses", e.target.value)}
                    placeholder="Unlimited"
                    min="1"
                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider block mb-1">Attribution</label>
                <input
                  value={form.referencedTo}
                  onChange={(e) => set("referencedTo", e.target.value)}
                  placeholder="e.g. @john_doe, Diwali2026, Google Ads"
                  className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider block mb-1">Expires At</label>
                <input
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) => set("expiresAt", e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 focus:outline-none focus:border-amber-500"
                />
              </div>
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium py-2 transition-colors disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm py-2 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export function DeleteCouponButton({ id }: { id: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this coupon?")) return;
    setLoading(true);
    await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-400 hover:text-red-300 text-xs disabled:opacity-50 transition-colors"
    >
      {loading ? "..." : "Delete"}
    </button>
  );
}

export function ToggleCouponButton({ id, active }: { id: number; active: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    await fetch(`/api/admin/coupons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`text-xs px-2 py-0.5 rounded font-medium transition-colors disabled:opacity-50 ${
        active
          ? "bg-green-900 text-green-300 hover:bg-green-800"
          : "bg-gray-800 text-gray-400 hover:bg-gray-700"
      }`}
    >
      {loading ? "..." : active ? "Active" : "Inactive"}
    </button>
  );
}
