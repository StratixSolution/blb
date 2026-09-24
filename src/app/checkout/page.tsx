import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { CheckoutClient } from "@/components/shop/CheckoutClient";

export const metadata = {
  title: "Checkout - Bean Leaf Brew",
};

export default function CheckoutPage() {
  return (
    <>
      <Nav />
      <CartDrawer />
      <main className="min-h-screen bg-[#F7F0E6] pt-20">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="mb-10">
            <h1 className="font-serif text-4xl text-[#1A0E08]">Checkout</h1>
          </div>
          <CheckoutClient />
        </div>
      </main>
      <Footer />
    </>
  );
}
