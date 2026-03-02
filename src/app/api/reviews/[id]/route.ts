import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getSessionEmail } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const email = await getSessionEmail();
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [row] = await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.id, id), eq(reviews.userEmail, email)))
    .limit(1);

  if (!row) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: row.id,
    contentType: row.contentType,
    reviewMode: row.reviewMode,
    draft: row.draft,
    context: row.context,
    review: row.review,
    rating: row.rating,
    createdAt: row.createdAt.toISOString(),
  });
}
