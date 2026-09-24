import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { ContactForm } from "@/components/ContactForm";

export const metadata = {
  title: "Contact - Bean Leaf Brew",
};

export default function ContactPage() {
  return (
    <>
      <Nav />
      <CartDrawer />
      <main className="min-h-screen bg-[#F7F0E6] pt-20">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="mb-12">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#C9953C] mb-2">Get in Touch</p>
            <h1 className="font-serif text-3xl md:text-5xl text-[#1A0E08]">Contact Us</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-16">
            <div className="md:col-span-2">
              <div className="space-y-6 text-sm text-[#4A2512]">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#8B5E3C] mb-1">Address</p>
                  <p className="leading-relaxed">
                    Prime Square, Unit 303, 3rd Floor,<br/>
                    Whitefield Main Road,<br/>
                    Bengaluru Urban 560066, Karnataka
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#8B5E3C] mb-1">Phone</p>
                  <p>+91 8123273344</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#8B5E3C] mb-1">Orders & Support</p>
                  <p>hello@beanleafbrew.com</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#8B5E3C] mb-1">Hours</p>
                  <p>Monday – Saturday<br/>9:00 AM – 6:00 PM IST</p>
                </div>
              </div>
            </div>

            <div className="md:col-span-3">
              <ContactForm />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
