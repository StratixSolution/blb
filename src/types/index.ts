// Category is now a dynamic slug referencing the `categories` table.
export type ProductCategory = string;

export interface Product {
  id: number;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  category: ProductCategory;
  // Resolved display label + field-visibility flags for the product's category.
  categoryLabel?: string;
  showWeight?: boolean;
  showRoast?: boolean;
  showBlend?: boolean;
  showNotes?: boolean;
  price: number;
  regularPrice?: number;
  images: string[];
  tags: string[];
  inStock: boolean;
  visible: boolean;
  weight?: string;
  notes?: string[];
  roast?: string;
  blend?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled";
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
    state: string;
  };
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: Date;
}
