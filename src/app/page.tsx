"use client";

import { useState, useEffect, useCallback } from "react";
import { AlertBanner } from "./components/AlertBanner";
import { TrendingFeed } from "./components/TrendingFeed";
import { DetailPanel } from "./components/DetailPanel";
import { SourceFilter } from "./components/SourceFilter";
import { StatsBar } from "./components/StatsBar";
import { TickerBar } from "./components/TickerBar";
import { AuthModal } from "./components/AuthModal";
import { KeywordBar } from "./components/KeywordBar";
import { TickerSearch } from "./components/TickerSearch";
import { DateSelector } from "./components/DateSelector";
import { TranslateButton } from "./components/TranslateButton";
import { groupItems } from "../lib/grouping";
import type { TrendingItemData, AlertData, TickerSummary } from "./types";

interface AuthUser {
  id: number;
  email: string;
  name: string | null;
}

interface UserKeyword {
  id: number;
  keyword: string;
}

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

  // Auth state
  const [user, setUser] = useState<AuthUser | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [keywords, setKeywords] = useState<UserKeyword[]>([]);
  const [keywordFilter, setKeywordFilter] = useState<string | null>(null);
  const [groupingEnabled, setGroupingEnabled] = useState(true);
  const [viewMode, setViewMode] = useState<string>("live"); // "live" or date string
  const [isKorean, setIsKorean] = useState(false);

  // Check auth on mount
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch keywords when logged in
  useEffect(() => {
    if (!user) {
      setKeywords([]);
      return;
    }
    fetch("/api/keywords")
      .then((r) => r.json())
      .then((data) => {
        if (data.keywords) setKeywords(data.keywords);
      })
      .catch(() => {});
  }, [user]);

  const fetchData = useCallback(async () => {
    try {
      if (viewMode !== "live") {
        // Historical snapshot mode
        const res = await fetch(`/api/snapshots?date=${viewMode}`);
        if (res.ok) {
          const data = await res.json();
          setItems(data.items || []);
        }
        setAlerts([]);
        setLastUpdated(new Date());
        setLoading(false);
        return;
      }

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
  }, [filter, tickerFilter, viewMode]);

  useEffect(() => {
    fetchData();
    // Only auto-refresh in live mode
    if (viewMode === "live") {
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [fetchData, viewMode]);

  async function handleSignOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    setUser(null);
    setKeywords([]);
    setKeywordFilter(null);
  }

  async function handleAddKeyword(keyword: string) {
    const res = await fetch("/api/keywords", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword }),
    });
    if (res.ok) {
      const data = await res.json();
      setKeywords((prev) => [...prev, data.keyword]);
    }
  }

  async function handleRemoveKeyword(id: number) {
    await fetch(`/api/keywords?id=${id}`, { method: "DELETE" });
    setKeywords((prev) => prev.filter((k) => k.id !== id));
    if (keywords.find((k) => k.id === id)?.keyword === keywordFilter) {
      setKeywordFilter(null);
    }
  }

  const viralCount = items.filter((i) => i.isViral).length;
  const sourceCounts = items.reduce(
    (acc, item) => {
      acc[item.sourceType] = (acc[item.sourceType] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const allSourceTypes = Object.keys(sourceCounts);

  // Apply source filter
  let filteredItems =
    sourceFilter.length === 0
      ? items
      : items.filter((item) => sourceFilter.includes(item.sourceType));

  // Apply keyword filter (client-side text search)
  if (keywordFilter) {
    const kw = keywordFilter.toLowerCase();
    filteredItems = filteredItems.filter(
      (item) =>
        item.title.toLowerCase().includes(kw) ||
        item.matchedKeywords.some((mk) => mk.toLowerCase().includes(kw)) ||
        (item.description && item.description.toLowerCase().includes(kw))
    );
  }

  // Group items if enabled
  const groupedFeed = groupingEnabled ? groupItems(filteredItems) : null;

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

              {/* Date selector — Live or historical snapshot */}
              <DateSelector
                selected={viewMode}
                onSelect={(v) => {
                  setViewMode(v);
                  setLoading(true);
                  setSelectedItem(null);
                }}
              />

              {/* Group / List toggle */}
              <button
                onClick={() => setGroupingEnabled(!groupingEnabled)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  groupingEnabled
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {groupingEnabled ? "Grouped" : "List"}
              </button>

              {/* Korean translation toggle */}
              <TranslateButton onLanguageChange={setIsKorean} />

              {/* Ticker search (logged-in only) */}
              {user && (
                <TickerSearch
                  tickers={tickers}
                  selectedTicker={tickerFilter}
                  onSelect={setTickerFilter}
                />
              )}

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

              {/* Auth button */}
              {user ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 hidden sm:inline">
                    {user.name || user.email}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 text-sm transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-gray-900 text-white hover:bg-gray-800 text-sm font-medium transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>

          {/* Keyword bar (logged-in only) */}
          {user && keywords.length > 0 && (
            <div className="mt-2">
              <KeywordBar
                keywords={keywords}
                selectedKeyword={keywordFilter}
                onSelect={setKeywordFilter}
                onAdd={handleAddKeyword}
                onRemove={handleRemoveKeyword}
              />
            </div>
          )}
          {user && keywords.length === 0 && (
            <div className="mt-2">
              <KeywordBar
                keywords={[]}
                selectedKeyword={null}
                onSelect={setKeywordFilter}
                onAdd={handleAddKeyword}
                onRemove={handleRemoveKeyword}
              />
            </div>
          )}

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
            {/* Historical snapshot banner */}
            {viewMode !== "live" && (
              <div className="mb-3 px-4 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-center justify-between">
                <span>
                  Viewing snapshot from{" "}
                  <strong>
                    {new Date(viewMode + "T12:00:00").toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </strong>
                </span>
                <button
                  onClick={() => { setViewMode("live"); setLoading(true); }}
                  className="text-amber-600 hover:text-amber-800 font-medium"
                >
                  Back to Live
                </button>
              </div>
            )}

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
                  if (prev.length === 0) {
                    return allSourceTypes.filter((s) => s !== source);
                  }
                  const next = prev.includes(source)
                    ? prev.filter((s) => s !== source)
                    : [...prev, source];
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
                    : keywordFilter
                      ? `No items matching "${keywordFilter}"`
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
                  ) : keywordFilter ? (
                    <button
                      onClick={() => setKeywordFilter(null)}
                      className="text-orange-600 hover:text-orange-500"
                    >
                      Clear keyword filter
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
                grouped={groupedFeed}
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

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onAuth={(u) => setUser(u)}
        />
      )}
    </div>
  );
}
