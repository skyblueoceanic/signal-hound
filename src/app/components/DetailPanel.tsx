"use client";

import { SparklineChart } from "./SparklineChart";
import { TickerBadge } from "./TickerBar";
import type { TrendingItemData } from "../types";

const SOURCE_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  hackernews: { label: "Hacker News", color: "text-orange-600", bg: "bg-orange-50" },
  reddit: { label: "Reddit", color: "text-blue-600", bg: "bg-blue-50" },
  github: { label: "GitHub", color: "text-purple-600", bg: "bg-purple-50" },
  arxiv: { label: "arXiv", color: "text-green-600", bg: "bg-green-50" },
  rss: { label: "RSS Feed", color: "text-yellow-600", bg: "bg-yellow-50" },
  benzinga: { label: "Benzinga", color: "text-cyan-600", bg: "bg-cyan-50" },
};

export function DetailPanel({
  item,
  onClose,
}: {
  item: TrendingItemData | null;
  onClose: () => void;
}) {
  if (!item) {
    return (
      <div className="flex items-center justify-center h-full text-gray-600 text-sm">
        <div className="text-center">
          <div className="text-3xl mb-3 opacity-50">←</div>
          <p>Select an item to view details</p>
        </div>
      </div>
    );
  }

  const source = SOURCE_CONFIG[item.sourceType] || {
    label: item.sourceType,
    color: "text-gray-600",
    bg: "bg-gray-100",
  };
  const subreddit = (item.metadata as { subreddit?: string })?.subreddit;
  const sortedSnapshots = item.snapshots.slice().reverse();

  return (
    <div className="h-full overflow-y-auto">
      {/* Close button (mobile) + Source badge */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${source.bg} ${source.color}`}
          >
            {source.label}
          </span>
          {subreddit && (
            <span className="text-xs text-blue-500">r/{subreddit}</span>
          )}
          {item.isViral && (
            <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-600 text-xs font-medium">
              VIRAL
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="lg:hidden text-gray-400 hover:text-gray-900 text-lg"
        >
          ✕
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Title — prominent */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 leading-snug">
            {item.title}
          </h2>
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 flex-wrap">
            {item.author && <span>by {item.author}</span>}
            <span>{getTimeAgo(new Date(item.publishedAt))}</span>
            <span>·</span>
            <span>First seen {getTimeAgo(new Date(item.firstSeenAt))}</span>
          </div>
        </div>

        {/* Open article button — prominent */}
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 w-full py-3 px-4 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Read Full Article
        </a>

        {/* Description */}
        {item.description && (
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-700 leading-relaxed">
              {item.description}
            </p>
          </div>
        )}

        {/* Embedded article iframe */}
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
            <span className="text-xs text-gray-500 truncate max-w-[80%]">{item.url}</span>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-orange-600 hover:text-orange-500 shrink-0"
            >
              Open ↗
            </a>
          </div>
          <iframe
            src={item.url}
            className="w-full border-0"
            style={{ height: "400px" }}
            sandbox="allow-scripts allow-same-origin"
            title={item.title}
          />
        </div>

        {/* Affected tickers */}
        {item.tickers && item.tickers.length > 0 && (
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
              Affected Tickers
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {item.tickers.map((t) => (
                <TickerBadge
                  key={t.ticker}
                  ticker={t.ticker}
                  sentiment={t.sentiment}
                />
              ))}
            </div>
          </div>
        )}

        {/* Matched keywords */}
        {item.matchedKeywords.length > 0 && (
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
              Matched Keywords
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {[...new Set(item.matchedKeywords)].map((kw) => (
                <span
                  key={kw}
                  className="px-2 py-1 rounded bg-gray-100 text-gray-500 text-xs"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Compact metrics row */}
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
          <div className="flex items-center gap-4 flex-wrap text-xs">
            <span><span className="text-gray-400">Score</span> <span className="text-gray-900 font-medium">{formatNumber(item.score)}</span></span>
            <span><span className="text-gray-400">Comments</span> <span className="text-gray-900 font-medium">{formatNumber(item.commentCount)}</span></span>
            <span><span className="text-gray-400">Virality</span> <span className={item.isViral ? "text-red-600 font-medium" : "text-gray-900 font-medium"}>{item.viralityScore.toFixed(1)}</span></span>
            {item.velocity > 0 && (
              <span><span className="text-gray-400">Vel</span> <span className={item.velocity > 1 ? "text-red-600 font-medium" : "text-gray-900 font-medium"}>{item.velocity.toFixed(1)}/min</span></span>
            )}
          </div>
        </div>

        {/* Engagement chart (compact) */}
        {sortedSnapshots.length >= 2 && (
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
              Engagement Over Time
            </div>
            <div className="h-16">
              <SparklineChart
                data={sortedSnapshots.map((s) => s.score)}
                color={item.isViral ? "#ef4444" : "#f97316"}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
      <div className="text-xs text-gray-500 mb-0.5">{label}</div>
      <div
        className={`text-lg font-bold ${highlight ? "text-red-600" : "text-gray-900"}`}
      >
        {value}
      </div>
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
