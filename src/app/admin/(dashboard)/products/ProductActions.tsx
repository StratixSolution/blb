"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface DbProduct {
  id: number;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  category: string;
  price: number;
  regularPrice: number | null;
  images: string;
  tags: string;
  notes: string;
  weight: string | null;
  roast: string | null;
  blend: string | null;
  inStock: number | boolean;
  featured: number | boolean;
  visible: number | boolean;
  ean: string | null;
}

interface ProductFormData {
  name: string;
  slug: string;
  category: string;
  price: string;
  regularPrice: string;
  shortDescription: string;
  description: string;
  weight: string;
  roast: string;
  blend: string;
  ean: string;
  notes: string;
  tags: string;
  inStock: boolean;
  featured: boolean;
  visible: boolean;
  images: string[];
}

const EMPTY_FORM: ProductFormData = {
  name: "", slug: "", category: "ground-coffee", price: "", regularPrice: "",
  shortDescription: "", description: "", weight: "", roast: "", blend: "", ean: "",
  notes: "", tags: "", inStock: true, featured: false, visible: true, images: [],
};

function toForm(p: DbProduct): ProductFormData {
  return {
    name: p.name, slug: p.slug, category: p.category,
    price: String(p.price), regularPrice: p.regularPrice ? String(p.regularPrice) : "",
    shortDescription: p.shortDescription, description: p.description,
    weight: p.weight ?? "", roast: p.roast ?? "", blend: p.blend ?? "", ean: p.ean ?? "",
    notes: (JSON.parse(p.notes || "[]") as string[]).join(", "),
    tags: (JSON.parse(p.tags || "[]") as string[]).join(", "),
    inStock: Boolean(p.inStock), featured: Boolean(p.featured), visible: Boolean(p.visible),
    images: JSON.parse(p.images || "[]") as string[],
  };
}

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function splitComma(s: string) {
  return s.split(",").map((x) => x.trim()).filter(Boolean);
}

// ── Image Upload Area ─────────────────────────────────────────────────────────

