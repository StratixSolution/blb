"use client";

import Link from "next/link";
import Image from "next/image";
import { type Product } from "@/types";
import { useCartStore } from "@/store/cart";
import { ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import { formatPriceDisplay, requiresOptionSelection } from "@/lib/productOptions";
import { useState } from "react";

interface Props {
  products: Product[];
}

function FeaturedProductCard({ product }: { product: Product }) {
  const { addItem } = useCartStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const hasMultipleImages = product.images.length > 1;

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="group bg-[#FAFAF8] border border-[#D4C4B0] overflow-hidden hover:shadow-md transition-shadow flex flex-col w-full">
      <Link href={`/shop/${product.slug}`} className="flex flex-col flex-1">
        <div 
          className="relative h-60 bg-[#EAD9C8] overflow-hidden flex-shrink-0"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => {
            setIsHovering(false);
            setCurrentImageIndex(0);
          }}
        >
          <Image
            src={product.images[currentImageIndex]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 33vw"
          />

          {/* Image Navigation Controls - Show on hover if multiple images */}
          {hasMultipleImages && isHovering && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-[#1A0E08] p-1.5 rounded-full shadow-md transition-all opacity-0 group-hover:opacity-100 z-10"
                aria-label="Previous image"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-[#1A0E08] p-1.5 rounded-full shadow-md transition-all opacity-0 group-hover:opacity-100 z-10"
                aria-label="Next image"
              >
                <ChevronRight size={16} />
              </button>

              {/* Image Indicators */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                {product.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      index === currentImageIndex 
                        ? "bg-white w-6" 
                        : "bg-white/60 hover:bg-white/80"
                    }`}
                    aria-label={`View image ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
        <div className="p-5 flex-1">
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
      <div className="px-5 pb-5 flex items-center justify-between flex-shrink-0">
        <span className="font-medium text-[#1A0E08]">
          {formatPriceDisplay(product.price, product.weightOptions ?? [])}
        </span>
        {requiresOptionSelection(product.category, product.weightOptions ?? [], product.brewingEquipmentOptions ?? []) ? (
          <Link
            href={`/shop/${product.slug}`}
            className="flex items-center gap-2 bg-[#1A0E08] text-[#F7F0E6] text-[10px] uppercase tracking-widest px-4 py-2 hover:bg-[#4A2512] transition-colors"
          >
            <ShoppingBag size={12} />
            Select
          </Link>
        ) : (
          <button
            onClick={() => addItem(product)}
            className="flex items-center gap-2 bg-[#1A0E08] text-[#F7F0E6] text-[10px] uppercase tracking-widest px-4 py-2 hover:bg-[#4A2512] transition-colors"
          >
            <ShoppingBag size={12} />
            Add
          </button>
        )}
      </div>
    </div>
  );
}

export function FeaturedProducts({ products }: Props) {

  return (
    <section className="bg-[#F7F0E6] py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#C9953C] mb-2">
            Signature Roasts
          </p>
          <h2 className="font-serif text-2xl md:text-4xl text-[#1A0E08]">Crafted to perfection.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="flex">
              <FeaturedProductCard product={product} />
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
