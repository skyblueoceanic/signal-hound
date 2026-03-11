"use client";

import { useState } from "react";
import { SparklineChart } from "./SparklineChart";
import { TickerBadge } from "./TickerBar";
import type { TrendingItemData } from "../types";
import type { GroupedFeed } from "../../lib/grouping";

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
  grouped,
}: {
  items: TrendingItemData[];
  selectedId?: number | null;
  onSelect?: (item: TrendingItemData) => void;
  grouped?: GroupedFeed | null;
}) {
  if (grouped && (grouped.groups.length > 0 || grouped.ungrouped.length > 0)) {
    return (
      <div className="space-y-3">
        {grouped.groups.map((group) => (
          <ArticleGroupView
            key={group.topic}
            topic={group.topic}
            items={group.items}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        ))}
        {grouped.ungrouped.length > 0 && (
          <div className="space-y-2">
            {grouped.ungrouped.map((item) => (
              <TrendingCard
                key={`${item.sourceType}-${item.id}`}
                item={item}
                selected={selectedId === item.id}
                onSelect={onSelect}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

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

function ArticleGroupView({
  topic,
  items,
  selectedId,
  onSelect,
}: {
  topic: string;
  items: TrendingItemData[];
  selectedId?: number | null;
  onSelect?: (item: TrendingItemData) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const displayItems = expanded ? items : items.slice(0, 1);

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      {/* Group header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg
            className={`w-3.5 h-3.5 text-gray-400 transition-transform ${expanded ? "rotate-90" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-xs font-semibold text-gray-700">{topic}</span>
          <span className="text-[10px] text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded-full">
            {items.length} articles
          </span>
        </div>
        <div className="text-[10px] text-gray-400">
          {items.filter((i) => i.isViral).length > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-600 font-medium mr-2">
              VIRAL
            </span>
          )}
          Top: {formatNumber(items[0]?.score || 0)} pts
        </div>
      </button>

      {/* Group items */}
      <div className="divide-y divide-gray-100">
        {displayItems.map((item) => (
          <div key={`${item.sourceType}-${item.id}`} className="px-1">
            <TrendingCard
              item={item}
              selected={selectedId === item.id}
              onSelect={onSelect}
            />
          </div>
        ))}
      </div>

      {/* Expand prompt */}
      {!expanded && items.length > 1 && (
        <button
          onClick={() => setExpanded(true)}
          className="w-full py-1.5 text-[11px] text-orange-600 hover:text-orange-500 bg-orange-50/50 hover:bg-orange-50 transition-colors"
        >
          + {items.length - 1} more article{items.length - 1 > 1 ? "s" : ""} on this topic
        </button>
      )}
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
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-sm text-gray-900 font-medium leading-snug line-clamp-2 hover:text-orange-600 transition-colors"
              >
                {item.title}
                <svg className="inline-block ml-1 w-3 h-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
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
