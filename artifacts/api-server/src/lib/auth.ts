import { getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";
import { db } from "@workspace/db";
import { usersTable, casesTable } from "@workspace/db/schema";
import { eq, isNull } from "drizzle-orm";

export type UserRole =
  | "SUPER_ADMIN"
  | "LEGAL_ADMIN"
  | "LAWYER"
  | "STAFF"
  | "USER";

declare global {
  namespace Express {
    interface Request {
      dbUser?: typeof usersTable.$inferSelect;
      dbCase?: typeof casesTable.$inferSelect;
    }
  }
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

export async function loadDbUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { userId } = getAuth(req);
  if (!userId) {
    next();
    return;
  }
  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerkId, userId))
      .limit(1);
    req.dbUser = user;
  } catch {
    // user not synced yet — ok
  }
  next();
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.dbUser;
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (!roles.includes(user.role as UserRole)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  };
}

/**
 * Loads the case from :id param and enforces row-level access:
 *   - USER:   must be complainant
 *   - LAWYER: must be assigned lawyer
 *   - SUPER_ADMIN / LEGAL_ADMIN / STAFF: full access
 */
export async function loadAndAuthorizeCase(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const user = req.dbUser;
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const caseId = String(req.params.id ?? req.params.caseId ?? "");
  if (!caseId) {
    res.status(400).json({ error: "Missing case id" });
    return;
  }

  try {
    const [caseRow] = await db
      .select()
      .from(casesTable)
      .where(eq(casesTable.id, caseId))
      .limit(1);

    if (!caseRow || caseRow.deletedAt !== null) {
      res.status(404).json({ error: "Case not found" });
      return;
    }

    if (user.role === "USER" && caseRow.complainantId !== user.id) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    if (user.role === "LAWYER" && caseRow.assignedLawyerId !== user.id) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    req.dbCase = caseRow;
    next();
  } catch (err) {
    next(err);
  }
}

export async function requireDbUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!req.dbUser) {
    res.status(401).json({ error: "Unauthorized — user not synced" });
    return;
  }
  next();
}
