import crypto from "crypto";
import { NextRequest } from "next/server";

export function adminToken(): string {
  const secret = process.env.ADMIN_SECRET ?? "";
  return crypto.createHash("sha256").update(secret + "ziva-admin").digest("hex");
}

export function isAdmin(req: NextRequest): boolean {
  const expected = adminToken();
  return (
    req.cookies.get("admin-token")?.value === expected ||
    req.headers.get("x-admin-token") === expected
  );
}
