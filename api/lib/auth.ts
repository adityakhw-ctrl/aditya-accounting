import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const JWT_SECRET_KEY = process.env.JWT_SECRET || "fallback-secret-key";

function getSecretKey() {
  return new TextEncoder().encode(JWT_SECRET_KEY);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createToken(payload: {
  userId: number;
  email: string;
  role: string;
}): Promise<string> {
  return new SignJWT({
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey());
}

export async function verifyToken(token: string): Promise<{
  userId: number;
  email: string;
  role: string;
} | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      clockTolerance: 60,
    });
    return {
      userId: payload.userId as number,
      email: payload.email as string,
      role: payload.role as string,
    };
  } catch {
    return null;
  }
}

export function getAuthTokenFromRequest(req: Request): string | null {
  // Check Authorization header first
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  // Check cookie
  const cookie = req.headers.get("cookie");
  if (cookie) {
    const match = cookie.match(/auth_token=([^;]+)/);
    if (match) return match[1];
  }

  return null;
}
