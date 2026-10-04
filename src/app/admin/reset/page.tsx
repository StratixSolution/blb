"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function ResetForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (newPassword !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/admin/account/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    });
    setLoading(false);

    if (res.ok) {
      setDone(true);
      setTimeout(() => router.push("/admin/login"), 1500);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not reset password.");
    }
  }

  const inputCls =
    "w-full bg-gray-800 border border-gray-700 text-white text-sm px-4 py-2.5 focus:outline-none focus:border-amber-500";

  if (!token) {
    return <p className="text-red-400 text-sm">Missing or invalid reset link.</p>;
  }

  if (done) {
    return <p className="text-green-400 text-sm">Password reset. Redirecting to sign in…</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="password"
        placeholder="New password"
        autoComplete="new-password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
        className={inputCls}
      />
      <input
        type="password"
        placeholder="Confirm new password"
        autoComplete="new-password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        required
        className={inputCls}
      />
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium py-2.5 transition-colors disabled:opacity-50"
      >
        {loading ? "Resetting..." : "Reset password"}
      </button>
    </form>
  );
}

export default function AdminResetPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="bg-gray-900 border border-gray-800 p-8 w-full max-w-sm">
        <h1 className="text-white text-xl font-semibold mb-1">Bean Leaf Brew</h1>
        <p className="text-gray-400 text-sm mb-6">Reset admin password</p>
        <Suspense fallback={<p className="text-gray-400 text-sm">Loading…</p>}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}
