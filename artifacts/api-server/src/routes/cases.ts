import { Router } from "express";
import { db } from "@workspace/db";
import {
  casesTable,
  usersTable,
  caseNotesTable,
  caseTimelineTable,
  auditLogsTable,
} from "@workspace/db/schema";
import { eq, desc, ilike, and, or, count, isNull } from "drizzle-orm";
import {
  requireAuth,
  loadDbUser,
  requireRole,
  loadAndAuthorizeCase,
  requireDbUser,
} from "../lib/auth";

const router = Router();
router.use(requireAuth, loadDbUser, requireDbUser);

function generateCaseNumber() {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 90000) + 10000;
  return `CSC-${year}-${rand}`;
}

router.get("/", async (req, res) => {
  try {
    const {
      status,
      search,
      page = "1",
      limit = "20",
      lawyerId,
    } = req.query as Record<string, string>;
    const offset = (Number(page) - 1) * Number(limit);
    const user = req.dbUser!;

    const conditions: ReturnType<typeof eq>[] = [
      isNull(casesTable.deletedAt) as ReturnType<typeof eq>,
    ];

    if (user.role === "USER") {
      conditions.push(eq(casesTable.complainantId, user.id));
    } else if (user.role === "LAWYER") {
      conditions.push(eq(casesTable.assignedLawyerId, user.id));
    }

    if (status) {
      conditions.push(
        eq(
          casesTable.status,
          status as typeof casesTable.status._.data,
        ),
      );
    }
    if (
      lawyerId &&
      (user.role === "SUPER_ADMIN" || user.role === "LEGAL_ADMIN")
    ) {
      conditions.push(eq(casesTable.assignedLawyerId, lawyerId));
    }
    if (search) {
      conditions.push(
        or(
          ilike(casesTable.title, `%${search}%`),
          ilike(casesTable.caseNumber, `%${search}%`),
        ) as ReturnType<typeof eq>,
      );
    }

    const whereClause = and(...conditions);

    const cases = await db
      .select({
        case: casesTable,
        complainant: usersTable,
      })
      .from(casesTable)
      .leftJoin(usersTable, eq(casesTable.complainantId, usersTable.id))
      .where(whereClause)
      .orderBy(desc(casesTable.createdAt))
      .limit(Number(limit))
      .offset(offset);

    const [{ total }] = await db
      .select({ total: count() })
      .from(casesTable)
      .where(whereClause);

    res.json({
      cases: cases.map((r) => ({ ...r.case, complainant: r.complainant })),
      total: Number(total),
      page: Number(page),
      limit: Number(limit),
    });
  } catch (err) {
    req.log.error(err, "Failed to list cases");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post(
  "/",
  requireRole("SUPER_ADMIN", "LEGAL_ADMIN", "STAFF", "USER"),
  async (req, res) => {
    try {
      const user = req.dbUser!;
      const { title, description, category, priority, dueDate, complainantId } =
        req.body;

      if (!title?.trim()) {
        res.status(400).json({ error: "Title is required" });
        return;
      }

      const caseNumber = generateCaseNumber();
      const [newCase] = await db
        .insert(casesTable)
        .values({
          caseNumber,
          title: title.trim(),
          description,
          category,
          priority: priority ?? "NORMAL",
          status: "FILED",
          complainantId:
            user.role === "USER"
              ? user.id
              : (complainantId ?? user.id),
          createdById: user.id,
          dueDate: dueDate ? new Date(dueDate) : undefined,
        })
        .returning();

      await db.insert(caseTimelineTable).values({
        caseId: newCase.id,
        actorId: user.id,
        action: "CASE_FILED",
        description: `Case ${caseNumber} was filed`,
      });

      await db.insert(auditLogsTable).values({
        actorId: user.id,
        action: "CREATE",
        resource: "case",
        resourceId: newCase.id,
        details: { caseNumber, title },
        ipAddress: req.ip,
      });

      res.status(201).json(newCase);
    } catch (err) {
      req.log.error(err, "Failed to create case");
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

router.get("/:id", loadAndAuthorizeCase, async (req, res) => {
  const id = String(req.params.id);
  try {
    const caseRow = req.dbCase!;

    let assignedLawyer = null;
    if (caseRow.assignedLawyerId) {
      const [lawyer] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, caseRow.assignedLawyerId))
        .limit(1);
      assignedLawyer = lawyer;
    }

    let complainant = null;
    if (caseRow.complainantId) {
      const [c] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, caseRow.complainantId))
        .limit(1);
      complainant = c;
    }

    res.json({ ...caseRow, complainant, assignedLawyer });
  } catch (err) {
    req.log.error(err, "Failed to get case");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch(
  "/:id",
  loadAndAuthorizeCase,
  requireRole("SUPER_ADMIN", "LEGAL_ADMIN", "LAWYER"),
  async (req, res) => {
    const id = String(req.params.id);
    try {
      const { title, description, category, priority, dueDate, resolution } =
        req.body;
      const [updated] = await db
        .update(casesTable)
        .set({
          ...(title !== undefined ? { title } : {}),
          ...(description !== undefined ? { description } : {}),
          ...(category !== undefined ? { category } : {}),
          ...(priority !== undefined ? { priority } : {}),
          ...(dueDate !== undefined
            ? { dueDate: dueDate ? new Date(dueDate) : null }
            : {}),
          ...(resolution !== undefined ? { resolution } : {}),
          updatedAt: new Date(),
        })
        .where(eq(casesTable.id, id))
        .returning();
      if (!updated) {
        res.status(404).json({ error: "Case not found" });
        return;
      }
      res.json(updated);
    } catch (err) {
      req.log.error(err, "Failed to update case");
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

router.delete(
  "/:id",
  loadAndAuthorizeCase,
  requireRole("SUPER_ADMIN"),
  async (req, res) => {
    const id = String(req.params.id);
    try {
      await db
        .update(casesTable)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(eq(casesTable.id, id));

      await db.insert(auditLogsTable).values({
        actorId: req.dbUser!.id,
        action: "DELETE",
        resource: "case",
        resourceId: id,
        ipAddress: req.ip,
      });

      res.status(204).end();
    } catch (err) {
      req.log.error(err, "Failed to delete case");
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

router.patch(
  "/:id/status",
  loadAndAuthorizeCase,
  requireRole("SUPER_ADMIN", "LEGAL_ADMIN", "LAWYER"),
  async (req, res) => {
    const id = String(req.params.id);
    try {
      const user = req.dbUser!;
      const { status, reason } = req.body;

      const validStatuses = [
        "FILED",
        "UNDER_REVIEW",
        "INVESTIGATION",
        "HEARING_SCHEDULED",
        "RESOLVED",
        "ARCHIVED",
      ];
      if (!validStatuses.includes(status)) {
        res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
        return;
      }

      const closedAt =
        status === "RESOLVED" || status === "ARCHIVED" ? new Date() : undefined;

      const [updated] = await db
        .update(casesTable)
        .set({ status, closedAt, updatedAt: new Date() })
        .where(eq(casesTable.id, id))
        .returning();

      if (!updated) {
        res.status(404).json({ error: "Case not found" });
        return;
      }

      await db.insert(caseTimelineTable).values({
        caseId: id,
        actorId: user.id,
        action: "STATUS_CHANGED",
        description: `Status changed to ${status}${reason ? `: ${reason}` : ""}`,
        metadata: { previousStatus: req.dbCase!.status, newStatus: status },
      });

      await db.insert(auditLogsTable).values({
        actorId: user.id,
        action: "UPDATE_STATUS",
        resource: "case",
        resourceId: id,
        details: { status, reason },
        ipAddress: req.ip,
      });

      res.json(updated);
    } catch (err) {
      req.log.error(err, "Failed to update case status");
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

router.patch(
  "/:id/assign-lawyer",
  loadAndAuthorizeCase,
  requireRole("SUPER_ADMIN", "LEGAL_ADMIN"),
  async (req, res) => {
    const id = String(req.params.id);
    try {
      const user = req.dbUser!;
      const { lawyerId } = req.body;

      const [updated] = await db
        .update(casesTable)
        .set({ assignedLawyerId: lawyerId ?? null, updatedAt: new Date() })
        .where(eq(casesTable.id, id))
        .returning();

      if (!updated) {
        res.status(404).json({ error: "Case not found" });
        return;
      }

      await db.insert(caseTimelineTable).values({
        caseId: id,
        actorId: user.id,
        action: "LAWYER_ASSIGNED",
        description: lawyerId
          ? `Case assigned to lawyer`
          : "Lawyer unassigned from case",
      });

      res.json(updated);
    } catch (err) {
      req.log.error(err, "Failed to assign lawyer");
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

router.get("/:id/notes", loadAndAuthorizeCase, async (req, res) => {
  const id = String(req.params.id);
  try {
    const user = req.dbUser!;

    const conditions: ReturnType<typeof eq>[] = [
      eq(caseNotesTable.caseId, id),
      isNull(caseNotesTable.deletedAt) as ReturnType<typeof eq>,
    ];

    if (user.role === "USER") {
      conditions.push(eq(caseNotesTable.isInternal, false));
    }

    const notes = await db
      .select()
      .from(caseNotesTable)
      .where(and(...conditions))
      .orderBy(desc(caseNotesTable.createdAt));

    res.json(notes);
  } catch (err) {
    req.log.error(err, "Failed to get notes");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:id/notes", loadAndAuthorizeCase, async (req, res) => {
  const id = String(req.params.id);
  try {
    const user = req.dbUser!;
    const { content, isInternal } = req.body;

    if (!content?.trim()) {
      res.status(400).json({ error: "Note content is required" });
      return;
    }

    const [note] = await db
      .insert(caseNotesTable)
      .values({
        caseId: id,
        authorId: user.id,
        content: content.trim(),
        isInternal: isInternal && user.role !== "USER" ? true : false,
      })
      .returning();

    res.status(201).json(note);
  } catch (err) {
    req.log.error(err, "Failed to add note");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id/timeline", loadAndAuthorizeCase, async (req, res) => {
  const id = String(req.params.id);
  try {
    const timeline = await db
      .select()
      .from(caseTimelineTable)
      .where(eq(caseTimelineTable.caseId, id))
      .orderBy(desc(caseTimelineTable.createdAt));

    res.json(timeline);
  } catch (err) {
    req.log.error(err, "Failed to get timeline");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
