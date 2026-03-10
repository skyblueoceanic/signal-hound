import type { ContentItem } from "../types";
import { matchesAIKeywords } from "../config/ai-keywords";

const ALGOLIA_BASE = "https://hn.algolia.com/api/v1";
const HN_FIREBASE_BASE = "https://hacker-news.firebaseio.com/v0";

interface AlgoliaHit {
  objectID: string;
  title: string;
  url: string | null;
  author: string;
  points: number;
  num_comments: number;
  created_at: string;
  story_text?: string;
}

interface AlgoliaResponse {
  hits: AlgoliaHit[];
}

// Search for AI-related stories using Algolia
export async function fetchAIStories(): Promise<ContentItem[]> {
  const queries = [
    "AI", "LLM", "GPT", "OpenAI", "Anthropic", "machine learning",
    "deep learning", "neural network", "ChatGPT", "Claude",
    "NVIDIA", "GPU", "DeepSeek", "Gemini",
  ];

  const allItems: ContentItem[] = [];
  const seenIds = new Set<string>();

  // Search for each query in parallel (limited to avoid rate limits)
  const results = await Promise.allSettled(
    queries.map((q) =>
      fetch(
        `${ALGOLIA_BASE}/search_by_date?query=${encodeURIComponent(q)}&tags=story&hitsPerPage=20`
      ).then((r) => r.json() as Promise<AlgoliaResponse>)
    )
  );

  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    for (const hit of result.value.hits) {
      if (seenIds.has(hit.objectID)) continue;
      seenIds.add(hit.objectID);

      const text = `${hit.title} ${hit.story_text || ""}`;
      const { matches, matchedTerms } = matchesAIKeywords(text);
      if (!matches) continue;

      allItems.push({
        sourceType: "hackernews",
        externalId: hit.objectID,
        title: hit.title,
        url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
        author: hit.author,
        description: hit.story_text || null,
        publishedAt: new Date(hit.created_at),
        score: hit.points || 0,
        commentCount: hit.num_comments || 0,
        matchedKeywords: matchedTerms,
      });
    }
  }

  return allItems;
}

// Also fetch top stories from Firebase and filter for AI
export async function fetchTopAIStories(): Promise<ContentItem[]> {
  const res = await fetch(`${HN_FIREBASE_BASE}/topstories.json`);
  const ids: number[] = await res.json();

  // Fetch top 100 stories
  const top100 = ids.slice(0, 100);
  const stories = await Promise.allSettled(
    top100.map((id) =>
      fetch(`${HN_FIREBASE_BASE}/item/${id}.json`).then((r) => r.json())
    )
  );

  const items: ContentItem[] = [];
  for (const result of stories) {
    if (result.status !== "fulfilled" || !result.value) continue;
    const story = result.value;
    if (story.type !== "story" || story.dead || story.deleted) continue;

    const text = `${story.title || ""} ${story.text || ""}`;
    const { matches, matchedTerms } = matchesAIKeywords(text);
    if (!matches) continue;

    items.push({
      sourceType: "hackernews",
      externalId: String(story.id),
      title: story.title || "",
      url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
      author: story.by || null,
      description: story.text || null,
      publishedAt: new Date(story.time * 1000),
      score: story.score || 0,
      commentCount: story.descendants || 0,
      matchedKeywords: matchedTerms,
    });
  }

  return items;
}
