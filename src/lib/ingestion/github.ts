import type { ContentItem } from "../types";
import { matchesAIKeywords } from "../config/ai-keywords";

const GITHUB_API = "https://api.github.com";

interface GitHubRepo {
  id: number;
  full_name: string;
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  topics: string[];
  owner: {
    login: string;
  };
}

interface GitHubSearchResponse {
  total_count: number;
  items: GitHubRepo[];
}

const AI_TOPICS = [
  "machine-learning",
  "deep-learning",
  "artificial-intelligence",
  "llm",
  "large-language-model",
  "generative-ai",
  "transformer",
  "neural-network",
  "gpt",
  "chatgpt",
  "langchain",
  "rag",
];

export async function fetchTrendingAIRepos(): Promise<ContentItem[]> {
  // Search for recently created/updated AI repos with significant stars
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const dateStr = oneWeekAgo.toISOString().split("T")[0];

  const queries = [
    `topic:machine-learning pushed:>${dateStr} stars:>50`,
    `topic:llm pushed:>${dateStr} stars:>50`,
    `topic:artificial-intelligence pushed:>${dateStr} stars:>50`,
    `topic:deep-learning pushed:>${dateStr} stars:>50`,
    `"AI" OR "LLM" OR "GPT" in:name,description created:>${dateStr} stars:>100`,
  ];

  const allItems: ContentItem[] = [];
  const seenIds = new Set<string>();

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "Trending/0.1.0",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  for (const query of queries) {
    try {
      const url = `${GITHUB_API}/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=30`;
      const res = await fetch(url, { headers });

      if (!res.ok) {
        console.error(`GitHub API error: ${res.status} ${res.statusText}`);
        // Respect rate limits
        if (res.status === 403 || res.status === 429) {
          console.error("GitHub rate limit hit, stopping queries");
          break;
        }
        continue;
      }

      const data: GitHubSearchResponse = await res.json();

      for (const repo of data.items) {
        const id = String(repo.id);
        if (seenIds.has(id)) continue;
        seenIds.add(id);

        const text = `${repo.full_name} ${repo.description || ""} ${repo.topics?.join(" ") || ""}`;
        const { matches, matchedTerms } = matchesAIKeywords(text);

        // GitHub topic search already filters for AI, but double-check
        const hasAITopic = repo.topics?.some((t) =>
          AI_TOPICS.includes(t)
        );

        if (!matches && !hasAITopic) continue;

        const keywords = matches
          ? matchedTerms
          : repo.topics?.filter((t) => AI_TOPICS.includes(t)) || [];

        allItems.push({
          sourceType: "github",
          externalId: id,
          title: repo.full_name,
          url: repo.html_url,
          author: repo.owner.login,
          description: repo.description,
          publishedAt: new Date(repo.pushed_at), // use last push, not creation date
          score: repo.stargazers_count,
          commentCount: repo.open_issues_count, // use issues as proxy for activity
          matchedKeywords: keywords,
          language: repo.language || undefined,
        });
      }

      // Small delay between queries to respect rate limits
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (err) {
      console.error(`GitHub fetch error for query "${query}":`, err);
    }
  }

  return allItems;
}
