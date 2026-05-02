import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { OrderEmailData } from "@/emails/order-confirmation";

const C = {
  black: "#111111",
  darkGray: "#222222",
  cream: "#faf8f5",
  muted: "#7a7470",
  border: "#e6e0d8",
  green: "#15803d",
  greenBg: "#f0fdf4",
  amber: "#92400e",
  amberBg: "#fffbeb",
  amberBd: "#fde68a",
  white: "#ffffff",
  accent: "#c9a96e",
};

const s = StyleSheet.create({
  page: {
    backgroundColor: C.white,
    fontFamily: "Helvetica",
    paddingBottom: 60,
  },

  /* ── Header band ── */
  header: {
    backgroundColor: C.darkGray,
    paddingHorizontal: 40,
    paddingVertical: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  logoText: {
    fontSize: 26,
    fontFamily: "Helvetica-Bold",
    color: C.white,
    letterSpacing: 4,
  },
  logoSub: {
    fontSize: 7,
    color: "#aaaaaa",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginTop: 3,
  },
  invoiceTag: {
    backgroundColor: C.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 6,
    alignSelf: "flex-end",
  },
  invoiceTagText: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: C.white,
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  invoiceNum: {
    fontSize: 15,
    fontFamily: "Helvetica-Bold",
    color: C.white,
    textAlign: "right",
  },
  invoiceDate: {
    fontSize: 8,
    color: "#999999",
    textAlign: "right",
    marginTop: 3,
  },

  /* ── Divider accent line ── */
  accentLine: {
    height: 2,
    backgroundColor: C.accent,
  },

  /* ── Info section ── */
  infoRow: {
    flexDirection: "row",
    marginHorizontal: 40,
    marginTop: 24,
    marginBottom: 28,
    gap: 10,
  },
  infoCard: {
    flex: 1,
    borderTop: 2,
    borderTopColor: C.border,
    paddingTop: 10,
  },
  infoCardHighlight: {
    flex: 1,
    borderTop: 2,
    borderTopColor: C.accent,
    paddingTop: 10,
  },
  infoLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: C.muted,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 9,
    color: C.black,
    marginBottom: 2,
    lineHeight: 1.4,
  },
  paidBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    backgroundColor: C.greenBg,
    borderRadius: 2,
    paddingHorizontal: 6,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  paidText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: C.green,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  refText: {
    fontSize: 8,
    color: C.muted,
    marginTop: 2,
    fontFamily: "Helvetica",
  },

  /* ── Table ── */
  tableWrap: {
    marginHorizontal: 40,
  },
  tableHead: {
    flexDirection: "row",
    backgroundColor: C.black,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  thText: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: C.white,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  tableRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderBottom: 1,
    borderBottomColor: C.border,
  },
  tableRowShaded: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderBottom: 1,
    borderBottomColor: C.border,
    backgroundColor: C.cream,
  },

  colName: { width: "58%", paddingRight: 10 },
  colQty: { width: "12%", textAlign: "center" },
  colPrice: { width: "30%", textAlign: "right" },

  itemName: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: C.black,
  },
  itemMeta: {
    fontSize: 8,
    color: C.muted,
    marginTop: 3,
    lineHeight: 1.4,
  },
  itemPrice: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: C.black,
    textAlign: "right",
  },
  qtyText: {
    fontSize: 10,
    color: C.black,
    textAlign: "center",
  },

  /* ── Custom tailoring ── */
  measureBox: {
    marginTop: 8,
    padding: 7,
    backgroundColor: C.amberBg,
    borderLeft: 2,
    borderLeftColor: C.accent,
  },
  measureTitle: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: C.amber,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  measureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  measureItem: {
    fontSize: 7,
    color: C.amber,
    marginRight: 8,
    marginBottom: 2,
  },

  /* ── Totals ── */
  totalsWrap: {
    marginHorizontal: 40,
    marginTop: 24,
    alignItems: "flex-end",
  },
  totalsBox: {
    width: "42%",
    borderTop: 1,
    borderTopColor: C.border,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottom: 1,
    borderBottomColor: C.border,
  },
  totalLabel: {
    fontSize: 9,
    color: C.muted,
  },
  totalValue: {
    fontSize: 9,
    color: C.black,
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: C.black,
    marginTop: 1,
  },
  grandLabel: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: C.white,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  grandValue: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: C.accent,
  },

  /* ── Footer ── */
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: C.cream,
    borderTop: 1,
    borderTopColor: C.border,
    paddingHorizontal: 40,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerLeft: {
    fontSize: 7,
    color: C.muted,
    lineHeight: 1.5,
  },
  footerRight: {
    fontSize: 7,
    color: C.muted,
    textAlign: "right",
  },
});

function fmt(n: number) {
  return `NGN ${n.toLocaleString("en-NG")}`;
}

