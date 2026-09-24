"use client";

import Link from "next/link";

export function Hero() {
  return (
    <section className="relative h-screen min-h-[600px] flex items-end overflow-hidden bg-[#0F0705]">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-60"
        poster="/images/HB_01.webp"
      >
        <source src="/videos/file.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-b from-[#1A0E08]/20 via-transparent to-[#1A0E08]/85" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-20">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#C9953C] mb-3">
            Artisan Coffee · Whitefield, Bengaluru
          </p>
          <h1 className="font-serif text-5xl md:text-7xl text-[#F7F0E6] leading-tight mb-6 max-w-xl">
            Anywhere.
            <br />
            Anytime.
          </h1>
          <p className="text-[#F7F0E6]/70 text-sm md:text-base max-w-sm mb-8 leading-relaxed">
            Small-batch specialty coffee roasted in-house and shipped fresh to your doorstep.
          </p>
          <div className="flex gap-4">
            <Link
              href="/shop"
              className="inline-block bg-[#C9953C] text-[#1A0E08] text-xs font-semibold uppercase tracking-widest px-7 py-3.5 hover:bg-[#B8842B] transition-colors"
            >
              Shop Now
            </Link>
            <Link
              href="/about"
              className="inline-block border border-[#F7F0E6]/40 text-[#F7F0E6]/80 text-xs uppercase tracking-widest px-7 py-3.5 hover:border-[#F7F0E6]/80 hover:text-[#F7F0E6] transition-colors"
            >
              Our Story
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1">
        <span className="text-[9px] uppercase tracking-[0.2em] text-[#F7F0E6]/40">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-[#F7F0E6]/30 to-transparent" />
      </div>
    </section>
  );
}
