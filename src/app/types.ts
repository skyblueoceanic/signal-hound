export interface Snapshot {
  score: number;
  commentCount: number;
  recordedAt: string;
}

export interface TickerImpact {
  ticker: string;
  name: string;
  sentiment: string;
  confidence: number;
}

export interface TrendingItemData {
  id: number;
  sourceType: string;
  title: string;
  url: string;
  author: string | null;
  description: string | null;
  publishedAt: string;
  score: number;
  commentCount: number;
  matchedKeywords: string[];
  viralityScore: number;
  isViral: boolean;
  velocity: number;
  acceleration: number;
  metadata: Record<string, unknown> | null;
  firstSeenAt: string;
  lastUpdatedAt: string;
  snapshots: Snapshot[];
  tickers: TickerImpact[];
}

export interface AlertData {
  id: number;
  type: string;
  message: string;
  score: number;
  createdAt: string;
  read: boolean;
  item: {
    id: number;
    title: string;
    url: string;
    sourceType: string;
    score: number;
  };
}

export interface TickerSummary {
  ticker: string;
  name: string;
  mentionCount: number;
}
