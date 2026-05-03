import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { db } from "@workspace/db";
import { caseFilesTable, caseTimelineTable } from "@workspace/db/schema";
import { eq, isNull } from "drizzle-orm";
import {
  requireAuth,
  loadDbUser,
  requireDbUser,
  loadAndAuthorizeCase,
} from "../lib/auth";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("File type not allowed"));
    }
  },
});

const router = Router();
router.use(requireAuth, loadDbUser, requireDbUser);

router.get("/:caseId/files", loadAndAuthorizeCase, async (req, res) => {
  const caseId = String(req.params.caseId);
  try {
    const files = await db
      .select()
      .from(caseFilesTable)
      .where(eq(caseFilesTable.caseId, caseId))
      .orderBy(caseFilesTable.createdAt);
    res.json(files);
  } catch (err) {
    req.log.error(err, "Failed to list files");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post(
  "/:caseId/files",
  loadAndAuthorizeCase,
  upload.single("file"),
  async (req, res) => {
    const caseId = String(req.params.caseId);
    try {
      const user = req.dbUser!;
      const file = req.file;
      if (!file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }

      const { category, description } = req.body;
      const [dbFile] = await db
        .insert(caseFilesTable)
        .values({
          caseId,
          uploadedById: user.id,
          fileName: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          fileSize: file.size,
          storagePath: file.path,
          category: (category ??
            "OTHER") as typeof caseFilesTable.category._.data,
          description,
        })
        .returning();

      await db.insert(caseTimelineTable).values({
        caseId,
        actorId: user.id,
        action: "FILE_UPLOADED",
        description: `File "${file.originalname}" uploaded`,
      });

      res.status(201).json(dbFile);
    } catch (err) {
      req.log.error(err, "Failed to upload file");
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

router.get("/download/:fileId", async (req, res) => {
  const fileId = String(req.params.fileId);
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

    const [caseRow] = await db.query.casesTable.findMany({
      where: (c, { eq: eqFn }) => eqFn(c.id, file.caseId),
      limit: 1,
    });

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

router.delete("/files/:fileId", async (req, res) => {
  const fileId = String(req.params.fileId);
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
