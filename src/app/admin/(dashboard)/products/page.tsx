import { db } from "@/db/client";
import { products } from "@/db/schema";
import { and, or, like, eq } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { AddProductButton, EditProductButton, DeleteProductButton, ToggleStockButton } from "./ProductActions";
import { SearchInput } from "../_components/SearchInput";

const CATEGORY_TABS = [
  { key: "all",             label: "All" },
  { key: "ground-coffee",   label: "Ground Coffee" },
  { key: "whole-bean",      label: "Whole Bean" },
  { key: "instant-premix",  label: "Instant Premix" },
] as const;

type CategoryKey = (typeof CATEGORY_TABS)[number]["key"];

const STOCK_OPTIONS = [
  { key: "all",    label: "All Stock" },
  { key: "in",     label: "In Stock" },
  { key: "out",    label: "Out of Stock" },
] as const;

type StockKey = (typeof STOCK_OPTIONS)[number]["key"];

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; stock?: string }>;
}) {
  const { q, category: categoryParam, stock: stockParam } = await searchParams;

  const activeCategory: CategoryKey =
    CATEGORY_TABS.find((t) => t.key === categoryParam)?.key ?? "all";
  const activeStock: StockKey =
    STOCK_OPTIONS.find((t) => t.key === stockParam)?.key ?? "all";
  const search = q?.trim() || undefined;

  const categoryFilter =
    activeCategory !== "all"
      ? eq(products.category, activeCategory as "ground-coffee" | "whole-bean" | "instant-premix")
      : undefined;
  const stockFilter =
    activeStock === "in"  ? eq(products.inStock, true)  :
    activeStock === "out" ? eq(products.inStock, false) :
    undefined;
  const searchFilter = search
    ? or(like(products.name, `%${search}%`), like(products.slug, `%${search}%`))
    : undefined;

  const rows = await db
    .select()
    .from(products)
    .where(and(categoryFilter, stockFilter, searchFilter));

  // Counts per category (ignoring search/stock for stable tab numbers)
  const allRows = await db.select({ category: products.category }).from(products);
  const categoryCount = Object.fromEntries(
    CATEGORY_TABS.filter((t) => t.key !== "all").map((t) => [
      t.key,
      allRows.filter((r) => r.category === t.key).length,
    ])
  );

  // baseParams for SearchInput (preserves category + stock, not q or page)
  const baseParamsForSearch = new URLSearchParams();
  if (activeCategory !== "all") baseParamsForSearch.set("category", activeCategory);
  if (activeStock !== "all") baseParamsForSearch.set("stock", activeStock);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-2xl font-semibold">Products</h1>
          <p className="text-gray-500 text-xs mt-1">{rows.length} product{rows.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-2">
          <SearchInput
            placeholder="Search products…"
            defaultValue={search}
            pathname="/admin/products"
            baseParams={baseParamsForSearch.toString()}
          />
          <AddProductButton />
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1 border-b border-gray-800">
          {CATEGORY_TABS.map((tab) => {
            const count = tab.key === "all" ? allRows.length : (categoryCount[tab.key] ?? 0);
            const isActive = tab.key === activeCategory;
            const tabHref = `/admin/products?category=${tab.key}${search ? `&q=${encodeURIComponent(search)}` : ""}${activeStock !== "all" ? `&stock=${activeStock}` : ""}`;
            return (
              <Link
                key={tab.key}
                href={tabHref}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  isActive
                    ? "border-amber-500 text-white"
                    : "border-transparent text-gray-400 hover:text-gray-200"
                }`}
              >
                {tab.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                  isActive ? "bg-gray-700 text-gray-200" : "bg-gray-800 text-gray-500"
                }`}>
                  {count}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-1">
          {STOCK_OPTIONS.map((opt) => {
            const isActive = opt.key === activeStock;
            const href = `/admin/products?stock=${opt.key}${activeCategory !== "all" ? `&category=${activeCategory}` : ""}${search ? `&q=${encodeURIComponent(search)}` : ""}`;
            return (
              <Link
                key={opt.key}
                href={href}
                className={`text-xs px-3 py-1.5 rounded border transition-colors ${
                  isActive
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-transparent border-gray-700 text-gray-500 hover:text-gray-300"
                }`}
              >
                {opt.label}
              </Link>
            );
          })}
        </div>
      </div>

      {search && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-gray-400 text-xs">
            {rows.length} result{rows.length !== 1 ? "s" : ""} for &ldquo;{search}&rdquo;
          </span>
          <Link
            href={`/admin/products${activeCategory !== "all" ? `?category=${activeCategory}` : ""}${activeStock !== "all" ? `${activeCategory !== "all" ? "&" : "?"}stock=${activeStock}` : ""}`}
            className="text-amber-500 hover:text-amber-400 text-xs transition-colors"
          >
            Clear
          </Link>
        </div>
      )}

      {rows.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded p-12 text-center">
          <p className="text-gray-500 text-sm">
            {search ? `No products matching "${search}"` : "No products found."}
          </p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Product</th>
                <th className="text-left text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Category</th>
                <th className="text-left text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Price</th>
                <th className="text-left text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Weight</th>
                <th className="text-left text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Stock</th>
                <th className="text-left text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Featured</th>
                <th className="text-left text-gray-400 text-xs uppercase tracking-wider px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((product) => {
                const images = JSON.parse(product.images || "[]") as string[];
                return (
                  <tr key={product.id} className="border-b border-gray-800 hover:bg-gray-800/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-800 overflow-hidden rounded flex-shrink-0">
                          {images[0] ? (
                            <Image src={images[0]} alt={product.name} width={40} height={40} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">-</div>
                          )}
                        </div>
                        <div>
                          <p className="text-gray-200 font-medium">{product.name}</p>
                          <p className="text-gray-500 text-xs">/{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded">
                        {CATEGORY_TABS.find((t) => t.key === product.category)?.label ?? product.category}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-200">
                      ₹{product.price}
                      {product.regularPrice && (
                        <span className="ml-1 text-gray-500 line-through text-xs">₹{product.regularPrice}</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-400">{product.weight ?? "-"}</td>
                    <td className="px-5 py-3">
                      <ToggleStockButton id={product.id} inStock={Boolean(product.inStock)} />
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded ${Boolean(product.featured) ? "bg-amber-900 text-amber-300" : "text-gray-600"}`}>
                        {Boolean(product.featured) ? "Featured" : "-"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <EditProductButton product={product} />
                        <DeleteProductButton id={product.id} name={product.name} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
