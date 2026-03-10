"use client";

const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
  hackernews: { label: "Hacker News", color: "text-orange-600" },
  reddit: { label: "Reddit", color: "text-blue-600" },
  github: { label: "GitHub", color: "text-purple-600" },
  arxiv: { label: "arXiv", color: "text-green-600" },
  rss: { label: "RSS", color: "text-yellow-600" },
  benzinga: { label: "Benzinga", color: "text-cyan-600" },
};

interface SourceFilterProps {
  selected: string[];
  onToggle: (source: string) => void;
  onToggleAll: () => void;
  counts: Record<string, number>;
}

export function SourceFilter({ selected, onToggle, onToggleAll, counts }: SourceFilterProps) {
  const allSelected = selected.length === 0; // empty = all selected

  return (
    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
      <FilterChip
        label="All Sources"
        count={Object.values(counts).reduce((a, b) => a + b, 0)}
        active={allSelected}
        onClick={onToggleAll}
      />
      {Object.entries(SOURCE_LABELS).map(([key, { label, color }]) => {
        const count = counts[key] || 0;
        if (count === 0) return null;
        return (
          <FilterChip
            key={key}
            label={label}
            count={count}
            active={allSelected || selected.includes(key)}
            onClick={() => onToggle(key)}
            colorClass={color}
          />
        );
      })}
    </div>
  );
}

function FilterChip({
  label,
  count,
  active,
  onClick,
  colorClass,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  colorClass?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
        active
          ? "bg-gray-900 text-white border border-gray-900"
          : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700"
      }`}
    >
      <span className={active ? "text-white" : colorClass}>{label}</span>
      <span className={`ml-1.5 text-xs ${active ? "text-gray-300" : "text-gray-400"}`}>{count}</span>
    </button>
  );
}
