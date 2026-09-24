"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Plus, Minus, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const { isOpen, closeCart, items, updateQuantity, removeItem, total } =
    useCartStore();

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const cartTotal = total();

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50"
        onClick={closeCart}
        aria-hidden="true"
      />
      <aside className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-[#FAFAF8] flex flex-col shadow-xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#D4C4B0]">
          <h2 className="font-serif text-lg text-[#1A0E08]">Your Cart</h2>
          <button onClick={closeCart} aria-label="Close cart" className="text-[#8B5E3C] hover:text-[#1A0E08] transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <p className="text-[#8B5E3C] text-sm">Your cart is empty.</p>
              <Link
                href="/shop"
                onClick={closeCart}
                className="text-xs uppercase tracking-widest text-[#C9953C] border-b border-[#C9953C] pb-0.5 hover:opacity-80 transition-opacity"
              >
                Browse Shop
              </Link>
            </div>
          ) : (
            <ul className="space-y-5">
              {items.map(({ product, quantity }) => (
                <li key={product.id} className="flex gap-4">
                  <div className="w-16 h-16 rounded bg-[#EAD9C8] overflow-hidden flex-shrink-0">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1A0E08] leading-tight">{product.name}</p>
                    <p className="text-xs text-[#8B5E3C] mt-0.5">{product.weight}</p>
                    <p className="text-sm font-medium text-[#4A2512] mt-1">{formatPrice(product.price)}</p>
                  </div>
                  <div className="flex flex-col items-end justify-between gap-2">
                    <button
                      onClick={() => removeItem(product.id)}
                      className="text-[#8B5E3C] hover:text-red-600 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 size={14} />
                    </button>
                    <div className="flex items-center gap-2 border border-[#D4C4B0] rounded px-2 py-1">
                      <button onClick={() => updateQuantity(product.id, quantity - 1)} aria-label="Decrease quantity">
                        <Minus size={12} />
                      </button>
                      <span className="text-xs w-4 text-center">{quantity}</span>
                      <button onClick={() => updateQuantity(product.id, quantity + 1)} aria-label="Increase quantity">
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-[#D4C4B0]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-[#8B5E3C]">Total</span>
              <span className="text-lg font-medium text-[#1A0E08]">{formatPrice(cartTotal)}</span>
            </div>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full bg-[#C9953C] text-[#1A0E08] text-center text-xs font-semibold uppercase tracking-widest py-3.5 rounded hover:bg-[#B8842B] transition-colors"
            >
              Proceed to Checkout
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
