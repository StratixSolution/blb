// Shared helpers + types for ground-coffee selectable options
// (Weight variants + Brewing Equipment).
//
// Weight variants are admin-configured per product as {label, price} pairs.
// The selected variant's price overrides the product's base price.
// Brewing equipment is an admin-configured list of plain strings (no price impact).
//
// These options are only meaningful for the "ground-coffee" category.

import { formatPrice } from "./utils";

export const GROUND_COFFEE_CATEGORY = "ground-coffee";

// Canonical catalog of brewing-equipment options a ground-coffee product can
// offer. Admins pick a subset of these; by default all are selected.
export const BREWING_EQUIPMENT_CATALOG = [
  "French Press",
  "Coffee Filter",
  "Aeropress",
  "Pour Over",
  "Espresso",
  "Moka Pot",
  "Turkish",
  "Cold Brew",
  "Chemex",
  "Drip",
  "Percolator",
  "Channi",
] as const;

export interface WeightOption {
  label: string;
  price: number;
}

/** Safely parse a JSON string into a WeightOption[]. Invalid data yields []. */
export function parseWeightOptions(raw: string | null | undefined): WeightOption[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (o): o is WeightOption =>
          o != null &&
          typeof o.label === "string" &&
          o.label.trim() !== "" &&
          typeof o.price === "number" &&
          Number.isFinite(o.price) &&
          o.price >= 0
      )
      .map((o) => ({ label: o.label.trim(), price: o.price }));
  } catch {
    return [];
  }
}

/** Safely parse a JSON string into a string[] of brewing-equipment options. */
export function parseEquipmentOptions(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((s): s is string => typeof s === "string" && s.trim() !== "")
      .map((s) => s.trim());
  } catch {
    return [];
  }
}

/**
 * Display price for a product given its base price and weight options.
 * - No weight options: just the base price.
 * - One weight option: that single price.
 * - Multiple weight options: a range "₹min – ₹max" (collapses to one value
 *   when all variant prices are equal).
 */
export function formatPriceDisplay(basePrice: number, weightOptions: WeightOption[]): string {
  if (weightOptions.length === 0) return formatPrice(basePrice);
  const prices = weightOptions.map((o) => o.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (min === max) return formatPrice(min);
  return `${formatPrice(min)} – ${formatPrice(max)}`;
}

/** Whether a product requires option selection before it can be added to cart. */
export function requiresOptionSelection(
  category: string,
  weightOptions: WeightOption[],
  equipmentOptions: string[]
): boolean {
  return (
    category === GROUND_COFFEE_CATEGORY &&
    (weightOptions.length > 0 || equipmentOptions.length > 0)
  );
}

export interface ResolvedLineOptions {
  unitPrice: number;
  selectedWeight: string | null;
  brewingEquipment: string | null;
}

export interface ResolveLineError {
  error: string;
}

/**
 * Server-side authoritative resolution of a cart line's options and price.
 *
 * For ground coffee with configured options, both selections are required and
 * validated against the product's stored options; the weight variant's price
 * is used as the unit price (client-sent prices are ignored). For all other
 * products, options are ignored and the base price is used.
 *
 * `productRow` is the raw DB row (snake_case JSON columns).
 */
export function resolveLineOptions(
  productRow: {
    category: string;
    name: string;
    price: number;
    weightOptions?: string | null;
    brewingEquipmentOptions?: string | null;
  },
  selected: { selectedWeight?: string | null; selectedEquipment?: string | null }
): ResolvedLineOptions | ResolveLineError {
  const isGroundCoffee = productRow.category === GROUND_COFFEE_CATEGORY;
  if (!isGroundCoffee) {
    return { unitPrice: productRow.price, selectedWeight: null, brewingEquipment: null };
  }

  const weightOptions = parseWeightOptions(productRow.weightOptions);
  const storedEquipment = parseEquipmentOptions(productRow.brewingEquipmentOptions);
  // Default to the full catalog when none is configured (matches the storefront).
  const equipmentOptions = storedEquipment.length > 0 ? storedEquipment : [...BREWING_EQUIPMENT_CATALOG];

  let unitPrice = productRow.price;
  let selectedWeight: string | null = null;
  let brewingEquipment: string | null = null;

  if (weightOptions.length > 0) {
    const match = selected.selectedWeight
      ? weightOptions.find((w) => w.label === selected.selectedWeight)
      : undefined;
    if (!match) {
      return { error: `Please select a valid weight for ${productRow.name}` };
    }
    unitPrice = match.price;
    selectedWeight = match.label;
  }

  if (equipmentOptions.length > 0) {
    const match = selected.selectedEquipment
      ? equipmentOptions.find((e) => e === selected.selectedEquipment)
      : undefined;
    if (!match) {
      return { error: `Please select valid brewing equipment for ${productRow.name}` };
    }
    brewingEquipment = match;
  }

  return { unitPrice, selectedWeight, brewingEquipment };
}
