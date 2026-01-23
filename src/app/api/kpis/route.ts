import { NextResponse } from "next/server";
import { mockKpis } from "@/lib/mocks";

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(mockKpis);
}
