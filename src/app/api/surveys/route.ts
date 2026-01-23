import { NextResponse } from "next/server";
import { mockSurveys } from "@/lib/mocks";

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(mockSurveys);
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ id: `survey-${Date.now()}`, ...body });
}
