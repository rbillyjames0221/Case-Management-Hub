import { Router } from "express";
import { db } from "@workspace/db";
import { auditLogsTable, usersTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAuth, loadDbUser, requireRole } from "../lib/auth";

const router = Router();
router.use(requireAuth, loadDbUser, requireRole("SUPER_ADMIN", "LEGAL_ADMIN"));

router.get("/", async (req, res) => {
  try {
    const { page = "1", limit = "50" } = req.query as Record<string, string>;
    const offset = (Number(page) - 1) * Number(limit);

    const logs = await db
      .select({
        log: auditLogsTable,
        actor: usersTable,
      })
      .from(auditLogsTable)
      .leftJoin(usersTable, eq(auditLogsTable.actorId, usersTable.id))
      .orderBy(desc(auditLogsTable.createdAt))
      .limit(Number(limit))
      .offset(offset);

    res.json({
      logs: logs.map((r) => ({ ...r.log, actor: r.actor })),
      page: Number(page),
      limit: Number(limit),
    });
  } catch (err) {
    req.log.error(err, "Failed to get audit logs");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
