import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db/client";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keywords = await prisma.userKeyword.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    keywords: keywords.map((k) => ({ id: k.id, keyword: k.keyword })),
  });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { keyword } = await req.json();
  if (!keyword || typeof keyword !== "string" || keyword.trim().length === 0) {
    return NextResponse.json(
      { error: "Keyword is required" },
      { status: 400 }
    );
  }

  const trimmed = keyword.trim().slice(0, 50);

  try {
    const created = await prisma.userKeyword.create({
      data: { userId: user.id, keyword: trimmed },
    });
    return NextResponse.json({ keyword: { id: created.id, keyword: created.keyword } });
  } catch {
    return NextResponse.json(
      { error: "Keyword already exists" },
      { status: 409 }
    );
  }
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  await prisma.userKeyword.deleteMany({
    where: { id: parseInt(id), userId: user.id },
  });

  return NextResponse.json({ ok: true });
}
