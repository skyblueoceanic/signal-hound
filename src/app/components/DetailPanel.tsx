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

      <div className="p-4 space-y-5">
        {/* Title */}
        <div>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-semibold text-gray-900 hover:text-orange-600 transition-colors leading-snug"
          >
            {item.title}
          </a>
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 flex-wrap">
            {item.author && <span>by {item.author}</span>}
            <span>{getTimeAgo(new Date(item.publishedAt))}</span>
            <span>·</span>
            <span>First seen {getTimeAgo(new Date(item.firstSeenAt))}</span>
          </div>
        </div>

        {/* Engagement chart (larger) */}
        {sortedSnapshots.length >= 2 && (
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
              Engagement Over Time
            </div>
            <div className="h-24 bg-gray-50 rounded-lg p-2 border border-gray-200">
              <SparklineChart
                data={sortedSnapshots.map((s) => s.score)}
                color={item.isViral ? "#ef4444" : "#f97316"}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-1 px-1">
              <span>{getTimeAgo(new Date(sortedSnapshots[0].recordedAt))}</span>
              <span>{getTimeAgo(new Date(sortedSnapshots[sortedSnapshots.length - 1].recordedAt))}</span>
            </div>
          </div>
        )}

        {/* Key metrics grid */}
        <div className="grid grid-cols-2 gap-2">
          <MetricCard label="Score" value={formatNumber(item.score)} />
          <MetricCard label="Comments" value={formatNumber(item.commentCount)} />
          <MetricCard
            label="Virality"
            value={item.viralityScore.toFixed(1)}
            highlight={item.isViral}
          />
          <MetricCard
            label="Velocity"
            value={item.velocity > 0 ? `${item.velocity.toFixed(1)}/min` : "—"}
            highlight={item.velocity > 1}
          />
          {item.acceleration > 0 && (
            <MetricCard
              label="Acceleration"
              value={`+${item.acceleration.toFixed(2)}`}
              highlight
            />
          )}
          <MetricCard
            label="Snapshots"
            value={String(item.snapshots.length)}
          />
        </div>

        {/* Description */}
        {item.description && (
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
              Description
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              {item.description}
            </p>
          </div>
        )}

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

        {/* Engagement history table */}
        {sortedSnapshots.length > 0 && (
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
              Engagement History
            </div>
            <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500">
                    <th className="text-left py-2 px-3 font-medium">Time</th>
                    <th className="text-right py-2 px-3 font-medium">Score</th>
                    <th className="text-right py-2 px-3 font-medium">Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedSnapshots.slice(-10).reverse().map((s, i) => (
                    <tr
                      key={i}
                      className="border-b border-gray-200/50 last:border-0"
                    >
                      <td className="py-1.5 px-3 text-gray-500">
                        {getTimeAgo(new Date(s.recordedAt))}
                      </td>
                      <td className="py-1.5 px-3 text-right text-gray-900 font-medium">
                        {formatNumber(s.score)}
                      </td>
                      <td className="py-1.5 px-3 text-right text-gray-500">
                        {formatNumber(s.commentCount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Open original link */}
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center py-2.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium transition-colors"
        >
          Open Original →
        </a>
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
