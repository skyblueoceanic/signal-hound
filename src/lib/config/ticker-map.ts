// Maps AI keywords, company names, and themes to affected stock tickers
// Used in Phase 2 for automatic ticker impact classification

export interface TickerMapping {
  ticker: string;
  name: string;
  // Keywords that directly map to this ticker
  keywords: string[];
  // Themes that indirectly affect this ticker
  themes: string[];
  // Default sentiment when this company is mentioned in AI context
  defaultSentiment: "bullish" | "bearish" | "neutral";
}

export const TICKER_MAP: TickerMapping[] = [
  // ─── Mega-cap AI plays ────────────────────────────────────────
  {
    ticker: "NVDA",
    name: "NVIDIA",
    keywords: [
      "NVIDIA", "Jensen Huang", "H100", "H200", "B200", "B100", "GB200",
      "A100", "CUDA", "GeForce", "DGX", "NVLink", "Blackwell", "Hopper",
      "Grace", "Jetson",
    ],
    themes: [
      "GPU", "AI chip", "AI accelerator", "AI infrastructure", "data center",
      "AI server", "AI cluster", "compute", "AI capex", "AI spending",
      "training cost", "inference cost", "hyperscaler",
    ],
    defaultSentiment: "bullish",
  },
  {
    ticker: "MSFT",
    name: "Microsoft",
    keywords: [
      "Microsoft", "Azure", "Copilot", "GitHub Copilot", "Bing AI",
      "Microsoft AI", "Satya Nadella",
    ],
    themes: [
      "OpenAI", "ChatGPT", "GPT-4", "GPT-5", "AI enterprise", "cloud AI",
      "AI partnership",
    ],
    defaultSentiment: "bullish",
  },
  {
    ticker: "GOOGL",
    name: "Alphabet/Google",
    keywords: [
      "Google", "Alphabet", "DeepMind", "Google DeepMind", "Gemini", "Gemma",
      "Google AI", "Sundar Pichai", "Google Cloud", "Bard", "NotebookLM",
    ],
    themes: [
      "Anthropic", "AI search", "AI advertising",
    ],
    defaultSentiment: "bullish",
  },
  {
    ticker: "AMZN",
    name: "Amazon",
    keywords: [
      "Amazon", "AWS", "Amazon Bedrock", "AWS AI", "Alexa AI",
      "Andy Jassy", "Amazon Q",
    ],
    themes: [
      "Anthropic", "Claude", "cloud AI", "AI infrastructure",
    ],
    defaultSentiment: "bullish",
  },
  {
    ticker: "META",
    name: "Meta Platforms",
    keywords: [
      "Meta", "Meta AI", "Mark Zuckerberg", "Llama", "Meta Llama",
      "Instagram AI", "WhatsApp AI",
    ],
    themes: [
      "open source AI", "AI social media", "generative AI",
    ],
    defaultSentiment: "bullish",
  },
  {
    ticker: "AAPL",
    name: "Apple",
    keywords: [
      "Apple", "Apple Intelligence", "Siri AI", "Apple AI",
      "Tim Cook", "Apple Silicon", "M4",
    ],
    themes: [
      "on-device AI", "AI smartphone", "edge AI",
    ],
    defaultSentiment: "neutral",
  },
  {
    ticker: "TSLA",
    name: "Tesla",
    keywords: [
      "Tesla", "Tesla AI", "Elon Musk", "FSD", "Full Self-Driving",
      "Tesla Bot", "Optimus", "Dojo",
    ],
    themes: [
      "autonomous driving", "self-driving", "AI robotics", "xAI",
    ],
    defaultSentiment: "bullish",
  },

  // ─── AI-focused companies ─────────────────────────────────────
  {
    ticker: "PLTR",
    name: "Palantir",
    keywords: ["Palantir", "Alex Karp", "AIP", "Palantir AIP", "Gotham", "Foundry"],
    themes: ["AI defense", "AI military", "AI enterprise", "AI government"],
    defaultSentiment: "bullish",
  },
  {
    ticker: "AI",
    name: "C3.ai",
    keywords: ["C3.ai", "C3 AI", "Tom Siebel"],
    themes: ["AI enterprise", "enterprise AI platform"],
    defaultSentiment: "bullish",
  },
  {
    ticker: "SOUN",
    name: "SoundHound AI",
    keywords: ["SoundHound", "SoundHound AI"],
    themes: ["voice AI", "conversational AI"],
    defaultSentiment: "bullish",
  },
  {
    ticker: "BBAI",
    name: "BigBear.ai",
    keywords: ["BigBear.ai", "BigBear AI"],
    themes: ["AI defense", "AI analytics"],
    defaultSentiment: "bullish",
  },

  // ─── Semiconductor / AI infrastructure ────────────────────────
  {
    ticker: "AMD",
    name: "AMD",
    keywords: ["AMD", "Lisa Su", "MI300", "MI300X", "Instinct", "ROCm"],
    themes: ["GPU", "AI chip", "AI accelerator", "data center"],
    defaultSentiment: "bullish",
  },
  {
    ticker: "AVGO",
    name: "Broadcom",
    keywords: ["Broadcom", "Hock Tan"],
    themes: ["AI chip", "AI networking", "custom AI silicon", "ASIC"],
    defaultSentiment: "bullish",
  },
  {
    ticker: "TSM",
    name: "TSMC",
    keywords: ["TSMC", "Taiwan Semiconductor"],
    themes: ["semiconductor", "AI chip", "chip manufacturing", "advanced node"],
    defaultSentiment: "bullish",
  },
  {
    ticker: "ASML",
    name: "ASML",
    keywords: ["ASML"],
    themes: ["semiconductor", "chip manufacturing", "EUV", "lithography"],
    defaultSentiment: "bullish",
  },
  {
    ticker: "ARM",
    name: "Arm Holdings",
    keywords: ["Arm", "ARM Holdings", "Arm AI"],
    themes: ["AI chip", "chip design", "edge AI", "mobile AI"],
    defaultSentiment: "bullish",
  },
  {
    ticker: "MRVL",
    name: "Marvell Technology",
    keywords: ["Marvell"],
    themes: ["custom AI silicon", "AI networking", "data center"],
    defaultSentiment: "bullish",
  },
  {
    ticker: "INTC",
    name: "Intel",
    keywords: ["Intel", "Gaudi", "Intel Gaudi", "Pat Gelsinger"],
    themes: ["AI chip", "semiconductor", "data center"],
    defaultSentiment: "neutral",
  },

  // ─── Cloud / AI infrastructure ────────────────────────────────
  {
    ticker: "ORCL",
    name: "Oracle",
    keywords: ["Oracle", "OCI", "Oracle Cloud", "Larry Ellison"],
    themes: ["cloud AI", "AI infrastructure", "AI data center"],
    defaultSentiment: "bullish",
  },
  {
    ticker: "CRM",
    name: "Salesforce",
    keywords: ["Salesforce", "Einstein AI", "Agentforce", "Marc Benioff"],
    themes: ["AI enterprise", "AI agents", "CRM AI"],
    defaultSentiment: "bullish",
  },
  {
    ticker: "SNOW",
    name: "Snowflake",
    keywords: ["Snowflake", "Cortex AI"],
    themes: ["AI data", "data warehouse AI", "AI analytics"],
    defaultSentiment: "bullish",
  },
  {
    ticker: "DDOG",
    name: "Datadog",
    keywords: ["Datadog", "Bits AI"],
    themes: ["AI observability", "LLM monitoring"],
    defaultSentiment: "bullish",
  },

  // ─── AI-affected sectors (bearish on disruption) ──────────────
  {
    ticker: "CHGG",
    name: "Chegg",
    keywords: ["Chegg"],
    themes: ["AI education", "AI tutoring", "ChatGPT education"],
    defaultSentiment: "bearish",
  },
  {
    ticker: "UPWK",
    name: "Upwork",
    keywords: ["Upwork"],
    themes: ["AI workforce", "AI displacement", "AI jobs", "AI freelancing"],
    defaultSentiment: "bearish",
  },

  // ─── Data center / power ──────────────────────────────────────
  {
    ticker: "VRT",
    name: "Vertiv",
    keywords: ["Vertiv"],
    themes: ["data center", "liquid cooling", "power management", "AI infrastructure"],
    defaultSentiment: "bullish",
  },
  {
    ticker: "EQIX",
    name: "Equinix",
    keywords: ["Equinix"],
    themes: ["data center", "colocation", "AI infrastructure"],
    defaultSentiment: "bullish",
  },
  {
    ticker: "VST",
    name: "Vistra",
    keywords: ["Vistra"],
    themes: ["energy AI", "power consumption", "data center power", "nuclear AI"],
    defaultSentiment: "bullish",
  },
  {
    ticker: "CEG",
    name: "Constellation Energy",
    keywords: ["Constellation Energy"],
    themes: ["nuclear AI", "data center power", "energy AI"],
    defaultSentiment: "bullish",
  },
];

