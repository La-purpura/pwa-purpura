import { NextResponse } from "next/server";
import { mockInvites } from "@/lib/mocks";

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(mockInvites);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return NextResponse.json({
    id: `invite-${Date.now()}`,
    sentAt: new Date().toISOString(),
    ...body,
  });
}
