"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetMsg, setResetMsg] = useState("");
  const [resetting, setResetting] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError("Invalid password.");
      setLoading(false);
    }
  }

  async function handleForgot() {
    setResetting(true);
    setResetMsg("");
    setError("");
    await fetch("/api/admin/account/forgot", { method: "POST" });
    setResetting(false);
    setResetMsg("If an admin email is configured, a reset link has been sent.");
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="bg-gray-900 border border-gray-800 p-8 w-full max-w-sm">
        <h1 className="text-white text-xl font-semibold mb-1">Bean Leaf Brew</h1>
        <p className="text-gray-400 text-sm mb-6">Admin Dashboard</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-4 py-2.5 focus:outline-none focus:border-amber-500"
          />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          {resetMsg && <p className="text-green-400 text-xs">{resetMsg}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium py-2.5 transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <button
          type="button"
          onClick={handleForgot}
          disabled={resetting}
          className="mt-4 text-xs text-gray-400 hover:text-amber-400 transition-colors disabled:opacity-50"
        >
          {resetting ? "Sending reset link..." : "Forgot password?"}
        </button>
      </div>
    </div>
  );
}
