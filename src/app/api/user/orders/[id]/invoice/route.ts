import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getDb } from "@/lib/mongodb";
import { generateInvoicePdf } from "@/lib/invoice";

function adminToken() {
  const secret = process.env.ADMIN_SECRET ?? "";
  return crypto.createHash("sha256").update(secret + "ziva-admin").digest("hex");
}

async function getUserId(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get("ziva-session")?.value;
  if (!token) return null;
  const db      = await getDb();
  const session = await db.collection("sessions").findOne({ token });
  if (!session || new Date(session.expiresAt) < new Date()) return null;
  return session.userId as string;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id }    = await params;
    const db        = await getDb();

    /* Allow either the order owner or an authenticated admin */
    const isAdmin = req.cookies.get("admin-token")?.value === adminToken();
    const userId  = isAdmin ? null : await getUserId(req);

    if (!isAdmin && !userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const query = isAdmin ? { id } : { id, userId };
    const order = await db.collection("orders").findOne(query);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const pdfBuffer = await generateInvoicePdf({
      orderId:   order.id,
      reference: order.reference,
      customer:  order.customer,
      delivery:  order.delivery,
      items:     order.items,
      subtotal:  order.subtotal,
      shipping:  order.shipping,
      total:     order.total,
    });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status:  200,
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