// ─── Theme-to-tickers quick lookup ──────────────────────────────
// For when content is about a theme rather than a specific company

export const THEME_TICKER_MAP: Record<string, { tickers: string[]; sentiment: "bullish" | "bearish" | "mixed" }> = {
  "AI chip export ban": {
    tickers: ["NVDA", "AMD", "AVGO", "ASML", "TSM"],
    sentiment: "bearish",
  },
  "AI capex increase": {
    tickers: ["NVDA", "AMD", "AVGO", "VRT", "EQIX", "VST", "CEG"],
    sentiment: "bullish",
  },
  "AI capex slowdown": {
    tickers: ["NVDA", "AMD", "AVGO", "VRT", "EQIX"],
    sentiment: "bearish",
  },
  "AI regulation": {
    tickers: ["MSFT", "GOOGL", "META", "NVDA", "PLTR"],
    sentiment: "mixed",
  },
  "AI bubble": {
    tickers: ["NVDA", "AI", "SOUN", "BBAI", "PLTR"],
    sentiment: "bearish",
  },
  "AI breakthrough": {
    tickers: ["NVDA", "MSFT", "GOOGL", "META", "AMZN"],
    sentiment: "bullish",
  },
  "AI job displacement": {
    tickers: ["UPWK", "CHGG"],
    sentiment: "bearish",
  },
  "open source AI": {
    tickers: ["META", "NVDA", "AMD"],
    sentiment: "bullish",
  },
  "AI healthcare": {
    tickers: ["ISRG", "VEEV", "RXRX"],
    sentiment: "bullish",
  },
  "autonomous driving": {
    tickers: ["TSLA", "GOOGL", "NVDA", "MBLY"],
    sentiment: "bullish",
  },
  "AI data center": {
    tickers: ["NVDA", "EQIX", "VRT", "VST", "CEG", "ORCL", "AMZN", "MSFT", "GOOGL"],
    sentiment: "bullish",
  },
};

