// Category is now a dynamic slug referencing the `categories` table.
export type ProductCategory = string;

export interface WeightOption {
  label: string;
  price: number;
}

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
  // Admin-configured selectable options for ground coffee.
  weightOptions?: WeightOption[];
  brewingEquipmentOptions?: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  // Customer-selected options (ground coffee only).
  selectedWeight?: string;
  // Unit price for the chosen weight variant; overrides product.price when set.
  selectedWeightPrice?: number;
  selectedEquipment?: string;
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
