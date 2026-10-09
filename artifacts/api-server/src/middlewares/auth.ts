import type { NextFunction, Request, Response } from "express";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";

const FIREBASE_PROJECT_ID =
  process.env.FIREBASE_PROJECT_ID ?? "savestreetdogs-7aafe";
const FIREBASE_ISSUER = `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`;
const FIREBASE_KEYS = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
  ),
);

export type FirebaseUser = JWTPayload & {
  uid: string;
  email?: string;
  admin?: boolean;
  role?: string;
};

declare global {
  namespace Express {
    interface Request {
      firebaseUser?: FirebaseUser;
    }
  }
}

async function verifyFirebaseToken(req: Request): Promise<FirebaseUser | null> {
  const authorization = req.header("authorization");
  if (!authorization?.startsWith("Bearer ")) return null;

  const token = authorization.slice("Bearer ".length).trim();
  if (!token) return null;

  try {
    const verified = await jwtVerify(token, FIREBASE_KEYS, {
      algorithms: ["RS256"],
      audience: FIREBASE_PROJECT_ID,
      issuer: FIREBASE_ISSUER,
    });
    const uid = typeof verified.payload.user_id === "string"
      ? verified.payload.user_id
      : verified.payload.sub;
    if (!uid) return null;

    return {
      ...verified.payload,
      uid,
      email:
        typeof verified.payload.email === "string"
          ? verified.payload.email
          : undefined,
      admin:
        verified.payload.admin === true ||
        verified.payload.admin === "true",
      role:
        typeof verified.payload.role === "string"
          ? verified.payload.role
          : undefined,
    };
  } catch {
    return null;
  }
}

export async function requireUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const user = await verifyFirebaseToken(req);
  if (!user) {
    res.status(401).json({ error: "Sign in required" });
    return;
  }

  req.firebaseUser = user;
  next();
}

export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const user = await verifyFirebaseToken(req);
  if (!user) {
    res.status(401).json({ error: "Sign in required" });
    return;
  }

  const allowedAdminUids = (process.env.ADMIN_FIREBASE_UIDS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const isAdmin =
    user.admin === true ||
    user.role === "admin" ||
    allowedAdminUids.includes(user.uid);

  if (!isAdmin) {
    res.status(403).json({ error: "Admin authorization required" });
    return;
  }

  req.firebaseUser = user;
  next();
}