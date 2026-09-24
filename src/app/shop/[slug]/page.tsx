import { notFound } from "next/navigation";
import Image from "next/image";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { ProductActions } from "@/components/shop/ProductActions";
import { getProductBySlug, getAllProducts } from "@/lib/products";
import { formatPrice } from "@/lib/utils";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const all = await getAllProducts();
  return all.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: `${product.name} - Bean Leaf Brew`,
    description: product.shortDescription,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <>
      <Nav />
      <CartDrawer />
      <main className="min-h-screen bg-[#F7F0E6] pt-20">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            <div className="relative aspect-square bg-[#EAD9C8] overflow-hidden">
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>

            <div className="md:sticky md:top-28">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#8B5E3C] mb-3">
                {product.category === "ground-coffee"
                  ? "Ground Coffee"
                  : product.category === "whole-bean"
                  ? "Whole Bean"
                  : "Instant Premix"}{" "}
                · {product.weight}
              </p>
              <h1 className="font-serif text-4xl text-[#1A0E08] mb-3">{product.name}</h1>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl font-medium text-[#1A0E08]">{formatPrice(product.price)}</span>
                {product.regularPrice && (
                  <span className="text-base text-[#8B5E3C] line-through">{formatPrice(product.regularPrice)}</span>
                )}
              </div>

              {(product.notes || product.roast || product.blend) && (
                <div className="bg-[#EAD9C8] p-5 mb-6 space-y-2">
                  {product.blend && (
                    <div className="flex justify-between text-xs">
                      <span className="text-[#8B5E3C] uppercase tracking-wider">Blend</span>
                      <span className="text-[#1A0E08]">{product.blend}</span>
                    </div>
                  )}
                  {product.roast && (
                    <div className="flex justify-between text-xs">
                      <span className="text-[#8B5E3C] uppercase tracking-wider">Roast</span>
                      <span className="text-[#1A0E08]">{product.roast}</span>
                    </div>
                  )}
                  {product.notes && (
                    <div className="flex justify-between text-xs">
                      <span className="text-[#8B5E3C] uppercase tracking-wider">Notes</span>
                      <span className="text-[#1A0E08]">{product.notes.join(" & ")}</span>
                    </div>
                  )}
                </div>
              )}

              <ProductActions product={product} />

              <div className="mt-8 pt-8 border-t border-[#D4C4B0]">
                <h2 className="font-serif text-xl text-[#1A0E08] mb-3">About this product</h2>
                <p className="text-sm text-[#4A2512] leading-relaxed">{product.description}</p>
              </div>

              {product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-6">
                  {product.tags.map((tag) => (
                    <span key={tag} className="text-[9px] uppercase tracking-wider px-2 py-1 bg-[#EAD9C8] text-[#4A2512]">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
