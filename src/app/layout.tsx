import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { UtmTracker } from "@/components/UtmTracker";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bean Leaf Brew - Artisan Coffee, Bengaluru",
  description:
    "Specialty coffee roasted in small batches in Whitefield, Bengaluru. Shop single-origin beans, ground blends, and instant premix.",
  keywords: ["coffee", "specialty coffee", "Bengaluru", "artisan", "instant premix"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" as="image" href="/images/HB_01.webp" />
      </head>
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
        <UtmTracker />
        {children}
        <WhatsAppButton />
      </body>
    </html>
  );
}
