import { NextResponse } from "next/server";
import { getDailySnapshot, getAvailableSnapshotDates } from "@/lib/db/items";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  try {
    if (date) {
      // Return snapshot for specific date
      const snapshot = await getDailySnapshot(date);
      if (!snapshot) {
        return NextResponse.json(
          { error: "No snapshot for this date" },
          { status: 404 }
        );
      }
      return NextResponse.json({
        date: snapshot.date,
        items: snapshot.items,
        itemCount: snapshot.itemCount,
      });
    }

    // Return list of available dates
    const dates = await getAvailableSnapshotDates();
    return NextResponse.json({ dates });
  } catch (err) {
    console.error("Snapshots API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch snapshots" },
      { status: 500 }
    );
  }
}
