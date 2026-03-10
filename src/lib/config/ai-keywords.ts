export const AI_KEYWORDS: Record<string, string[]> = {
  companies: [
    "OpenAI", "Anthropic", "Google DeepMind", "DeepMind", "Meta AI", "Mistral AI",
    "xAI", "Cohere", "Stability AI", "Midjourney", "Perplexity", "DeepSeek",
    "Inflection AI", "Adept", "Character AI", "Runway", "ElevenLabs",
    "Hugging Face", "HuggingFace", "Scale AI", "Databricks", "Palantir",
    "C3.ai", "SoundHound", "BigBear.ai", "Recursion", "Tempus AI",
    "Baidu AI", "Alibaba Qwen", "Tencent AI", "ByteDance", "SenseTime",
  ],
  models: [
    "GPT-4", "GPT-5", "GPT-4o", "ChatGPT", "Claude", "Gemini", "Llama",
    "Mistral", "DeepSeek", "Grok", "DALL-E", "Sora", "Stable Diffusion",
    "Copilot", "Gemma", "Phi-4", "Command R", "Flux", "Whisper", "Codex",
    "AlphaFold", "AlphaGo", "o1", "o3",
  ],
  coreTech: [
    "LLM", "large language model", "transformer", "neural network",
    "deep learning", "machine learning", "generative AI", "GenAI",
    "diffusion model", "foundation model", "multimodal", "vision model",
    "language model", "AI model", "AI system", "NLP",
    "natural language processing", "computer vision", "reinforcement learning",
    "text-to-image", "text-to-video", "text-to-speech", "speech-to-text",
  ],
  concepts: [
    "AGI", "artificial general intelligence", "ASI", "superintelligence",
    "AI safety", "AI alignment", "RLHF", "fine-tuning", "fine tuning",
    "RAG", "retrieval augmented generation", "AI agents", "agentic AI",
    "chain-of-thought", "reasoning model", "inference", "pre-training",
    "post-training", "synthetic data", "benchmark", "scaling laws",
    "context window", "embedding", "hallucination", "red teaming", "AI ethics",
  ],
  hardware: [
    "NVIDIA", "H100", "H200", "B200", "B100", "GB200", "A100", "GPU", "TPU",
    "AMD MI300", "Intel Gaudi", "AI chip", "AI accelerator", "data center",
    "hyperscaler", "AI infrastructure", "compute", "CUDA", "TSMC",
    "semiconductor", "AI server", "AI cluster",
  ],
  business: [
    "AI investment", "AI capex", "AI spending", "AI revenue", "AI bubble",
    "AI valuation", "AI startup", "AI funding", "AI IPO", "AI acquisition",
    "AI partnership", "inference cost", "training cost", "AI pricing",
    "AI monetization", "AI adoption",
  ],
  regulation: [
    "AI regulation", "AI Act", "AI executive order", "AI policy",
    "AI governance", "AI legislation", "AI ban", "AI moratorium",
    "AI oversight", "AI compliance", "AI liability", "AI copyright",
    "AI deepfake", "AI misinformation", "AI workforce", "AI jobs",
    "AI displacement", "AI automation",
  ],
  sectorAI: [
    "AI healthcare", "AI drug discovery", "AI finance", "AI trading",
    "AI autonomous driving", "self-driving", "AI robotics",
    "AI cybersecurity", "AI defense", "AI military", "AI education",
    "AI enterprise",
  ],
  sentiment: [
    "AI doom", "AI risk", "AI threat", "AI apocalypse", "AI takeover",
    "AI breakthrough", "AI revolution", "AI disruption", "AI singularity",
    "AI winter", "AI hype", "AI crash", "existential risk",
  ],
  // Geopolitical / War / Iran — market-moving events
  geopolitical: [
    "Iran", "Iran sanctions", "Iran war", "Iran nuclear", "Iran strike",
    "Iran oil", "IRGC", "Strait of Hormuz", "Middle East conflict",
    "Israel Iran", "Iran missile", "Iran drone",
    "tariff", "trade war", "sanctions", "embargo",
    "NATO", "Ukraine war", "Russia sanctions", "China Taiwan",
    "South China Sea", "OPEC", "oil embargo",
    "defense spending", "military", "missile strike", "airstrike",
    "ceasefire", "escalation", "de-escalation", "geopolitical risk",
  ],
  // Energy markets
  energy: [
    "oil price", "crude oil", "WTI", "Brent crude", "natural gas",
    "energy crisis", "energy prices", "OPEC+", "oil supply",
    "oil demand", "petroleum", "refinery", "LNG",
    "renewable energy", "solar energy", "wind energy", "nuclear energy",
    "energy transition", "clean energy", "green energy",
    "uranium", "lithium", "cobalt", "rare earth",
    "EV battery", "electric vehicle", "Tesla energy", "grid storage",
    "carbon capture", "hydrogen fuel", "energy storage",
    "power grid", "electricity prices", "utility",
  ],
};

// Flatten all keywords into a single array for matching
export const ALL_AI_KEYWORDS: string[] = Object.values(AI_KEYWORDS).flat();

// Build a regex pattern for efficient matching
// Sort by length descending so longer phrases match first
const sortedKeywords = [...ALL_AI_KEYWORDS].sort((a, b) => b.length - a.length);
const escapedKeywords = sortedKeywords.map((k) =>
  k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
);
export const AI_KEYWORD_REGEX = new RegExp(
  `\\b(${escapedKeywords.join("|")})\\b`,
  "i"
);

export function matchesAIKeywords(text: string): {
  matches: boolean;
  matchedTerms: string[];
} {
  const matchedTerms: string[] = [];
  const lowerText = text.toLowerCase();

  for (const keyword of ALL_AI_KEYWORDS) {
    if (lowerText.includes(keyword.toLowerCase())) {
      matchedTerms.push(keyword);
    }
  }

  return { matches: matchedTerms.length > 0, matchedTerms };
}
