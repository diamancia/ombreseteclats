import { NextRequest, NextResponse } from "next/server";
import { markAllNotificationsRead } from "@/lib/db";
import { verifyUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  if (!verifyUser(req)) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  await markAllNotificationsRead();
  return NextResponse.json({ message: "Tout marqué comme lu" });
}
