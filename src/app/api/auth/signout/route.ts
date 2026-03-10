import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth";

export async function POST() {
  await deleteSession();
  const res = NextResponse.json({ ok: true });
  res.cookies.set("sh_session", "", { maxAge: 0, path: "/" });
  return res;
}
