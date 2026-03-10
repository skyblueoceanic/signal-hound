"use client";

interface StatsBarProps {
  totalItems: number;
  viralCount: number;
  sourceCounts: Record<string, number>;
}

export function StatsBar({ totalItems, viralCount, sourceCounts }: StatsBarProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <StatCard label="Tracking" value={totalItems} />
      <StatCard label="Viral" value={viralCount} highlight />
      <StatCard
        label="Sources"
        value={Object.keys(sourceCounts).length}
      />
      <StatCard
        label="Top Source"
        value={
          Object.entries(sourceCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ||
          "—"
        }
        isText
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
  isText,
}: {
  label: string;
  value: number | string;
  highlight?: boolean;
  isText?: boolean;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
        {label}
      </div>
      <div
        className={`text-2xl font-bold ${
          highlight
            ? "text-red-600"
            : isText
              ? "text-orange-600 text-lg capitalize"
              : "text-gray-900"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