// Build a fast keyword → ticker lookup
const _keywordToTickers = new Map<string, string[]>();
for (const mapping of TICKER_MAP) {
  for (const kw of [...mapping.keywords, ...mapping.themes]) {
    const lower = kw.toLowerCase();
    const existing = _keywordToTickers.get(lower) || [];
    if (!existing.includes(mapping.ticker)) {
      existing.push(mapping.ticker);
    }
    _keywordToTickers.set(lower, existing);
  }
}

export function findAffectedTickers(
  text: string,
  matchedKeywords: string[]
): Array<{ ticker: string; name: string; sentiment: "bullish" | "bearish" | "neutral" }> {
  const found = new Map<string, { name: string; sentiment: "bullish" | "bearish" | "neutral" }>();
  const lowerText = text.toLowerCase();

  // Check direct keyword matches
  for (const kw of matchedKeywords) {
    const tickers = _keywordToTickers.get(kw.toLowerCase());
    if (tickers) {
      for (const ticker of tickers) {
        const mapping = TICKER_MAP.find((m) => m.ticker === ticker);
        if (mapping && !found.has(ticker)) {
          found.set(ticker, {
            name: mapping.name,
            sentiment: mapping.defaultSentiment,
          });
        }
      }
    }
  }

  // Check for direct ticker mentions ($NVDA, NVDA)
  for (const mapping of TICKER_MAP) {
    if (found.has(mapping.ticker)) continue;
    const tickerPattern = new RegExp(
      `\\$${mapping.ticker}\\b|\\b${mapping.ticker}\\b`,
      "i"
    );
    if (tickerPattern.test(text)) {
      found.set(mapping.ticker, {
        name: mapping.name,
        sentiment: mapping.defaultSentiment,
      });
    }
  }

  // Check for company name mentions in text
  for (const mapping of TICKER_MAP) {
    if (found.has(mapping.ticker)) continue;
    for (const kw of mapping.keywords) {
      if (lowerText.includes(kw.toLowerCase())) {
        found.set(mapping.ticker, {
          name: mapping.name,
          sentiment: mapping.defaultSentiment,
        });
        break;
      }
    }
  }

  return Array.from(found.entries()).map(([ticker, data]) => ({
    ticker,
    ...data,
  }));
}
