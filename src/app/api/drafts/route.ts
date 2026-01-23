import { NextResponse } from "next/server";
import { mockDrafts } from "@/lib/mocks";

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(mockDrafts);
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ id: `draft-${Date.now()}`, ...body });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  return NextResponse.json({ updated: true, ...body });
}
