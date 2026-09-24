"use client";

import { useState } from "react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    await new Promise((r) => setTimeout(r, 800));
    setStatus("success");
    setEmail("");
  }

  return (
    <section className="bg-[#4A2512] py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="font-serif text-3xl text-[#F7F0E6] mb-2">
              First sip is on us.
            </h2>
            <p className="text-sm text-[#F7F0E6]/60">
              Get 10% off your first order + weekly brewing tips straight to your inbox.
            </p>
          </div>

          {status === "success" ? (
            <p className="text-[#C9953C] text-sm font-medium">
              You&apos;re in! Check your inbox for your discount code.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-3 w-full md:w-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 md:w-64 bg-[#F7F0E6]/10 border border-[#F7F0E6]/20 text-[#F7F0E6] placeholder-[#F7F0E6]/30 text-sm px-4 py-3 focus:outline-none focus:border-[#C9953C] transition-colors"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="bg-[#C9953C] text-[#1A0E08] text-xs font-semibold uppercase tracking-widest px-6 py-3 hover:bg-[#B8842B] transition-colors disabled:opacity-60"
              >
                {status === "loading" ? "..." : "Subscribe"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
