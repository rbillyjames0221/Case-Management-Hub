import { Router } from "express";
import { db } from "@workspace/db";
import { messagesTable, usersTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import {
  requireAuth,
  loadDbUser,
  requireDbUser,
  loadAndAuthorizeCase,
} from "../lib/auth";

const router = Router();
router.use(requireAuth, loadDbUser, requireDbUser);

router.get(
  "/:caseId/messages",
  loadAndAuthorizeCase,
  async (req, res) => {
    const caseId = String(req.params.caseId);
    try {
      const messages = await db
        .select({
          message: messagesTable,
          sender: usersTable,
        })
        .from(messagesTable)
        .leftJoin(usersTable, eq(messagesTable.senderId, usersTable.id))
        .where(eq(messagesTable.caseId, caseId))
        .orderBy(messagesTable.createdAt);

      res.json(messages.map((r) => ({ ...r.message, sender: r.sender })));
    } catch (err) {
      req.log.error(err, "Failed to get messages");
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

router.post(
  "/:caseId/messages",
  loadAndAuthorizeCase,
  async (req, res) => {
    const caseId = String(req.params.caseId);
    try {
      const user = req.dbUser!;
      const { content } = req.body;

      if (!content?.trim()) {
        res.status(400).json({ error: "Message content is required" });
        return;
      }

      const [msg] = await db
        .insert(messagesTable)
        .values({
          caseId,
          senderId: user.id,
          content: content.trim(),
        })
        .returning();

      res.status(201).json(msg);
    } catch (err) {
      req.log.error(err, "Failed to send message");
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

export default router;
