import Parser from "rss-parser";
import type { ContentItem } from "../types";
import { matchesAIKeywords } from "../config/ai-keywords";

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "Trending/0.1.0 (AI content monitor)",
  },
});

// Curated list of AI-focused RSS feeds
export const AI_RSS_FEEDS: Array<{
  name: string;
  url: string;
  category: "newsletter" | "company" | "news";
}> = [
  // Company blogs
  { name: "OpenAI Blog", url: "https://openai.com/news/rss.xml", category: "company" },
  { name: "Google AI Blog", url: "https://blog.google/technology/ai/rss/", category: "company" },
  { name: "Anthropic Blog", url: "https://www.anthropic.com/feed.xml", category: "company" },
  { name: "Microsoft Research", url: "https://www.microsoft.com/en-us/research/feed/", category: "company" },
  { name: "NVIDIA Blog", url: "https://blogs.nvidia.com/feed/", category: "company" },

  // AI newsletters on Substack
  { name: "AI News (Artificial Intelligence)", url: "https://www.artificialintelligence-news.com/feed/", category: "newsletter" },
  { name: "Import AI", url: "https://importai.substack.com/feed", category: "newsletter" },
  { name: "The Gradient", url: "https://thegradient.pub/rss/", category: "newsletter" },
  { name: "AI Supremacy", url: "https://aisupremacy.substack.com/feed", category: "newsletter" },
  { name: "Ahead of AI", url: "https://magazine.sebastianraschka.com/feed", category: "newsletter" },
  { name: "Interconnects", url: "https://www.interconnects.ai/feed", category: "newsletter" },
  { name: "One Useful Thing", url: "https://www.oneusefulthing.org/feed", category: "newsletter" },
  { name: "Latent Space", url: "https://www.latent.space/feed", category: "newsletter" },
  { name: "Semianalysis", url: "https://semianalysis.substack.com/feed", category: "newsletter" },
  { name: "Stratechery", url: "https://stratechery.com/feed/", category: "newsletter" },

  // AI news sites
  { name: "MIT Technology Review AI", url: "https://www.technologyreview.com/feed/", category: "news" },
  { name: "The Verge AI", url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml", category: "news" },
  { name: "Ars Technica AI", url: "https://feeds.arstechnica.com/arstechnica/technology-lab", category: "news" },
  { name: "TechCrunch AI", url: "https://techcrunch.com/category/artificial-intelligence/feed/", category: "news" },
  { name: "VentureBeat AI", url: "https://venturebeat.com/category/ai/feed/", category: "news" },
];

export async function fetchRSSFeed(
  feedUrl: string,
  feedName: string
): Promise<ContentItem[]> {
  try {
    const feed = await parser.parseURL(feedUrl);
    const items: ContentItem[] = [];

    for (const entry of feed.items.slice(0, 20)) {
      if (!entry.title) continue;

      const text = `${entry.title} ${entry.contentSnippet || ""} ${entry.content || ""}`;
      const { matches, matchedTerms } = matchesAIKeywords(text);

      // For AI-specific feeds, include all posts
      // For general tech feeds, only include if keywords match
      const isAIFeed =
        feedName.toLowerCase().includes("ai") ||
        feedName.toLowerCase().includes("deeplearning") ||
        feedName.toLowerCase().includes("machine");

      if (!isAIFeed && !matches) continue;

      const keywords = matches ? matchedTerms : ["AI-feed"];

      items.push({
        sourceType: "rss",
        externalId: entry.guid || entry.link || entry.title,
        title: entry.title,
        url: entry.link || feedUrl,
        author: typeof entry.creator === "string"
          ? entry.creator
          : typeof entry.author === "string"
            ? entry.author
            : feedName,
        description: entry.contentSnippet?.slice(0, 500) || null,
        publishedAt: entry.pubDate ? new Date(entry.pubDate) : new Date(),
        score: 0, // RSS feeds don't have engagement metrics
        commentCount: 0,
        matchedKeywords: keywords,
      });
    }

    return items;
  } catch (err) {
    console.error(`RSS fetch error for ${feedName} (${feedUrl}):`, err);
    return [];
  }
}

export async function fetchAllAIFeeds(): Promise<ContentItem[]> {
  // Fetch all feeds in parallel, but limit concurrency to avoid overwhelming
  const batchSize = 5;
  const allItems: ContentItem[] = [];
  const seenIds = new Set<string>();

  for (let i = 0; i < AI_RSS_FEEDS.length; i += batchSize) {
    const batch = AI_RSS_FEEDS.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map((feed) => fetchRSSFeed(feed.url, feed.name))
    );

    for (const result of results) {
      if (result.status !== "fulfilled") continue;
      for (const item of result.value) {
        if (seenIds.has(item.externalId)) continue;
        seenIds.add(item.externalId);
        allItems.push(item);
      }
    }
  }

  return allItems;
}
