import { Router } from "express";
import { db } from "@workspace/db";
import {
  casesTable,
  usersTable,
  hearingsTable,
  caseTimelineTable,
} from "@workspace/db/schema";
import { eq, count, desc, gte, and, isNull } from "drizzle-orm";
import { requireAuth, loadDbUser, requireDbUser } from "../lib/auth";

const router = Router();
router.use(requireAuth, loadDbUser, requireDbUser);

router.get("/stats", async (req, res) => {
  try {
    const user = req.dbUser!;
    const notDeleted = isNull(casesTable.deletedAt);

    if (user.role === "USER") {
      const [total] = await db
        .select({ count: count() })
        .from(casesTable)
        .where(and(notDeleted, eq(casesTable.complainantId, user.id)));

      const [filed] = await db
        .select({ count: count() })
        .from(casesTable)
        .where(
          and(
            notDeleted,
            eq(casesTable.complainantId, user.id),
            eq(casesTable.status, "FILED"),
          ),
        );

      const [underReview] = await db
        .select({ count: count() })
        .from(casesTable)
        .where(
          and(
            notDeleted,
            eq(casesTable.complainantId, user.id),
            eq(casesTable.status, "UNDER_REVIEW"),
          ),
        );

      const [resolved] = await db
        .select({ count: count() })
        .from(casesTable)
        .where(
          and(
            notDeleted,
            eq(casesTable.complainantId, user.id),
            eq(casesTable.status, "RESOLVED"),
          ),
        );

      res.json({
        totalCases: Number(total.count),
        filedCases: Number(filed.count),
        underReviewCases: Number(underReview.count),
        resolvedCases: Number(resolved.count),
      });
      return;
    }

    if (user.role === "LAWYER") {
      const [total] = await db
        .select({ count: count() })
        .from(casesTable)
        .where(and(notDeleted, eq(casesTable.assignedLawyerId, user.id)));

      const [active] = await db
        .select({ count: count() })
        .from(casesTable)
        .where(
          and(
            notDeleted,
            eq(casesTable.assignedLawyerId, user.id),
            eq(casesTable.status, "INVESTIGATION"),
          ),
        );

      const [scheduled] = await db
        .select({ count: count() })
        .from(casesTable)
        .where(
          and(
            notDeleted,
            eq(casesTable.assignedLawyerId, user.id),
            eq(casesTable.status, "HEARING_SCHEDULED"),
          ),
        );

      const [resolved] = await db
        .select({ count: count() })
        .from(casesTable)
        .where(
          and(
            notDeleted,
            eq(casesTable.assignedLawyerId, user.id),
            eq(casesTable.status, "RESOLVED"),
          ),
        );

      res.json({
        totalCases: Number(total.count),
        activeCases: Number(active.count),
        scheduledCases: Number(scheduled.count),
        resolvedCases: Number(resolved.count),
      });
      return;
    }

    const [totalCases] = await db
      .select({ count: count() })
      .from(casesTable)
      .where(notDeleted);
    const [filedCases] = await db
      .select({ count: count() })
      .from(casesTable)
      .where(and(notDeleted, eq(casesTable.status, "FILED")));
    const [activeCases] = await db
      .select({ count: count() })
      .from(casesTable)
      .where(and(notDeleted, eq(casesTable.status, "UNDER_REVIEW")));
    const [resolvedCases] = await db
      .select({ count: count() })
      .from(casesTable)
      .where(and(notDeleted, eq(casesTable.status, "RESOLVED")));
    const [totalUsers] = await db
      .select({ count: count() })
      .from(usersTable)
      .where(eq(usersTable.isActive, true));
    const [totalLawyers] = await db
      .select({ count: count() })
      .from(usersTable)
      .where(and(eq(usersTable.role, "LAWYER"), eq(usersTable.isActive, true)));

    res.json({
      totalCases: Number(totalCases.count),
      filedCases: Number(filedCases.count),
      activeCases: Number(activeCases.count),
      resolvedCases: Number(resolvedCases.count),
      totalUsers: Number(totalUsers.count),
      totalLawyers: Number(totalLawyers.count),
    });
  } catch (err) {
    req.log.error(err, "Failed to get stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/recent-activity", async (req, res) => {
  try {
    const user = req.dbUser!;
    const limit = Number(req.query.limit ?? 10);

    let activity;
    if (user.role === "USER") {
      activity = await db
        .select()
        .from(caseTimelineTable)
        .innerJoin(casesTable, eq(caseTimelineTable.caseId, casesTable.id))
        .where(eq(casesTable.complainantId, user.id))
        .orderBy(desc(caseTimelineTable.createdAt))
        .limit(limit);
    } else if (user.role === "LAWYER") {
      activity = await db
        .select()
        .from(caseTimelineTable)
        .innerJoin(casesTable, eq(caseTimelineTable.caseId, casesTable.id))
        .where(eq(casesTable.assignedLawyerId, user.id))
        .orderBy(desc(caseTimelineTable.createdAt))
        .limit(limit);
    } else {
      activity = await db
        .select()
        .from(caseTimelineTable)
        .orderBy(desc(caseTimelineTable.createdAt))
        .limit(limit);
    }

    res.json(activity);
  } catch (err) {
    req.log.error(err, "Failed to get activity");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/my-cases", async (req, res) => {
  try {
    const user = req.dbUser!;
    const limit = Number(req.query.limit ?? 5);
    const notDeleted = isNull(casesTable.deletedAt);

    let cases;
    if (user.role === "USER") {
      cases = await db
        .select()
        .from(casesTable)
        .where(and(notDeleted, eq(casesTable.complainantId, user.id)))
        .orderBy(desc(casesTable.updatedAt))
        .limit(limit);
    } else if (user.role === "LAWYER") {
      cases = await db
        .select()
        .from(casesTable)
        .where(and(notDeleted, eq(casesTable.assignedLawyerId, user.id)))
        .orderBy(desc(casesTable.updatedAt))
        .limit(limit);
    } else {
      cases = await db
        .select()
        .from(casesTable)
        .where(notDeleted)
        .orderBy(desc(casesTable.updatedAt))
        .limit(limit);
    }

    res.json(cases);
  } catch (err) {
    req.log.error(err, "Failed to get my cases");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/upcoming-hearings", async (req, res) => {
  try {
    const user = req.dbUser!;
    const limit = Number(req.query.limit ?? 5);
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
        .where(and(...baseConditions, eq(casesTable.complainantId, user.id)))
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
