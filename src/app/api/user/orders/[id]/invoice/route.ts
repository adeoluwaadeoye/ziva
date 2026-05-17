import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getSessionUserId } from "@/lib/get-session";
import { generateInvoicePdf } from "@/lib/invoice";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getSessionUserId(req);
    if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { id } = await params;
    const db = await getDb();
    const order = await db.collection("orders").findOne({ id, userId });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    // Normalize items: handle both mobile (flat) and web (nested CartItem) formats
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = (order.items ?? []).map((item: any) => ({
      product: {
        name: item.name ?? item.product?.name ?? "Item",
        price: Number(item.price ?? item.product?.price ?? 0),
      },
      quantity: Number(item.quantity ?? 1),
      selectedSize: item.selectedSize ?? item.size ?? "",
      selectedColor: item.selectedColor ?? item.color ?? "",
      selectedFabric: item.selectedFabric ?? item.product?.selectedFabric,
      isCustomTailored: item.isCustomTailored ?? false,
      measurements: item.measurements,
    }));

    const pdfBuffer = await generateInvoicePdf({
      orderId:   order.id,
      reference: order.reference ?? "",
      customer:  {
        name:  order.customer?.name  ?? "Customer",
        email: order.customer?.email ?? "",
        phone: order.customer?.phone ?? "",
      },
      delivery: {
        address: order.delivery?.address ?? "",
        city:    order.delivery?.city    ?? "",
        state:   order.delivery?.state   ?? "",
        notes:   order.delivery?.notes   ?? "",
        type:    order.delivery?.type    ?? "standard",
      },
      items,
      subtotal: Number(order.subtotal ?? 0),
      shipping: Number(order.shipping ?? 0),
      total:    Number(order.total    ?? 0),
    });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type":        "application/pdf",
        "Content-Disposition": `attachment; filename="ZIVA-Invoice-${id}.pdf"`,
        "Content-Length":      pdfBuffer.length.toString(),
      },
    });
  } catch (err) {
    console.error("[invoice]", err);
    return NextResponse.json({ error: "Failed to generate invoice" }, { status: 500 });
  }
}
