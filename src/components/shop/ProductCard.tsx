"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import { type Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { formatPriceDisplay, requiresOptionSelection } from "@/lib/productOptions";
import { useState } from "react";

interface Props {
  product: Product;
}

export function ProductCard({ product }: Props) {
  const { addItem } = useCartStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const weightOptions = product.weightOptions ?? [];
  const equipmentOptions = product.brewingEquipmentOptions ?? [];
  // Ground coffee with configured options must be chosen on the product page,
  // so the card links there instead of adding directly.
  const needsSelection = requiresOptionSelection(product.category, weightOptions, equipmentOptions);

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
    <div className="group flex flex-col w-full bg-[#FAFAF8] border border-[#D4C4B0] overflow-hidden hover:shadow-md transition-shadow">
      <Link href={`/shop/${product.slug}`} className="flex flex-col flex-1">
        <div 
          className="relative h-56 bg-[#EAD9C8] overflow-hidden flex-shrink-0"
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
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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

          {product.regularPrice && (
            <span className="absolute top-3 left-3 bg-[#C9953C] text-[#1A0E08] text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5">
              Sale
            </span>
          )}
        </div>
        <div className="p-5 flex-1">
          <p className="text-[9px] uppercase tracking-widest text-[#8B5E3C] mb-1">
            {product.categoryLabel ?? product.category}
            {product.weight ? ` · ${product.weight}` : ""}
          </p>
          <h3 className="font-serif text-base text-[#1A0E08] mb-1">{product.name}</h3>
          <p className="text-xs text-[#8B5E3C] leading-relaxed line-clamp-2">
            {product.shortDescription}
          </p>
        </div>
      </Link>
      <div className="px-5 pb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-medium text-[#1A0E08]">{formatPriceDisplay(product.price, weightOptions)}</span>
          {product.regularPrice && weightOptions.length === 0 && (
            <span className="text-xs text-[#8B5E3C] line-through">{formatPrice(product.regularPrice)}</span>
          )}
        </div>
        {needsSelection ? (
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
