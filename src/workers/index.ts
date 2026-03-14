import cron from "node-cron";
import { fetchAIStories, fetchTopAIStories } from "../lib/ingestion/hackernews";
import { fetchAllAISubreddits } from "../lib/ingestion/reddit";
import { fetchTrendingAIRepos } from "../lib/ingestion/github";
import {
  fetchArxivPapers,
  enrichWithSemanticScholar,
  fetchTrendingAIPapers,
} from "../lib/ingestion/arxiv";
import { fetchAllAIFeeds } from "../lib/ingestion/rss";
import { fetchBenzingaHeadlines } from "../lib/ingestion/benzinga";
import { fetchGoogleTrends } from "../lib/ingestion/google-trends";
import { processItems } from "../lib/ingestion/processor";
import { runKeywordCycle } from "../lib/engine/keyword-discovery";
import { getTrendingItems, getViralItems, saveDailySnapshot } from "../lib/db/items";

console.log("Starting Trending workers...");
console.log("Sources: Hacker News, Reddit, GitHub, arXiv, Semantic Scholar, RSS, Benzinga, Google Trends");

// ─── Hacker News: every 2 minutes ────────────────────────────────
cron.schedule("*/2 * * * *", async () => {
  console.log(`[${new Date().toISOString()}] Polling Hacker News...`);
  try {
    const [algoliaItems, topItems] = await Promise.all([
      fetchAIStories(),
      fetchTopAIStories(),
    ]);

    const seen = new Set<string>();
    const allItems = [...algoliaItems, ...topItems].filter((item) => {
      if (seen.has(item.externalId)) return false;
      seen.add(item.externalId);
      return true;
    });

    console.log(`  HN: ${allItems.length} AI stories`);
    await processItems(allItems);
  } catch (err) {
    console.error("HN polling error:", err);
  }
});

// ─── Reddit: every 2 minutes ─────────────────────────────────────
cron.schedule("*/2 * * * *", async () => {
  console.log(`[${new Date().toISOString()}] Polling Reddit...`);
  try {
    const items = await fetchAllAISubreddits();
    console.log(`  Reddit: ${items.length} AI posts`);
    await processItems(items);
  } catch (err) {
    console.error("Reddit polling error:", err);
  }
});

// ─── GitHub: every 10 minutes ────────────────────────────────────
cron.schedule("*/10 * * * *", async () => {
  console.log(`[${new Date().toISOString()}] Polling GitHub...`);
  try {
    const items = await fetchTrendingAIRepos();
    console.log(`  GitHub: ${items.length} trending AI repos`);
    await processItems(items);
  } catch (err) {
    console.error("GitHub polling error:", err);
  }
});

// ─── arXiv + Semantic Scholar: every 30 minutes ──────────────────
cron.schedule("*/30 * * * *", async () => {
  console.log(`[${new Date().toISOString()}] Polling arXiv + Semantic Scholar...`);
  try {
    // Fetch from both arXiv (new papers) and Semantic Scholar (trending papers)
    const [arxivPapers, ssTrending] = await Promise.allSettled([
      fetchArxivPapers().then((papers) =>
        enrichWithSemanticScholar(papers.slice(0, 20))
      ),
      fetchTrendingAIPapers(),
    ]);

    let total = 0;

    if (arxivPapers.status === "fulfilled") {
      console.log(`  arXiv: ${arxivPapers.value.length} papers`);
      await processItems(arxivPapers.value);
      total += arxivPapers.value.length;
    } else {
      console.error("  arXiv failed:", arxivPapers.reason);
    }

    if (ssTrending.status === "fulfilled") {
      console.log(`  Semantic Scholar: ${ssTrending.value.length} trending papers`);
      await processItems(ssTrending.value);
      total += ssTrending.value.length;
    } else {
      console.error("  Semantic Scholar failed:", ssTrending.reason);
    }

    console.log(`  Total research items: ${total}`);
  } catch (err) {
    console.error("arXiv/SS polling error:", err);
  }
});

// ─── RSS Feeds: every 5 minutes ──────────────────────────────────
cron.schedule("*/5 * * * *", async () => {
  console.log(`[${new Date().toISOString()}] Polling RSS feeds...`);
  try {
    const items = await fetchAllAIFeeds();
    console.log(`  RSS: ${items.length} AI articles from newsletters/blogs`);
    await processItems(items);
  } catch (err) {
    console.error("RSS polling error:", err);
  }
});

// ─── Benzinga: every 5 minutes ───────────────────────────────────
cron.schedule("*/5 * * * *", async () => {
  console.log(`[${new Date().toISOString()}] Polling Benzinga...`);
  try {
    const items = await fetchBenzingaHeadlines();
    console.log(`  Benzinga: ${items.length} AI market headlines`);
    await processItems(items);
  } catch (err) {
    console.error("Benzinga polling error:", err);
  }
});

