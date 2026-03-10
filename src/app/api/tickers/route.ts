import { NextResponse } from "next/server";
import { getTickerSummary } from "@/lib/db/items";
import { TICKER_MAP } from "@/lib/config/ticker-map";

export async function GET() {
  try {
    const summary = await getTickerSummary();

    // Enrich with names from TICKER_MAP
    const tickers = summary.map((s) => {
      const mapping = TICKER_MAP.find((m) => m.ticker === s.ticker);
      return {
        ticker: s.ticker,
        name: mapping?.name || s.ticker,
        mentionCount: s.mentionCount,
      };
    });

    return NextResponse.json({
      tickers,
      count: tickers.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Tickers API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch tickers" },
      { status: 500 }
    );
  }
}
