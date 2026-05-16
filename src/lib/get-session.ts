import { NextRequest } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function getSessionUserId(req: NextRequest): Promise<string | null> {
  const token =
    req.cookies.get("ziva-session")?.value ??
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  try {
    const db = await getDb();
    const session = await db.collection("sessions").findOne({ token });
    if (!session || new Date(session.expiresAt) < new Date()) return null;
    return session.userId as string;
  } catch {
    return null;
  }
}
