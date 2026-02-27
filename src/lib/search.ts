/**
 * Web search integration for content research.
 * Uses Brave Search API if BRAVE_SEARCH_API_KEY is configured.
 * Returns null if no API key is available (pipeline falls back to Claude's knowledge).
 */

interface SearchResult {
  title: string;
  url: string;
  description: string;
}

export async function webSearch(
  query: string,
  count: number = 10
): Promise<SearchResult[] | null> {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;
  if (!apiKey) return null;

  try {
    const params = new URLSearchParams({
      q: query,
      count: String(count),
      text_decorations: "false",
      search_lang: "en",
    });

    const response = await fetch(
      `https://api.search.brave.com/res/v1/web/search?${params}`,
      {
        headers: {
          Accept: "application/json",
          "Accept-Encoding": "gzip",
          "X-Subscription-Token": apiKey,
        },
      }
    );

    if (!response.ok) {
      console.error("Brave Search error:", response.status);
      return null;
    }

    const data = await response.json();
    const results: SearchResult[] = (data.web?.results || []).map(
      (r: { title: string; url: string; description: string }) => ({
        title: r.title,
        url: r.url,
        description: r.description,
      })
    );

    return results;
  } catch (error) {
    console.error("Search error:", error);
    return null;
  }
}

export async function researchTopic(topic: string): Promise<string> {
  const queries = [
    `${topic} thought leadership 2025 2026`,
    `${topic} leadership consulting perspective`,
    `${topic} organizational strategy article`,
  ];

  const allResults: SearchResult[] = [];

  for (const query of queries) {
    const results = await webSearch(query, 8);
    if (results) {
      allResults.push(...results);
    }
  }

  if (allResults.length === 0) {
    return "NO_WEB_SEARCH: Web search is not available. Use your training knowledge to analyze the current content landscape for this topic.";
  }

  const formatted = allResults
    .map((r, i) => `${i + 1}. "${r.title}" - ${r.url}\n   ${r.description}`)
    .join("\n\n");

  return `WEB RESEARCH RESULTS (${allResults.length} articles found):\n\n${formatted}`;
}
