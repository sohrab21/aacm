"use client";

import { useState } from "react";

const CONTENT_TYPES = [
  { value: "LinkedIn Post", label: "LinkedIn Post" },
  { value: "Website Article", label: "Website Article" },
  { value: "Whitepaper", label: "Whitepaper" },
  { value: "Newspaper Article", label: "Newspaper Article" },
  { value: "IMD Article", label: "IMD Article" },
] as const;

const TONES = [
  { value: "Let the AI decide based on content type", label: "Auto (based on content type)" },
  { value: "Direct & Provocative", label: "Direct & Provocative" },
  { value: "Analytical & Structured", label: "Analytical & Structured" },
  { value: "Authoritative & Evidence-Based", label: "Authoritative & Evidence-Based" },
] as const;

interface CreateFormProps {
  onSubmit: (data: {
    contentType: string;
    tone: string;
    brief: string;
    referenceMaterial: string;
  }) => void;
  isLoading: boolean;
}

export default function CreateForm({ onSubmit, isLoading }: CreateFormProps) {
  const [contentType, setContentType] = useState("LinkedIn Post");
  const [tone, setTone] = useState("Let the AI decide based on content type");
  const [brief, setBrief] = useState("");
  const [referenceMaterial, setReferenceMaterial] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brief.trim()) return;
    onSubmit({ contentType, tone, brief, referenceMaterial });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Content Type Selector */}
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

      {/* Tone Selector */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-3">
          Tone
        </label>
        <select
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          className="w-full rounded-lg border border-border bg-input-bg p-3 text-sm text-text-primary focus:border-accent focus:ring-1 focus:ring-accent"
        >
          {TONES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Brief Input */}
      <div>
        <label
          htmlFor="brief"
          className="block text-sm font-medium text-text-secondary mb-2"
        >
          What is this piece about?
        </label>
        <p className="text-xs text-text-muted mb-2">
          Include your core argument, target audience, and any specific examples
          or data you want to include.
        </p>
        <textarea
          id="brief"
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          placeholder="Describe what you want to write about..."
          rows={8}
          className="w-full rounded-lg border border-border bg-input-bg p-4 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-1 focus:ring-accent resize-y"
        />
      </div>

      {/* Reference Material */}
      <div>
        <label
          htmlFor="reference"
          className="block text-sm font-medium text-text-secondary mb-2"
        >
          Reference Material{" "}
          <span className="text-text-muted font-normal">(optional)</span>
        </label>
        <textarea
          id="reference"
          value={referenceMaterial}
          onChange={(e) => setReferenceMaterial(e.target.value)}
          placeholder="Paste any reference material, notes, quotes, or data you want the piece to draw from."
          rows={4}
          className="w-full rounded-lg border border-border bg-input-bg p-4 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-1 focus:ring-accent resize-y"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !brief.trim()}
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
            Writing First Draft...
          </span>
        ) : (
          "Write First Draft"
        )}
      </button>
    </form>
  );
}
