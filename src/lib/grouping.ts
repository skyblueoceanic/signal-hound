import type { TrendingItemData } from "../app/types";

export interface ArticleGroup {
  topic: string;
  items: TrendingItemData[];
}

export interface GroupedFeed {
  groups: ArticleGroup[];
  ungrouped: TrendingItemData[];
}

// Common words to ignore when comparing titles
const TITLE_STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "is", "it", "its", "are", "was", "were",
  "be", "been", "have", "has", "had", "do", "does", "did", "not", "no",
  "so", "if", "as", "that", "this", "what", "which", "who", "how",
  "when", "where", "why", "all", "new", "can", "will", "may", "just",
  "about", "over", "after", "into", "up", "out", "now", "get", "says",
  "said", "could", "would", "should", "also", "than", "been", "more",
  "most", "some", "very", "well", "our", "us", "we", "they", "them",
  "their", "your", "you", "my", "he", "she", "his", "her", "i", "me",
  "via", "per", "yet", "use", "using", "used", "make", "many", "much",
]);

/**
 * Extract significant words from a title for comparison.
 */
function extractSignificantWords(title: string): Set<string> {
  return new Set(
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !TITLE_STOPWORDS.has(w))
  );
}

/**
 * Compute similarity between two items based on keywords + title overlap.
 * Returns a score from 0 to 1.
 */
function similarity(a: TrendingItemData, b: TrendingItemData): number {
  // Keyword overlap (matched keywords from ingestion)
  const aKeywords = new Set(a.matchedKeywords.map((k) => k.toLowerCase()));
  const bKeywords = new Set(b.matchedKeywords.map((k) => k.toLowerCase()));
  let keywordOverlap = 0;
  for (const k of aKeywords) {
    if (bKeywords.has(k)) keywordOverlap++;
  }

  // Title word overlap
  const aWords = extractSignificantWords(a.title);
  const bWords = extractSignificantWords(b.title);
  let wordOverlap = 0;
  for (const w of aWords) {
    if (bWords.has(w)) wordOverlap++;
  }
  const minWords = Math.min(aWords.size, bWords.size) || 1;
  const titleSimilarity = wordOverlap / minWords;

  // Ticker overlap
  const aTickers = new Set(a.tickers.map((t) => t.ticker));
  const bTickers = new Set(b.tickers.map((t) => t.ticker));
  let tickerOverlap = 0;
  for (const t of aTickers) {
    if (bTickers.has(t)) tickerOverlap++;
  }

  // Combined score: keyword overlap is strongest signal
  if (keywordOverlap >= 2) return 0.9;
  if (keywordOverlap >= 1 && titleSimilarity >= 0.4) return 0.8;
  if (titleSimilarity >= 0.5) return 0.7;
  if (tickerOverlap >= 1 && keywordOverlap >= 1) return 0.6;

  return 0;
}

/**
 * Choose a display label for a group of items.
 */
function pickGroupLabel(items: TrendingItemData[]): string {
  // Count keyword frequency across all items in group
  const kwCounts = new Map<string, number>();
  for (const item of items) {
    for (const kw of item.matchedKeywords) {
      // Strip dynamic keyword prefix
      const clean = kw.startsWith("⚡") ? kw.slice(1) : kw;
      kwCounts.set(clean, (kwCounts.get(clean) || 0) + 1);
    }
  }

  // Pick the most common keyword
  let bestKw = "";
  let bestCount = 0;
  for (const [kw, count] of kwCounts) {
    if (count > bestCount) {
      bestCount = count;
      bestKw = kw;
    }
  }

  if (bestKw) return bestKw;

  // Fallback: most common significant word in titles
  const wordCounts = new Map<string, number>();
  for (const item of items) {
    const words = extractSignificantWords(item.title);
    for (const w of words) {
      wordCounts.set(w, (wordCounts.get(w) || 0) + 1);
    }
  }

  let bestWord = "Related";
  let bestWordCount = 0;
  for (const [w, count] of wordCounts) {
    if (count > bestWordCount) {
      bestWordCount = count;
      bestWord = w.charAt(0).toUpperCase() + w.slice(1);
    }
  }

  return bestWord;
}

const SIMILARITY_THRESHOLD = 0.6;

/**
 * Group items by topic similarity.
 * Items that don't strongly match any group stay ungrouped.
 */
export function groupItems(items: TrendingItemData[]): GroupedFeed {
  if (items.length <= 1) {
    return { groups: [], ungrouped: items };
  }

  // Simple greedy clustering
  const assigned = new Set<number>();
  const clusters: TrendingItemData[][] = [];

  for (let i = 0; i < items.length; i++) {
    if (assigned.has(i)) continue;

    const cluster: TrendingItemData[] = [items[i]];
    assigned.add(i);

    for (let j = i + 1; j < items.length; j++) {
      if (assigned.has(j)) continue;

      // Check similarity against any item already in the cluster
      const sim = Math.max(
        ...cluster.map((c) => similarity(c, items[j]))
      );

      if (sim >= SIMILARITY_THRESHOLD) {
        cluster.push(items[j]);
        assigned.add(j);
      }
    }

    clusters.push(cluster);
  }

  // Split into groups (≥2 items) and ungrouped (single items)
  const groups: ArticleGroup[] = [];
  const ungrouped: TrendingItemData[] = [];

  for (const cluster of clusters) {
    if (cluster.length >= 2) {
      // Sort by score descending (lead article first)
      cluster.sort((a, b) => b.score - a.score);
      groups.push({
        topic: pickGroupLabel(cluster),
        items: cluster,
      });
    } else {
      ungrouped.push(cluster[0]);
    }
  }

  // Sort groups by lead article's score
  groups.sort((a, b) => b.items[0].score - a.items[0].score);

  return { groups, ungrouped };
}
