import Image from "next/image";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";

export const metadata = {
  title: "About - Bean Leaf Brew",
  description: "The story behind Bean Leaf Brew — artisan coffee from Whitefield, Bengaluru.",
};

export default function AboutPage() {
  return (
    <>
      <Nav />
      <CartDrawer />
      <main className="min-h-screen bg-[#F7F0E6]">
        <section className="relative h-72 bg-[#1A0E08] flex items-end overflow-hidden">
          <Image
            src="/images/BLB-web-banner-1.webp"
            alt="Bean Leaf Brew"
            fill
            className="object-cover opacity-40"
          />
          <div className="relative z-10 max-w-7xl mx-auto px-6 pb-12 w-full">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#C9953C] mb-2">Our Story</p>
            <h1 className="font-serif text-3xl md:text-5xl text-[#F7F0E6]">About Us</h1>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="font-serif text-3xl text-[#1A0E08] mb-6">
                Born in Whitefield,<br/>Brewed with Purpose.
              </h2>
              <div className="space-y-4 text-sm text-[#4A2512] leading-relaxed">
                <p>
                  Bean Leaf Brew started as a passion project in a small roastery in Whitefield, Bengaluru.
                  We wanted to bring the quality of specialty coffee that you'd find in the best cafes directly
                  to your doorstep — without the café markup.
                </p>
                <p>
                  We source directly from award-winning estates in Coorg and Chikmagalur, Karnataka —
                  grown at elevations of 3,100 to 4,000 ft. Every batch is freshly profile-roasted
                  in-house using state-of-the-art technology, then packed immediately to lock in
                  the aroma and freshness.
                </p>
                <p>
                  No middlemen. No stale stock. Just coffee that's honest and alive.
                  Anytime. Anywhere.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="relative h-80 overflow-hidden">
                <Image
                  src="/images/DSC5452.webp"
                  alt="Our roastery"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { stat: "3,100 – 4,000 ft", label: "Estate Altitude" },
              { stat: "100%", label: "Freshly Roasted" },
              { stat: "Coorg & Chikmagalur", label: "Source Regions" },
            ].map(({ stat, label }) => (
              <div key={label} className="bg-[#EAD9C8] px-6 py-8">
                <p className="font-serif text-2xl text-[#1A0E08] mb-1">{stat}</p>
                <p className="text-xs uppercase tracking-widest text-[#8B5E3C]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
