export function VideoQuote() {
  return (
    <section className="relative h-[360px] flex items-center justify-center overflow-hidden bg-[#0F0705]">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-40"
      >
        <source src="/videos/file-2.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-[#0F0705]/60" />

      <div className="relative z-10 text-center px-6">
        <p className="font-serif text-3xl md:text-5xl text-[#F7F0E6] italic leading-tight max-w-2xl mx-auto">
          &ldquo;The ritual of a perfect pour.&rdquo;
        </p>
        <p className="mt-4 text-[9px] uppercase tracking-[0.25em] text-[#C9953C]">
          Bean Leaf Brew
        </p>
      </div>
    </section>
  );
}
