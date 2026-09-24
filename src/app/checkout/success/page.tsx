import Link from "next/link";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";

export const metadata = { title: "Order Confirmed - Bean Leaf Brew" };

export default function SuccessPage() {
  return (
    <>
      <Nav />
      <main className="min-h-screen bg-[#F7F0E6] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-[#EAD9C8] flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl text-[#C9953C]">✓</span>
          </div>
          <h1 className="font-serif text-4xl text-[#1A0E08] mb-4">Order Confirmed!</h1>
          <p className="text-sm text-[#8B5E3C] leading-relaxed mb-8">
            Thank you for your order. We&apos;ll process and ship it within 1-2 business days.
            A confirmation email has been sent to your inbox.
          </p>
          <Link
            href="/"
            className="inline-block bg-[#1A0E08] text-[#F7F0E6] text-xs font-semibold uppercase tracking-widest px-8 py-3.5 hover:bg-[#4A2512] transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
