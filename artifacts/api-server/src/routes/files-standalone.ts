import { Router } from "express";
import path from "path";
import { db } from "@workspace/db";
import { caseFilesTable, casesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth, loadDbUser, requireDbUser } from "../lib/auth";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

const router = Router();
router.use(requireAuth, loadDbUser, requireDbUser);

router.get("/:id", async (req, res) => {
  const fileId = String(req.params.id);
  try {
    const user = req.dbUser!;
    const [file] = await db
      .select()
      .from(caseFilesTable)
      .where(eq(caseFilesTable.id, fileId))
      .limit(1);

    if (!file || file.deletedAt !== null) {
      res.status(404).json({ error: "File not found" });
      return;
    }

    const [caseRow] = await db
      .select()
      .from(casesTable)
      .where(eq(casesTable.id, file.caseId))
      .limit(1);

    if (caseRow) {
      if (user.role === "USER" && caseRow.complainantId !== user.id) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
      if (user.role === "LAWYER" && caseRow.assignedLawyerId !== user.id) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
    }

    res.download(file.storagePath, file.originalName);
  } catch (err) {
    req.log.error(err, "Failed to download file");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  const fileId = String(req.params.id);
  try {
    const user = req.dbUser!;
    const [file] = await db
      .select()
      .from(caseFilesTable)
      .where(eq(caseFilesTable.id, fileId))
      .limit(1);

    if (!file || file.deletedAt !== null) {
      res.status(404).json({ error: "File not found" });
      return;
    }

    if (
      user.role !== "SUPER_ADMIN" &&
      user.role !== "LEGAL_ADMIN" &&
      file.uploadedById !== user.id
    ) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    await db
      .update(caseFilesTable)
      .set({ deletedAt: new Date() })
      .where(eq(caseFilesTable.id, fileId));

    res.status(204).end();
  } catch (err) {
    req.log.error(err, "Failed to delete file");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
