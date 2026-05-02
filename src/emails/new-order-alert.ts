import type { OrderEmailData } from "./order-confirmation";
export type { OrderEmailData };

function fmt(n: number) { return "₦" + n.toLocaleString("en-NG"); }

export function newOrderAlertHtml(order: OrderEmailData, adminUrl: string): string {
  const { orderId, reference, customer, delivery, items, subtotal, shipping, total } = order;
  const deliveryLabel = delivery.type === "sameday" ? "Lagos Same-Day" : "Standard (3–5 days)";
  const year = new Date().getFullYear();

  const itemsHtml = items.map((item, idx) => {
    const mEntries = item.measurements
      ? Object.entries(item.measurements).filter(([k, v]) => v && k !== "notes")
      : [];
    const mLine = mEntries.map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}cm`).join(" &middot; ");

    return `
    <tr style="background:${idx % 2 === 0 ? "#ffffff" : "#faf9f7"};">
      <td style="padding:14px 16px;border-bottom:1px solid #e5e0d8;vertical-align:top;">
        <p style="margin:0;font-size:13px;font-weight:700;color:#1a1a1a;">${item.product.name}</p>
        <p style="margin:4px 0 0;font-size:12px;color:#5a5550;">
          Size: ${item.selectedSize}
          ${item.selectedColor ? ` &middot; Colour: ${item.selectedColor}` : ""}
          ${item.selectedFabric ? ` &middot; Fabric: ${item.selectedFabric}` : ""}
        </p>
        ${item.isCustomTailored ? `
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;background:#fffbf0;border:1px solid #e8d5a3;">
            <tr><td style="padding:10px 12px;">
              <p style="margin:0 0 4px;font-size:10px;font-weight:700;color:#92701a;text-transform:uppercase;letter-spacing:0.1em;">&#9986; Custom Tailored &mdash; Measurements</p>
              ${mLine ? `<p style="margin:0;font-size:12px;color:#6b4f10;">${mLine}</p>` : `<p style="margin:0;font-size:12px;color:#8a8075;font-style:italic;">No measurements provided</p>`}
              ${item.measurements?.notes ? `<p style="margin:6px 0 0;font-size:12px;color:#6b4f10;font-style:italic;">Notes: &ldquo;${item.measurements.notes}&rdquo;</p>` : ""}
            </td></tr>
          </table>
        ` : ""}
      </td>
      <td style="padding:14px 12px;border-bottom:1px solid #e5e0d8;text-align:center;font-size:14px;font-weight:700;color:#1a1a1a;vertical-align:top;width:40px;">${item.quantity}</td>
      <td style="padding:14px 12px;border-bottom:1px solid #e5e0d8;text-align:right;font-size:13px;font-weight:700;color:#1a1a1a;vertical-align:top;white-space:nowrap;width:110px;">${fmt(item.product.price * item.quantity)}</td>
    </tr>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>New Order &#8212; ZIVA Admin</title>
</head>
<body style="margin:0;padding:0;background:#f0ece4;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ece4;">
<tr><td align="center" style="padding:40px 20px;">
<table width="620" cellpadding="0" cellspacing="0" style="max-width:620px;width:100%;background:#ffffff;">

  <tr>
    <td style="background:#1a1a1a;padding:24px 32px;">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td>
          <p style="margin:0;font-size:22px;font-weight:300;color:#f5f1ea;letter-spacing:0.2em;text-transform:uppercase;">ZIVA</p>
          <p style="margin:2px 0 0;font-size:9px;color:#a09080;letter-spacing:0.3em;text-transform:uppercase;">Admin Notification</p>
        </td>
        <td style="text-align:right;">
          <p style="margin:0;font-size:11px;color:#8a8075;">New Order Received</p>
          <p style="margin:4px 0 0;font-size:20px;font-weight:700;color:#d4af56;font-family:monospace;">${fmt(total)}</p>
        </td>
      </tr></table>
    </td>
  </tr>
  <tr><td style="height:3px;background:linear-gradient(90deg,#b8962e,#d4af56,#b8962e);"></td></tr>

  <tr><td style="padding:28px 32px 0;">

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="width:50%;vertical-align:top;padding-right:12px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f1ea;border:1px solid #e5e0d8;">
            <tr><td style="padding:14px 16px;">
              <p style="margin:0 0 8px;font-size:10px;font-weight:700;color:#8a8075;text-transform:uppercase;letter-spacing:0.12em;">Customer</p>
              <p style="margin:0;font-size:14px;font-weight:700;color:#1a1a1a;">${customer.name}</p>
              <p style="margin:3px 0 0;font-size:12px;color:#5a5550;">${customer.email}</p>
              <p style="margin:3px 0 0;font-size:12px;color:#5a5550;">${customer.phone}</p>
            </td></tr>
          </table>
        </td>
        <td style="width:50%;vertical-align:top;padding-left:12px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f1ea;border:1px solid #e5e0d8;">
            <tr><td style="padding:14px 16px;">
              <p style="margin:0 0 8px;font-size:10px;font-weight:700;color:#8a8075;text-transform:uppercase;letter-spacing:0.12em;">Order</p>
              <p style="margin:0;font-size:13px;font-weight:700;color:#1a1a1a;font-family:monospace;">#${orderId}</p>
              <p style="margin:3px 0 0;font-size:11px;color:#5a5550;">Ref: ${reference}</p>
              <p style="margin:3px 0 0;font-size:11px;color:#5a5550;">${deliveryLabel}</p>
            </td></tr>
          </table>
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;border:1px solid #e5e0d8;">
      <thead>
        <tr style="background:#f5f1ea;">
          <th style="text-align:left;font-size:10px;color:#8a8075;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;padding:10px 16px;border-bottom:1px solid #e5e0d8;">Item</th>
          <th style="text-align:center;font-size:10px;color:#8a8075;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;padding:10px 12px;border-bottom:1px solid #e5e0d8;width:40px;">Qty</th>
          <th style="text-align:right;font-size:10px;color:#8a8075;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;padding:10px 12px;border-bottom:1px solid #e5e0d8;width:110px;">Price</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:5px 0;font-size:13px;color:#8a8075;">Subtotal</td>
        <td style="padding:5px 0;font-size:13px;font-weight:600;color:#1a1a1a;text-align:right;">${fmt(subtotal)}</td>
      </tr>
      <tr>
        <td style="padding:5px 0;font-size:13px;color:#8a8075;">Shipping</td>
        <td style="padding:5px 0;font-size:13px;font-weight:600;text-align:right;color:${shipping === 0 ? "#16a34a" : "#1a1a1a"};">${shipping === 0 ? "FREE" : fmt(shipping)}</td>
      </tr>
      <tr>
        <td style="padding:12px 0 0;font-size:17px;font-weight:700;color:#1a1a1a;border-top:2px solid #1a1a1a;">Total Received</td>
        <td style="padding:12px 0 0;font-size:17px;font-weight:700;color:#1a1a1a;text-align:right;border-top:2px solid #1a1a1a;">${fmt(total)}</td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f1ea;border:1px solid #e5e0d8;margin-bottom:28px;">
      <tr><td style="padding:16px;">
        <p style="margin:0 0 8px;font-size:10px;font-weight:700;color:#8a8075;text-transform:uppercase;letter-spacing:0.12em;">Delivery Address</p>
        <p style="margin:0;font-size:13px;color:#1a1a1a;line-height:1.8;">
          ${delivery.address}<br/>
          ${delivery.city}, ${delivery.state}
          ${delivery.notes ? `<br/><em style="color:#8a8075;">${delivery.notes}</em>` : ""}
        </p>
      </td></tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      <tr><td align="center">
        <a href="${adminUrl}/admin" style="display:inline-block;background:#1a1a1a;color:#f5f1ea;text-decoration:none;font-size:12px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;padding:14px 32px;">
          View in Admin Dashboard &rarr;
        </a>
      </td></tr>
    </table>

  </td></tr>

  <tr>
    <td style="padding:20px 32px;border-top:1px solid #e5e0d8;text-align:center;background:#f5f1ea;">
      <p style="margin:0;font-size:11px;color:#8a8075;">&copy; ${year} ZIVA &middot; Internal Order Notification</p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}
