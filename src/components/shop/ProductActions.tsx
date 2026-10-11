"use client";

import { useState } from "react";
import { ShoppingBag, Minus, Plus } from "lucide-react";
import { type Product } from "@/types";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { GROUND_COFFEE_CATEGORY } from "@/lib/productOptions";

interface Props {
  product: Product;
}

export function ProductActions({ product }: Props) {
  const [qty, setQty] = useState(1);
  const { addItem } = useCartStore();

  const isGroundCoffee = product.category === GROUND_COFFEE_CATEGORY;
  const weightOptions = isGroundCoffee ? product.weightOptions ?? [] : [];
  const equipmentOptions = isGroundCoffee ? product.brewingEquipmentOptions ?? [] : [];
  const hasWeight = weightOptions.length > 0;
  const hasEquipment = equipmentOptions.length > 0;

  const [selectedWeight, setSelectedWeight] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState("");

  const selectedWeightOption = weightOptions.find((w) => w.label === selectedWeight);

  // Required-selection gating: when options exist, both must be chosen.
  const needsWeight = hasWeight && !selectedWeight;
  const needsEquipment = hasEquipment && !selectedEquipment;
  const canAdd = !needsWeight && !needsEquipment;

  function handleAdd() {
    if (!canAdd) return;
    addItem(product, qty, {
      selectedWeight: hasWeight ? selectedWeight : undefined,
      selectedWeightPrice: selectedWeightOption?.price,
      selectedEquipment: hasEquipment ? selectedEquipment : undefined,
    });
  }

  const selectCls =
    "w-full border border-[#D4C4B0] bg-[#FAFAF8] text-[#1A0E08] text-sm px-4 py-3 focus:outline-none focus:border-[#8B5E3C] transition-colors";

  return (
    <div className="space-y-5">
      {(hasWeight || hasEquipment) && (
        <div className="space-y-4">
          {hasWeight && (
            <div>
              <label className="block text-xs uppercase tracking-widest text-[#8B5E3C] mb-1.5">
                Weight
              </label>
              <select
                value={selectedWeight}
                onChange={(e) => setSelectedWeight(e.target.value)}
                className={selectCls}
              >
                <option value="">Choose an option</option>
                {weightOptions.map((w) => (
                  <option key={w.label} value={w.label}>
                    {w.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {hasEquipment && (
            <div>
              <label className="block text-xs uppercase tracking-widest text-[#8B5E3C] mb-1.5">
                Brewing Equipment
              </label>
              <select
                value={selectedEquipment}
                onChange={(e) => setSelectedEquipment(e.target.value)}
                className={selectCls}
              >
                <option value="">Choose an option</option>
                {equipmentOptions.map((eq) => (
                  <option key={eq} value={eq}>
                    {eq}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedWeightOption && (
            <p className="text-xl font-medium text-[#1A0E08]">
              {formatPrice(selectedWeightOption.price)}
            </p>
          )}
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="flex items-center border border-[#D4C4B0]">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="w-10 h-11 flex items-center justify-center text-[#8B5E3C] hover:text-[#1A0E08] transition-colors"
            aria-label="Decrease quantity"
          >
            <Minus size={14} />
          </button>
          <span className="w-10 text-center text-sm font-medium text-[#1A0E08]">{qty}</span>
          <button
            onClick={() => setQty((q) => q + 1)}
            className="w-10 h-11 flex items-center justify-center text-[#8B5E3C] hover:text-[#1A0E08] transition-colors"
            aria-label="Increase quantity"
          >
            <Plus size={14} />
          </button>
        </div>

        <button
          onClick={handleAdd}
          disabled={!canAdd}
          className="flex-1 flex items-center justify-center gap-2 bg-[#1A0E08] text-[#F7F0E6] text-xs font-semibold uppercase tracking-widest py-3 px-6 hover:bg-[#4A2512] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingBag size={14} />
          Add to Cart
        </button>
      </div>

      {!canAdd && (
        <p className="text-xs text-[#8B5E3C]">
          Please select {needsWeight ? "a weight" : ""}
          {needsWeight && needsEquipment ? " and " : ""}
          {needsEquipment ? "brewing equipment" : ""} to continue.
        </p>
      )}
    </div>
  );
}
