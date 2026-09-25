import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { orders, orderItems, products, settings } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { requireAdmin } from "@/lib/adminAuth";
import { assignInvoiceNumber } from "@/lib/invoiceNumber";
import { amountInWords } from "@/lib/amountInWords";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauth = await requireAdmin();
  if (unauth) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  const { id } = await params;

  let [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!order) {
    return new NextResponse("Order not found", { status: 404 });
  }

  if (!order.invoiceNumber) {
    await assignInvoiceNumber(id);
    [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  }

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));

  const productIds = items.map((i) => i.productId);
  const productRows = productIds.length
    ? await db.select().from(products).where(inArray(products.id, productIds))
    : [];
  const productMap = Object.fromEntries(productRows.map((p) => [p.id, p]));

  const allSettings = Object.fromEntries(
    (await db.select().from(settings)).map((r) => [r.key, r.value])
  );

  const igstRate = parseFloat(allSettings.igst_rate ?? "5");

  const lineItems = items.map((item, i) => {
    const product = productMap[item.productId];
    const mrp = item.price;
    const qty = item.quantity;
    const basicRate = mrp / (1 + igstRate / 100);
    const igstPerUnit = mrp - basicRate;
    const igstTotal = igstPerUnit * qty;
    const basicTotal = basicRate * qty;
    return {
      idx: i + 1,
      name: item.productName,
      weight: product?.weight ?? "",
      ean: product?.ean ?? "",
      qty,
      mrp,
      basicRate,
      igstTotal,
      basicTotal,
    };
  });

  const totalBasic = lineItems.reduce((s, l) => s + l.basicTotal, 0);
  const totalIgst = lineItems.reduce((s, l) => s + l.igstTotal, 0);
  const totalAmount = order.total;

  const fmt = (n: number) => n.toFixed(2);
  const fmtDate = (d: string) => {
    const dt = new Date(d);
    return `${dt.getDate().toString().padStart(2, "0")}/${(dt.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${dt.getFullYear()}`;
  };
  const today = fmtDate(new Date().toISOString());

  const s = allSettings;
  const e = (str: string | null | undefined) =>
    (str ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const lineItemsHtml = lineItems
    .map(
      (item) => `
    <tr>
      <td style="text-align:center">${item.idx}</td>
      <td>${e(item.name)}</td>
      <td style="text-align:center">${e(item.weight)}</td>
      <td style="text-align:center;font-family:monospace;font-size:6.5pt">${e(item.ean) || "-"}</td>
      <td style="text-align:center">${item.qty}</td>
      <td style="text-align:right">${fmt(item.mrp)}</td>
      <td style="text-align:center">0</td>
      <td style="text-align:center">0</td>
      <td style="text-align:center">${igstRate}</td>
      <td style="text-align:right">0.00</td>
      <td style="text-align:right">0.00</td>
      <td style="text-align:right">${fmt(item.igstTotal)}</td>
      <td style="text-align:right">${fmt(item.basicRate)}</td>
      <td style="text-align:right">${fmt(item.basicTotal)}</td>
    </tr>`
    )
    .join("");

  const discountRow =
    order.discount > 0
      ? `<tr class="total-row">
          <td colspan="13" style="text-align:right">Discount${order.couponCode ? ` (${e(order.couponCode)})` : ""}</td>
          <td style="text-align:right">- ${fmt(order.discount)}</td>
        </tr>`
      : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Invoice ${e(order.invoiceNumber)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 9pt; color: #000; background: #fff; }
    .no-print { background: #1a1a1a; padding: 12px 20px; display: flex; align-items: center; gap: 12px; position: sticky; top: 0; z-index: 10; }
    .no-print a { color: #d4a853; text-decoration: none; font-size: 13px; }
    .no-print button { background: #d4a853; color: #000; border: none; padding: 8px 20px; font-size: 13px; font-weight: 600; cursor: pointer; border-radius: 3px; }
    .page { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 10mm 12mm; }
    @media print { .no-print { display: none !important; } .page { padding: 8mm 10mm; } }
    h1.invoice-title { font-size: 14pt; font-weight: bold; text-align: center; margin-bottom: 6px; border-bottom: 2px solid #000; padding-bottom: 4px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
    .seller-info p, .invoice-meta p { line-height: 1.5; font-size: 8.5pt; }
    .invoice-meta { text-align: right; }
    .meta-label { font-weight: bold; }
    .divider { border-top: 1px solid #000; margin: 8px 0; }
    .addresses { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 8px; }
    .addr-block strong { font-size: 8pt; text-transform: uppercase; letter-spacing: 0.5px; }
    .addr-block p { line-height: 1.5; margin-top: 3px; font-size: 8.5pt; }
    table { width: 100%; border-collapse: collapse; font-size: 7pt; margin-bottom: 6px; }
    th { background: #f0f0f0; border: 1px solid #666; padding: 3px; text-align: center; font-weight: bold; font-size: 6.5pt; line-height: 1.3; }
    td { border: 1px solid #999; padding: 2px 3px; vertical-align: middle; font-size: 7pt; }
    .hsn-row td { background: #efefef; font-weight: bold; font-size: 6.5pt; padding: 2px 4px; }
    .total-row td { font-weight: bold; background: #f8f8f8; }
    .grand-total td { font-weight: bold; background: #e8e8e8; font-size: 8.5pt; }
    .amount-words { font-size: 8pt; font-style: italic; margin: 4px 0 8px; }
    .tc, .bank { font-size: 8pt; margin-bottom: 4px; }
    .cut-line { border-top: 2px dashed #555; margin: 12px 0 8px; position: relative; }
    .cut-line span { position: absolute; top: -8px; left: 50%; transform: translateX(-50%); background: #fff; padding: 0 6px; font-size: 7pt; color: #666; }
    .shipping { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .ship-block strong { font-size: 8pt; text-transform: uppercase; }
    .ship-block p { line-height: 1.5; margin-top: 2px; font-size: 8.5pt; }
    .pan-row { font-size: 7.5pt; margin-top: 4px; }
  </style>
</head>
<body>
  <div class="no-print">
    <a href="/admin/orders/${e(id)}">&#8592; Back to Order</a>
    <button onclick="window.print()">&#128424; Print / Save as PDF</button>
  </div>

  <div class="page">
    <h1 class="invoice-title">Invoice / Bill of Supply / Cash Memo</h1>

    <div class="header">
      <div class="seller-info">
        <p style="font-weight:bold;font-size:11pt">${e(s.seller_name)}</p>
        <p>${e(s.seller_address)}</p>
        <p>${e(s.seller_phone)}</p>
        <p>${e(s.seller_website)} | ${e(s.seller_email)}</p>
        <p class="pan-row">PAN No.: ${e(s.seller_pan)} &nbsp;|&nbsp; GSTIN No. ${e(s.seller_gstin)} &nbsp;|&nbsp; FSSAI LIC No. ${e(s.seller_fssai)}</p>
      </div>
      <div class="invoice-meta">
        <p><span class="meta-label">Invoice No. :</span> ${e(order.invoiceNumber)}</p>
        <p><span class="meta-label">Date :</span> ${today}</p>
        <p><span class="meta-label">Order Date :</span> ${fmtDate(order.createdAt)}</p>
        <p style="font-family:monospace;font-size:6.5pt;color:#555;margin-top:6px">${e(order.id)}</p>
      </div>
    </div>

    <div class="divider"></div>

    <div class="addresses">
      <div class="addr-block">
        <strong>Customer Billing Address:</strong>
        <p>${e(order.customerName)}</p>
        <p>${e(order.address)}</p>
        <p>${e(order.city)}${order.state ? `, ${e(order.state)}` : ""} ${e(order.pincode)}</p>
        ${order.customerEmail ? `<p>Email: ${e(order.customerEmail)}</p>` : ""}
        ${order.customerPhone ? `<p>Phone: ${e(order.customerPhone)}</p>` : ""}
      </div>
      <div class="addr-block">
        <strong>Delivery Address:</strong>
        <p>${e(order.customerName)}</p>
        <p>${e(order.address)}</p>
        <p>${e(order.city)}${order.state ? `, ${e(order.state)}` : ""} ${e(order.pincode)}</p>
        ${order.customerEmail ? `<p>Email: ${e(order.customerEmail)}</p>` : ""}
        ${order.customerPhone ? `<p>Phone: ${e(order.customerPhone)}</p>` : ""}
      </div>
    </div>

    <div class="divider"></div>

    <table>
      <thead>
        <tr>
          <th style="width:4%">Item No.</th>
          <th style="width:20%">Product Name</th>
          <th style="width:6%">Pack size</th>
          <th style="width:13%">EAN Bar Code</th>
          <th style="width:5%">No. of Packs</th>
          <th style="width:7%">MRP Rs /Unit</th>
          <th style="width:4%">SGST %</th>
          <th style="width:4%">CGST %</th>
          <th style="width:4%">IGST %</th>
          <th style="width:6%">SGST Rs.</th>
          <th style="width:6%">CGST Rs.</th>
          <th style="width:6%">IGST Rs.</th>
          <th style="width:8%">Basic Rate Rs/BoUM</th>
          <th style="width:7%">Basic Total Rs.</th>
        </tr>
      </thead>
      <tbody>
        <tr class="hsn-row">
          <td colspan="14">HSN Code: ${e(s.hsn_code)}</td>
        </tr>
        ${lineItemsHtml}
        <tr class="total-row">
          <td colspan="5" style="text-align:center;font-weight:normal;font-size:7pt">Total</td>
          <td></td><td></td><td></td><td></td>
          <td style="text-align:right">0</td>
          <td style="text-align:right">0</td>
          <td style="text-align:right">${fmt(totalIgst)}</td>
          <td></td>
          <td style="text-align:right">${fmt(totalBasic)}</td>
        </tr>
        <tr class="total-row">
          <td colspan="13" style="text-align:right">Total Basic Rate Rs.</td>
          <td style="text-align:right">${fmt(totalBasic)}</td>
        </tr>
        <tr class="total-row">
          <td colspan="13" style="text-align:right">Total GST Rs.</td>
          <td style="text-align:right">${fmt(totalIgst)}</td>
        </tr>
        ${discountRow}
        <tr class="grand-total">
          <td colspan="13" style="text-align:right">TOTAL INVOICE AMOUNT</td>
          <td style="text-align:right">${fmt(totalAmount)}</td>
        </tr>
      </tbody>
    </table>

    <p class="amount-words">&#8377; ${e(amountInWords(totalAmount))}</p>
    <p class="tc">T&amp;C : Payment received</p>
    <p class="bank">Bank: ${e(s.bank_details)}</p>

    <div class="cut-line"><span>&#9986; cut here</span></div>

    <div class="shipping">
      <div class="ship-block">
        <strong>To</strong>
        <p>${e(order.customerName)}</p>
        <p>${e(order.address)}</p>
        <p>${e(order.city)}${order.state ? `, ${e(order.state)}` : ""}</p>
        <p>${e(order.pincode)}</p>
        ${order.customerEmail ? `<p>Email: ${e(order.customerEmail)}</p>` : ""}
        ${order.customerPhone ? `<p>Phone: ${e(order.customerPhone)}</p>` : ""}
      </div>
      <div class="ship-block">
        <strong>From</strong>
        <p>${e(s.seller_name)}</p>
        <p>${e(s.seller_address)}</p>
        <p>${e(s.seller_phone)}</p>
      </div>
    </div>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
