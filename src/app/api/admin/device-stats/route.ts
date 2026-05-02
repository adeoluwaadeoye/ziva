import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { isAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().slice(0, 10);
  });
  const db = await getDb();
  const rows = await db.collection("visit_stats")
    .find({ date: { $in: days } }, { projection: { _id: 0 } })
    .toArray();
  const totals = { mobile: 0, tablet: 0, desktop: 0 };
  rows.forEach((r) => {
    totals.mobile  += (r.mobile  as number) ?? 0;
    totals.tablet  += (r.tablet  as number) ?? 0;
    totals.desktop += (r.desktop as number) ?? 0;
  });
  return NextResponse.json({ totals });
}
