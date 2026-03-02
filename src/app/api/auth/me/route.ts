import { NextResponse } from "next/server";
import { getSessionEmail } from "@/lib/auth";

export async function GET() {
  const email = await getSessionEmail();

  if (!email) {
    return NextResponse.json({ email: null }, { status: 401 });
  }

  return NextResponse.json({ email });
}
