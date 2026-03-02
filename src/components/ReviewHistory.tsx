"use client";

import { useState, useEffect, useCallback } from "react";

interface ReviewSummary {
  id: string;
  contentType: string;
  reviewMode: string;
  rating: number | null;
  draftPreview: string;
  createdAt: string;
}

interface ReviewHistoryProps {
  onSelect: (id: string) => void;
  refreshTrigger: number;
}

function getRatingColor(rating: number): string {
  if (rating <= 3) return "text-accent-danger";
  if (rating <= 5) return "text-orange-600";
  if (rating <= 7) return "text-yellow-600";
  return "text-accent";
}

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function ReviewHistory({
  onSelect,
  refreshTrigger,
}: ReviewHistoryProps) {
  const [open, setOpen] = useState(false);
  const [reviews, setReviews] = useState<ReviewSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reviews");
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews);
      }
    } catch {
      // Silently fail — history is non-critical
    } finally {
      setLoading(false);
      setFetched(true);
    }
  }, []);

  // Lazy fetch on first open
  useEffect(() => {
    if (open && !fetched) {
      fetchReviews();
    }
  }, [open, fetched, fetchReviews]);

  // Re-fetch when refreshTrigger changes (new review submitted)
  useEffect(() => {
    if (refreshTrigger > 0 && open) {
      fetchReviews();
    }
    // Also mark as needing re-fetch if closed
    if (refreshTrigger > 0 && !open) {
      setFetched(false);
    }
  }, [refreshTrigger, open, fetchReviews]);

  return (
    <div className="mt-8">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm font-semibold text-text-muted hover:text-text-primary transition-colors"
      >
        <span
          className="inline-block transition-transform"
          style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
        >
          &#9654;
        </span>
        Review History
      </button>

      {open && (
        <div className="mt-3 rounded-[0.75rem] border border-border bg-surface shadow-[var(--shadow-s)]">
          {loading && !reviews.length ? (
            <div className="px-6 py-8 text-center text-sm text-text-muted">
              Loading...
            </div>
          ) : reviews.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-text-muted">
              No reviews yet. Submit a draft to get started.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {reviews.map((r) => (
                <button
                  key={r.id}
                  onClick={() => onSelect(r.id)}
                  className="w-full text-left px-6 py-4 hover:bg-surface-light transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-text-primary truncate">
                        {r.draftPreview}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs font-medium text-text-muted bg-neutral-light px-2 py-0.5 rounded">
                          {r.contentType}
                        </span>
                        <span className="text-xs text-text-muted">
                          {relativeTime(r.createdAt)}
                        </span>
                      </div>
                    </div>
                    {r.rating !== null && (
                      <span
                        className={`text-lg font-bold ${getRatingColor(r.rating)} shrink-0`}
                      >
                        {r.rating}
                        <span className="text-xs text-text-muted">/10</span>
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