function ImageUploader({ images, onChange }: { images: string[]; onChange: (imgs: string[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError("");
    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      try {
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        if (res.ok) {
          const data = await res.json();
          newUrls.push(data.url);
        } else {
          const data = await res.json().catch(() => ({}));
          setUploadError(data.error ?? "Upload failed.");
        }
      } catch {
        setUploadError("Upload failed. Check your connection and try again.");
      }
    }
    if (newUrls.length) onChange([...images, ...newUrls]);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function remove(idx: number) {
    onChange(images.filter((_, i) => i !== idx));
  }

  function move(from: number, to: number) {
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {images.map((url, i) => (
          <div key={url + i} className="relative w-16 h-16 group">
            <Image src={url} alt="" fill className="object-cover rounded border border-gray-700" sizes="64px" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 rounded transition-opacity">
              {i > 0 && (
                <button type="button" onClick={() => move(i, i - 1)} className="text-white text-xs px-1 hover:text-amber-400" title="Move left">←</button>
              )}
              <button type="button" onClick={() => remove(i)} className="text-red-400 text-xs hover:text-red-300" title="Remove">✕</button>
              {i < images.length - 1 && (
                <button type="button" onClick={() => move(i, i + 1)} className="text-white text-xs px-1 hover:text-amber-400" title="Move right">→</button>
              )}
            </div>
            {i === 0 && (
              <span className="absolute bottom-0 left-0 right-0 text-center text-[9px] bg-amber-600 text-white rounded-b">main</span>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-16 h-16 border border-dashed border-gray-600 rounded flex flex-col items-center justify-center text-gray-400 hover:border-amber-500 hover:text-amber-400 transition-colors text-xs disabled:opacity-50"
        >
          {uploading ? "..." : <><span className="text-xl leading-none">+</span><span>upload</span></>}
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {uploadError && <p className="text-red-400 text-xs mb-1">{uploadError}</p>}
      <p className="text-gray-500 text-xs">First image is the main product image. Drag order with ← → arrows.</p>
    </div>
  );
}

// ── Product Form Modal ────────────────────────────────────────────────────────

function ProductModal({
  initial, onClose, editId,
}: {
  initial: ProductFormData;
  onClose: () => void;
  editId?: number;
}) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormData>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof ProductFormData>(field: K, value: ProductFormData[K]) {
    setForm((f) => {
      const next = { ...f, [field]: value };
      if (field === "name" && !editId) next.slug = slugify(value as string);
      return next;
    });
  }

  async function save() {
    if (!form.name || !form.price) { setError("Name and price are required."); return; }
    setSaving(true);
    setError("");

    const payload = {
      ...form,
      price: Number(form.price),
      regularPrice: form.regularPrice ? Number(form.regularPrice) : null,
      notes: splitComma(form.notes),
      tags: splitComma(form.tags),
      ean: form.ean.trim() || null,
    };

    const url = editId ? `/api/admin/products/${editId}` : "/api/admin/products";
    const method = editId ? "PATCH" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });

    if (res.ok) {
      router.refresh();
      onClose();
    } else {
      const data = await res.json();
      setError(data.error ?? "Failed to save.");
    }
    setSaving(false);
  }

  const inputCls = "w-full bg-gray-800 border border-gray-700 text-gray-200 text-sm px-3 py-2 rounded focus:outline-none focus:border-amber-500";
  const labelCls = "block text-gray-400 text-xs uppercase tracking-wider mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-gray-900 border border-gray-700 rounded w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="text-white font-semibold">{editId ? "Edit Product" : "New Product"}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white">✕</button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Name *</label>
              <input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Slug</label>
              <input className={inputCls} value={form.slug} onChange={(e) => set("slug", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Category *</label>
              <select className={inputCls} value={form.category} onChange={(e) => set("category", e.target.value)}>
                <option value="ground-coffee">Ground Coffee</option>
                <option value="whole-bean">Whole Bean</option>
                <option value="instant-premix">Instant Premix</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Price (₹) *</label>
              <input className={inputCls} type="number" value={form.price} onChange={(e) => set("price", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Regular Price (₹)</label>
              <input className={inputCls} type="number" value={form.regularPrice} onChange={(e) => set("regularPrice", e.target.value)} placeholder="optional" />
            </div>
          </div>

          <div>
            <label className={labelCls}>Short Description</label>
            <input className={inputCls} value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} />
          </div>

          <div>
            <label className={labelCls}>Full Description</label>
            <textarea className={inputCls + " resize-none"} rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} />
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className={labelCls}>Weight</label>
              <input className={inputCls} value={form.weight} onChange={(e) => set("weight", e.target.value)} placeholder="e.g. 250g" />
            </div>
            <div>
              <label className={labelCls}>Roast</label>
              <input className={inputCls} value={form.roast} onChange={(e) => set("roast", e.target.value)} placeholder="e.g. Medium-Dark" />
            </div>
            <div>
              <label className={labelCls}>Blend</label>
              <input className={inputCls} value={form.blend} onChange={(e) => set("blend", e.target.value)} placeholder="e.g. 100% Pure Coffee" />
            </div>
            <div>
              <label className={labelCls}>EAN Barcode</label>
              <input className={inputCls} value={form.ean} onChange={(e) => set("ean", e.target.value)} placeholder="e.g. 0745604911184" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Tasting Notes (comma-separated)</label>
              <input className={inputCls} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Caramel, Chocolate" />
            </div>
            <div>
              <label className={labelCls}>Tags (comma-separated)</label>
              <input className={inputCls} value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="arabica, filter coffee" />
            </div>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.inStock} onChange={(e) => set("inStock", e.target.checked)} className="w-4 h-4 rounded accent-amber-500" />
              <span className="text-gray-300 text-sm">In Stock</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="w-4 h-4 rounded accent-amber-500" />
              <span className="text-gray-300 text-sm">Featured on Homepage</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.visible} onChange={(e) => set("visible", e.target.checked)} className="w-4 h-4 rounded accent-amber-500" />
              <span className="text-gray-300 text-sm">Show on Site</span>
            </label>
          </div>
          {!form.visible && (
            <p className="text-amber-400/80 text-xs -mt-2">This product is hidden and will not be visible on the site.</p>
          )}

          <div>
            <label className={labelCls}>Product Images</label>
            <ImageUploader images={form.images} onChange={(imgs) => set("images", imgs)} />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-800">
          <button onClick={onClose} className="text-sm text-gray-400 hover:text-white px-4 py-2">Cancel</button>
          <button
            onClick={save}
            disabled={saving}
            className="bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium px-5 py-2 rounded disabled:opacity-60"
          >
            {saving ? "Saving..." : editId ? "Save Changes" : "Create Product"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Button ─────────────────────────────────────────────────────────────

export function DeleteProductButton({ id, name }: { id: number; name: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  async function doDelete() {
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    router.refresh();
  }

  if (confirming) {
    return (
      <span className="flex items-center gap-1 text-xs">
        <span className="text-gray-400">Delete &quot;{name}&quot;?</span>
        <button onClick={doDelete} className="text-red-400 hover:text-red-300 underline">Yes</button>
        <button onClick={() => setConfirming(false)} className="text-gray-500 hover:text-gray-300 underline ml-1">No</button>
      </span>
    );
  }
  return (
    <button onClick={() => setConfirming(true)} className="text-red-500 hover:text-red-300 text-xs">Delete</button>
  );
}

// ── Toggle Stock ──────────────────────────────────────────────────────────────

export function ToggleStockButton({ id, inStock }: { id: number; inStock: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inStock: !inStock }),
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <button onClick={toggle} disabled={loading} className={`text-xs px-2 py-0.5 rounded font-medium transition-opacity disabled:opacity-50 ${inStock ? "bg-green-900 text-green-300 hover:bg-green-800" : "bg-red-900 text-red-300 hover:bg-red-800"}`}>
      {loading ? "..." : inStock ? "In Stock" : "Out of Stock"}
    </button>
  );
}

// ── Toggle Visibility ─────────────────────────────────────────────────────────

export function ToggleVisibilityButton({ id, visible }: { id: number; visible: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visible: !visible }),
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <button onClick={toggle} disabled={loading} className={`text-xs px-2 py-0.5 rounded font-medium transition-opacity disabled:opacity-50 ${visible ? "bg-sky-900 text-sky-300 hover:bg-sky-800" : "bg-gray-700 text-gray-400 hover:bg-gray-600"}`}>
      {loading ? "..." : visible ? "Shown" : "Hidden"}
    </button>
  );
}

// ── Add / Edit Buttons ────────────────────────────────────────────────────────

export function AddProductButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded transition-colors">
        + Add Product
      </button>
      {open && <ProductModal initial={EMPTY_FORM} onClose={() => setOpen(false)} />}
    </>
  );
}

export function EditProductButton({ product }: { product: DbProduct }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="text-amber-400 hover:text-amber-300 text-xs">Edit</button>
      {open && <ProductModal initial={toForm(product)} editId={product.id} onClose={() => setOpen(false)} />}
    </>
  );
}
