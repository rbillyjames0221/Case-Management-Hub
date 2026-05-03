import { Router } from "express";
import { db } from "@workspace/db";
import { casesTable } from "@workspace/db/schema";
import { and, eq, isNull } from "drizzle-orm";

const router = Router();

router.get("/search", async (req, res) => {
  try {
    const q = String(req.query.q ?? "").trim().toUpperCase();
    if (!q) {
      res.json(null);
      return;
    }

    const [result] = await db
      .select({
        caseNumber: casesTable.caseNumber,
        status: casesTable.status,
        updatedAt: casesTable.updatedAt,
      })
      .from(casesTable)
      .where(and(isNull(casesTable.deletedAt), eq(casesTable.caseNumber, q)))
      .limit(1);

    res.json(result ?? null);
  } catch (err) {
    req.log.error(err, "Public case search failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
