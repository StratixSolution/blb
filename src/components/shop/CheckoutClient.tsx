"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { getStoredAttribution } from "@/lib/utmCapture";

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

const INITIAL: FormData = {
  name: "", email: "", phone: "", address: "", city: "", state: "Karnataka", pincode: "",
};

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export function CheckoutClient() {
  const { items, total, clearCart } = useCartStore();
  const [form, setForm] = useState<FormData>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);

  const cartTotal = total();
  const finalTotal = appliedCoupon ? Math.max(0, cartTotal - appliedCoupon.discount) : cartTotal;

  if (items.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="text-[#8B5E3C] mb-4">Your cart is empty.</p>
        <Link href="/shop" className="text-xs uppercase tracking-widest text-[#C9953C] border-b border-[#C9953C] pb-0.5">
          Go to Shop
        </Link>
      </div>
    );
  }

  function set(field: keyof FormData, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function applyCoupon() {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    setAppliedCoupon(null);
    const res = await fetch("/api/coupon/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponInput.trim(), cartTotal }),
    });
    const data = await res.json();
    if (res.ok && data.valid) {
      setAppliedCoupon({ code: data.code, discount: data.discount });
    } else {
      setCouponError(data.error ?? "Invalid coupon");
    }
    setCouponLoading(false);
  }

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const cartItems = items.map((i) => ({ productId: i.product.id, quantity: i.quantity }));
    const couponCode = appliedCoupon?.code ?? null;

    const attribution = getStoredAttribution();

    // Free order (100% coupon discount) - skip Razorpay
    if (finalTotal === 0) {
      try {
        const res = await fetch("/api/orders/free", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customer: form, items: cartItems, couponCode, attribution }),
        });
        if (res.ok) {
          clearCart();
          window.location.href = "/checkout/success";
        } else {
          const data = await res.json().catch(() => ({}));
          setError(data.error ?? "Something went wrong. Please try again.");
        }
      } catch {
        setError("Something went wrong. Please try again.");
      }
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cartItems, couponCode }),
      });
      const data = await res.json();
      if (!res.ok || !data.id) throw new Error(data.error ?? "Failed to create order");

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      document.body.appendChild(script);

      script.onload = () => {
        const rzp = new window.Razorpay({
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: data.amount,
          currency: "INR",
          name: "Bean Leaf Brew",
          description: "Coffee Order",
          order_id: data.id,
          prefill: {
            name: form.name,
            email: form.email,
            contact: form.phone,
          },
          theme: { color: "#C9953C" },
          modal: {
            ondismiss: () => {
              setLoading(false);
            },
          },
          handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
            const verify = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...response, customer: form, attribution }),
            });
            if (verify.ok) {
              clearCart();
              window.location.href = "/checkout/success";
            } else {
              const errData = await verify.json().catch(() => ({}));
              setError(`Payment received but order confirmation failed (${verify.status}: ${errData.error ?? "unknown"}). Payment ID: ${response.razorpay_payment_id}`);
              setLoading(false);
            }
          },
        });
        rzp.open();
      };

      script.onerror = () => {
        setError("Failed to load payment gateway. Please try again.");
        setLoading(false);
      };
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
      <form onSubmit={handlePay} className="lg:col-span-3 space-y-5 order-2 lg:order-1">
        <h2 className="font-serif text-2xl text-[#1A0E08] mb-6">Delivery Details</h2>

        {[
          { label: "Full Name", field: "name" as const, type: "text", required: true },
          { label: "Email Address", field: "email" as const, type: "email", required: true },
          { label: "Phone Number", field: "phone" as const, type: "tel", required: true },
          { label: "Delivery Address", field: "address" as const, type: "text", required: true },
          { label: "City", field: "city" as const, type: "text", required: true },
          { label: "State", field: "state" as const, type: "text", required: true },
          { label: "Pincode", field: "pincode" as const, type: "text", required: true },
        ].map(({ label, field, type, required }) => (
          <div key={field}>
            <label className="block text-xs uppercase tracking-widest text-[#8B5E3C] mb-1.5">{label}</label>
            <input
              type={type}
              value={form[field]}
              onChange={(e) => set(field, e.target.value)}
              required={required}
              className="w-full border border-[#D4C4B0] bg-[#FAFAF8] text-[#1A0E08] text-sm px-4 py-3 focus:outline-none focus:border-[#8B5E3C] transition-colors"
            />
          </div>
        ))}

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#C9953C] text-[#1A0E08] text-xs font-semibold uppercase tracking-widest py-4 hover:bg-[#B8842B] transition-colors disabled:opacity-60 mt-4"
        >
          {loading ? "Processing..." : `Pay ${formatPrice(finalTotal)}`}
        </button>
      </form>

      <aside className="lg:col-span-2 order-1 lg:order-2">
        <h2 className="font-serif text-2xl text-[#1A0E08] mb-6">Order Summary</h2>
        <div className="bg-[#FAFAF8] border border-[#D4C4B0] p-6 space-y-4">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="flex gap-3">
              <div className="w-12 h-12 bg-[#EAD9C8] overflow-hidden flex-shrink-0">
                <Image src={product.images[0]} alt={product.name} width={48} height={48} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-[#1A0E08]">{product.name}</p>
                <p className="text-xs text-[#8B5E3C]">Qty: {quantity}</p>
              </div>
              <p className="text-xs font-medium text-[#1A0E08]">{formatPrice(product.price * quantity)}</p>
            </div>
          ))}
          <div className="border-t border-[#D4C4B0] pt-4 space-y-2">
            {!appliedCoupon ? (
              <div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon code"
                    value={couponInput}
                    onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(""); }}
                    className="flex-1 border border-[#D4C4B0] bg-[#FAFAF8] text-[#1A0E08] text-xs px-3 py-2 focus:outline-none focus:border-[#8B5E3C]"
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    disabled={couponLoading || !couponInput.trim()}
                    className="text-xs uppercase tracking-widest text-[#C9953C] border border-[#C9953C] px-3 py-2 hover:bg-[#C9953C] hover:text-[#1A0E08] transition-colors disabled:opacity-40"
                  >
                    {couponLoading ? "..." : "Apply"}
                  </button>
                </div>
                {couponError && <p className="text-red-600 text-xs mt-1">{couponError}</p>}
              </div>
            ) : (
              <div className="flex items-center justify-between text-xs">
                <span className="text-green-700 font-medium">
                  {appliedCoupon.code} applied - save {formatPrice(appliedCoupon.discount)}
                </span>
                <button
                  type="button"
                  onClick={() => { setAppliedCoupon(null); setCouponInput(""); }}
                  className="text-[#8B5E3C] hover:text-[#1A0E08] underline"
                >
                  Remove
                </button>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-[#8B5E3C]">Subtotal</span>
              <span className="text-sm text-[#1A0E08]">{formatPrice(cartTotal)}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between">
                <span className="text-sm text-green-700">Discount</span>
                <span className="text-sm text-green-700">-{formatPrice(appliedCoupon.discount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-[#D4C4B0] pt-2">
              <span className="text-sm font-medium text-[#1A0E08]">Total</span>
              <span className="text-base font-medium text-[#1A0E08]">{formatPrice(finalTotal)}</span>
            </div>
          </div>
          <p className="text-[10px] text-[#8B5E3C]">Free delivery on orders above ₹500</p>
        </div>
      </aside>
    </div>
  );
}
