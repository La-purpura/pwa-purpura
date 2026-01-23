import { NextResponse } from "next/server";
import { mockReports } from "@/lib/mocks";

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(mockReports);
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ id: `REP-${Date.now()}`, ...body });
}
