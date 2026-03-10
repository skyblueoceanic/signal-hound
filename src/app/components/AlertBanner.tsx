"use client";

interface Alert {
  id: number;
  type: string;
  message: string;
  score: number;
  createdAt: string;
  read: boolean;
  item: {
    title: string;
    url: string;
    sourceType: string;
  };
}

export function AlertBanner({ alerts }: { alerts: Alert[] }) {
  const unread = alerts.filter((a) => !a.read);
  if (unread.length === 0) return null;

  const latest = unread[0];
  const timeAgo = getTimeAgo(new Date(latest.createdAt));

  return (
    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold">
            {unread.length}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-red-600">
              {latest.type === "velocity_spike"
                ? "Velocity Spike"
                : "High Engagement"}
            </span>
            <span className="text-xs text-gray-500">{timeAgo}</span>
          </div>
          <p className="text-sm text-gray-700 truncate">{latest.message}</p>
          {unread.length > 1 && (
            <p className="text-xs text-gray-500 mt-1">
              +{unread.length - 1} more alert{unread.length - 1 > 1 ? "s" : ""}
            </p>
          )}
        </div>
        <a
          href={latest.item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-sm text-orange-600 hover:text-orange-500"
        >
          View
        </a>
      </div>
    </div>
  );
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
