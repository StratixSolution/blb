"use client";

import { useRouter } from "next/navigation";

export function AdminLogout() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="block w-full text-left px-3 py-2 text-xs text-gray-500 hover:text-red-400 transition-colors"
    >
      Sign out
    </button>
  );
}
