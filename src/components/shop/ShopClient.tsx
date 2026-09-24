"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { type Product, type ProductCategory } from "@/types";
import { ProductCard } from "./ProductCard";

interface Props {
  products: Product[];
}

const categories: { label: string; value: ProductCategory | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Ground Coffee", value: "ground-coffee" },
  { label: "Whole Bean", value: "whole-bean" },
  { label: "Instant Premix", value: "instant-premix" },
];

export function ShopClient({ products }: Props) {
  const searchParams = useSearchParams();
  const [active, setActive] = useState<ProductCategory | "all">("all");

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat && categories.find((c) => c.value === cat)) {
      setActive(cat as ProductCategory | "all");
    }
  }, [searchParams]);

  const filtered = active === "all" ? products : products.filter((p) => p.category === active);

  return (
    <>
      <div className="flex gap-2 flex-wrap mb-10">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActive(cat.value)}
            className={`text-[10px] uppercase tracking-widest px-4 py-2 border transition-colors ${
              active === cat.value
                ? "bg-[#1A0E08] text-[#F7F0E6] border-[#1A0E08]"
                : "text-[#8B5E3C] border-[#D4C4B0] hover:border-[#8B5E3C]"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((product) => (
          <div key={product.id}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </>
  );
}
