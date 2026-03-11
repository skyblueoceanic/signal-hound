import { prisma } from "../db/client";
import { ALL_AI_KEYWORDS } from "../config/ai-keywords";

// Common English stopwords to skip during n-gram extraction
const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "is", "it", "its", "are", "was", "were",
  "be", "been", "being", "have", "has", "had", "do", "does", "did",
  "will", "would", "could", "should", "may", "might", "shall", "can",
  "not", "no", "nor", "so", "if", "then", "than", "that", "this",
  "these", "those", "what", "which", "who", "whom", "how", "when",
  "where", "why", "all", "each", "every", "both", "few", "more",
  "most", "other", "some", "such", "only", "own", "same", "too",
  "very", "just", "about", "above", "after", "again", "also", "any",
  "as", "because", "before", "between", "during", "here", "into",
  "out", "over", "through", "under", "until", "up", "while", "new",
  "now", "get", "got", "like", "make", "many", "much", "still",
  "since", "back", "even", "well", "way", "take", "come", "go",
  "see", "use", "used", "using", "says", "said", "via", "per",
  "yet", "i", "you", "he", "she", "we", "they", "me", "him", "her",
  "us", "them", "my", "your", "his", "our", "their",
]);

// Lowercase set of static keywords for fast lookup
const STATIC_KEYWORDS_LOWER = new Set(
  ALL_AI_KEYWORDS.map((k) => k.toLowerCase())
);

/**
 * Extract meaningful 2-gram and 3-gram phrases from a title.
 */
function extractNgrams(title: string): string[] {
  // Clean: remove URLs, special chars, normalize whitespace
  const cleaned = title
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[^a-zA-Z0-9\s\-\.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const words = cleaned
    .split(" ")
    .map((w) => w.toLowerCase().replace(/^[.\-]+|[.\-]+$/g, ""))
    .filter((w) => w.length > 1 && !STOPWORDS.has(w));

  const ngrams: string[] = [];

  // 2-grams
  for (let i = 0; i < words.length - 1; i++) {
    ngrams.push(`${words[i]} ${words[i + 1]}`);
  }

  // 3-grams
  for (let i = 0; i < words.length - 2; i++) {
    ngrams.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
  }

  return ngrams;
}

/**
 * Check if a phrase overlaps with any static keyword.
 */
function isStaticKeyword(phrase: string): boolean {
  const lower = phrase.toLowerCase();
  for (const kw of STATIC_KEYWORDS_LOWER) {
    if (lower.includes(kw) || kw.includes(lower)) return true;
  }
  return false;
}

/**
 * Discover new keyword candidates from recently ingested items.
 * Call this after each ingestion cycle.
 */
export async function discoverKeywords(
  titles: string[]
): Promise<{ discovered: number; promoted: number }> {
  if (titles.length === 0) return { discovered: 0, promoted: 0 };

  // Step 1: Extract n-grams from all titles
  const phraseCounts = new Map<string, number>();
  for (const title of titles) {
    const ngrams = extractNgrams(title);
    const seen = new Set<string>(); // dedupe within a single title
    for (const ng of ngrams) {
      if (seen.has(ng)) continue;
      seen.add(ng);
      phraseCounts.set(ng, (phraseCounts.get(ng) || 0) + 1);
    }
  }

  // Step 2: Filter to phrases appearing in ≥2 titles that aren't static keywords
  const candidates: string[] = [];
  for (const [phrase, count] of phraseCounts) {
    if (count >= 2 && !isStaticKeyword(phrase)) {
      candidates.push(phrase);
    }
  }

  let discovered = 0;

  // Step 3: Upsert candidates into DynamicKeyword table
  for (const phrase of candidates) {
    try {
      await prisma.dynamicKeyword.upsert({
        where: { keyword: phrase },
        create: {
          keyword: phrase,
          status: "candidate",
          hitCount: 1,
          score: 0,
        },
        update: {
          hitCount: { increment: 1 },
          lastSeenAt: new Date(),
          missCount: 0, // Reset miss count on new hit
        },
      });
      discovered++;
    } catch {
      // Ignore race conditions
    }
  }

  return { discovered, promoted: 0 };
}

/**
 * Run promotion and retirement cycle.
 * Call every 15 minutes from the worker.
 */
export async function runKeywordCycle(): Promise<{
  promoted: number;
  retired: number;
}> {
  let promoted = 0;
  let retired = 0;

  // Promote candidates with enough hits
  const promotable = await prisma.dynamicKeyword.findMany({
    where: {
      status: "candidate",
      hitCount: { gte: 5 },
    },
  });

  for (const kw of promotable) {
    await prisma.dynamicKeyword.update({
      where: { id: kw.id },
      data: { status: "active", score: Math.min(kw.hitCount / 20, 1) },
    });
    promoted++;
    console.log(`[KeywordDiscovery] Promoted: "${kw.keyword}" (hits: ${kw.hitCount})`);
  }

  // Increment miss count for keywords not seen recently (last 30 min)
  const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
  await prisma.dynamicKeyword.updateMany({
    where: {
      status: { in: ["candidate", "active"] },
      lastSeenAt: { lt: thirtyMinAgo },
    },
    data: { missCount: { increment: 1 } },
  });

  // Retire keywords with too many misses
  const retirable = await prisma.dynamicKeyword.findMany({
    where: {
      status: { in: ["candidate", "active"] },
      missCount: { gte: 10 },
    },
  });

  for (const kw of retirable) {
    await prisma.dynamicKeyword.update({
      where: { id: kw.id },
      data: { status: "retired", score: 0 },
    });
    retired++;
    console.log(`[KeywordDiscovery] Retired: "${kw.keyword}" (misses: ${kw.missCount})`);
  }

  return { promoted, retired };
}

/**
 * Get all active dynamic keywords for matching.
 */
export async function getActiveDynamicKeywords(): Promise<string[]> {
  const keywords = await prisma.dynamicKeyword.findMany({
    where: { status: "active" },
    select: { keyword: true },
  });
  return keywords.map((k) => k.keyword);
}
