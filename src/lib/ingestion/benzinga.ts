import type { ContentItem } from "../types";
import { matchesAIKeywords } from "../config/ai-keywords";

// Benzinga free tier on AWS Marketplace provides headlines + teasers
// Without an API key, we use their public RSS feed as an alternative
const BENZINGA_RSS = "https://www.benzinga.com/feed";

// Benzinga API (requires free API key from AWS Marketplace)
const BENZINGA_API = "https://api.benzinga.com/api/v2/news";

export async function fetchBenzingaHeadlines(): Promise<ContentItem[]> {
  // Try API first if token is available
  if (process.env.BENZINGA_API_KEY) {
    return fetchBenzingaAPI();
  }

  // Fallback to RSS
  return fetchBenzingaRSS();
}

async function fetchBenzingaAPI(): Promise<ContentItem[]> {
  const apiKey = process.env.BENZINGA_API_KEY;
  if (!apiKey) return [];

  try {
    const url = `${BENZINGA_API}?token=${apiKey}&pageSize=20&displayOutput=full`;
    const res = await fetch(url);

    if (!res.ok) {
      console.error(`Benzinga API error: ${res.status}`);
      return fetchBenzingaRSS(); // Fallback to RSS
    }

    const data = await res.json();
    const items: ContentItem[] = [];

    for (const article of data) {
      const text = `${article.title} ${article.teaser || ""}`;
      const { matches, matchedTerms } = matchesAIKeywords(text);
      if (!matches) continue;

      items.push({
        sourceType: "benzinga",
        externalId: String(article.id),
        title: article.title,
        url: article.url,
        author: article.author || "Benzinga",
        description: article.teaser?.slice(0, 500) || null,
        publishedAt: new Date(article.created),
        score: 0,
        commentCount: 0,
        matchedKeywords: matchedTerms,
      });
    }

    return items;
  } catch (err) {
    console.error("Benzinga API error:", err);
    return fetchBenzingaRSS();
  }
}

async function fetchBenzingaRSS(): Promise<ContentItem[]> {
  try {
    const res = await fetch(BENZINGA_RSS, {
      headers: { "User-Agent": "Trending/0.1.0" },
    });

    if (!res.ok) {
      console.error(`Benzinga RSS error: ${res.status}`);
      return [];
    }

    const xml = await res.text();
    const items: ContentItem[] = [];
    const entryRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = entryRegex.exec(xml)) !== null) {
      const entry = match[1];
      const title = extractCdata(entry, "title");
      const link = extractTag(entry, "link");
      const description = extractCdata(entry, "description");
      const pubDate = extractTag(entry, "pubDate");
      const creator = extractTag(entry, "dc:creator");

      if (!title) continue;

      const text = `${title} ${description}`;
      const { matches, matchedTerms } = matchesAIKeywords(text);
      if (!matches) continue;

      items.push({
        sourceType: "benzinga",
        externalId: link || title,
        title,
        url: link || "https://www.benzinga.com",
        author: creator || "Benzinga",
        description: description?.slice(0, 500) || null,
        publishedAt: pubDate ? new Date(pubDate) : new Date(),
        score: 0,
        commentCount: 0,
        matchedKeywords: matchedTerms,
      });
    }

    return items;
  } catch (err) {
    console.error("Benzinga RSS error:", err);
    return [];
  }
}

function extractTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  return match ? match[1].trim() : "";
}

function extractCdata(xml: string, tag: string): string {
  // Try CDATA first
  const cdataMatch = xml.match(
    new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${tag}>`)
  );
  if (cdataMatch) return cdataMatch[1].trim();

  // Fall back to regular tag
  return extractTag(xml, tag);
}
