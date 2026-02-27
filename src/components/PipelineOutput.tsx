"use client";

import { useState } from "react";
import ReviewOutput from "./ReviewOutput";

export interface PipelineIteration {
  iteration: number;
  draft: string;
  review: string;
  rating: number | null;
}

interface PipelineOutputProps {
  iterations: PipelineIteration[];
  finalDraft: string;
  finalReview: string;
  status: string;
  onEditInCreateMode: (draft: string) => void;
  onReviewAgain: (draft: string, contentType: string) => void;
  contentType: string;
}

function parseRating(review: string): number | null {
  const match = review.match(
    /\bRATING[:\s]*(\d{1,2})\s*(?:\/\s*10|out of 10)/i
  );
  if (match) return parseInt(match[1], 10);
  const altMatch = review.match(/(\d{1,2})\s*\/\s*10/);
  if (altMatch) return parseInt(altMatch[1], 10);
  return null;
}

function getRatingColor(rating: number): string {
  if (rating <= 3) return "text-accent-danger";
  if (rating <= 5) return "text-orange-600";
  if (rating <= 7) return "text-yellow-600";
  return "text-accent";
}

export default function PipelineOutput({
  iterations,
  finalDraft,
  finalReview,
  status,
  onEditInCreateMode,
  onReviewAgain,
  contentType,
}: PipelineOutputProps) {
  const [copied, setCopied] = useState(false);
  const [expandedIterations, setExpandedIterations] = useState<Set<number>>(
    new Set()
  );

  const handleCopy = async () => {
    await navigator.clipboard.writeText(finalDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleIteration = (idx: number) => {
    const next = new Set(expandedIterations);
    if (next.has(idx)) {
      next.delete(idx);
    } else {
      next.add(idx);
    }
    setExpandedIterations(next);
  };

  const finalRating = finalReview ? parseRating(finalReview) : null;

  return (
    <div className="space-y-6">
      {/* Final Draft */}
      <div className="rounded-lg border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-text-muted">
              Final Draft
            </h2>
            {finalRating !== null && (
              <span
                className={`text-lg font-bold ${getRatingColor(finalRating)}`}
              >
                {finalRating}
                <span className="text-xs text-text-muted">/10</span>
              </span>
            )}
            <span className="text-xs text-text-muted">
              ({iterations.length} iteration{iterations.length !== 1 ? "s" : ""})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-light hover:text-text-primary"
            >
              {copied ? "Copied!" : "Copy Final Draft"}
            </button>
            <button
              onClick={() => onEditInCreateMode(finalDraft)}
              className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-light hover:text-text-primary"
            >
              Edit in Create Mode
            </button>
            <button
              onClick={() => onReviewAgain(finalDraft, contentType)}
              className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent-hover"
            >
              Review Again
            </button>
          </div>
        </div>

        <div className="px-6 py-5">
          {finalDraft.split("\n").map((line, i) => {
            if (!line.trim()) return <br key={i} />;
            if (line.startsWith("# "))
              return (
                <h1
                  key={i}
                  className="text-xl font-bold text-text-primary mt-4 mb-2"
                >
                  {line.replace(/^#\s+/, "")}
                </h1>
              );
            if (line.startsWith("## "))
              return (
                <h2
                  key={i}
                  className="text-lg font-bold text-text-primary mt-4 mb-2"
                >
                  {line.replace(/^##\s+/, "")}
                </h2>
              );
            if (line.startsWith("### "))
              return (
                <h3
                  key={i}
                  className="text-base font-semibold text-text-primary mt-3 mb-1"
                >
                  {line.replace(/^###\s+/, "")}
                </h3>
              );
            return (
              <p
                key={i}
                className="text-text-secondary text-sm leading-relaxed mb-2"
              >
                {line}
              </p>
            );
          })}
        </div>
      </div>

      {/* Final Review */}
      {finalReview && <ReviewOutput review={finalReview} />}

      {/* Pipeline Log */}
      {iterations.length > 0 && (
        <div className="rounded-lg border border-border bg-surface">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-text-muted">
              Pipeline Log
            </h2>
          </div>
          <div className="divide-y divide-border">
            {iterations.map((iter, idx) => (
              <div key={idx} className="px-6 py-3">
                <button
                  onClick={() => toggleIteration(idx)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-text-primary">
                      Iteration {iter.iteration}
                    </span>
                    {iter.rating !== null && (
                      <span
                        className={`text-sm font-bold ${getRatingColor(iter.rating)}`}
                      >
                        {iter.rating}/10
                      </span>
                    )}
                  </div>
                  <span className="text-text-muted text-xs">
                    {expandedIterations.has(idx) ? "Collapse" : "Expand"}
                  </span>
                </button>

                {expandedIterations.has(idx) && (
                  <div className="mt-3 space-y-3">
                    <div className="rounded border border-border bg-surface p-4">
                      <p className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-2">
                        Draft
                      </p>
                      <div className="text-sm text-text-secondary leading-relaxed max-h-60 overflow-y-auto">
                        {iter.draft.split("\n").map((line, i) =>
                          line.trim() ? (
                            <p key={i} className="mb-1">
                              {line}
                            </p>
                          ) : (
                            <br key={i} />
                          )
                        )}
                      </div>
                    </div>
                    <div className="rounded border border-border bg-surface p-4">
                      <p className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-2">
                        Review
                      </p>
                      <div className="text-sm text-text-secondary leading-relaxed max-h-60 overflow-y-auto">
                        {iter.review.split("\n").map((line, i) =>
                          line.trim() ? (
                            <p key={i} className="mb-1">
                              {line}
                            </p>
                          ) : (
                            <br key={i} />
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status */}
      {status && (
        <p className="text-center text-xs text-text-muted">{status}</p>
      )}
    </div>
  );
}
