import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, real, index } from "drizzle-orm/sqlite-core";

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  paymentId: text("payment_id").notNull(),
  status: text("status", { enum: ["pending", "processing", "shipped", "delivered", "cancelled"] })
    .notNull()
    .default("processing"),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull().default(""),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull().default(""),
  pincode: text("pincode").notNull(),
  total: real("total").notNull(),
  discount: real("discount").notNull().default(0),
  couponCode: text("coupon_code"),
  trackingRef: text("tracking_ref"),
  trackingVendor: text("tracking_vendor"),
  invoiceNumber: text("invoice_number"),
  orderNumber: text("order_number"),
  sourceType: text("source_type"),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
}, (t) => ({
  createdAtIdx: index("idx_orders_created_at").on(t.createdAt),
  statusIdx: index("idx_orders_status").on(t.status),
  invoiceNumberIdx: index("idx_orders_invoice_number").on(t.invoiceNumber),
  orderNumberIdx: index("idx_orders_order_number").on(t.orderNumber),
}));

export const orderItems = sqliteTable("order_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id").notNull(),
  productName: text("product_name").notNull(),
  price: real("price").notNull(),
  quantity: integer("quantity").notNull(),
}, (t) => ({
  orderIdIdx: index("idx_order_items_order_id").on(t.orderId),
}));

export const customers = sqliteTable("customers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull().default(""),
  address: text("address").notNull().default(""),
  city: text("city").notNull().default(""),
  state: text("state").notNull().default(""),
  pincode: text("pincode").notNull().default(""),
  orderCount: integer("order_count").notNull().default(1),
  totalSpend: real("total_spend").notNull().default(0),
  lastOrderAt: text("last_order_at"),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
}, (t) => ({
  lastOrderAtIdx: index("idx_customers_last_order_at").on(t.lastOrderAt),
}));

export const coupons = sqliteTable("coupons", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
  type: text("type", { enum: ["percentage", "fixed", "flat_total"] }).notNull().default("percentage"),
  amount: real("amount").notNull(),
  minOrderAmount: real("min_order_amount").notNull().default(0),
  maxUses: integer("max_uses"),
  usesCount: integer("uses_count").notNull().default(0),
  expiresAt: text("expires_at"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  referencedTo: text("referenced_to"),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  shortDescription: text("short_description").notNull().default(""),
  description: text("description").notNull().default(""),
  category: text("category", { enum: ["ground-coffee", "whole-bean", "instant-premix"] }).notNull(),
  price: real("price").notNull(),
  regularPrice: real("regular_price"),
  images: text("images").notNull().default("[]"),
  tags: text("tags").notNull().default("[]"),
  inStock: integer("in_stock", { mode: "boolean" }).notNull().default(true),
  weight: text("weight"),
  notes: text("notes").notNull().default("[]"),
  roast: text("roast"),
  blend: text("blend"),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  ean: text("ean"),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
}, (t) => ({
  categoryIdx: index("idx_products_category").on(t.category),
  featuredIdx: index("idx_products_featured").on(t.featured),
}));

export const orderNotes = sqliteTable("order_notes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: text("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  note: text("note").notNull(),
  type: text("type", { enum: ["internal", "customer"] }).notNull().default("internal"),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
}, (t) => ({
  orderIdIdx: index("idx_order_notes_order_id").on(t.orderId),
}));

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  label: text("label").notNull().default(""),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

// Single-admin credential store. There is normally exactly one row (id = 1).
// If no row exists / password_hash is null, login falls back to the ADMIN_PASSWORD env var.
export const adminUsers = sqliteTable("admin_users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email"),
  passwordHash: text("password_hash"),
  resetTokenHash: text("reset_token_hash"),
  resetTokenExpiresAt: text("reset_token_expires_at"),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

export const pendingOrders = sqliteTable("pending_orders", {
  id: text("id").primaryKey(),
  amountPaise: integer("amount_paise").notNull(),
  discount: real("discount").notNull().default(0),
  couponCode: text("coupon_code"),
  itemsJson: text("items_json").notNull(),
  customerJson: text("customer_json"),
  attributionJson: text("attribution_json"),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

export type Setting = typeof settings.$inferSelect;
export type AdminUser = typeof adminUsers.$inferSelect;
export type PendingOrder = typeof pendingOrders.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderNote = typeof orderNotes.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Coupon = typeof coupons.$inferSelect;
export type DbProduct = typeof products.$inferSelect;
