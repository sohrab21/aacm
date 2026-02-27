"use client";

import { useState } from "react";

const CONTENT_TYPES = [
  { value: "LinkedIn Post", label: "LinkedIn Post" },
  { value: "Website Article", label: "Website Article" },
  { value: "Whitepaper", label: "Whitepaper" },
] as const;

interface PipelineFormProps {
  onResearch: (data: { contentArea: string; contentType: string }) => void;
  isLoading: boolean;
}

export default function PipelineForm({
  onResearch,
  isLoading,
}: PipelineFormProps) {
  const [contentType, setContentType] = useState("Website Article");
  const [contentArea, setContentArea] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentArea.trim()) return;
    onResearch({ contentArea, contentType });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Content Type */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-3">
          Content Type
        </label>
        <div className="flex gap-2">
          {CONTENT_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setContentType(type.value)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                contentType === type.value
                  ? "bg-accent text-white"
                  : "bg-surface-light text-text-secondary hover:text-text-primary hover:bg-surface-light/80"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div>
        <label
          htmlFor="content-area"
          className="block text-sm font-medium text-text-secondary mb-2"
        >
          What area should we explore?
        </label>
        <p className="text-xs text-text-muted mb-2">
          Describe the topic space you want content for. The system will research
          what's already out there and propose differentiated angles.
        </p>
        <textarea
          id="content-area"
          value={contentArea}
          onChange={(e) => setContentArea(e.target.value)}
          placeholder='e.g., "AI adoption in enterprise organizations" or "Why most agile transformations fail at the leadership level" or "The gap between strategy and execution in mid-size companies"'
          rows={4}
          className="w-full rounded-lg border border-border bg-surface p-4 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-1 focus:ring-accent resize-y"
        />
      </div>

      {/* Research Button */}
      <button
        type="submit"
        disabled={isLoading || !contentArea.trim()}
        className="w-full rounded-lg bg-accent py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
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
            Researching content landscape...
          </span>
        ) : (
          "Research & Propose Topics"
        )}
      </button>
    </form>
  );
}
