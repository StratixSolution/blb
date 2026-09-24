"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { type Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart";

interface Props {
  product: Product;
}

export function ProductCard({ product }: Props) {
  const { addItem } = useCartStore();

  return (
    <div className="group bg-[#FAFAF8] border border-[#D4C4B0] overflow-hidden hover:shadow-md transition-shadow">
      <Link href={`/shop/${product.slug}`} className="block">
        <div className="relative h-56 bg-[#EAD9C8] overflow-hidden">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {product.regularPrice && (
            <span className="absolute top-3 left-3 bg-[#C9953C] text-[#1A0E08] text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5">
              Sale
            </span>
          )}
        </div>
        <div className="p-5">
          <p className="text-[9px] uppercase tracking-widest text-[#8B5E3C] mb-1">
            {product.category === "ground-coffee"
              ? "Ground Coffee"
              : product.category === "whole-bean"
              ? "Whole Bean"
              : "Instant Premix"}{" "}
            · {product.weight}
          </p>
          <h3 className="font-serif text-base text-[#1A0E08] mb-1">{product.name}</h3>
          <p className="text-xs text-[#8B5E3C] leading-relaxed line-clamp-2">
            {product.shortDescription}
          </p>
        </div>
      </Link>
      <div className="px-5 pb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-medium text-[#1A0E08]">{formatPrice(product.price)}</span>
          {product.regularPrice && (
            <span className="text-xs text-[#8B5E3C] line-through">{formatPrice(product.regularPrice)}</span>
          )}
        </div>
        <button
          onClick={() => addItem(product)}
          className="flex items-center gap-2 bg-[#1A0E08] text-[#F7F0E6] text-[10px] uppercase tracking-widest px-4 py-2 hover:bg-[#4A2512] transition-colors"
        >
          <ShoppingBag size={12} />
          Add
        </button>
      </div>
    </div>
  );
}
