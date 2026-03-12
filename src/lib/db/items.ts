import { prisma } from "./client";
import type { ContentItem } from "../types";

export async function upsertItem(item: ContentItem) {
  return prisma.item.upsert({
    where: {
      sourceType_externalId: {
        sourceType: item.sourceType,
        externalId: item.externalId,
      },
    },
    update: {
      score: item.score,
      commentCount: item.commentCount,
      title: item.title,
      matchedKeywords: item.matchedKeywords,
    },
    create: {
      sourceType: item.sourceType,
      externalId: item.externalId,
      title: item.title,
      url: item.url,
      author: item.author,
      description: item.description,
      publishedAt: item.publishedAt,
      score: item.score,
      commentCount: item.commentCount,
      matchedKeywords: item.matchedKeywords,
      metadata: item.subreddit
        ? { subreddit: item.subreddit }
        : item.language
          ? { language: item.language }
          : item.categories
            ? { categories: item.categories }
            : undefined,
    },
  });
}

export async function recordSnapshot(
  itemId: number,
  score: number,
  commentCount: number
) {
  return prisma.engagementSnapshot.create({
    data: { itemId, score, commentCount },
  });
}

export async function getRecentSnapshots(itemId: number, limit = 10) {
  return prisma.engagementSnapshot.findMany({
    where: { itemId },
    orderBy: { recordedAt: "desc" },
    take: limit,
  });
}

export async function getTrendingItems(limit = 50, ticker?: string) {
  return prisma.item.findMany({
    where: {
      isRelevant: true,
      ...(ticker
        ? { tickerImpacts: { some: { ticker } } }
        : {}),
    },
    orderBy: [{ viralityScore: "desc" }, { lastUpdatedAt: "desc" }],
    take: limit,
    include: {
      snapshots: {
        orderBy: { recordedAt: "desc" },
        take: 20,
      },
      tickerImpacts: true,
    },
  });
}

export async function getViralItems(limit = 20, ticker?: string) {
  return prisma.item.findMany({
    where: {
      isViral: true,
      isRelevant: true,
      ...(ticker
        ? { tickerImpacts: { some: { ticker } } }
        : {}),
    },
    orderBy: { viralityScore: "desc" },
    take: limit,
    include: {
      snapshots: {
        orderBy: { recordedAt: "desc" },
        take: 20,
      },
      tickerImpacts: true,
    },
  });
}

export async function updateViralityScore(
  itemId: number,
  data: {
    viralityScore: number;
    isViral: boolean;
    velocity: number;
    acceleration: number;
  }
) {
  return prisma.item.update({
    where: { id: itemId },
    data,
  });
}

export async function createAlert(
  itemId: number,
  type: string,
  message: string,
  score: number
) {
  return prisma.alert.create({
    data: { itemId, type, message, score },
  });
}

export async function getRecentAlerts(limit = 20) {
  return prisma.alert.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { item: true },
  });
}

export async function upsertTickerImpact(
  itemId: number,
  ticker: string,
  name: string,
  sentiment: string,
  confidence: number = 0.5,
  source: string = "keyword"
) {
  return prisma.tickerImpact.upsert({
    where: { itemId_ticker: { itemId, ticker } },
    update: { sentiment, confidence, source },
    create: { itemId, ticker, name, sentiment, confidence, source },
  });
}

export async function getTickerSummary() {
  const impacts = await prisma.tickerImpact.groupBy({
    by: ["ticker"],
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 30,
  });

  return impacts.map((i) => ({
    ticker: i.ticker,
    mentionCount: i._count.id,
  }));
}

export async function getItemsByTicker(ticker: string, limit = 50) {
  return prisma.item.findMany({
    where: {
      isRelevant: true,
      tickerImpacts: { some: { ticker } },
    },
    orderBy: { viralityScore: "desc" },
    take: limit,
    include: {
      snapshots: {
        orderBy: { recordedAt: "desc" },
        take: 20,
      },
      tickerImpacts: {
        where: { ticker },
      },
    },
  });
}
