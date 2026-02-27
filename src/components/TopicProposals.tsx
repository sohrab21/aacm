"use client";

import { useState } from "react";

interface TopicProposalsProps {
  proposals: string;
  hasWebSearch: boolean;
  contentType: string;
  onSelectTopic: (topic: string, contentType: string) => void;
  onResearchAgain: () => void;
}

export default function TopicProposals({
  proposals,
  hasWebSearch,
  contentType,
  onSelectTopic,
  onResearchAgain,
}: TopicProposalsProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [customBrief, setCustomBrief] = useState("");
  const [qualityThreshold, setQualityThreshold] = useState(8);
  const [maxIterations, setMaxIterations] = useState(3);

  // Parse the numbered proposals into blocks
  const blocks = proposals
    .split(/(?=^\d+\.)/m)
    .filter((b) => b.trim())
    .map((b) => b.trim());

  const handleWrite = () => {
    if (selectedIndex === null && !customBrief.trim()) return;

    const topic =
      selectedIndex !== null ? blocks[selectedIndex] : customBrief;

    onSelectTopic(
      JSON.stringify({
        topic,
        qualityThreshold,
        maxIterations,
        contentType,
      }),
      contentType
    );
  };

  return (
    <div className="space-y-6">
      {/* Research note */}
      <div className="rounded-lg border border-border bg-surface px-5 py-3">
        <p className="text-xs text-text-muted">
          {hasWebSearch
            ? "Topics proposed based on live web research and Agile Academy's content positioning."
            : "Topics proposed based on content analysis. Add a Brave Search API key to .env.local for live web research."}
        </p>
      </div>

      {/* Proposals */}
      <div className="space-y-3">
        {blocks.map((block, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setSelectedIndex(idx);
              setCustomBrief("");
            }}
            className={`w-full text-left rounded-lg border p-4 transition-colors ${
              selectedIndex === idx
                ? "border-accent bg-accent/10"
                : "border-border bg-surface hover:border-text-muted"
            }`}
          >
            <div className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
              {block}
            </div>
          </button>
        ))}
      </div>

      {/* Custom topic option */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Or describe your own topic
        </label>
        <textarea
          value={customBrief}
          onChange={(e) => {
            setCustomBrief(e.target.value);
            if (e.target.value.trim()) setSelectedIndex(null);
          }}
          placeholder="Write your own topic brief here if none of the above fit..."
          rows={3}
          className="w-full rounded-lg border border-border bg-surface p-4 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-1 focus:ring-accent resize-y"
        />
      </div>

      {/* Pipeline controls */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Quality Threshold
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={5}
              max={10}
              value={qualityThreshold}
              onChange={(e) => setQualityThreshold(parseInt(e.target.value))}
              className="flex-1 accent-accent"
            />
            <span className="text-sm font-bold text-text-primary w-8 text-center">
              {qualityThreshold}
            </span>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Minimum Bar Raiser score to pass
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Max Iterations
          </label>
          <select
            value={maxIterations}
            onChange={(e) => setMaxIterations(parseInt(e.target.value))}
            className="w-full rounded-lg border border-border bg-surface p-3 text-sm text-text-primary focus:border-accent focus:ring-1 focus:ring-accent"
          >
            <option value={2}>2 iterations</option>
            <option value={3}>3 iterations</option>
            <option value={5}>5 iterations</option>
          </select>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={onResearchAgain}
          className="rounded-lg border border-border px-4 py-3 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-light hover:text-text-primary"
        >
          Research Again
        </button>
        <button
          onClick={handleWrite}
          disabled={selectedIndex === null && !customBrief.trim()}
          className="flex-1 rounded-lg bg-accent py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Write & Review Selected Topic
        </button>
      </div>

      {/* Cost note */}
      <p className="text-xs text-text-muted text-center">
        The write phase makes multiple API calls. Each iteration uses
        approximately 2 calls. A {maxIterations}-iteration run uses up to{" "}
        {maxIterations * 2} calls.
      </p>
    </div>
  );
}
