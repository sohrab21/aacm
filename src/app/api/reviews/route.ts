import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSessionEmail } from "@/lib/auth";

export async function GET() {
  const email = await getSessionEmail();
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db
    .select({
      id: reviews.id,
      contentType: reviews.contentType,
      reviewMode: reviews.reviewMode,
      rating: reviews.rating,
      draft: reviews.draft,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .where(eq(reviews.userEmail, email))
    .orderBy(desc(reviews.createdAt))
    .limit(50);

  const summaries = rows.map((r) => ({
    id: r.id,
    contentType: r.contentType,
    reviewMode: r.reviewMode,
    rating: r.rating,
    draftPreview: r.draft.length > 100 ? r.draft.slice(0, 100) + "..." : r.draft,
    createdAt: r.createdAt.toISOString(),
  }));

  return NextResponse.json({ reviews: summaries });
}
