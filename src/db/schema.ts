import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, real } from "drizzle-orm/sqlite-core";

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
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

export const orderItems = sqliteTable("order_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id").notNull(),
  productName: text("product_name").notNull(),
  price: real("price").notNull(),
  quantity: integer("quantity").notNull(),
});

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
});

export const coupons = sqliteTable("coupons", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
  type: text("type", { enum: ["percentage", "fixed"] }).notNull().default("percentage"),
  amount: real("amount").notNull(),
  minOrderAmount: real("min_order_amount").notNull().default(0),
  maxUses: integer("max_uses"),
  usesCount: integer("uses_count").notNull().default(0),
  expiresAt: text("expires_at"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
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
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

export const orderNotes = sqliteTable("order_notes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: text("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  note: text("note").notNull(),
  type: text("type", { enum: ["internal", "customer"] }).notNull().default("internal"),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

export type Order = typeof orders.$inferSelect;
export type OrderNote = typeof orderNotes.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Coupon = typeof coupons.$inferSelect;
export type DbProduct = typeof products.$inferSelect;
