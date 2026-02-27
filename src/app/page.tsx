"use client";

import { useState, useCallback } from "react";
import Header from "@/components/Header";
import ReviewForm from "@/components/ReviewForm";
import ReviewOutput from "@/components/ReviewOutput";
import CreateChat from "@/components/PipelineChat";

type Mode = "review" | "create";

export default function Home() {
  const [mode, setMode] = useState<Mode>("create");

  // Review state
  const [review, setReview] = useState<string | null>(null);
  const [isReviewLoading, setIsReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [prefillReview, setPrefillReview] = useState<{
    draft: string;
    contentType: string;
    context: string;
  } | null>(null);

  // Review handler
  const handleReviewSubmit = async (data: {
    contentType: string;
    draft: string;
    context: string;
    reviewMode: string;
  }) => {
    setIsReviewLoading(true);
    setReviewError(null);
    setReview(null);
    setPrefillReview(null);

    try {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Something went wrong.");
      setReview(result.review);
    } catch (err: unknown) {
      setReviewError(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    } finally {
      setIsReviewLoading(false);
    }
  };

  // Create -> Review
  const handleCreateToReview = useCallback(
    (draft: string, contentType: string) => {
      setPrefillReview({
        draft,
        contentType,
        context:
          "This draft was produced by the AACM content creator. Reviewing for final approval.",
      });
      setReview(null);
      setReviewError(null);
      setMode("review");
    },
    []
  );

  return (
    <div className="min-h-screen bg-white">
      <Header activeMode={mode} onModeChange={setMode} />
      <main className="mx-auto px-6 py-10 max-w-5xl">
        {/* Review Mode */}
        <div className={mode === "review" ? "" : "hidden"}>
          <ReviewForm
            onSubmit={handleReviewSubmit}
            isLoading={isReviewLoading}
            initialDraft={prefillReview?.draft}
            initialContentType={prefillReview?.contentType}
            initialContext={prefillReview?.context}
            key={prefillReview ? JSON.stringify(prefillReview) : "review"}
          />
          {reviewError && (
            <div className="mt-6 rounded-lg border border-accent-danger/20 bg-red-50 px-5 py-4 text-sm text-accent-danger">
              {reviewError}
            </div>
          )}
          {review && (
            <div className="mt-8">
              <ReviewOutput review={review} />
            </div>
          )}
        </div>

        {/* Create Mode - Chat Interface */}
        <div className={mode === "create" ? "" : "hidden"}>
          <CreateChat
            onSendToReview={handleCreateToReview}
          />
        </div>
      </main>
    </div>
  );
}
