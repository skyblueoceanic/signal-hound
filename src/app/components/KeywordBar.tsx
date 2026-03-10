"use client";

import { useState } from "react";

interface UserKeyword {
  id: number;
  keyword: string;
}

export function KeywordBar({
  keywords,
  selectedKeyword,
  onSelect,
  onAdd,
  onRemove,
}: {
  keywords: UserKeyword[];
  selectedKeyword: string | null;
  onSelect: (keyword: string | null) => void;
  onAdd: (keyword: string) => void;
  onRemove: (id: number) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [input, setInput] = useState("");

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setInput("");
    setAdding(false);
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="text-xs text-gray-400 mr-1">Keywords:</span>
      {keywords.map((kw) => (
        <button
          key={kw.id}
          onClick={() =>
            onSelect(selectedKeyword === kw.keyword ? null : kw.keyword)
          }
          className={`group flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
            selectedKeyword === kw.keyword
              ? "bg-orange-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {kw.keyword}
          <span
            onClick={(e) => {
              e.stopPropagation();
              onRemove(kw.id);
            }}
            className={`ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ${
              selectedKeyword === kw.keyword
                ? "text-white/70 hover:text-white"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            ✕
          </span>
        </button>
      ))}

      {adding ? (
        <form onSubmit={handleAdd} className="flex items-center gap-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. robotics"
            autoFocus
            className="w-28 px-2 py-1 rounded-lg border border-gray-300 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
          <button
            type="submit"
            className="px-2 py-1 rounded-lg bg-orange-600 text-white text-xs"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setAdding(false)}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="px-2 py-1 rounded-lg border border-dashed border-gray-300 text-xs text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors"
        >
          + Add
        </button>
      )}
    </div>
  );
}
