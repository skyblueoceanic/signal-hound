import type { ContentItem } from "../types";
import { matchesAIKeywords } from "../config/ai-keywords";
import { isMemeContent } from "../config/meme-filter";

const REDDIT_BASE = "https://www.reddit.com";
const AI_SUBREDDITS = [
  "MachineLearning",
  "LocalLLaMA",
  "artificial",
  "singularity",
  "ChatGPT",
  "consciousness",
  "neuroscience",
  "Futurology",
  "neurotech",
];

// General market/finance subreddits — only AI-related content surfaces
const MARKET_SUBREDDITS = [
  "stocks",
  "investing",
  "StockMarket",
  "wallstreetbets",
  "options",
  "SecurityAnalysis",
];

interface RedditPost {
  data: {
    id: string;
    title: string;
    url: string;
    author: string;
    selftext: string;
    score: number;
    num_comments: number;
    created_utc: number;
    subreddit: string;
    permalink: string;
    is_self: boolean;
    link_flair_text?: string;
  };
}

interface RedditListing {
  data: {
    children: RedditPost[];
  };
}

export async function fetchSubredditPosts(
  subreddit: string,
  sort: "hot" | "new" | "rising" = "hot",
  limit = 25
): Promise<ContentItem[]> {
  const url = `${REDDIT_BASE}/r/${subreddit}/${sort}.json?limit=${limit}&raw_json=1`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Trending/0.1.0 (AI content monitor)",
    },
  });

  if (!res.ok) {
    console.error(
      `Reddit API error for r/${subreddit}: ${res.status} ${res.statusText}`
    );
    return [];
  }

  const data: RedditListing = await res.json();
  const items: ContentItem[] = [];

  for (const post of data.data.children) {
    const p = post.data;
    const text = `${p.title} ${p.selftext || ""} ${p.link_flair_text || ""}`;
    const { matches, matchedTerms } = matchesAIKeywords(text);

    // Skip memes and low-quality content
    if (isMemeContent(p.title, p.link_flair_text, p.subreddit, p.score)) continue;

    // For AI-specific subreddits, include all posts
    // For general subreddits, only include if keywords match
    const isAISub = AI_SUBREDDITS.map(s => s.toLowerCase()).includes(subreddit.toLowerCase());

    if (!isAISub && !matches) continue;

    // If from an AI sub, still note which keywords matched (might be empty for general AI discussion)
    const keywords = matches ? matchedTerms : ["AI-subreddit"];

    items.push({
      sourceType: "reddit",
      externalId: p.id,
      title: p.title,
      url: p.is_self
        ? `https://reddit.com${p.permalink}`
        : p.url,
      author: p.author,
      description: p.selftext?.slice(0, 500) || null,
      publishedAt: new Date(p.created_utc * 1000),
      score: p.score,
      commentCount: p.num_comments,
      matchedKeywords: keywords,
      subreddit: p.subreddit,
    });
  }

  return items;
}

export async function fetchAllAISubreddits(): Promise<ContentItem[]> {
  const allSubs = [...AI_SUBREDDITS, ...MARKET_SUBREDDITS];
  const results = await Promise.allSettled(
    allSubs.flatMap((sub) => [
      fetchSubredditPosts(sub, "hot", 25),
      fetchSubredditPosts(sub, "rising", 15),
    ])
  );

  const allItems: ContentItem[] = [];
  const seenIds = new Set<string>();

  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    for (const item of result.value) {
      if (seenIds.has(item.externalId)) continue;
      seenIds.add(item.externalId);
      allItems.push(item);
    }
  }

  return allItems;
}
