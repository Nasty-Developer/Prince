import type { NextFunction, Request, Response } from "express";
import { getAuth } from "@clerk/express";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function requireUser(req: Request, res: Response, next: NextFunction): void {
  const userId = getAuth(req).userId;
  if (!userId) {
    res.status(401).json({ error: "Sign in required" });
    return;
  }
  req.userId = userId;
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const userId = getAuth(req).userId;
  if (!userId) {
    res.status(401).json({ error: "Sign in required" });
    return;
  }

  const allowedAdminIds = (process.env.ADMIN_CLERK_USER_IDS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (!allowedAdminIds.includes(userId)) {
    res.status(403).json({ error: "Admin authorization required" });
    return;
  }

  req.userId = userId;
  next();
}