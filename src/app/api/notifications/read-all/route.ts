import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/mongoose";
import { Notification } from "@/lib/models";
import { verifyUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  if (!verifyUser(req)) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  await connectDb();
  await Notification.updateMany({ read: false }, { read: true });
  return NextResponse.json({ message: "Tout marqué comme lu" });
}
