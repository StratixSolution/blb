import Link from "next/link";
import Image from "next/image";
import { type Product } from "@/types";
import { formatPrice } from "@/lib/utils";

interface Props {
  products: Product[];
}

export function PremixStrip({ products }: Props) {
  return (
    <section className="bg-[#F7F0E6] py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#C9953C] mb-2">
              Instant Premix
            </p>
            <h2 className="font-serif text-4xl text-[#1A0E08]">Ready in 60 seconds.</h2>
          </div>
          <Link
            href="/shop?category=instant-premix"
            className="hidden md:block text-xs uppercase tracking-widest text-[#8B5E3C] border-b border-[#8B5E3C] pb-0.5 hover:text-[#1A0E08] hover:border-[#1A0E08] transition-colors"
          >
            View all
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
          {products.map((product) => (
            <div key={product.id} className="flex-none w-44 snap-start">
              <Link href={`/shop/${product.slug}`} className="group block">
                <div className="relative h-44 bg-[#EAD9C8] overflow-hidden mb-3">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="176px"
                  />
                  {product.regularPrice && (
                    <span className="absolute top-2 left-2 bg-[#C9953C] text-[#1A0E08] text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5">
                      Sale
                    </span>
                  )}
                </div>
                <p className="text-xs font-medium text-[#1A0E08] leading-snug mb-1">{product.name}</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#4A2512]">{formatPrice(product.price)}</span>
                  {product.regularPrice && (
                    <span className="text-xs text-[#8B5E3C] line-through">{formatPrice(product.regularPrice)}</span>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
