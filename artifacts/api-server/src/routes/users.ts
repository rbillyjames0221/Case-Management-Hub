import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq, ilike, or, desc } from "drizzle-orm";
import { requireAuth, loadDbUser, requireRole } from "../lib/auth";

const router = Router();
router.use(requireAuth, loadDbUser);

router.get("/", requireRole("SUPER_ADMIN", "LEGAL_ADMIN"), async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query as Record<string, string>;
    const offset = (Number(page) - 1) * Number(limit);

    let query = db.select().from(usersTable).$dynamic();

    if (role) {
      query = query.where(eq(usersTable.role, role as "SUPER_ADMIN" | "LEGAL_ADMIN" | "LAWYER" | "STAFF" | "USER"));
    }

    if (search) {
      query = query.where(
        or(
          ilike(usersTable.firstName, `%${search}%`),
          ilike(usersTable.lastName, `%${search}%`),
          ilike(usersTable.email, `%${search}%`),
        ),
      );
    }

    const users = await query
      .orderBy(desc(usersTable.createdAt))
      .limit(Number(limit))
      .offset(offset);

    res.json({ users, total: users.length, page: Number(page), limit: Number(limit) });
  } catch (err) {
    req.log.error(err, "Failed to list users");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/lawyers", async (req, res) => {
  try {
    const lawyers = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.role, "LAWYER"))
      .orderBy(usersTable.firstName);
    res.json(lawyers);
  } catch (err) {
    req.log.error(err, "Failed to list lawyers");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", requireRole("SUPER_ADMIN", "LEGAL_ADMIN"), async (req, res) => {
  const id = String(req.params.id);
  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(user);
  } catch (err) {
    req.log.error(err, "Failed to get user");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", requireRole("SUPER_ADMIN", "LEGAL_ADMIN"), async (req, res) => {
  const id = String(req.params.id);
  try {
    const { firstName, lastName, phone, department } = req.body;
    const [updated] = await db
      .update(usersTable)
      .set({ firstName, lastName, phone, department, updatedAt: new Date() })
      .where(eq(usersTable.id, id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(updated);
  } catch (err) {
    req.log.error(err, "Failed to update user");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", requireRole("SUPER_ADMIN"), async (req, res) => {
  const id = String(req.params.id);
  try {
    await db
      .update(usersTable)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(usersTable.id, id));
    res.status(204).end();
  } catch (err) {
    req.log.error(err, "Failed to delete user");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id/role", requireRole("SUPER_ADMIN"), async (req, res) => {
  const id = String(req.params.id);
  try {
    const { role } = req.body;
    const [updated] = await db
      .update(usersTable)
      .set({ role, updatedAt: new Date() })
      .where(eq(usersTable.id, id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(updated);
  } catch (err) {
    req.log.error(err, "Failed to update role");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
