import { db } from "@/db/client";
import { orders, orderItems, products, settings } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { notFound } from "next/navigation";
import { amountInWords } from "@/lib/amountInWords";
import { PrintButton } from "./PrintButton";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [order] = await db
    .select({ invoiceNumber: orders.invoiceNumber })
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);
  return { title: order?.invoiceNumber ? `Invoice ${order.invoiceNumber}` : "Invoice" };
}

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!order) notFound();

  if (!order.invoiceNumber) {
    return (
      <div style={{ fontFamily: "Arial, sans-serif", padding: "40px", maxWidth: "600px", margin: "0 auto" }}>
        <div style={{ background: "#1a1a1a", padding: "12px 20px", marginBottom: "20px" }}>
          <a href={`/admin/orders/${id}`} style={{ color: "#d4a853", textDecoration: "none", fontSize: "13px" }}>
            ← Back to Order
          </a>
        </div>
        <div style={{ background: "#fff8e1", border: "1px solid #f0c040", borderRadius: "4px", padding: "24px" }}>
          <h2 style={{ margin: "0 0 12px", color: "#7a5200", fontSize: "16px" }}>Invoice Number Not Set</h2>
          <p style={{ margin: 0, color: "#555", fontSize: "14px" }}>
            No invoice number has been assigned to this order yet.
            Please go back to the order detail page and enter an invoice number in the <strong>Invoice Number</strong> field, then save.
          </p>
        </div>
      </div>
    );
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

  return (
    <>
      <style>{`
        body {
          background: #fff !important;
          color: #000 !important;
          font-family: Arial, sans-serif !important;
          font-size: 9pt !important;
        }
        * { box-sizing: border-box; }
        .page {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          padding: 10mm 12mm;
          background: #fff;
        }
        .no-print {
          background: #1a1a1a;
          padding: 12px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .no-print a { color: #d4a853; text-decoration: none; font-size: 13px; }
        @media print {
          .no-print { display: none !important; }
          .page { padding: 8mm 10mm; }
          /* Hide dashboard sidebar and reset fixed layout for printing */
          body > div { position: static !important; overflow: visible !important; background: #fff !important; display: block !important; }
          body > div > aside { display: none !important; }
          body > div > main { overflow: visible !important; background: #fff !important; }
        }
        h1.invoice-title {
          font-size: 14pt;
          font-weight: bold;
          text-align: center;
          margin-bottom: 6px;
          border-bottom: 2px solid #000;
          padding-bottom: 4px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }
        .seller-info p { line-height: 1.5; font-size: 8.5pt; }
        .invoice-meta { text-align: right; }
        .invoice-meta p { line-height: 1.6; font-size: 8.5pt; }
        .meta-label { font-weight: bold; }
        .divider { border-top: 1px solid #000; margin: 8px 0; }
        .addresses {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 8px;
        }
        .addr-block strong {
          font-size: 8pt;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .addr-block p { line-height: 1.5; margin-top: 3px; font-size: 8.5pt; }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 7pt;
          margin-bottom: 6px;
        }
        th {
          background: #f0f0f0;
          border: 1px solid #666;
          padding: 3px 3px;
          text-align: center;
          font-weight: bold;
          font-size: 6.5pt;
          line-height: 1.3;
        }
        td { border: 1px solid #999; padding: 2px 3px; vertical-align: middle; font-size: 7pt; }
        .hsn-row td {
          background: #efefef;
          font-weight: bold;
          font-size: 6.5pt;
          padding: 2px 4px;
        }
        .total-row td { font-weight: bold; background: #f8f8f8; }
        .grand-total td { font-weight: bold; background: #e8e8e8; font-size: 8.5pt; }
        .amount-words { font-size: 8pt; font-style: italic; margin: 4px 0 8px; }
        .tc { font-size: 8pt; margin-bottom: 4px; }
        .bank { font-size: 8pt; margin-bottom: 10px; }
        .cut-line {
          border-top: 2px dashed #555;
          margin: 12px 0 8px;
          position: relative;
        }
        .cut-line span {
          position: absolute;
          top: -8px;
          left: 50%;
          transform: translateX(-50%);
          background: #fff;
          padding: 0 6px;
          font-size: 7pt;
          color: #666;
        }
        .shipping { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .ship-block strong { font-size: 8pt; text-transform: uppercase; }
        .ship-block p { line-height: 1.5; margin-top: 2px; font-size: 8.5pt; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .pan-row { font-size: 7.5pt; margin-top: 4px; }
        .mono { font-family: monospace; }
      `}</style>

      <div className="no-print">
        <a href={`/admin/orders/${id}`}>← Back to Order</a>
        <PrintButton />
      </div>

      <div className="page">
        <h1 className="invoice-title">Invoice / Bill of Supply / Cash Memo</h1>

        <div className="header">
          <div className="seller-info">
            <p style={{ fontWeight: "bold", fontSize: "11pt" }}>{s.seller_name}</p>
            <p>{s.seller_address}</p>
            <p>{s.seller_phone}</p>
            <p>
              {s.seller_website} | {s.seller_email}
            </p>
            <p className="pan-row">
              PAN No.: {s.seller_pan} &nbsp;|&nbsp; GSTIN No. {s.seller_gstin}{" "}
              &nbsp;|&nbsp; FSSAI LIC No. {s.seller_fssai}
            </p>
          </div>
          <div className="invoice-meta">
            <p>
              <span className="meta-label">Invoice No. :</span> {order.invoiceNumber}
            </p>
            <p>
              <span className="meta-label">Date :</span> {today}
            </p>
            <p>
              <span className="meta-label">Order Date :</span>{" "}
              {fmtDate(order.createdAt)}
            </p>
            <p className="mono" style={{ fontSize: "6.5pt", color: "#555", marginTop: 6 }}>
              {order.id}
            </p>
          </div>
        </div>

        <div className="divider" />

        <div className="addresses">
          <div className="addr-block">
            <strong>Customer Billing Address:</strong>
            <p>{order.customerName}</p>
            <p>{order.address}</p>
            <p>
              {order.city}
              {order.state ? `, ${order.state}` : ""} {order.pincode}
            </p>
            {order.customerEmail && <p>Email: {order.customerEmail}</p>}
            {order.customerPhone && <p>Phone: {order.customerPhone}</p>}
          </div>
          <div className="addr-block">
            <strong>Delivery Address:</strong>
            <p>{order.customerName}</p>
            <p>{order.address}</p>
            <p>
              {order.city}
              {order.state ? `, ${order.state}` : ""} {order.pincode}
            </p>
            {order.customerEmail && <p>Email: {order.customerEmail}</p>}
            {order.customerPhone && <p>Phone: {order.customerPhone}</p>}
          </div>
        </div>

        <div className="divider" />

        <table>
          <thead>
            <tr>
              <th style={{ width: "4%" }}>Item No.</th>
              <th style={{ width: "20%" }}>Product Name</th>
              <th style={{ width: "6%" }}>Pack size</th>
              <th style={{ width: "13%" }}>EAN Bar Code</th>
              <th style={{ width: "5%" }}>No. of Packs</th>
              <th style={{ width: "7%" }}>MRP Rs /Unit</th>
              <th style={{ width: "4%" }}>SGST %</th>
              <th style={{ width: "4%" }}>CGST %</th>
              <th style={{ width: "4%" }}>IGST %</th>
              <th style={{ width: "6%" }}>SGST Rs.</th>
              <th style={{ width: "6%" }}>CGST Rs.</th>
              <th style={{ width: "6%" }}>IGST Rs.</th>
              <th style={{ width: "8%" }}>Basic Rate Rs/BoUM</th>
              <th style={{ width: "7%" }}>Basic Total Rs.</th>
            </tr>
          </thead>
          <tbody>
            <tr className="hsn-row">
              <td colSpan={14}>HSN Code: {s.hsn_code}</td>
            </tr>
            {lineItems.map((item) => (
              <tr key={item.idx}>
                <td className="text-center">{item.idx}</td>
                <td>{item.name}</td>
                <td className="text-center">{item.weight}</td>
                <td className="text-center mono" style={{ fontSize: "6.5pt" }}>
                  {item.ean || "-"}
                </td>
                <td className="text-center">{item.qty}</td>
                <td className="text-right">{fmt(item.mrp)}</td>
                <td className="text-center">0</td>
                <td className="text-center">0</td>
                <td className="text-center">{igstRate}</td>
                <td className="text-right">0.00</td>
                <td className="text-right">0.00</td>
                <td className="text-right">{fmt(item.igstTotal)}</td>
                <td className="text-right">{fmt(item.basicRate)}</td>
                <td className="text-right">{fmt(item.basicTotal)}</td>
              </tr>
            ))}
            <tr className="total-row">
              <td colSpan={5} className="text-center" style={{ fontSize: "7pt", fontWeight: "normal" }}>
                Total
              </td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td className="text-right">0</td>
              <td className="text-right">0</td>
              <td className="text-right">{fmt(totalIgst)}</td>
              <td></td>
              <td className="text-right">{fmt(totalBasic)}</td>
            </tr>
            <tr className="total-row">
              <td colSpan={13} className="text-right">
                Total Basic Rate Rs.
              </td>
              <td className="text-right">{fmt(totalBasic)}</td>
            </tr>
            <tr className="total-row">
              <td colSpan={13} className="text-right">
                Total GST Rs.
              </td>
              <td className="text-right">{fmt(totalIgst)}</td>
            </tr>
            {order.discount > 0 && (
              <tr className="total-row">
                <td colSpan={13} className="text-right">
                  Discount{order.couponCode ? ` (${order.couponCode})` : ""}
                </td>
                <td className="text-right">- {fmt(order.discount)}</td>
              </tr>
            )}
            <tr className="grand-total">
              <td colSpan={13} className="text-right">
                TOTAL INVOICE AMOUNT
              </td>
              <td className="text-right">{fmt(totalAmount)}</td>
            </tr>
          </tbody>
        </table>

        <p className="amount-words">&#8377; {amountInWords(totalAmount)}</p>

        <p className="tc">T&amp;C : Payment received</p>
        <p className="bank">Bank: {s.bank_details}</p>

        <div className="cut-line">
          <span>&#9986; cut here</span>
        </div>

        <div className="shipping">
          <div className="ship-block">
            <strong>To</strong>
            <p>{order.customerName}</p>
            <p>{order.address}</p>
            <p>
              {order.city}
              {order.state ? `, ${order.state}` : ""}
            </p>
            <p>{order.pincode}</p>
            {order.customerEmail && <p>Email: {order.customerEmail}</p>}
            {order.customerPhone && <p>Phone: {order.customerPhone}</p>}
          </div>
          <div className="ship-block">
            <strong>From</strong>
            <p>{s.seller_name}</p>
            <p>{s.seller_address}</p>
            <p>{s.seller_phone}</p>
          </div>
        </div>
      </div>
    </>
  );
}
