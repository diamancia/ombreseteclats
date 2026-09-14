import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/mongoose";
import { Notification } from "@/lib/models";
import { verifyUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!verifyUser(req)) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  await connectDb();
  const [notifications, unread] = await Promise.all([
    Notification.find().sort({ createdAt: -1 }).limit(50),
    Notification.countDocuments({ read: false }),
  ]);
  return NextResponse.json({ notifications, unread });
}
