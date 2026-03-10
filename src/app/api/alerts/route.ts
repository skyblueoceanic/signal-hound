import { NextResponse } from "next/server";
import { getRecentAlerts } from "@/lib/db/items";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

  try {
    const alerts = await getRecentAlerts(limit);

    return NextResponse.json({
      alerts: alerts.map((alert) => ({
        id: alert.id,
        type: alert.type,
        message: alert.message,
        score: alert.score,
        createdAt: alert.createdAt,
        read: alert.read,
        item: {
          id: alert.item.id,
          title: alert.item.title,
          url: alert.item.url,
          sourceType: alert.item.sourceType,
          score: alert.item.score,
        },
      })),
      count: alerts.length,
    });
  } catch (err) {
    console.error("Alerts API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}
