import Link from "next/link";
import Image from "next/image";

export function BrandStory() {
  return (
    <section className="bg-[#1A0E08] py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="relative h-96 md:h-[480px] overflow-hidden">
              <Image
                src="/images/Hero-Image.webp"
                alt="Bean Leaf Brew barista"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-[#C9953C]/10 border border-[#C9953C]/20" />
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#C9953C] mb-4">
              Our Story
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-[#F7F0E6] leading-tight mb-6">
              Born in Whitefield,
              <br />
              Brewed with Purpose.
            </h2>
            <p className="text-[#F7F0E6]/60 text-sm leading-relaxed mb-4">
              We source directly from award-winning estates in Coorg and Chikmagalur,
              Karnataka — grown at elevations of 3,100 to 4,000 ft. Every batch is
              freshly profile-roasted in-house using state-of-the-art technology.
            </p>
            <p className="text-[#F7F0E6]/60 text-sm leading-relaxed mb-8">
              No middlemen. No stale stock. Just coffee that&apos;s honest and alive —
              packed immediately after roasting to lock in the aroma and freshness
              you deserve.
            </p>
            <Link
              href="/about"
              className="text-xs uppercase tracking-widest text-[#C9953C] border-b border-[#C9953C] pb-0.5 hover:opacity-80 transition-opacity"
            >
              Read our story →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
