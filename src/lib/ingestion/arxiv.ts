import type { ContentItem } from "../types";
import { matchesAIKeywords } from "../config/ai-keywords";

const ARXIV_API = "https://export.arxiv.org/api/query";
const SEMANTIC_SCHOLAR_API = "https://api.semanticscholar.org/graph/v1";

// arXiv AI categories
const AI_CATEGORIES = ["cs.AI", "cs.CL", "cs.LG", "cs.CV", "cs.MA"];

interface SemanticScholarPaper {
  paperId: string;
  title: string;
  citationCount: number;
  influentialCitationCount: number;
  url: string;
}

// Fetch recent AI papers from arXiv
export async function fetchArxivPapers(): Promise<ContentItem[]> {
  const categoryQuery = AI_CATEGORIES.map((c) => `cat:${c}`).join("+OR+");
  const url = `${ARXIV_API}?search_query=${categoryQuery}&sortBy=submittedDate&sortOrder=descending&max_results=50`;

  const res = await fetch(url);
  if (!res.ok) {
    console.error(`arXiv API error: ${res.status}`);
    return [];
  }

  const xml = await res.text();
  const entries = parseArxivXml(xml);
  const items: ContentItem[] = [];

  for (const entry of entries) {
    const text = `${entry.title} ${entry.summary}`;
    const { matches, matchedTerms } = matchesAIKeywords(text);

    // All papers from AI categories are relevant, but note specific keyword matches
    const keywords = matches ? matchedTerms : ["AI-research"];

    items.push({
      sourceType: "arxiv",
      externalId: entry.id,
      title: entry.title.replace(/\s+/g, " ").trim(),
      url: entry.link,
      author: entry.authors.slice(0, 3).join(", ") +
        (entry.authors.length > 3 ? ` +${entry.authors.length - 3}` : ""),
      description: entry.summary.slice(0, 500),
      publishedAt: new Date(entry.published),
      score: 0, // Will be enriched by Semantic Scholar
      commentCount: 0,
      matchedKeywords: keywords,
      categories: entry.categories,
    });
  }

  return items;
}

// Enrich arXiv papers with Semantic Scholar citation data
export async function enrichWithSemanticScholar(
  items: ContentItem[]
): Promise<ContentItem[]> {
  const enriched: ContentItem[] = [];

  for (const item of items) {
    try {
      // Extract arXiv ID from the external ID
      const arxivId = item.externalId;
      const ssUrl = `${SEMANTIC_SCHOLAR_API}/paper/ARXIV:${arxivId}?fields=citationCount,influentialCitationCount,url`;

      const res = await fetch(ssUrl);

      if (res.ok) {
        const data: SemanticScholarPaper = await res.json();
        enriched.push({
          ...item,
          score: data.citationCount || 0,
          commentCount: data.influentialCitationCount || 0,
        });
      } else {
        enriched.push(item);
      }

      // Respect rate limits: 1 req/sec for unauthenticated
      await new Promise((resolve) => setTimeout(resolve, 1100));
    } catch {
      enriched.push(item);
    }
  }

  return enriched;
}

// Fetch trending papers from Semantic Scholar directly
export async function fetchTrendingAIPapers(): Promise<ContentItem[]> {
  const queries = [
    "large language model",
    "artificial intelligence",
    "deep learning transformer",
    "generative AI",
  ];

  const items: ContentItem[] = [];
  const seenIds = new Set<string>();

  for (const query of queries) {
    try {
      const url = `${SEMANTIC_SCHOLAR_API}/paper/search?query=${encodeURIComponent(query)}&fields=title,url,authors,abstract,citationCount,influentialCitationCount,publicationDate,externalIds&limit=20&sort=citationCount:desc&year=2024-2026`;

      const res = await fetch(url);
      if (!res.ok) continue;

      const data = await res.json();
      if (!data.data) continue;

      for (const paper of data.data) {
        const arxivId = paper.externalIds?.ArXiv;
        const id = arxivId || paper.paperId;
        if (seenIds.has(id)) continue;
        seenIds.add(id);

        const text = `${paper.title || ""} ${paper.abstract || ""}`;
        const { matches, matchedTerms } = matchesAIKeywords(text);
        const keywords = matches ? matchedTerms : ["AI-research"];

        items.push({
          sourceType: "arxiv",
          externalId: id,
          title: paper.title || "Untitled",
          url: paper.url || `https://www.semanticscholar.org/paper/${paper.paperId}`,
          author: paper.authors
            ?.slice(0, 3)
            .map((a: { name: string }) => a.name)
            .join(", ") || null,
          description: paper.abstract?.slice(0, 500) || null,
          publishedAt: paper.publicationDate
            ? new Date(paper.publicationDate)
            : new Date(),
          score: paper.citationCount || 0,
          commentCount: paper.influentialCitationCount || 0,
          matchedKeywords: keywords,
          categories: ["Semantic Scholar"],
        });
      }

      // Rate limit
      await new Promise((resolve) => setTimeout(resolve, 1100));
    } catch (err) {
      console.error(`Semantic Scholar search error for "${query}":`, err);
    }
  }

  return items;
}

// Simple XML parser for arXiv Atom feed
function parseArxivXml(xml: string): Array<{
  id: string;
  title: string;
  summary: string;
  link: string;
  published: string;
  authors: string[];
  categories: string[];
}> {
  const entries: Array<{
    id: string;
    title: string;
    summary: string;
    link: string;
    published: string;
    authors: string[];
    categories: string[];
  }> = [];

  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;

  while ((match = entryRegex.exec(xml)) !== null) {
    const entry = match[1];

    const id = extractTag(entry, "id")
      .replace("http://arxiv.org/abs/", "")
      .replace(/v\d+$/, "");
    const title = extractTag(entry, "title");
    const summary = extractTag(entry, "summary");
    const published = extractTag(entry, "published");

    // Get the abstract page link
    const linkMatch = entry.match(
      /<link[^>]*rel="alternate"[^>]*href="([^"]*)"[^>]*\/>/
    );
    const link = linkMatch
      ? linkMatch[1]
      : `https://arxiv.org/abs/${id}`;

    // Extract authors
    const authors: string[] = [];
    const authorRegex = /<author>\s*<name>([^<]*)<\/name>/g;
    let authorMatch;
    while ((authorMatch = authorRegex.exec(entry)) !== null) {
      authors.push(authorMatch[1].trim());
    }

    // Extract categories
    const categories: string[] = [];
    const catRegex = /<category[^>]*term="([^"]*)"[^>]*\/>/g;
    let catMatch;
    while ((catMatch = catRegex.exec(entry)) !== null) {
      categories.push(catMatch[1]);
    }

    entries.push({ id, title, summary, link, published, authors, categories });
  }

  return entries;
}

function extractTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  return match ? match[1].trim() : "";
}
