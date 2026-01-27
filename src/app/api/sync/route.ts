import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ status: "ok", synced: true, received: body ?? null });
}
