import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

if (!process.env.JWT_SECRET) {
  throw new Error("Missing JWT_SECRET env variable");
}
const JWT_SECRET = process.env.JWT_SECRET as string;

export function signAdminToken() {
  return jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "24h" });
}

export function verifyAdmin(req: NextRequest): boolean {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return false;
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { role?: string };
    return payload.role === "admin";
  } catch {
    return false;
  }
}
