import { NextRequest, NextResponse } from "next/server";
import { listNotifications } from "@/lib/db";
import { verifyUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!verifyUser(req)) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { notifications, unreadCount } = await listNotifications(50);
  return NextResponse.json({ notifications, unread: unreadCount });
}
