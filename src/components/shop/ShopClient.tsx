"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { type Product } from "@/types";
import { ProductCard } from "./ProductCard";
import { CATEGORIES } from "@/lib/categories";

interface Props {
  products: Product[];
}

export function ShopClient({ products }: Props) {
  const searchParams = useSearchParams();

  // Build the filter list excluding premix subcategories and merchandise
  const categories = useMemo(() => {
    // Exclude premix subcategories and merchandise from main navigation
    const excludedSlugs = ["non-milk-tea", "milk-tea", "matcha-tea", "malt-protein", "merchandise-accessories"];
    const filteredCategories = CATEGORIES.filter((c) => !excludedSlugs.includes(c.slug));

    return [
      { label: "All", value: "all" },
      ...filteredCategories.map((c) => ({ label: c.name, value: c.slug })),
    ];
  }, []);

  // Honour an initial ?category= from the URL, then let clicks override it.
  const urlCategory = searchParams.get("category");
  const initialActive =
    urlCategory && categories.some((c) => c.value === urlCategory) ? urlCategory : "all";
  const [active, setActive] = useState<string>(initialActive);

  // Filter products - special handling for instant-premix
  const filtered = useMemo(() => {
    if (active === "all") return products;

    if (active === "instant-premix") {
      return products.filter((p) => p.category === "instant-premix");
    }

    return products.filter((p) => p.category === active);
  }, [active, products]);

  const isCategoryEmpty = filtered.length === 0;

  return (
    <>
      {/* Main Category Navigation */}
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

      {/* Instant Premix: Special layout with Coming Soon banner */}
      {active === "instant-premix" ? (
        isCategoryEmpty ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center max-w-md px-8 py-12 rounded-2xl border border-[#8B5E3C] shadow-lg overflow-hidden relative">
              {/* Background image with overlay */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: "url('/images/Roasted-Beans.avif')",
                }}
              />
              <div className="absolute inset-0 bg-[#F7F0E6]/85" />
              {/* Content */}
              <div className="relative z-10">
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#C9953C] mb-6">
                  COMING SOON
                </p>
                <h2 className="font-serif text-2xl md:text-3xl text-[#1A0E08] mb-6 font-bold">
                  Something Special Is Brewing!
                </h2>
                <p className="text-[#4A2512] text-sm leading-relaxed">
                  Our Instant Premix collection is brewing behind the scenes. Stay tuned for something delicious.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {filtered.map((product) => (
              <div key={product.id} className="flex">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )
      ) : isCategoryEmpty ? (
        <div className="bg-[#FAFAF8] border border-[#D4C4B0] rounded-lg p-12 md:p-16 text-center">
          <p className="text-sm text-[#8B5E3C]">No products available in this category yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {filtered.map((product) => (
            <div key={product.id} className="flex">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
