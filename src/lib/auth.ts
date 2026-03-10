import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./db/client";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "signal-hound-dev-secret-change-in-prod"
);
const COOKIE_NAME = "sh_session";

export async function createSession(userId: number): Promise<string> {
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  const session = await prisma.session.create({
    data: { userId, expiresAt },
  });

  const token = await new SignJWT({ sessionId: session.id, userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(JWT_SECRET);

  return token;
}

export function setSessionCookie(token: string) {
  // Returns the cookie options — caller must await cookies() first
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  };
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const sessionId = payload.sessionId as string;

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: { select: { id: true, email: true, name: true } } },
    });

    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    return session.user;
  } catch {
    return null;
  }
}

export async function deleteSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return;

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const sessionId = payload.sessionId as string;
    await prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
  } catch {
    // Token invalid, just clear cookie
  }
}
