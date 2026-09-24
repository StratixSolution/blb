import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { Hero } from "@/components/home/Hero";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { BrandStory } from "@/components/home/BrandStory";
import { PremixStrip } from "@/components/home/PremixStrip";
import { VideoQuote } from "@/components/home/VideoQuote";
import { Testimonials } from "@/components/home/Testimonials";
import { getFeaturedProducts, getProductsByCategory } from "@/lib/products";

export default async function HomePage() {
  const [featured, premixes] = await Promise.all([
    getFeaturedProducts(),
    getProductsByCategory("instant-premix"),
  ]);

  return (
    <>
      <Nav />
      <CartDrawer />
      <main>
        <Hero />
        <FeaturedProducts products={featured} />
        <BrandStory />
        <PremixStrip products={premixes} />
        <VideoQuote />
        <Testimonials />
      </main>
      <Footer />
    </>
  );
}
