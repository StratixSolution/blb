"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type CartItem, type Product } from "@/types";

export interface AddItemOptions {
  selectedWeight?: string;
  selectedWeightPrice?: number;
  selectedEquipment?: string;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, quantity?: number, options?: AddItemOptions) => void;
  removeItem: (lineKey: string) => void;
  updateQuantity: (lineKey: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  total: () => number;
  itemCount: () => number;
}

/**
 * Unique identity for a cart line. The same product with different selected
 * weight / brewing equipment are distinct lines, so the key combines all three.
 */
export function lineKey(item: Pick<CartItem, "product" | "selectedWeight" | "selectedEquipment">): string {
  return `${item.product.id}|${item.selectedWeight ?? ""}|${item.selectedEquipment ?? ""}`;
}

/** Per-unit price for a line: the selected weight variant price if set, else base price. */
export function unitPrice(item: CartItem): number {
  return item.selectedWeightPrice ?? item.product.price;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, quantity = 1, options = {}) => {
        const newItem: CartItem = {
          product,
          quantity,
          selectedWeight: options.selectedWeight,
          selectedWeightPrice: options.selectedWeightPrice,
          selectedEquipment: options.selectedEquipment,
        };
        const key = lineKey(newItem);
        set((state) => {
          const existing = state.items.find((i) => lineKey(i) === key);
          if (existing) {
            return {
              items: state.items.map((i) =>
                lineKey(i) === key ? { ...i, quantity: i.quantity + quantity } : i
              ),
              isOpen: true,
            };
          }
          return { items: [...state.items, newItem], isOpen: true };
        });
      },

      removeItem: (key) => {
        set((state) => ({
          items: state.items.filter((i) => lineKey(i) !== key),
        }));
      },

      updateQuantity: (key, quantity) => {
        if (quantity < 1) {
          get().removeItem(key);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            lineKey(i) === key ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      total: () => {
        return get().items.reduce(
          (sum, item) => sum + unitPrice(item) * item.quantity,
          0
        );
      },

      itemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    { name: "blb-cart" }
  )
);
