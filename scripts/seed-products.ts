/**
 * One-time seed: static products.ts → SQLite products table
 * Run: npx tsx scripts/seed-products.ts
 * Safe to re-run - skips products that already exist (by slug).
 */

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";
import { products } from "../src/db/schema";

const libsql = createClient({ url: process.env.TURSO_DATABASE_URL ?? "file:./local.db" });
const db = drizzle(libsql, { schema: { products } });

const seed = [
  {
    slug: "house-brew", name: "House Brew", category: "ground-coffee" as const,
    shortDescription: "South Indian filter blend with Caramel & Chocolate notes",
    description: "House Brew is a House blend of Roasted and Ground Coffee and Roasted Chicory to brew a rich and smooth cup of south Indian filter coffee. Coffee beans are sourced from award winning estates of Coorg & Chikmagalur regions of Karnataka and grown at altitudes of 3100-4000 ft. The beans are freshly profile roasted in a state-of-the-art coffee roaster, blended, ground & mixed with high quality roasted and ground chicory powder.",
    price: 304, regularPrice: null, weight: "250g",
    images: ["/images/2-3.webp", "/images/HB_01.webp", "/images/HB_02.webp"],
    tags: ["filter coffee", "chicory", "south indian"],
    notes: ["Caramel", "Chocolate"], roast: "Medium-Dark", blend: "Roasted Coffee (80%) - Chicory (20%)",
    inStock: true, featured: false,
  },
  {
    slug: "deja-brew", name: "Déjà Brew", category: "ground-coffee" as const,
    shortDescription: "100% Arabica single origin with Sweet & Citrus notes",
    description: "Déjà Brew is an Exotic single origin 100% Arabica coffee with an intense aroma and a fine sweetish flavour with citrus notes. Sourced from award winning estates of Coorg / Chikmagalur regions of Karnataka and grown at altitudes of 3500-4000 ft. The beans are freshly profile roasted in a state-of-the-art coffee roaster and immediately packed to preserve the aroma and freshness of coffee.",
    price: 387, regularPrice: null, weight: "250g",
    images: ["/images/1-3.webp", "/images/DB_Beans_01.webp"],
    tags: ["arabica", "single origin", "citrus"],
    notes: ["Sweet", "Citrus"], roast: "Medium", blend: "100% Pure Coffee",
    inStock: true, featured: true,
  },
  {
    slug: "morning-buzz", name: "Morning Buzz", category: "ground-coffee" as const,
    shortDescription: "Arabica & Robusta blend with Vanilla & Dark Chocolate notes",
    description: "Morning Buzz is a Unique blend of Arabica and Robusta Coffee beans with hints of Vanilla and Dark Chocolate notes. Sourced from award winning estates of Coorg / Chikmagalur regions of Karnataka and grown at altitudes of 3100-4000 ft. The beans are freshly profile roasted in a state-of-the-art coffee roaster and immediately packed to preserve the aroma and freshness of the coffee.",
    price: 360, regularPrice: null, weight: "250g",
    images: ["/images/3-3.webp", "/images/MB_Beans_01.webp"],
    tags: ["arabica", "robusta", "dark chocolate", "vanilla"],
    notes: ["Vanilla", "Dark Chocolate"], roast: "Medium-Dark", blend: "100% Pure Coffee",
    inStock: true, featured: true,
  },
  {
    slug: "golden-crema", name: "Golden Crema", category: "ground-coffee" as const,
    shortDescription: "Premium Arabica & Robusta blend with aromatic Caramel notes",
    description: "Golden Crema is an Exquisite blend of Arabica and Robusta Coffee beans to brew a rich and smooth cup of coffee with an aromatic Caramel and Chocolate notes. Sourced from award winning estates of Coorg & Chikmagalur regions of Karnataka and grown at altitudes of 3100-3700 ft. The beans are freshly profile roasted in a state-of-the-art coffee roaster and immediately packed to preserve the aroma and freshness of the coffee.",
    price: 360, regularPrice: null, weight: "250g",
    images: ["/images/4-2.webp", "/images/GC_Beans_01.webp"],
    tags: ["arabica", "robusta", "caramel"],
    notes: ["Caramel", "Chocolate"], roast: "Dark", blend: "100% Pure Coffee",
    inStock: true, featured: true,
  },
  {
    slug: "traditional-south", name: "Traditional South", category: "ground-coffee" as const,
    shortDescription: "Classic South Indian filter coffee - Coffee & Chicory blend",
    description: "Traditional South is Roasted and Ground Coffee Chicory blend crafted to deliver an authentic South Indian filter coffee experience. Sourced from award-winning estates in Coorg & Chikmagalur, Karnataka, our coffee is grown at elevations of 3,100-4,000 ft, ensuring rich flavors and superior quality.",
    price: 286, regularPrice: null, weight: "250g",
    images: ["/images/5-3.webp", "/images/traditional.webp"],
    tags: ["filter coffee", "chicory", "south indian", "traditional"],
    notes: ["Caramel", "Chocolate"], roast: "Medium-Dark", blend: "Coffee & Chicory",
    inStock: true, featured: false,
  },
  {
    slug: "whole-bean-morning-buzz", name: "Whole Bean Morning Buzz", category: "whole-bean" as const,
    shortDescription: "Whole bean Arabica & Robusta — grind fresh every morning",
    description: "The whole bean version of our bestselling Morning Buzz blend. Arabica and Robusta beans with hints of Vanilla and Dark Chocolate, sourced from award winning estates of Coorg / Chikmagalur. Grind fresh for maximum aroma and flavour.",
    price: 360, regularPrice: null, weight: "250g",
    images: ["/images/3-3.webp", "/images/MB_Beans_01.webp"],
    tags: ["whole bean", "arabica", "robusta", "vanilla", "dark chocolate"],
    notes: ["Vanilla", "Dark Chocolate"], roast: "Medium-Dark", blend: "100% Pure Coffee",
    inStock: true, featured: false,
  },
  {
    slug: "whole-bean-golden-crema", name: "Whole Bean Golden Crema", category: "whole-bean" as const,
    shortDescription: "Whole bean premium blend for a rich crema every time",
    description: "The whole bean version of our Golden Crema blend. Arabica and Robusta beans with Caramel and Chocolate notes, sourced from estates in Coorg & Chikmagalur, Karnataka. Perfect for espresso and moka pot.",
    price: 360, regularPrice: null, weight: "250g",
    images: ["/images/4-2.webp", "/images/GC_Beans_01.webp"],
    tags: ["whole bean", "arabica", "robusta", "caramel", "espresso"],
    notes: ["Caramel", "Chocolate"], roast: "Dark", blend: "100% Pure Coffee",
    inStock: true, featured: false,
  },
  {
    slug: "whole-bean-deja-brew", name: "Whole Bean Déjà Brew", category: "whole-bean" as const,
    shortDescription: "Single origin 100% Arabica whole bean — sweet & citrus",
    description: "The whole bean version of our exotic Déjà Brew. Single origin 100% Arabica from Coorg / Chikmagalur, grown at 3500-4000 ft. Sweet and citrus notes that shine brightest when freshly ground.",
    price: 387, regularPrice: null, weight: "250g",
    images: ["/images/1-3.webp", "/images/DB_Beans_01.webp"],
    tags: ["whole bean", "arabica", "single origin", "citrus"],
    notes: ["Sweet", "Citrus"], roast: "Medium", blend: "100% Pure Coffee",
    inStock: true, featured: false,
  },
  {
    slug: "black-tea-strawberry", name: "Black Tea Premix - Strawberry", category: "instant-premix" as const,
    shortDescription: "Fruit-infused black tea instant premix with natural strawberry",
    description: "Discover the uniquely crafted Black Tea Instant Fruit Infused Premix - Strawberry at Bean Leaf Brew. Sweetened with natural fruit sugar, low in glycemic index, and has no added preservatives, colours, or flavours.",
    price: 378, regularPrice: 440, weight: "10 sachets",
    images: ["/images/a32a5f_aef75315585a449495de509a3a23ff11mv2.webp", "/images/DSC5462.webp"],
    tags: ["instant", "tea", "strawberry", "antioxidants", "low gi"],
    notes: [], roast: null, blend: null,
    inStock: true, featured: false,
  },
  {
    slug: "black-tea-lemon", name: "Black Tea Premix - Classic Lemon", category: "instant-premix" as const,
    shortDescription: "Fruit-infused black tea with natural lemon — refreshing & healthy",
    description: "Discover the uniquely crafted Black Tea Fruit Infused Instant Premix Classic - Lemon at Bean Leaf Brew. No added preservatives, colors, or flavors, sweetened with natural fruit sugar, making it low in glycemic index.",
    price: 378, regularPrice: 440, weight: "10 sachets",
    images: ["/images/a32a5f_5b2ce5c04c6a4bb8833aeee47f1e6c53mv2.webp", "/images/DSC5452.webp"],
    tags: ["instant", "tea", "lemon", "vitamin c", "antioxidants"],
    notes: [], roast: null, blend: null,
    inStock: true, featured: false,
  },
  {
    slug: "black-coffee-cranberry-vanilla", name: "Black Coffee Premix - Cranberry Vanilla", category: "instant-premix" as const,
    shortDescription: "Coffee infused with cranberry & natural vanilla extract",
    description: "Discover the uniquely crafted Black Coffee Fruit Infused Instant Premix Cranberry - Vanilla at Bean Leaf Brew. Sweetened with natural fruit sugar and low in glycemic index.",
    price: 468, regularPrice: 540, weight: "10 sachets",
    images: ["/images/a32a5f_c64640210bee44db8ad9b0e68aad4c5fmv2.webp", "/images/DSC5468.webp"],
    tags: ["instant", "coffee", "cranberry", "vanilla", "antioxidants"],
    notes: [], roast: null, blend: null,
    inStock: true, featured: false,
  },
  {
    slug: "black-coffee-watermelon", name: "Black Coffee Premix - Watermelon", category: "instant-premix" as const,
    shortDescription: "Coffee meets watermelon in this unique fruit-infused premix",
    description: "Discover the uniquely crafted Black Coffee Fruit Infused Instant Premix - Watermelon at Bean Leaf Brew. Sweetened with natural fruit sugar, maintaining a low glycemic index.",
    price: 414, regularPrice: 480, weight: "10 sachets",
    images: ["/images/a32a5f_4376164d5f884049bb18df35e193e44dmv2.webp", "/images/DSC5471.webp"],
    tags: ["instant", "coffee", "watermelon", "lycopene", "antioxidants"],
    notes: [], roast: null, blend: null,
    inStock: true, featured: false,
  },
  {
    slug: "green-tea-orange-lemon", name: "Green Tea Premix - Orange Lemon", category: "instant-premix" as const,
    shortDescription: "Green tea with orange & lemon — antioxidants and vitamin C",
    description: "Experience the exceptional blend of Green Tea Fruit Infused Instant Premix Orange - Lemon, uniquely crafted for a deliciously refreshing taste. No added preservatives, colours, or flavours.",
    price: 378, regularPrice: 440, weight: "10 sachets",
    images: ["/images/a32a5f_b044ea54a12746189030217dd00b5a01mv2.webp", "/images/DSC5448.webp"],
    tags: ["instant", "green tea", "orange", "lemon", "catechins"],
    notes: [], roast: null, blend: null,
    inStock: true, featured: false,
  },
  {
    slug: "green-tea-pineapple", name: "Green Tea Premix - Pineapple", category: "instant-premix" as const,
    shortDescription: "Green tea with pineapple — bromelain & Vitamin C boost",
    description: "Experience the unique blend of Green Tea Fruit Infused Instant Premix Pineapple, exclusively at Bean Leaf Brew. Sweetened with natural fruit sugar, low in glycemic index.",
    price: 378, regularPrice: 440, weight: "10 sachets",
    images: ["/images/a32a5f_5f3446489bc845f499cd0904da7e03d8mv2.webp", "/images/DSC5458.webp"],
    tags: ["instant", "green tea", "pineapple", "bromelain", "vitamin c"],
    notes: [], roast: null, blend: null,
    inStock: true, featured: false,
  },
  {
    slug: "matcha-latte", name: "Matcha Latte Classic 3-in-1", category: "instant-premix" as const,
    shortDescription: "Classic matcha latte instant premix — rich, smooth & healthy",
    description: "Experience the exquisite blend of taste and wellness with Matcha Latte Classic 3-in-1 instant premix at Bean Leaf Brew. Easy to prepare whether at home, in the office, or on the go.",
    price: 378, regularPrice: 440, weight: "10 sachets",
    images: ["/images/a32a5f_b6149460f45447a5b871bb1e66f622e0mv2.webp", "/images/DSC5466.webp"],
    tags: ["instant", "matcha", "latte", "green tea", "catechins"],
    notes: [], roast: null, blend: null,
    inStock: true, featured: false,
  },
  {
    slug: "milk-tea-ginger", name: "Milk Tea 3-in-1 Ginger Infused", category: "instant-premix" as const,
    shortDescription: "Classic chai with natural ginger goodness",
    description: "Discover the uniquely crafted Milk Tea 3-in-1 Ginger Infused Instant Premix at Bean Leaf Brew. Easy to prepare, whether at home, in the office, or on the go.",
    price: 324, regularPrice: 390, weight: "10 sachets",
    images: ["/images/ginger.webp", "/images/DSC5476.webp"],
    tags: ["instant", "milk tea", "ginger", "chai", "traditional"],
    notes: [], roast: null, blend: null,
    inStock: true, featured: false,
  },
];

async function main() {
  let inserted = 0;
  let skipped = 0;

  for (const p of seed) {
    const existing = await db.select({ id: products.id }).from(products).where(eq(products.slug, p.slug)).limit(1);
    if (existing.length > 0) { skipped++; continue; }

    await db.insert(products).values({
      slug: p.slug,
      name: p.name,
      category: p.category,
      shortDescription: p.shortDescription,
      description: p.description,
      price: p.price,
      regularPrice: p.regularPrice ?? null,
      weight: p.weight ?? null,
      images: JSON.stringify(p.images),
      tags: JSON.stringify(p.tags),
      notes: JSON.stringify(p.notes),
      roast: p.roast ?? null,
      blend: p.blend ?? null,
      inStock: p.inStock,
      featured: p.featured,
    });
    inserted++;
  }

  console.log(`Done! Inserted: ${inserted}, Skipped: ${skipped}`);
  libsql.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
