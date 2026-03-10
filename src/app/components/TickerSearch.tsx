"use client";

import { useState, useRef, useEffect } from "react";
import type { TickerSummary } from "../types";

export function TickerSearch({
  tickers,
  selectedTicker,
  onSelect,
}: {
  tickers: TickerSummary[];
  selectedTicker: string | null;
  onSelect: (ticker: string | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = query
    ? tickers.filter(
        (t) =>
          t.ticker.toLowerCase().includes(query.toLowerCase()) ||
          t.name.toLowerCase().includes(query.toLowerCase())
      )
    : tickers;

  return (
    <div className="relative" ref={ref}>
      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            type="text"
            placeholder="Search ticker..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            className="w-44 px-3 py-1.5 pl-7 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <svg
            className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        {selectedTicker && (
          <button
            onClick={() => {
              onSelect(null);
              setQuery("");
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-100 text-orange-700 text-xs font-medium"
          >
            ${selectedTicker}
            <span className="text-orange-400 hover:text-orange-600">✕</span>
          </button>
        )}
      </div>

      {open && filtered.length > 0 && (
        <div className="absolute top-full mt-1 left-0 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-48 overflow-y-auto">
          {filtered.slice(0, 10).map((t) => (
            <button
              key={t.ticker}
              onClick={() => {
                onSelect(t.ticker);
                setQuery("");
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center justify-between"
            >
              <span>
                <span className="font-medium text-gray-900">${t.ticker}</span>
                <span className="text-gray-400 ml-1.5">{t.name}</span>
              </span>
              <span className="text-xs text-gray-400">
                {t.mentionCount}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
