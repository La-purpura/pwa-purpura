import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * DEPRECATED: Use /api/dashboard/summary instead.
 * Proxying for backward compatibility.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  url.pathname = '/api/dashboard/summary';
  return NextResponse.redirect(url);
}
