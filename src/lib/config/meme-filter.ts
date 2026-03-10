// Patterns that indicate meme/joke/low-quality content unlikely to move markets

export const MEME_TITLE_PATTERNS = [
  /^MFW\b/i,
  /^TFW\b/i,
  /^POV:/i,
  /^Me when/i,
  /^Nobody:/i,
  /^\[Meme\]/i,
  /^\[Humor\]/i,
  /^\[Shitpost\]/i,
  /^\[Joke\]/i,
  /shitpost/i,
  /copypasta/i,
  /circlejerk/i,
  /\bwaifu\b/i,
  /\bdank\b/i,
  /\bmeme\b/i,
  /virgin.*chad/i,
  /starter.?pack/i,
  /upvote if/i,
  /who would win/i,
  /change my mind/i,
  /wrong answers only/i,
  /🤡|💀|😂|🚀🚀🚀/,
];

export const MEME_REDDIT_FLAIRS = [
  "meme", "humor", "shitpost", "funny", "satire", "joke",
  "memes", "humour", "shitposting", "discussion/humor",
];

// Subreddits where almost everything is memes
export const MEME_SUBREDDITS = [
  "ProgrammerHumor",
  "programmingmemes",
  "AImemes",
  "dankmemes",
  "memes",
];

export function isMemeContent(
  title: string,
  flair?: string | null,
  subreddit?: string | null,
  score?: number
): boolean {
  // Check title patterns
  for (const pattern of MEME_TITLE_PATTERNS) {
    if (pattern.test(title)) return true;
  }

  // Check Reddit flair
  if (flair) {
    const lowerFlair = flair.toLowerCase();
    if (MEME_REDDIT_FLAIRS.some((f) => lowerFlair.includes(f))) return true;
  }

  // Check meme subreddits
  if (subreddit && MEME_SUBREDDITS.some(
    (s) => s.toLowerCase() === subreddit.toLowerCase()
  )) {
    return true;
  }

  // Very short title + high engagement on Reddit = likely meme
  if (subreddit && title.length < 15 && (score || 0) > 500) return true;

  return false;
}
