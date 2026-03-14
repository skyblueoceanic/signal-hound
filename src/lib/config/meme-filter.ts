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
  /\blmao\b/i,
  /\blmfao\b/i,
  /\brofl\b/i,
  /\bbruh\b/i,
  /irl$/i,          // "me_irl", "AI_irl"
  /be like$/i,      // "AI devs be like"
  /in a nutshell/i,
  /emotional damage/i,
  /is wild/i,        // "this AI is wild" — casual reaction posts
  /just vibes/i,
  /no cap/i,
  /real ones know/i,
  /least unhinged/i,
  /most sane/i,
  /didn'?t hold back/i,  // "Grok didn't hold back" — reaction posts
  /goes? hard/i,          // "this AI goes hard"
  /shows up/i,            // "Kurt Cobain shows up" — casual entertainment
  /check this out/i,
  /you won'?t believe/i,
  /I asked .* to/i,       // "I asked ChatGPT to write..." — casual demos
  /I told .* to/i,
  /look what .* made/i,
  /made .* using AI/i,    // casual "look what I made" posts
  /rate my/i,
  /is (crazy|insane|nuts|unreal)/i,
];

export const MEME_REDDIT_FLAIRS = [
  "meme", "humor", "shitpost", "funny", "satire", "joke",
  "memes", "humour", "shitposting", "discussion/humor",
  "fun", "off-topic", "fluff", "low effort",
];

// Subreddits where almost everything is memes
export const MEME_SUBREDDITS = [
  "ProgrammerHumor",
  "programmingmemes",
  "AImemes",
  "dankmemes",
  "memes",
  "meirl",
  "me_irl",
  "2meirl4meirl",
  "technicallythetruth",
];

// Image/video hosting domains — posts linking here are almost never articles
const IMAGE_VIDEO_HOSTS = [
  "i.redd.it",
  "i.imgur.com",
  "imgur.com",
  "v.redd.it",
  "gfycat.com",
  "streamable.com",
  "giphy.com",
  "media.giphy.com",
  "i.imgflip.com",
  "pbs.twimg.com",       // Twitter image CDN
  "preview.redd.it",
  "external-preview.redd.it",
  "media.tenor.com",
  "youtube.com/shorts",
  "tiktok.com",
];

export function isMemeContent(
  title: string,
  flair?: string | null,
  subreddit?: string | null,
  score?: number,
  url?: string | null,
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

  // Image/video-only posts are almost always memes or low-value screenshots
  if (url) {
    try {
      const hostname = new URL(url).hostname.replace(/^www\./, "");
      const fullUrl = url.toLowerCase();
      if (
        IMAGE_VIDEO_HOSTS.some((h) => hostname === h || fullUrl.includes(h)) ||
        /\.(jpg|jpeg|png|gif|webp|mp4|webm)(\?|$)/i.test(url)
      ) {
        return true;
      }
    } catch {
      // invalid URL, skip check
    }
  }

  // Very short title + high engagement on Reddit = likely meme
  if (subreddit && title.length < 15 && (score || 0) > 500) return true;

  return false;
}
