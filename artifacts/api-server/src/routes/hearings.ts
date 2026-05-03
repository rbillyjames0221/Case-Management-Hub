import { Router } from "express";
import { db } from "@workspace/db";
import {
  hearingsTable,
  casesTable,
  caseTimelineTable,
} from "@workspace/db/schema";
import { eq, gte, and, isNull } from "drizzle-orm";
import {
  requireAuth,
  loadDbUser,
  requireDbUser,
  requireRole,
  loadAndAuthorizeCase,
} from "../lib/auth";

const router = Router();
router.use(requireAuth, loadDbUser, requireDbUser);

router.get(
  "/:caseId/hearings",
  loadAndAuthorizeCase,
  async (req, res) => {
    const caseId = String(req.params.caseId);
    try {
      const hearings = await db
        .select()
        .from(hearingsTable)
        .where(
          and(
            eq(hearingsTable.caseId, caseId),
            isNull(hearingsTable.deletedAt),
          ),
        )
        .orderBy(hearingsTable.scheduledAt);

      res.json(hearings);
    } catch (err) {
      req.log.error(err, "Failed to get hearings");
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

router.post(
  "/:caseId/hearings",
  loadAndAuthorizeCase,
  requireRole("SUPER_ADMIN", "LEGAL_ADMIN", "LAWYER"),
  async (req, res) => {
    const caseId = String(req.params.caseId);
    try {
      const user = req.dbUser!;
      const {
        title,
        description,
        scheduledAt,
        location,
        isVirtual,
        meetingUrl,
      } = req.body;

      if (!title?.trim() || !scheduledAt) {
        res
          .status(400)
          .json({ error: "Title and scheduledAt are required" });
        return;
      }

      const [hearing] = await db
        .insert(hearingsTable)
        .values({
          caseId,
          title: title.trim(),
          description,
          scheduledAt: new Date(scheduledAt),
          location,
          isVirtual: isVirtual ?? false,
          meetingUrl,
          createdById: user.id,
        })
        .returning();

      await db.insert(caseTimelineTable).values({
        caseId,
        actorId: user.id,
        action: "HEARING_SCHEDULED",
        description: `Hearing "${title}" scheduled for ${new Date(scheduledAt).toLocaleDateString()}`,
      });

      res.status(201).json(hearing);
    } catch (err) {
      req.log.error(err, "Failed to schedule hearing");
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

router.get("/upcoming", async (req, res) => {
  try {
    const user = req.dbUser!;
    const limit = Number(req.query.limit ?? 10);
    const now = new Date();

    const baseConditions = [
      gte(hearingsTable.scheduledAt, now),
      isNull(hearingsTable.deletedAt),
    ];

    let hearings;
    if (user.role === "USER") {
      hearings = await db
        .select({ hearing: hearingsTable, case: casesTable })
        .from(hearingsTable)
        .innerJoin(casesTable, eq(hearingsTable.caseId, casesTable.id))
        .where(
          and(...baseConditions, eq(casesTable.complainantId, user.id)),
        )
        .orderBy(hearingsTable.scheduledAt)
        .limit(limit);
    } else if (user.role === "LAWYER") {
      hearings = await db
        .select({ hearing: hearingsTable, case: casesTable })
        .from(hearingsTable)
        .innerJoin(casesTable, eq(hearingsTable.caseId, casesTable.id))
        .where(
          and(...baseConditions, eq(casesTable.assignedLawyerId, user.id)),
        )
        .orderBy(hearingsTable.scheduledAt)
        .limit(limit);
    } else {
      hearings = await db
        .select({ hearing: hearingsTable, case: casesTable })
        .from(hearingsTable)
        .innerJoin(casesTable, eq(hearingsTable.caseId, casesTable.id))
        .where(and(...baseConditions))
        .orderBy(hearingsTable.scheduledAt)
        .limit(limit);
    }

    res.json(hearings.map((r) => ({ ...r.hearing, case: r.case })));
  } catch (err) {
    req.log.error(err, "Failed to get upcoming hearings");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
