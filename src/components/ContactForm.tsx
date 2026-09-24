"use client";

import { useState } from "react";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export function ContactForm() {
  const [form, setForm] = useState<FormData>({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  function set(field: keyof FormData, val: string) {
    setForm((f) => ({ ...f, [field]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("success");
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-[#EAD9C8] p-8 text-center">
        <p className="font-serif text-xl text-[#1A0E08] mb-2">Message sent!</p>
        <p className="text-sm text-[#8B5E3C]">We&apos;ll get back to you within one business day.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {[
        { label: "Your Name", field: "name" as const, type: "text" },
        { label: "Email Address", field: "email" as const, type: "email" },
        { label: "Subject", field: "subject" as const, type: "text" },
      ].map(({ label, field, type }) => (
        <div key={field}>
          <label className="block text-xs uppercase tracking-widest text-[#8B5E3C] mb-1.5">{label}</label>
          <input
            type={type}
            value={form[field]}
            onChange={(e) => set(field, e.target.value)}
            required
            className="w-full border border-[#D4C4B0] bg-[#FAFAF8] text-[#1A0E08] text-sm px-4 py-3 focus:outline-none focus:border-[#8B5E3C] transition-colors"
          />
        </div>
      ))}
      <div>
        <label className="block text-xs uppercase tracking-widest text-[#8B5E3C] mb-1.5">Message</label>
        <textarea
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          required
          rows={5}
          className="w-full border border-[#D4C4B0] bg-[#FAFAF8] text-[#1A0E08] text-sm px-4 py-3 focus:outline-none focus:border-[#8B5E3C] transition-colors resize-none"
        />
      </div>

      {status === "error" && <p className="text-red-600 text-sm">Something went wrong. Please try again.</p>}

      <button
        type="submit"
        disabled={status === "loading"}
        className="bg-[#1A0E08] text-[#F7F0E6] text-xs font-semibold uppercase tracking-widest px-8 py-3.5 hover:bg-[#4A2512] transition-colors disabled:opacity-60"
      >
        {status === "loading" ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