// ─── Google Trends: every 15 minutes ─────────────────────────────
cron.schedule("*/15 * * * *", async () => {
  console.log(`[${new Date().toISOString()}] Polling Google Trends...`);
  try {
    const items = await fetchGoogleTrends();
    console.log(`  Google Trends: ${items.length} AI-related trending searches`);
    await processItems(items);
  } catch (err) {
    console.error("Google Trends polling error:", err);
  }
});

// ─── Keyword Discovery: promote/retire every 15 minutes ─────────
cron.schedule("*/15 * * * *", async () => {
  console.log(`[${new Date().toISOString()}] Running keyword discovery cycle...`);
  try {
    const { promoted, retired } = await runKeywordCycle();
    console.log(`  Keywords: ${promoted} promoted, ${retired} retired`);
  } catch (err) {
    console.error("Keyword cycle error:", err);
  }
});

// ─── Daily Snapshot: midnight ET (5:00 AM UTC) ──────────────────
cron.schedule("0 5 * * *", async () => {
  console.log(`[${new Date().toISOString()}] Saving daily snapshot...`);
  try {
    // Get today's date in ET
    const etDate = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });

    const [trending, viral] = await Promise.all([
      getTrendingItems(50),
      getViralItems(20),
    ]);

    // Merge and deduplicate (viral items are a subset of trending)
    const seenIds = new Set<number>();
    const allItems = [...trending, ...viral].filter((item) => {
      if (seenIds.has(item.id)) return false;
      seenIds.add(item.id);
      return true;
    });

    // Serialize in same shape as API response
    const serialized = allItems.map((item) => ({
      id: item.id,
      sourceType: item.sourceType,
      title: item.title,
      url: item.url,
      author: item.author,
      description: item.description,
      publishedAt: item.publishedAt,
      score: item.score,
      commentCount: item.commentCount,
      matchedKeywords: item.matchedKeywords,
      viralityScore: item.viralityScore,
      isViral: item.isViral,
      velocity: item.velocity,
      acceleration: item.acceleration,
      metadata: item.metadata,
      firstSeenAt: item.firstSeenAt,
      lastUpdatedAt: item.lastUpdatedAt,
      snapshots: item.snapshots.map((s) => ({
        score: s.score,
        commentCount: s.commentCount,
        recordedAt: s.recordedAt,
      })),
      tickers: item.tickerImpacts?.map((t) => ({
        ticker: t.ticker,
        name: t.name,
        sentiment: t.sentiment,
        confidence: t.confidence,
      })) || [],
    }));

    await saveDailySnapshot(etDate, serialized);
    console.log(`  Snapshot saved for ${etDate}: ${serialized.length} items`);
  } catch (err) {
    console.error("Daily snapshot error:", err);
  }
});

// ─── Initial fetch on startup ────────────────────────────────────
async function initialFetch() {
  console.log("Running initial data fetch across all sources...\n");

  const sources = [
    { name: "HN (Algolia)", fn: fetchAIStories },
    { name: "HN (Top)", fn: fetchTopAIStories },
    { name: "Reddit", fn: fetchAllAISubreddits },
    { name: "GitHub", fn: fetchTrendingAIRepos },
    { name: "arXiv", fn: fetchArxivPapers },
    { name: "Semantic Scholar", fn: fetchTrendingAIPapers },
    { name: "RSS Feeds", fn: fetchAllAIFeeds },
    { name: "Benzinga", fn: fetchBenzingaHeadlines },
    { name: "Google Trends", fn: fetchGoogleTrends },
  ];

  let totalItems = 0;

  for (const source of sources) {
    try {
      console.log(`  Fetching ${source.name}...`);
      const items = await source.fn();
      console.log(`  ${source.name}: ${items.length} items`);
      await processItems(items);
      totalItems += items.length;
    } catch (err) {
      console.error(`  ${source.name}: FAILED -`, err);
    }
  }

  console.log(`\nInitial fetch complete. Total: ${totalItems} items.\n`);
  console.log("Workers are now running on schedule:");
  console.log("  - Hacker News:       every 2 min");
  console.log("  - Reddit:            every 2 min");
  console.log("  - GitHub:            every 10 min");
  console.log("  - arXiv + SS:        every 30 min");
  console.log("  - RSS feeds:         every 5 min");
  console.log("  - Benzinga:          every 5 min");
  console.log("  - Google Trends:     every 15 min");
  console.log("  - Keyword Discovery: every 15 min\n");
}

initialFetch();

// Keep the process running
process.on("SIGINT", () => {
  console.log("\nShutting down workers...");
  process.exit(0);
});
