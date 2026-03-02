"use client";

import { useState } from "react";

const CONTENT_TYPES = [
  { value: "LinkedIn Post", label: "LinkedIn Post" },
  { value: "Website Article", label: "Website Article" },
  { value: "Whitepaper", label: "Whitepaper" },
  { value: "Newspaper Article", label: "Newspaper Article" },
  { value: "IMD Article", label: "IMD Article" },
] as const;

interface ReviewFormProps {
  onSubmit: (data: {
    contentType: string;
    draft: string;
    context: string;
    reviewMode: string;
  }) => void;
  isLoading: boolean;
  initialDraft?: string;
  initialContentType?: string;
  initialContext?: string;
}

export default function ReviewForm({
  onSubmit,
  isLoading,
  initialDraft = "",
  initialContentType = "LinkedIn Post",
  initialContext = "",
}: ReviewFormProps) {
  const [contentType, setContentType] = useState(initialContentType);
  const [draft, setDraft] = useState(initialDraft);
  const [context, setContext] = useState(initialContext);
  const [reviewMode, setReviewMode] = useState("critique_with_directions");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    onSubmit({ contentType, draft, context, reviewMode });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-[calc(100vh-280px)] min-h-[500px]">
      {/* Inline settings bar */}
      <div className="flex items-center gap-4 mb-4 px-1">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span>Type:</span>
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
            className="bg-input-bg border border-border rounded px-2 py-1 text-xs text-text-primary"
          >
            {CONTENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span>Mode:</span>
          <select
            value={reviewMode}
            onChange={(e) => setReviewMode(e.target.value)}
            className="bg-input-bg border border-border rounded px-2 py-1 text-xs text-text-primary"
          >
            <option value="critique_with_directions">Critique + Directions</option>
            <option value="critique_only">Critique Only</option>
          </select>
        </div>
      </div>

      {/* Draft textarea fills vertical space */}
      <div className="flex-1 min-h-0 mb-4">
        <textarea
          id="draft"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Paste your draft here..."
          className="w-full h-full rounded-[0.75rem] border border-border bg-input-bg p-4 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-1 focus:ring-accent resize-none"
        />
      </div>

      {/* Context + submit button in a row */}
      <div className="flex gap-2">
        <textarea
          id="context"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Optional context, e.g. target audience or related content..."
          rows={2}
          className="flex-1 rounded-[0.5rem] border border-border bg-input-bg p-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-1 focus:ring-accent resize-none"
        />
        <button
          type="submit"
          disabled={isLoading || !draft.trim()}
          className="self-end rounded-[4px] bg-accent px-4 py-3 text-sm font-bold tracking-wide text-white transition-colors hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Reviewing...
            </span>
          ) : (
            "Review"
          )}
        </button>
      </div>
    </form>
  );
}
