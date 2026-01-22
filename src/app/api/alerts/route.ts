import { NextResponse } from "next/server";
import { db } from "@/lib/server-db";

export async function GET() {
  return NextResponse.json(db.alerts.getAll());
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newAlert = db.alerts.create({
      ...body,
      isRead: false,
      createdAt: new Date().toISOString()
    });
    return NextResponse.json(newAlert);
  } catch (error) {
    return NextResponse.json({ error: "Create failed" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  // Placeholder for marking read
  return NextResponse.json({ updated: true });
}
