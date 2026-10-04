import Link from "next/link";
import Image from "next/image";

const shopLinks = [
  { label: "Ground Coffee", href: "/shop?category=ground-coffee" },
  { label: "Whole Bean", href: "/shop?category=whole-bean" },
  { label: "Instant Premix", href: "/shop?category=instant-premix" },
];

const companyLinks = [
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function Footer() {
  return (
    <footer className="bg-[#1A0E08] text-[#F7F0E6]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <Image
              src="/images/BeanLeaf-Logo.png"
              alt="Bean Leaf Brew"
              width={140}
              height={42}
              style={{ height: "40px", width: "auto" }}
              className="mb-4"
            />
            <p className="text-sm text-[#F7F0E6]/60 leading-relaxed max-w-sm">
              Artisan coffee roasted in small batches in Whitefield, Bengaluru.
              We source directly from estates in Coorg and Chikmagalur.
            </p>
            <p className="text-xs text-[#F7F0E6]/40 mt-4">
              Anytime. Anywhere.
            </p>
          </div>

          <div>
            <h4 className="text-[10px] uppercase tracking-widest text-[#C9953C] mb-4">
              Shop
            </h4>
            <ul className="space-y-3">
              {shopLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-[#F7F0E6]/60 hover:text-[#F7F0E6] transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] uppercase tracking-widest text-[#C9953C] mb-4">
              Company
            </h4>
            <ul className="space-y-3">
              {companyLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-[#F7F0E6]/60 hover:text-[#F7F0E6] transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#4A2512]/40 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#F7F0E6]/30">
            © {new Date().getFullYear()} Bean Leaf Brew LLP. All rights reserved.
          </p>
          <p className="text-xs text-[#F7F0E6]/30">
            Whitefield, Bengaluru 560066 · +91 8123273344
          </p>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-[#F7F0E6]/30">
            Made with <span className="text-[#C9953C]">❤</span> by Stratix Solutions
          </p>
        </div>
      </div>
    </footer>
  );
}
