import type { ContentItem } from "../types";
import { upsertItem, recordSnapshot, upsertTickerImpact } from "../db/items";
import { processItemVirality } from "../engine/virality";
import { findAffectedTickers } from "../config/ticker-map";
import { discoverKeywords } from "../engine/keyword-discovery";

export async function processItems(items: ContentItem[]): Promise<void> {
  for (const item of items) {
    try {
      // Upsert the item
      const dbItem = await upsertItem(item);

      // Record engagement snapshot
      await recordSnapshot(dbItem.id, item.score, item.commentCount);

      // Calculate virality
      await processItemVirality(
        dbItem.id,
        item.sourceType,
        item.score,
        item.commentCount,
        item.title
      );

      // Auto-map affected tickers
      const text = `${item.title} ${item.description || ""}`;
      const tickers = findAffectedTickers(text, item.matchedKeywords);

      for (const ticker of tickers) {
        await upsertTickerImpact(
          dbItem.id,
          ticker.ticker,
          ticker.name,
          ticker.sentiment,
          0.5, // keyword-based confidence
          "keyword"
        );
      }
    } catch (err) {
      console.error(
        `Error processing item ${item.sourceType}:${item.externalId}:`,
        err
      );
    }
  }

  // Keyword discovery: extract trending terms from this batch
  if (items.length > 0) {
    try {
      const titles = items.map((i) => i.title);
      const { discovered } = await discoverKeywords(titles);
      if (discovered > 0) {
        console.log(`[KeywordDiscovery] Discovered ${discovered} candidate keywords from ${items.length} items`);
      }
    } catch (err) {
      console.error("[KeywordDiscovery] Error:", err);
    }
  }
}
