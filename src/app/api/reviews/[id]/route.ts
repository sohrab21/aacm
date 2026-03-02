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
    overrideRating: row.overrideRating,
    overrideNotes: row.overrideNotes,
    createdAt: row.createdAt.toISOString(),
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const email = await getSessionEmail();
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { overrideRating, overrideNotes } = body;

  // Validate rating: must be integer 1-10 or null (to clear)
  if (overrideRating !== null && overrideRating !== undefined) {
    if (!Number.isInteger(overrideRating) || overrideRating < 1 || overrideRating > 10) {
      return NextResponse.json(
        { error: "Override rating must be an integer between 1 and 10" },
        { status: 400 }
      );
    }
  }

  const [updated] = await db
    .update(reviews)
    .set({
      overrideRating: overrideRating ?? null,
      overrideNotes: overrideNotes ?? null,
    })
    .where(and(eq(reviews.id, id), eq(reviews.userEmail, email)))
    .returning({ id: reviews.id });

  if (!updated) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
