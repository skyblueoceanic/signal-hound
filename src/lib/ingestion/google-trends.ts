import type { ContentItem } from "../types";

// Google Trends via unofficial API (no auth needed)
// Fetches trending searches and real-time trends related to AI

const TRENDS_API = "https://trends.google.com/trends/api";

// AI-related terms to monitor in Google Trends
const AI_TREND_TERMS = [
  "ChatGPT", "OpenAI", "AI", "artificial intelligence",
  "NVIDIA", "GPU shortage", "LLM", "DeepSeek",
  "Claude AI", "Gemini AI", "machine learning",
];

interface TrendingSearch {
  title: string;
  formattedTraffic: string;
  relatedQueries: string[];
  articles: Array<{
    title: string;
    url: string;
    source: string;
    snippet: string;
    timeAgo: string;
  }>;
}

// Fetch daily trending searches from Google Trends
// This uses the public trending searches endpoint (no auth needed)
export async function fetchGoogleTrends(): Promise<ContentItem[]> {
  try {
    const url = `${TRENDS_API}/dailytrends?hl=en-US&tz=-300&geo=US&ns=15`;

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!res.ok) {
      console.error(`Google Trends API error: ${res.status}`);
      return [];
    }

    // Google Trends returns JSONP-like response with )]}' prefix
    let text = await res.text();
    if (text.startsWith(")]}'")) {
      text = text.slice(5);
    }

    const data = JSON.parse(text);
    const items: ContentItem[] = [];

    const days = data?.default?.trendingSearchesDays;
    if (!Array.isArray(days)) return [];

    for (const day of days.slice(0, 2)) {
      // Last 2 days
      for (const trend of day.trendingSearches || []) {
        const title = trend.title?.query;
        if (!title) continue;

        // Check if this trend is AI-related
        const isAIRelated =
          AI_TREND_TERMS.some(
            (term) =>
              title.toLowerCase().includes(term.toLowerCase()) ||
              trend.relatedQueries?.some((q: { query: string }) =>
                q.query?.toLowerCase().includes(term.toLowerCase())
              )
          ) ||
          trend.articles?.some((a: { title: string; snippet: string }) =>
            AI_TREND_TERMS.some(
              (term) =>
                a.title?.toLowerCase().includes(term.toLowerCase()) ||
                a.snippet?.toLowerCase().includes(term.toLowerCase())
            )
          );

        if (!isAIRelated) continue;

        // Use the first article as the content link
        const article = trend.articles?.[0];
        const traffic = trend.formattedTraffic || "0";
        const trafficNum = parseTraffic(traffic);

        items.push({
          sourceType: "rss", // Use RSS type since Google Trends doesn't have its own type
          externalId: `gtrends-${title.replace(/\s+/g, "-").toLowerCase()}`,
          title: `[Google Trends] ${title} (${traffic} searches)`,
          url: article?.url || `https://trends.google.com/trends/explore?q=${encodeURIComponent(title)}`,
          author: "Google Trends",
          description: article?.snippet || `Trending search: "${title}" with ${traffic} searches`,
          publishedAt: new Date(),
          score: trafficNum,
          commentCount: 0,
          matchedKeywords: [title, ...AI_TREND_TERMS.filter((t) =>
            title.toLowerCase().includes(t.toLowerCase())
          )],
        });
      }
    }

    return items;
  } catch (err) {
    console.error("Google Trends fetch error:", err);
    return [];
  }
}

// Parse traffic strings like "200K+", "1M+", "500K+"
function parseTraffic(traffic: string): number {
  const cleaned = traffic.replace(/[+,]/g, "").trim();
  if (cleaned.endsWith("M")) {
    return parseFloat(cleaned) * 1000000;
  }
  if (cleaned.endsWith("K")) {
    return parseFloat(cleaned) * 1000;
  }
  return parseInt(cleaned) || 0;
}
