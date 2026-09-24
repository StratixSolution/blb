import { Suspense } from "react";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { ShopClient } from "@/components/shop/ShopClient";
import { getAllProducts } from "@/lib/products";

export const metadata = {
  title: "Shop - Bean Leaf Brew",
  description: "Browse our full range of specialty coffee, whole beans, and instant premix.",
};

export default async function ShopPage() {
  const products = await getAllProducts();

  return (
    <>
      <Nav />
      <CartDrawer />
      <main className="min-h-screen bg-[#F7F0E6]">
        <div className="pt-28 pb-24 max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#C9953C] mb-2">
              Our Products
            </p>
            <h1 className="font-serif text-3xl md:text-5xl text-[#1A0E08]">Shop</h1>
          </div>
          <Suspense fallback={<div className="text-sm text-[#8B5E3C]">Loading...</div>}>
            <ShopClient products={products} />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
