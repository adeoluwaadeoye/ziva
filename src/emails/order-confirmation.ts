interface OrderItem {
  product: { name: string; price: number };
  quantity: number;
  selectedSize: string;
  selectedColor?: string;
  selectedFabric?: string;
  isCustomTailored?: boolean;
  measurements?: Record<string, string>;
}

export interface OrderEmailData {
  orderId: string;
  reference: string;
  customer: { name: string; email: string; phone: string };
  delivery: { address: string; city: string; state: string; notes?: string; type: string };
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
}

function fmt(n: number) { return "₦" + n.toLocaleString("en-NG"); }

export function orderConfirmationHtml(order: OrderEmailData): string {
  const { orderId, reference, customer, delivery, items, subtotal, shipping, total } = order;
  const hasCustom = items.some((i) => i.isCustomTailored);
  const deliveryLabel = delivery.type === "sameday" ? "Lagos Same-Day" : "Standard (3–5 days)";
  const year = new Date().getFullYear();

  const itemsHtml = items.map((item) => {
    const mEntries = item.measurements
      ? Object.entries(item.measurements).filter(([k, v]) => v && k !== "notes")
      : [];
    const mLine = mEntries.map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}cm`).join(" · ");
    return `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #e5e0d8;vertical-align:top;">
          <p style="margin:0;font-size:13px;font-weight:600;color:#1a1a1a;">${item.product.name}</p>
          <p style="margin:4px 0 0;font-size:11px;color:#8a8075;">
            Size: ${item.selectedSize}${item.selectedColor ? ` &middot; ${item.selectedColor}` : ""}${item.selectedFabric ? ` &middot; ${item.selectedFabric}` : ""}${item.isCustomTailored ? " &middot; &#9986; Custom Tailored" : ""}
          </p>
          ${mLine ? `<p style="margin:4px 0 0;font-size:11px;color:#8a8075;">${mLine}</p>` : ""}
          ${item.measurements?.notes ? `<p style="margin:4px 0 0;font-size:11px;color:#8a8075;font-style:italic;">"${item.measurements.notes}"</p>` : ""}
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #e5e0d8;text-align:center;font-size:13px;color:#1a1a1a;vertical-align:top;width:40px;">${item.quantity}</td>
        <td style="padding:12px 0;border-bottom:1px solid #e5e0d8;text-align:right;font-size:13px;font-weight:700;color:#1a1a1a;vertical-align:top;width:100px;white-space:nowrap;">${fmt(item.product.price * item.quantity)}</td>
      </tr>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Order Confirmed &#8212; ZIVA</title>
</head>
<body style="margin:0;padding:0;background:#f5f1ea;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f1ea;">
<tr><td align="center" style="padding:40px 20px;">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;">

  <tr>
    <td style="background:#1a1a1a;padding:32px 40px;text-align:center;">
      <p style="margin:0;font-size:26px;font-weight:300;color:#f5f1ea;letter-spacing:0.25em;text-transform:uppercase;">ZIVA</p>
      <p style="margin:6px 0 0;font-size:9px;color:#a09080;letter-spacing:0.35em;text-transform:uppercase;">Authentic Nigerian Fashion</p>
    </td>
  </tr>
  <tr><td style="height:3px;background:linear-gradient(90deg,#b8962e,#d4af56,#b8962e);"></td></tr>

  <tr><td style="padding:40px 40px 32px;">
    <p style="margin:0 0 6px;font-size:11px;color:#8a8075;letter-spacing:0.15em;text-transform:uppercase;font-weight:600;">Order Confirmed</p>
    <h2 style="margin:0 0 16px;font-size:24px;font-weight:600;color:#1a1a1a;line-height:1.2;">Thank you, ${customer.name.split(" ")[0]}!</h2>
    <p style="margin:0 0 28px;font-size:14px;color:#5a5550;line-height:1.7;">
      Your order has been received and is being processed. We&rsquo;ll be in touch within 24&nbsp;hours with dispatch details.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f1ea;border:1px solid #e5e0d8;margin-bottom:32px;">
      <tr><td style="padding:16px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td>
            <p style="margin:0;font-size:10px;color:#8a8075;text-transform:uppercase;letter-spacing:0.12em;font-weight:600;">Order ID</p>
            <p style="margin:4px 0 0;font-size:15px;font-weight:700;color:#1a1a1a;font-family:monospace;">#${orderId}</p>
          </td>
          <td style="text-align:right;">
            <p style="margin:0;font-size:10px;color:#8a8075;text-transform:uppercase;letter-spacing:0.12em;font-weight:600;">Payment Reference</p>
            <p style="margin:4px 0 0;font-size:11px;color:#5a5550;font-family:monospace;">${reference}</p>
          </td>
        </tr></table>
      </td></tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <thead>
        <tr>
          <th style="text-align:left;font-size:10px;color:#8a8075;text-transform:uppercase;letter-spacing:0.12em;font-weight:600;padding-bottom:10px;border-bottom:2px solid #1a1a1a;">Item</th>
          <th style="text-align:center;font-size:10px;color:#8a8075;text-transform:uppercase;letter-spacing:0.12em;font-weight:600;padding-bottom:10px;border-bottom:2px solid #1a1a1a;">Qty</th>
          <th style="text-align:right;font-size:10px;color:#8a8075;text-transform:uppercase;letter-spacing:0.12em;font-weight:600;padding-bottom:10px;border-bottom:2px solid #1a1a1a;">Price</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#8a8075;">Subtotal</td>
        <td style="padding:6px 0;font-size:13px;font-weight:600;color:#1a1a1a;text-align:right;">${fmt(subtotal)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#8a8075;">Shipping &middot; ${deliveryLabel}</td>
        <td style="padding:6px 0;font-size:13px;font-weight:600;text-align:right;color:${shipping === 0 ? "#16a34a" : "#1a1a1a"};">${shipping === 0 ? "FREE" : fmt(shipping)}</td>
      </tr>
      <tr>
        <td style="padding:14px 0 0;font-size:17px;font-weight:700;color:#1a1a1a;border-top:2px solid #1a1a1a;">Total Paid</td>
        <td style="padding:14px 0 0;font-size:17px;font-weight:700;color:#1a1a1a;text-align:right;border-top:2px solid #1a1a1a;">${fmt(total)}</td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f1ea;border:1px solid #e5e0d8;margin-bottom:${hasCustom ? "24px" : "32px"};">
      <tr><td style="padding:20px;">
        <p style="margin:0 0 10px;font-size:10px;color:#8a8075;text-transform:uppercase;letter-spacing:0.12em;font-weight:600;">Delivery Address</p>
        <p style="margin:0;font-size:13px;color:#1a1a1a;line-height:1.9;">
          ${customer.name}<br/>
          ${delivery.address}<br/>
          ${delivery.city}, ${delivery.state}<br/>
          ${customer.phone}
          ${delivery.notes ? `<br/><em style="color:#8a8075;">${delivery.notes}</em>` : ""}
        </p>
      </td></tr>
    </table>

    ${hasCustom ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbf0;border:1px solid #e8d5a3;margin-bottom:32px;">
      <tr><td style="padding:16px 20px;">
        <p style="margin:0;font-size:13px;color:#92701a;line-height:1.7;">
          <strong>&#9986; Custom Tailoring Notice</strong> &mdash; Items flagged for custom tailoring require approximately <strong>10 business days</strong> to complete before dispatch. We will contact you if any clarification on your measurements is needed.
        </p>
      </td></tr>
    </table>
    ` : ""}

    <p style="font-size:13px;color:#5a5550;line-height:1.7;margin:0;">
      Questions? Contact us through our website. We&rsquo;re always happy to help.
    </p>
  </td></tr>

  <tr>
    <td style="padding:24px 40px;border-top:1px solid #e5e0d8;text-align:center;background:#f5f1ea;">
      <p style="margin:0;font-size:11px;color:#8a8075;">&copy; ${year} ZIVA &middot; Authentic Nigerian Fashion</p>
      <p style="margin:6px 0 0;font-size:11px;color:#b0a898;">This is an automated confirmation &mdash; please do not reply directly to this email.</p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}
