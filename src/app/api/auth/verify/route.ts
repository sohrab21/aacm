import { NextRequest, NextResponse } from "next/server";
import { verifyToken, createSessionToken, setSessionCookie } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=missing-token", request.url));
  }

  const result = await verifyToken(token, "magic-link");

  if (!result) {
    return NextResponse.redirect(new URL("/login?error=invalid-or-expired", request.url));
  }

  const sessionToken = await createSessionToken(result.email);
  await setSessionCookie(sessionToken);

  return NextResponse.redirect(new URL("/", request.url));
}
