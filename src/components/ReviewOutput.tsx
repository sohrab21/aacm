"use client";

import { useState } from "react";

interface ReviewOutputProps {
  review: string;
  contentType?: string;
  draft?: string;
  createdAt?: string;
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

function renderReviewContent(review: string) {
  const lines = review.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      elements.push(<br key={i} />);
      i++;
      continue;
    }

    const isSectionHeader =
      /^(VERDICT|RATING|CRITIQUES?|SPECIFIC CRITIQUES?|CONTENT TYPE CHECK|IMPROVEMENT DIRECTION)/i.test(
        trimmed
      );

    if (isSectionHeader) {
      elements.push(
        <p
          key={i}
          className="font-bold text-accent mt-5 mb-2 text-xs uppercase tracking-widest"
        >
          {trimmed}
        </p>
      );
      i++;
      continue;
    }

    // Check for numbered critique with possible improvement direction following
    const numberedCritique = trimmed.match(/^(\d+)\.\s/);
    if (numberedCritique) {
      // Collect the critique text (may span multiple lines until next numbered item, section header, or improvement direction marker)
      let critiqueLines = [trimmed];
      let directionLines: string[] = [];
      let inDirection = false;
      let j = i + 1;

      while (j < lines.length) {
        const nextTrimmed = lines[j].trim();
        if (!nextTrimmed) {
          // Empty line could be between critique and direction, or end of block
          // Peek ahead to see if direction follows
          if (!inDirection && j + 1 < lines.length) {
            const peekTrimmed = lines[j + 1].trim();
            if (
              /^(IMPROVEMENT DIRECTION|Direction:|>>|→)/i.test(peekTrimmed)
            ) {
              j++;
              continue;
            }
          }
          break;
        }
        if (/^(\d+)\.\s/.test(nextTrimmed)) break;
        if (
          /^(VERDICT|RATING|CRITIQUES?|SPECIFIC CRITIQUES?|CONTENT TYPE CHECK)/i.test(
            nextTrimmed
          )
        )
          break;

        // Detect improvement direction
        if (
          /^(IMPROVEMENT DIRECTION|Direction:|>>|→)/i.test(nextTrimmed)
        ) {
          inDirection = true;
          directionLines.push(
            nextTrimmed
              .replace(/^(IMPROVEMENT DIRECTION[:\s]*|Direction:\s*|>>\s*|→\s*)/i, "")
              .trim()
          );
          j++;
          continue;
        }

        if (inDirection) {
          directionLines.push(nextTrimmed);
        } else {
          critiqueLines.push(nextTrimmed);
        }
        j++;
      }

      elements.push(
        <div key={i} className="mb-4">
          <p className="text-text-primary text-sm leading-relaxed pl-3 border-l-2 border-border">
            {critiqueLines.join(" ")}
          </p>
          {directionLines.length > 0 && (
            <div className="mt-2 ml-3 pl-3 border-l-2 border-accent bg-accent/5 rounded-r py-2 pr-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-1">
                Improvement Direction
              </p>
              <p className="text-sm text-text-secondary leading-relaxed italic">
                {directionLines.join(" ")}
              </p>
            </div>
          )}
        </div>
      );
      i = j;
      continue;
    }

    // Default paragraph
    elements.push(
      <p key={i} className="text-text-secondary text-sm leading-relaxed mb-1">
        {trimmed}
      </p>
    );
    i++;
  }

  return elements;
}

export default function ReviewOutput({ review, contentType, draft, createdAt }: ReviewOutputProps) {
  const [copied, setCopied] = useState(false);
  const rating = parseRating(review);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(review);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    const date = createdAt
      ? new Date(createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

    const lines = [
      `# Bar Raiser Review`,
      ``,
      `**Date:** ${date}`,
    ];
    if (contentType) lines.push(`**Content Type:** ${contentType}`);
    if (rating !== null) lines.push(`**Rating:** ${rating}/10`);
    lines.push(``);

    if (draft) {
      lines.push(`## Draft`, ``, draft, ``);
    }

    lines.push(`## Review`, ``, review, ``);

    const markdown = lines.join("\n");
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `review-${date.replace(/\s+/g, "-").replace(/,/g, "").toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-[0.75rem] border border-border bg-surface shadow-[var(--shadow-s)]">
      {/* Header with rating */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-muted">
          Bar Raiser Review
        </h2>
        <div className="flex items-center gap-4">
          {rating !== null && (
            <span className={`text-2xl font-bold ${getRatingColor(rating)}`}>
              {rating}
              <span className="text-sm text-text-muted">/10</span>
            </span>
          )}
          <button
            onClick={handleExport}
            className="rounded-[4px] border border-border px-3 py-1.5 text-xs font-bold tracking-wide text-text-secondary transition-colors hover:bg-surface-light hover:text-text-primary"
          >
            Export .md
          </button>
          <button
            onClick={handleCopy}
            className="rounded-[4px] border border-border px-3 py-1.5 text-xs font-bold tracking-wide text-text-secondary transition-colors hover:bg-surface-light hover:text-text-primary"
          >
            {copied ? "Copied!" : "Copy Review"}
          </button>
        </div>
      </div>

      {/* Review content */}
      <div className="px-6 py-5">{renderReviewContent(review)}</div>
    </div>
  );
}
