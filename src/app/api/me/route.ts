import { NextResponse } from "next/server";
import { mockUser } from "@/lib/mocks";

export async function GET() {
  return NextResponse.json(mockUser);
}

export async function PUT(request: Request) {
  const body = await request.json();

  // In a real app, validate and update in DB
  // Here we just return the merged data to simulate a successful update
  const updatedUser = {
    ...mockUser,
    ...body,
  };

  return NextResponse.json(updatedUser);
}
