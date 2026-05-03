import { Router } from "express";
import { db } from "@workspace/db";
import { notificationsTable } from "@workspace/db/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { requireAuth, loadDbUser, requireDbUser } from "../lib/auth";

const router = Router();
router.use(requireAuth, loadDbUser, requireDbUser);

router.get("/", async (req, res) => {
  try {
    const user = req.dbUser!;
    const limit = Number(req.query.limit ?? 20);

    const notifications = await db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.userId, user.id))
      .orderBy(desc(notificationsTable.createdAt))
      .limit(limit);

    const [{ unreadCount }] = await db
      .select({ unreadCount: count() })
      .from(notificationsTable)
      .where(and(eq(notificationsTable.userId, user.id), eq(notificationsTable.isRead, false)));

    res.json({ notifications, unreadCount: Number(unreadCount) });
  } catch (err) {
    req.log.error(err, "Failed to get notifications");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id/read", async (req, res) => {
  const id = String(req.params.id);
  const user = req.dbUser!;
  try {
    await db
      .update(notificationsTable)
      .set({ isRead: true })
      .where(and(eq(notificationsTable.id, id), eq(notificationsTable.userId, user.id)));
    res.status(204).end();
  } catch (err) {
    req.log.error(err, "Failed to mark notification as read");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/read-all", async (req, res) => {
  const user = req.dbUser!;
  try {
    await db
      .update(notificationsTable)
      .set({ isRead: true })
      .where(and(eq(notificationsTable.userId, user.id), eq(notificationsTable.isRead, false)));
    res.status(204).end();
  } catch (err) {
    req.log.error(err, "Failed to mark all notifications as read");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
