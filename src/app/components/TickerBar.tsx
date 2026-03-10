"use client";

interface TickerData {
  ticker: string;
  name: string;
  mentionCount: number;
}

interface TickerBarProps {
  tickers: TickerData[];
  selectedTicker: string | null;
  onSelect: (ticker: string | null) => void;
}

const SENTIMENT_COLORS: Record<string, string> = {
  bullish: "text-green-600",
  bearish: "text-red-600",
  neutral: "text-gray-500",
};

export function TickerBar({ tickers, selectedTicker, onSelect }: TickerBarProps) {
  if (tickers.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
          Affected Tickers
        </span>
        {selectedTicker && (
          <button
            onClick={() => onSelect(null)}
            className="text-xs text-orange-600 hover:text-orange-500"
          >
            Clear filter
          </button>
        )}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tickers.map((t) => (
          <button
            key={t.ticker}
            onClick={() =>
              onSelect(selectedTicker === t.ticker ? null : t.ticker)
            }
            className={`shrink-0 px-3 py-2 rounded-lg border text-sm transition-colors ${
              selectedTicker === t.ticker
                ? "bg-orange-50 border-orange-400 text-orange-600"
                : "bg-white border-gray-200 hover:border-gray-300"
            }`}
          >
            <span className="font-bold text-gray-900">${t.ticker}</span>
            <span className="text-gray-400 ml-1.5 text-xs">
              {t.name}
            </span>
            <span className="ml-2 text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">
              {t.mentionCount}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Small ticker badge for use inside feed cards
export function TickerBadge({
  ticker,
  sentiment,
}: {
  ticker: string;
  sentiment: string;
}) {
  const color = SENTIMENT_COLORS[sentiment] || "text-gray-500";
  const bgColor =
    sentiment === "bullish"
      ? "bg-green-50"
      : sentiment === "bearish"
        ? "bg-red-50"
        : "bg-gray-100";

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${bgColor} ${color}`}
    >
      ${ticker}
      {sentiment === "bullish" && " ↑"}
      {sentiment === "bearish" && " ↓"}
    </span>
  );
}
