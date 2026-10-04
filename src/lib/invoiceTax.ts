import { isIntraState } from "./indiaLocations";

export interface TaxLineInput {
  idx: number;
  name: string;
  weight: string;
  ean: string;
  qty: number;
  mrp: number;
}

export interface TaxLine extends TaxLineInput {
  basicRate: number;
  basicTotal: number;
  sgstRate: number;
  cgstRate: number;
  igstRate: number;
  sgstTotal: number;
  cgstTotal: number;
  igstTotal: number;
}

export interface InvoiceTax {
  intraState: boolean;
  // Effective per-item rates applied (percent)
  sgstRate: number;
  cgstRate: number;
  igstRate: number;
  lines: TaxLine[];
  totalBasic: number;
  totalSgst: number;
  totalCgst: number;
  totalIgst: number;
  totalTax: number;
}

/**
 * Computes GST breakdown for an order based on the customer's state.
 *
 * MRP is treated as tax-inclusive, so the basic (taxable) rate is back-calculated.
 * - Intra-state (customer in seller's state, e.g. Karnataka): CGST + SGST applied.
 * - Inter-state: IGST applied.
 *
 * The combined effective tax rate used for the back-calculation is the same in both
 * cases (igstRate === cgstRate + sgstRate), which keeps the taxable value identical
 * regardless of whether the split is CGST/SGST or IGST.
 */
export function computeInvoiceTax(
  items: TaxLineInput[],
  settings: Record<string, string>,
  customerState: string | null | undefined
): InvoiceTax {
  const igstRate = parseFloat(settings.igst_rate ?? "5");
  const cgstRate = parseFloat(settings.cgst_rate ?? "2.5");
  const sgstRate = parseFloat(settings.sgst_rate ?? "2.5");

  const intraState = isIntraState(customerState);

  // Combined rate used to back out the taxable value from the (tax-inclusive) MRP.
  const combinedRate = intraState ? cgstRate + sgstRate : igstRate;

  const lines: TaxLine[] = items.map((item) => {
    const basicRate = item.mrp / (1 + combinedRate / 100);
    const basicTotal = basicRate * item.qty;
    const taxableTotal = basicTotal;

    const sgstTotal = intraState ? (taxableTotal * sgstRate) / 100 : 0;
    const cgstTotal = intraState ? (taxableTotal * cgstRate) / 100 : 0;
    const igstTotal = intraState ? 0 : (taxableTotal * igstRate) / 100;

    return {
      ...item,
      basicRate,
      basicTotal,
      sgstRate: intraState ? sgstRate : 0,
      cgstRate: intraState ? cgstRate : 0,
      igstRate: intraState ? 0 : igstRate,
      sgstTotal,
      cgstTotal,
      igstTotal,
    };
  });

  const totalBasic = lines.reduce((s, l) => s + l.basicTotal, 0);
  const totalSgst = lines.reduce((s, l) => s + l.sgstTotal, 0);
  const totalCgst = lines.reduce((s, l) => s + l.cgstTotal, 0);
  const totalIgst = lines.reduce((s, l) => s + l.igstTotal, 0);

  return {
    intraState,
    sgstRate: intraState ? sgstRate : 0,
    cgstRate: intraState ? cgstRate : 0,
    igstRate: intraState ? 0 : igstRate,
    lines,
    totalBasic,
    totalSgst,
    totalCgst,
    totalIgst,
    totalTax: totalSgst + totalCgst + totalIgst,
  };
}
