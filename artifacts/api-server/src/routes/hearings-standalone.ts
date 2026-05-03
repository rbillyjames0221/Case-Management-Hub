import { Router } from "express";
import { db } from "@workspace/db";
import { hearingsTable, casesTable, caseTimelineTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth, loadDbUser, requireDbUser, requireRole } from "../lib/auth";

const router = Router();
router.use(requireAuth, loadDbUser, requireDbUser);

async function loadAndAuthorizeHearing(
  hearingId: string,
  userId: string,
  userRole: string,
): Promise<{ hearing: typeof hearingsTable.$inferSelect; case: typeof casesTable.$inferSelect } | { error: string; status: 403 | 404 }> {
  const [hearing] = await db
    .select()
    .from(hearingsTable)
    .where(eq(hearingsTable.id, hearingId))
    .limit(1);

  if (!hearing || hearing.deletedAt !== null) {
    return { error: "Hearing not found", status: 404 };
  }

  const [caseRow] = await db
    .select()
    .from(casesTable)
    .where(eq(casesTable.id, hearing.caseId))
    .limit(1);

  if (!caseRow) {
    return { error: "Hearing not found", status: 404 };
  }

  if (userRole === "LAWYER" && caseRow.assignedLawyerId !== userId) {
    return { error: "Forbidden: you are not assigned to this case", status: 403 };
  }

  return { hearing, case: caseRow };
}

router.patch(
  "/:id",
  requireRole("SUPER_ADMIN", "LEGAL_ADMIN", "LAWYER"),
  async (req, res) => {
    const id = String(req.params.id);
    const user = req.dbUser!;

    const result = await loadAndAuthorizeHearing(id, user.id, user.role);
    if ("error" in result) {
      res.status(result.status).json({ error: result.error });
      return;
    }

    try {
      const { title, description, scheduledAt, location, isVirtual, meetingUrl, status, notes } = req.body;

      const [updated] = await db
        .update(hearingsTable)
        .set({
          ...(title !== undefined ? { title } : {}),
          ...(description !== undefined ? { description } : {}),
          ...(scheduledAt !== undefined ? { scheduledAt: new Date(scheduledAt) } : {}),
          ...(location !== undefined ? { location } : {}),
          ...(isVirtual !== undefined ? { isVirtual } : {}),
          ...(meetingUrl !== undefined ? { meetingUrl } : {}),
          ...(status !== undefined ? { status } : {}),
          ...(notes !== undefined ? { notes } : {}),
          updatedAt: new Date(),
        })
        .where(eq(hearingsTable.id, id))
        .returning();

      res.json(updated);
    } catch (err) {
      req.log.error(err, "Failed to update hearing");
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

router.delete(
  "/:id",
  requireRole("SUPER_ADMIN", "LEGAL_ADMIN"),
  async (req, res) => {
    const id = String(req.params.id);
    const user = req.dbUser!;

    const result = await loadAndAuthorizeHearing(id, user.id, user.role);
    if ("error" in result) {
      res.status(result.status).json({ error: result.error });
      return;
    }

    try {
      await db
        .update(hearingsTable)
        .set({ deletedAt: new Date() })
        .where(eq(hearingsTable.id, id));

      await db.insert(caseTimelineTable).values({
        caseId: result.hearing.caseId,
        actorId: user.id,
        action: "NOTE_ADDED",
        description: `Hearing "${result.hearing.title}" was removed`,
      });

      res.status(204).end();
    } catch (err) {
      req.log.error(err, "Failed to delete hearing");
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

export default router;
