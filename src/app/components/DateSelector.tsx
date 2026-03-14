"use client";

import { useState, useEffect } from "react";

interface SnapshotDate {
  date: string;
  itemCount: number;
}

export function DateSelector({
  selected,
  onSelect,
}: {
  selected: string; // "live" or "2026-03-12"
  onSelect: (value: string) => void;
}) {
  const [dates, setDates] = useState<SnapshotDate[]>([]);

  useEffect(() => {
    fetch("/api/snapshots")
      .then((r) => r.json())
      .then((data) => {
        if (data.dates) setDates(data.dates);
      })
      .catch(() => {});
  }, []);

  function formatDate(dateStr: string) {
    const [year, month, day] = dateStr.split("-").map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  return (
    <select
      value={selected}
      onChange={(e) => onSelect(e.target.value)}
      className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium border-0 cursor-pointer hover:bg-gray-200 transition-colors"
    >
      <option value="live">Live</option>
      {dates.map((d) => (
        <option key={d.date} value={d.date}>
          {formatDate(d.date)} ({d.itemCount} items)
        </option>
      ))}
    </select>
  );
}
