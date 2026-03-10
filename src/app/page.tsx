"use client";

import { useState, useEffect, useCallback } from "react";
import { AlertBanner } from "./components/AlertBanner";
import { TrendingFeed } from "./components/TrendingFeed";
import { DetailPanel } from "./components/DetailPanel";
import { SourceFilter } from "./components/SourceFilter";
import { StatsBar } from "./components/StatsBar";
import { TickerBar } from "./components/TickerBar";
import type { TrendingItemData, AlertData, TickerSummary } from "./types";

export default function Home() {
  const [items, setItems] = useState<TrendingItemData[]>([]);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [tickers, setTickers] = useState<TickerSummary[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string[]>([]);
  const [tickerFilter, setTickerFilter] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<TrendingItemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const tickerParam = tickerFilter ? `&ticker=${tickerFilter}` : "";
      const [itemsRes, alertsRes, tickersRes] = await Promise.all([
        fetch(`/api/items?filter=${filter}&limit=50${tickerParam}`),
        fetch("/api/alerts?limit=10"),
        fetch("/api/tickers"),
      ]);

      if (itemsRes.ok) {
        const data = await itemsRes.json();
        setItems(data.items);
      }

      if (alertsRes.ok) {
        const data = await alertsRes.json();
        setAlerts(data.alerts);
      }

      if (tickersRes.ok) {
        const data = await tickersRes.json();
        setTickers(data.tickers);
      }

      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  }, [filter, tickerFilter]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const viralCount = items.filter((i) => i.isViral).length;
  const sourceCounts = items.reduce(
    (acc, item) => {
      acc[item.sourceType] = (acc[item.sourceType] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const allSourceTypes = Object.keys(sourceCounts);

  const filteredItems =
    sourceFilter.length === 0
      ? items
      : items.filter((item) => sourceFilter.includes(item.sourceType));

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <img
              src="/logo.png"
              alt="Signal Hound - Hear the story before the market does"
              className="h-14 md:h-16"
            />
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filter === "all"
                      ? "bg-orange-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  All Trending
                </button>
                <button
                  onClick={() => setFilter("viral")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filter === "viral"
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Viral Only
                </button>
              </div>
              <button
                onClick={fetchData}
                className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm transition-colors"
              >
                Refresh
              </button>
              {lastUpdated && (
                <span className="text-xs text-gray-400">
                  {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>

          {/* Ticker Bar — prominent, right under header */}
          {tickers.length > 0 && (
            <div className="mt-3 -mb-1">
              <TickerBar
                tickers={tickers}
                selectedTicker={tickerFilter}
                onSelect={setTickerFilter}
              />
            </div>
          )}
        </div>
      </header>

      {/* Main content — split layout */}
      <div className="flex-1 flex">
        {/* Left panel — feed list */}
        <div
          className={`${
            selectedItem ? "hidden lg:block lg:w-[55%]" : "w-full"
          } border-r border-gray-200 overflow-y-auto`}
          style={{ height: "calc(100vh - 120px)" }}
        >
          <div className="p-4">
            {/* Alert Banner */}
            {alerts.length > 0 && <AlertBanner alerts={alerts} />}

            {/* Stats row */}
            <StatsBar
              totalItems={items.length}
              viralCount={viralCount}
              sourceCounts={sourceCounts}
            />

            {/* Source Filter */}
            <SourceFilter
              selected={sourceFilter}
              onToggle={(source) => {
                setSourceFilter((prev) => {
                  // If empty (all selected), switch to "all except this one"
                  if (prev.length === 0) {
                    return allSourceTypes.filter((s) => s !== source);
                  }
                  const next = prev.includes(source)
                    ? prev.filter((s) => s !== source)
                    : [...prev, source];
                  // If everything is deselected or everything is selected, reset to "all"
                  return next.length === 0 || next.length === allSourceTypes.length
                    ? []
                    : next;
                });
              }}
              onToggleAll={() => setSourceFilter([])}
              counts={sourceCounts}
            />

            {/* Feed */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-gray-400">Loading trending content...</div>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-gray-400 text-lg mb-2">
                  {tickerFilter
                    ? `No trending items for $${tickerFilter}`
                    : "No trending items yet"}
                </div>
                <div className="text-gray-500 text-sm max-w-md">
                  {tickerFilter ? (
                    <button
                      onClick={() => setTickerFilter(null)}
                      className="text-orange-600 hover:text-orange-500"
                    >
                      Clear ticker filter
                    </button>
                  ) : (
                    <>
                      Start the workers with{" "}
                      <code className="bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                        npm run workers
                      </code>{" "}
                      to begin monitoring all sources for viral AI content.
                    </>
                  )}
                </div>
              </div>
            ) : (
              <TrendingFeed
                items={filteredItems}
                selectedId={selectedItem?.id}
                onSelect={setSelectedItem}
              />
            )}
          </div>
        </div>

        {/* Right panel — detail view */}
        {selectedItem && (
          <div
            className="w-full lg:w-[45%] bg-white border-l border-gray-200"
            style={{ height: "calc(100vh - 120px)" }}
          >
            <DetailPanel
              item={selectedItem}
              onClose={() => setSelectedItem(null)}
            />
          </div>
        )}

        {/* Empty state for detail panel on desktop when nothing selected */}
        {!selectedItem && (
          <div
            className="hidden lg:flex lg:w-[45%] bg-white border-l border-gray-200 items-center justify-center"
            style={{ height: "calc(100vh - 120px)" }}
          >
            <DetailPanel item={null} onClose={() => {}} />
          </div>
        )}
      </div>
    </div>
  );
}
