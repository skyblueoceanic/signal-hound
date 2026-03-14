export type SourceType =
  | "hackernews"
  | "reddit"
  | "github"
  | "arxiv"
  | "rss"
  | "benzinga";

export interface ContentItem {
  sourceType: SourceType;
  externalId: string; // unique ID from the source platform
  title: string;
  url: string;
  author: string | null;
  description: string | null;
  publishedAt: Date;
  // Engagement metrics (platform-specific)
  score: number; // HN points, Reddit upvotes, GitHub stars, etc.
  commentCount: number;
  // AI relevance
  matchedKeywords: string[];
  // Metadata
  subreddit?: string; // Reddit-specific
  language?: string; // GitHub-specific
  categories?: string[]; // arXiv-specific
}

export interface EngagementSnapshot {
  itemId: number;
  score: number;
  commentCount: number;
  recordedAt: Date;
}

export interface ViralityScore {
  itemId: number;
  velocityScore: number; // rate of change signal
  absoluteScore: number; // absolute numbers signal
  combinedScore: number; // weighted combination
  isViral: boolean;
  velocity: number; // raw engagement change per minute
  acceleration: number; // rate of velocity change
}

export interface TrendingItem extends ContentItem {
  id: number;
  virality: ViralityScore;
  firstSeenAt: Date;
  lastUpdatedAt: Date;
  snapshots: EngagementSnapshot[];
}

// Platform-specific virality thresholds
// absoluteScore/absoluteComments: reaching 50% of these = score of 50 (capped at 100)
export const VIRALITY_THRESHOLDS = {
  hackernews: {
    absoluteScore: 1000, // 1K+ points = truly viral on HN
    absoluteComments: 500,
    velocityPerMinute: 5,
  },
  reddit: {
    absoluteScore: 5000, // 5K+ upvotes = truly viral (not just popular)
    absoluteComments: 500,
    velocityPerMinute: 20,
  },
  github: {
    absoluteScore: 50000, // 50K+ total stars — only truly massive repos
    absoluteComments: 0,
    velocityPerMinute: 5, // 5 stars/min = genuinely spiking
  },
  arxiv: {
    absoluteScore: 500, // 500+ citations/score — truly landmark papers
    absoluteComments: 0,
    velocityPerMinute: 0.5,
  },
  rss: {
    absoluteScore: 0, // RSS doesn't have engagement metrics
    absoluteComments: 0,
    velocityPerMinute: 0,
  },
  benzinga: {
    absoluteScore: 0,
    absoluteComments: 0,
    velocityPerMinute: 0,
  },
} as const;

// Weights for combining velocity and absolute signals
export const VIRALITY_WEIGHTS = {
  velocity: 0.6,
  absolute: 0.4,
};
