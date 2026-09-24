const testimonials = [
  {
    text: "Best green coffee I've had. The flavour is clean, earthy, and incredibly fresh. You can tell it's roasted in small batches.",
    author: "Priya K.",
    location: "Bangalore",
  },
  {
    text: "Their hazelnut premix is my morning ritual now. Ready in under a minute and tastes better than café coffee.",
    author: "Arjun M.",
    location: "Whitefield",
  },
  {
    text: "Fast delivery and the beans are always freshly roasted. The Golden Crema makes perfect espresso at home.",
    author: "Sneha R.",
    location: "HSR Layout",
  },
];

export function Testimonials() {
  return (
    <section className="bg-[#EAD9C8] py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12 text-center">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#C9953C] mb-2">
            Reviews
          </p>
          <h2 className="font-serif text-4xl text-[#1A0E08]">What our regulars say.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-[#FAFAF8] p-8 border border-[#D4C4B0]">
              <div className="text-[#C9953C] text-sm tracking-wider mb-4">★★★★★</div>
              <p className="text-sm text-[#4A2512] leading-relaxed italic">&ldquo;{t.text}&rdquo;</p>
              <div className="mt-6 pt-4 border-t border-[#D4C4B0]">
                <p className="text-xs font-medium text-[#1A0E08]">{t.author}</p>
                <p className="text-xs text-[#8B5E3C]">{t.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
