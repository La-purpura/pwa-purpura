import { NextResponse } from "next/server";
import { mockNews } from "@/lib/mocks";

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(mockNews);
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ id: `news-${Date.now()}`, ...body });
}
