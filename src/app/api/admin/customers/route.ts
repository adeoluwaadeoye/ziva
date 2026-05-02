import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { isAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const db = await getDb();

    const [users, orders] = await Promise.all([
      db.collection("users")
        .find({})
        .sort({ createdAt: -1 })
        .project({ passwordHash: 0, salt: 0 })
        .toArray(),
      db.collection("orders").find({}).project({ userId: 1, total: 1 }).toArray(),
    ]);

    const customers = users.map((u) => {
      const { _id, ...user } = u;
      void _id;
      const userOrders = orders.filter((o) => o.userId === user.id);
      return {
        ...user,
        orderCount: userOrders.length,
        totalSpent: userOrders.reduce((s, o) => s + (Number(o.total) || 0), 0),
      };
    });

    return NextResponse.json({ customers });
  } catch (err) {
    console.error("[admin customers]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
