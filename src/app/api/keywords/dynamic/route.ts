import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || undefined;

  try {
    const keywords = await prisma.dynamicKeyword.findMany({
      where: status ? { status } : undefined,
      orderBy: [{ status: "asc" }, { hitCount: "desc" }],
      take: 100,
    });

    return NextResponse.json({
      keywords: keywords.map((k) => ({
        id: k.id,
        keyword: k.keyword,
        status: k.status,
        score: k.score,
        hitCount: k.hitCount,
        missCount: k.missCount,
        firstSeenAt: k.firstSeenAt,
        lastSeenAt: k.lastSeenAt,
      })),
      counts: {
        candidate: keywords.filter((k) => k.status === "candidate").length,
        active: keywords.filter((k) => k.status === "active").length,
        retired: keywords.filter((k) => k.status === "retired").length,
      },
    });
  } catch (err) {
    console.error("Dynamic keywords API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch dynamic keywords" },
      { status: 500 }
    );
  }
}
