import { db } from "@/db/client";
import { products } from "@/db/schema";
import Image from "next/image";
import { AddProductButton, EditProductButton, DeleteProductButton, ToggleStockButton } from "./ProductActions";

const categoryLabel: Record<string, string> = {
  "ground-coffee": "Ground Coffee",
  "whole-bean": "Whole Bean",
  "instant-premix": "Instant Premix",
};

export default async function ProductsPage() {
  const rows = await db.select().from(products);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-white text-2xl font-semibold">Products</h1>
          <p className="text-gray-500 text-xs mt-1">{rows.length} products</p>
        </div>
        <AddProductButton />
      </div>

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
                          <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">—</div>
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
                      {categoryLabel[product.category] ?? product.category}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-200">
                    ₹{product.price}
                    {product.regularPrice && (
                      <span className="ml-1 text-gray-500 line-through text-xs">₹{product.regularPrice}</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-gray-400">{product.weight ?? "—"}</td>
                  <td className="px-5 py-3">
                    <ToggleStockButton id={product.id} inStock={Boolean(product.inStock)} />
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded ${Boolean(product.featured) ? "bg-amber-900 text-amber-300" : "text-gray-600"}`}>
                      {Boolean(product.featured) ? "Featured" : "—"}
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
    </div>
  );
}
