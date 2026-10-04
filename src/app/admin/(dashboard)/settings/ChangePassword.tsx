"use client";

import { useState } from "react";

export function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirm) {
      setMessage({ type: "err", text: "New passwords do not match." });
      return;
    }
    if (newPassword.length < 8) {
      setMessage({ type: "err", text: "New password must be at least 8 characters." });
      return;
    }

    setSaving(true);
    const res = await fetch("/api/admin/account/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    setSaving(false);

    if (res.ok) {
      setMessage({ type: "ok", text: "Password updated." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
    } else {
      const data = await res.json().catch(() => ({}));
      setMessage({ type: "err", text: data.error ?? "Could not update password." });
    }
  }

  const inputCls =
    "w-full bg-gray-800 border border-gray-700 text-gray-200 text-sm px-3 py-2 rounded focus:outline-none focus:border-amber-500";
  const labelCls = "block text-gray-400 text-xs uppercase tracking-wider mb-1";

  return (
    <form onSubmit={submit} className="space-y-4 max-w-md">
      <div>
        <label className={labelCls}>Current password</label>
        <input
          type="password"
          autoComplete="current-password"
          className={inputCls}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
      </div>
      <div>
        <label className={labelCls}>New password</label>
        <input
          type="password"
          autoComplete="new-password"
          className={inputCls}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
      </div>
      <div>
        <label className={labelCls}>Confirm new password</label>
        <input
          type="password"
          autoComplete="new-password"
          className={inputCls}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
      </div>
      {message && (
        <p className={message.type === "ok" ? "text-green-400 text-xs" : "text-red-400 text-xs"}>
          {message.text}
        </p>
      )}
      <button
        type="submit"
        disabled={saving}
        className="bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium px-6 py-2 rounded disabled:opacity-60 transition-colors"
      >
        {saving ? "Updating..." : "Update password"}
      </button>
    </form>
  );
}
