"use client";

import Link from "next/link";
import Image from "next/image";
import { type Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { ShoppingBag } from "lucide-react";

interface Props {
  products: Product[];
}

export function FeaturedProducts({ products }: Props) {
  const { addItem } = useCartStore();

  return (
    <section className="bg-[#F7F0E6] py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#C9953C] mb-2">
            Signature Roasts
          </p>
          <h2 className="font-serif text-4xl text-[#1A0E08]">Crafted to perfection.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id}>
              <div className="group bg-[#FAFAF8] border border-[#D4C4B0] overflow-hidden hover:shadow-md transition-shadow">
                <Link href={`/shop/${product.slug}`} className="block">
                  <div className="relative h-60 bg-[#EAD9C8] overflow-hidden">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-serif text-lg text-[#1A0E08] mb-1">{product.name}</h3>
                    <p className="text-xs text-[#8B5E3C] leading-relaxed">{product.shortDescription}</p>
                    {product.notes && (
                      <div className="flex gap-1.5 mt-3">
                        {product.notes.map((note) => (
                          <span key={note} className="text-[9px] uppercase tracking-wider px-2 py-0.5 bg-[#EAD9C8] text-[#4A2512]">
                            {note}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
                <div className="px-5 pb-5 flex items-center justify-between">
                  <span className="font-medium text-[#1A0E08]">{formatPrice(product.price)}</span>
                  <button
                    onClick={() => addItem(product)}
                    className="flex items-center gap-2 bg-[#1A0E08] text-[#F7F0E6] text-[10px] uppercase tracking-widest px-4 py-2 hover:bg-[#4A2512] transition-colors"
                  >
                    <ShoppingBag size={12} />
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/shop"
            className="text-xs uppercase tracking-widest text-[#1A0E08] border-b border-[#1A0E08] pb-0.5 hover:text-[#C9953C] hover:border-[#C9953C] transition-colors"
          >
            View all products
          </Link>
        </div>
      </div>
    </section>
  );
}
