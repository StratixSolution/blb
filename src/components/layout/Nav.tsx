"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { cn } from "@/lib/utils";

const links = [
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { itemCount, openCart } = useCartStore();
  const pathname = usePathname();
  const count = itemCount();

  useEffect(() => {
    setMounted(true);
    const handler = () => setScrolled(window.scrollY > 60);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const isTransparent = pathname === "/" && !scrolled;

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isTransparent
            ? "bg-transparent"
            : "bg-[#1A0E08]/95 backdrop-blur-sm shadow-sm"
        )}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/images/BeanLeaf-Logo.png"
              alt="Bean Leaf Brew"
              width={160}
              height={48}
              style={{ height: "48px", width: "auto", objectFit: "contain" }}
              priority
            />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-[11px] uppercase tracking-widest text-[#F7F0E6]/80 hover:text-[#F7F0E6] transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={openCart}
              className="relative text-[#F7F0E6]/80 hover:text-[#F7F0E6] transition-colors"
              aria-label="Open cart"
            >
              <ShoppingBag size={20} />
              {mounted && count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#C9953C] text-[#1A0E08] text-[9px] font-semibold flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>

            <button
              className="md:hidden text-[#F7F0E6]/80 hover:text-[#F7F0E6] transition-colors"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden bg-[#1A0E08] border-t border-[#4A2512]/40 px-6 py-4 flex flex-col gap-4">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-[12px] uppercase tracking-widest text-[#F7F0E6]/80 hover:text-[#F7F0E6] transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </>
  );
}
