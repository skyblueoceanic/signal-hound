import { NextResponse } from "next/server";
import { getTrendingItems, getViralItems } from "@/lib/db/items";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get("filter"); // "viral" or "all"
  const ticker = searchParams.get("ticker") || undefined; // e.g. "NVDA"
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);

  try {
    const items =
      filter === "viral"
        ? await getViralItems(limit, ticker)
        : await getTrendingItems(limit, ticker);

    return NextResponse.json({
      items: items.map((item) => ({
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
      })),
      count: items.length,
      ticker: ticker || null,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 }
    );
  }
}
