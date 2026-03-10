"use client";

import { SparklineChart } from "./SparklineChart";
import { TickerBadge } from "./TickerBar";
import type { TrendingItemData } from "../types";

const SOURCE_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: string }
> = {
  hackernews: { label: "HN", color: "text-orange-600", bg: "bg-orange-50", icon: "Y" },
  reddit: { label: "Reddit", color: "text-blue-600", bg: "bg-blue-50", icon: "R" },
  github: { label: "GitHub", color: "text-purple-600", bg: "bg-purple-50", icon: "G" },
  arxiv: { label: "arXiv", color: "text-green-600", bg: "bg-green-50", icon: "A" },
  rss: { label: "RSS", color: "text-yellow-600", bg: "bg-yellow-50", icon: "F" },
  benzinga: { label: "BZ", color: "text-cyan-600", bg: "bg-cyan-50", icon: "B" },
};

export function TrendingFeed({
  items,
  selectedId,
  onSelect,
}: {
  items: TrendingItemData[];
  selectedId?: number | null;
  onSelect?: (item: TrendingItemData) => void;
}) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <TrendingCard
          key={`${item.sourceType}-${item.id}`}
          item={item}
          selected={selectedId === item.id}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

function TrendingCard({
  item,
  selected,
  onSelect,
}: {
  item: TrendingItemData;
  selected?: boolean;
  onSelect?: (item: TrendingItemData) => void;
}) {
  const source = SOURCE_CONFIG[item.sourceType] || {
    label: item.sourceType,
    color: "text-gray-600",
    bg: "bg-gray-50",
    icon: "?",
  };
  const timeAgo = getTimeAgo(new Date(item.publishedAt));
  const subreddit = (item.metadata as { subreddit?: string })?.subreddit;

  return (
    <div
      onClick={() => onSelect?.(item)}
      className={`rounded-xl border p-3 transition-colors cursor-pointer ${
        selected
          ? "border-orange-400 bg-orange-50/50 shadow-sm"
          : item.isViral
            ? "border-red-200 bg-white hover:border-red-300 shadow-sm"
            : "border-gray-200 bg-white hover:border-gray-300 shadow-sm"
      }`}
    >
      <div className="flex gap-3">
        {/* Source icon */}
        <div className="shrink-0">
          <div
            className={`w-8 h-8 rounded-lg ${source.bg} flex items-center justify-center`}
          >
            <span className={`text-xs font-bold ${source.color}`}>
              {source.icon}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-sm text-gray-900 font-medium leading-snug line-clamp-2">
                {item.title}
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400 flex-wrap">
                <span className={source.color}>{source.label}</span>
                {subreddit && (
                  <span className="text-blue-500">r/{subreddit}</span>
                )}
                {item.author && <span className="truncate max-w-[100px]">{item.author}</span>}
                <span>{timeAgo}</span>
                {item.isViral && (
                  <span className="px-1 py-0.5 rounded bg-red-100 text-red-600 font-medium text-[10px]">
                    VIRAL
                  </span>
                )}
              </div>
            </div>

            {/* Sparkline */}
            {item.snapshots.length >= 2 && (
              <div className="shrink-0 w-16 h-8">
                <SparklineChart
                  data={item.snapshots
                    .slice()
                    .reverse()
                    .map((s) => s.score)}
                  color={item.isViral ? "#dc2626" : "#f97316"}
                />
              </div>
            )}
          </div>

          {/* Compact metrics row */}
          <div className="flex items-center gap-3 mt-1.5">
            <Metric label="Score" value={formatNumber(item.score)} />
            <Metric
              label="Comments"
              value={formatNumber(item.commentCount)}
            />
            <Metric
              label="Virality"
              value={item.viralityScore.toFixed(1)}
              highlight={item.isViral}
            />
            {item.velocity > 0 && (
              <Metric
                label="Vel"
                value={`${item.velocity.toFixed(1)}/m`}
                highlight={item.velocity > 1}
              />
            )}
          </div>

          {/* Tickers + Keywords (compact) */}
          {((item.tickers && item.tickers.length > 0) || item.matchedKeywords.length > 0) && (
            <div className="flex gap-1 mt-1.5 flex-wrap">
              {item.tickers?.slice(0, 3).map((t) => (
                <TickerBadge
                  key={t.ticker}
                  ticker={t.ticker}
                  sentiment={t.sentiment}
                />
              ))}
              {(item.tickers?.length || 0) > 3 && (
                <span className="text-[10px] text-gray-400">
                  +{(item.tickers?.length || 0) - 3}
                </span>
              )}
              {[...new Set(item.matchedKeywords)].slice(0, 2).map((kw) => (
                <span
                  key={kw}
                  className="px-1 py-0.5 rounded bg-gray-100 text-gray-500 text-[10px]"
                >
                  {kw}
                </span>
              ))}
              {item.matchedKeywords.length > 2 && (
                <span className="text-[10px] text-gray-400">
                  +{item.matchedKeywords.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="text-xs">
      <span className="text-gray-400">{label} </span>
      <span
        className={highlight ? "text-red-600 font-medium" : "text-gray-600"}
      >
        {value}
      </span>
    </div>
  );
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