function InvoiceDoc({ order }: { order: OrderEmailData }) {
  const { orderId, reference, customer, delivery, items, subtotal, shipping, total } = order;

  const date = new Date().toLocaleDateString("en-NG", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <Document title={`ZIVA Invoice #${orderId}`}>
      <Page size="A4" style={s.page}>

        {/* ── Header band ── */}
        <View style={s.header}>
          <View>
            <Text style={s.logoText}>ZIVA</Text>
            <Text style={s.logoSub}>Authentic Nigerian Fashion</Text>
          </View>
          <View>
            <View style={s.invoiceTag}>
              <Text style={s.invoiceTagText}>Official Invoice</Text>
            </View>
            <Text style={s.invoiceNum}>#{orderId}</Text>
            <Text style={s.invoiceDate}>{date}</Text>
          </View>
        </View>

        <View style={s.accentLine} />

        {/* ── Info row ── */}
        <View style={s.infoRow}>
          <View style={s.infoCard}>
            <Text style={s.infoLabel}>Customer</Text>
            <Text style={[s.infoText, { fontFamily: "Helvetica-Bold" }]}>{customer.name}</Text>
            <Text style={s.infoText}>{customer.email}</Text>
            {customer.phone ? <Text style={s.infoText}>{customer.phone}</Text> : null}
          </View>

          <View style={s.infoCard}>
            <Text style={s.infoLabel}>Delivery Address</Text>
            <Text style={s.infoText}>{delivery.address}</Text>
            <Text style={s.infoText}>{delivery.city}, {delivery.state}</Text>
            <Text style={[s.infoText, { fontFamily: "Helvetica-Bold", marginTop: 2 }]}>
              {delivery.type === "sameday" ? "Same-Day Delivery" : "Standard Delivery"}
            </Text>
          </View>

          <View style={s.infoCardHighlight}>
            <Text style={s.infoLabel}>Payment</Text>
            <Text style={s.refText}>Ref: {reference}</Text>
            <View style={s.paidBadge}>
              <Text style={s.paidText}>✓ Paid via Paystack</Text>
            </View>
          </View>
        </View>

        {/* ── Items table ── */}
        <View style={s.tableWrap}>
          <View style={s.tableHead}>
            <View style={s.colName}><Text style={s.thText}>Description</Text></View>
            <View style={s.colQty}><Text style={s.thText}>Qty</Text></View>
            <View style={s.colPrice}><Text style={s.thText}>Amount</Text></View>
          </View>

          {items.map((item, i) => (
            <View key={i} style={i % 2 === 0 ? s.tableRow : s.tableRowShaded} wrap={false}>
              <View style={s.colName}>
                <Text style={s.itemName}>{item.product.name}</Text>
                <Text style={s.itemMeta}>
                  Size: {item.selectedSize}
                  {item.selectedColor ? ` · Color: ${item.selectedColor}` : ""}
                  {item.selectedFabric ? ` · Fabric: ${item.selectedFabric}` : ""}
                </Text>

                {item.isCustomTailored && (
                  <View style={s.measureBox}>
                    <Text style={s.measureTitle}>Custom Measurements (CM)</Text>
                    <View style={s.measureGrid}>
                      {Object.entries(item.measurements || {})
                        .filter(([k, v]) => v && k !== "notes")
                        .map(([k, v]) => (
                          <Text key={k} style={s.measureItem}>
                            {k.charAt(0).toUpperCase() + k.slice(1)}: {v}
                          </Text>
                        ))}
                    </View>
                    {item.measurements?.notes && (
                      <Text style={[s.measureItem, { marginTop: 4 }]}>
                        Notes: {item.measurements.notes}
                      </Text>
                    )}
                  </View>
                )}
              </View>

              <View style={s.colQty}>
                <Text style={s.qtyText}>{item.quantity}</Text>
              </View>

              <View style={s.colPrice}>
                <Text style={s.itemPrice}>{fmt(item.product.price * item.quantity)}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── Totals ── */}
        <View style={s.totalsWrap}>
          <View style={s.totalsBox}>
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Subtotal</Text>
              <Text style={s.totalValue}>{fmt(subtotal)}</Text>
            </View>
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Shipping</Text>
              <Text style={s.totalValue}>{shipping === 0 ? "FREE" : fmt(shipping)}</Text>
            </View>
            <View style={s.grandTotalRow}>
              <Text style={s.grandLabel}>Total</Text>
              <Text style={s.grandValue}>{fmt(total)}</Text>
            </View>
          </View>
        </View>

        {/* ── Footer ── */}
        <View style={s.footer} fixed>
          <Text style={s.footerLeft}>
            ZIVA Fashion · 15 Bode Thomas St, Surulere, Lagos{"\n"}
            hello@ziva.ng · +234 801 234 5678
          </Text>
          <Text style={s.footerRight}>
            This is a computer-generated invoice.{"\n"}
            Thank you for shopping with ZIVA.
          </Text>
        </View>

      </Page>
    </Document>
  );
}

export async function generateInvoicePdf(order: OrderEmailData): Promise<Buffer> {
  return renderToBuffer(<InvoiceDoc order={order} />) as Promise<Buffer>;
}
