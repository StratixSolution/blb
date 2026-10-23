"use client";

import Image from "next/image";
import partners from "@/data/partners.json";

export function PartnerMarquee() {
  // Duplicate the partner list to create a seamless loop
  const marqueePartners = [...partners, ...partners];

  return (
    <section className="bg-blb-white py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-10">
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gold mb-2">
            Our Partners
          </p>
          <h2 className="font-serif text-2xl md:text-4xl text-espresso">
            Trusted by businesses that serve better.
          </h2>
        </div>
      </div>

      <div className="relative overflow-hidden">
        {/* Fade masks for smooth edges */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-blb-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-blb-white to-transparent z-10 pointer-events-none" />

        {/* Marquee container */}
        <div className="relative w-full">
          <div className="flex items-center animate-marquee hover:pause-marquee w-max">
            {marqueePartners.map((partner, index) => (
              <div
                key={`${partner.name}-${index}`}
                className="flex-shrink-0 mx-8 md:mx-12"
              >
                <div className="relative w-32 h-16 md:w-48 md:h-24 flex items-center justify-center">
                  {partner.website ? (
                    <a
                      href={partner.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative w-full h-full flex items-center justify-center transition-opacity hover:opacity-80"
                      aria-label={`Visit ${partner.name} website`}
                    >
                      {partner.logo ? (
                        <Image
                          src={partner.logo}
                          alt={partner.name}
                          fill
                          className="object-contain"
                          sizes="(max-width: 768px) 128px, 192px"
                        />
                      ) : (
                        <span className="text-sm md:text-base font-serif text-roast text-center leading-tight">
                          {partner.name}
                        </span>
                      )}
                    </a>
                  ) : (
                    <>
                      {partner.logo ? (
                        <Image
                          src={partner.logo}
                          alt={partner.name}
                          fill
                          className="object-contain"
                          sizes="(max-width: 768px) 128px, 192px"
                        />
                      ) : (
                        <span className="text-sm md:text-base font-serif text-roast text-center leading-tight">
                          {partner.name}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
