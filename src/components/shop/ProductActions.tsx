"use client";

import { useState } from "react";
import { ShoppingBag, Minus, Plus } from "lucide-react";
import { type Product } from "@/types";
import { useCartStore } from "@/store/cart";

interface Props {
  product: Product;
}

export function ProductActions({ product }: Props) {
  const [qty, setQty] = useState(1);
  const { addItem } = useCartStore();

  function handleAdd() {
    addItem(product, qty);
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center border border-[#D4C4B0]">
        <button
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="w-10 h-11 flex items-center justify-center text-[#8B5E3C] hover:text-[#1A0E08] transition-colors"
          aria-label="Decrease quantity"
        >
          <Minus size={14} />
        </button>
        <span className="w-10 text-center text-sm font-medium text-[#1A0E08]">{qty}</span>
        <button
          onClick={() => setQty((q) => q + 1)}
          className="w-10 h-11 flex items-center justify-center text-[#8B5E3C] hover:text-[#1A0E08] transition-colors"
          aria-label="Increase quantity"
        >
          <Plus size={14} />
        </button>
      </div>

      <button
        onClick={handleAdd}
        className="flex-1 flex items-center justify-center gap-2 bg-[#1A0E08] text-[#F7F0E6] text-xs font-semibold uppercase tracking-widest py-3 px-6 hover:bg-[#4A2512] transition-colors"
      >
        <ShoppingBag size={14} />
        Add to Cart
      </button>
    </div>
  );
}
