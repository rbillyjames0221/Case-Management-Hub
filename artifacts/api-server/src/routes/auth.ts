import { Router } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth, loadDbUser, requireDbUser } from "../lib/auth";

const router = Router();

router.get("/me", requireAuth, async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    let [dbUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerkId, userId))
      .limit(1);

    if (!dbUser) {
      const clerkUser = await clerkClient.users.getUser(userId);
      const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
      const validRoles = ["SUPER_ADMIN", "LEGAL_ADMIN", "LAWYER", "STAFF", "USER"] as const;
      type UserRole = (typeof validRoles)[number];
      const metaRole = clerkUser.publicMetadata?.role as string | undefined;
      const role: UserRole =
        metaRole && (validRoles as readonly string[]).includes(metaRole)
          ? (metaRole as UserRole)
          : "USER";
      const newUser = {
        id: userId,
        clerkId: userId,
        email,
        firstName: (clerkUser.publicMetadata?.firstName as string | undefined) ?? clerkUser.firstName,
        lastName: (clerkUser.publicMetadata?.lastName as string | undefined) ?? clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,
        role,
      };
      [dbUser] = await db
        .insert(usersTable)
        .values(newUser)
        .onConflictDoUpdate({
          target: usersTable.clerkId,
          set: {
            email,
            firstName: clerkUser.firstName,
            lastName: clerkUser.lastName,
            imageUrl: clerkUser.imageUrl,
            updatedAt: new Date(),
          },
        })
        .returning();
    }

    res.json(dbUser);
  } catch (err) {
    req.log.error(err, "Failed to get/sync user");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/profile", requireAuth, loadDbUser, async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { firstName, lastName, phone, department } = req.body;
  try {
    const [updated] = await db
      .update(usersTable)
      .set({ firstName, lastName, phone, department, updatedAt: new Date() })
      .where(eq(usersTable.clerkId, userId))
      .returning();
    res.json(updated);
  } catch (err) {
    req.log.error(err, "Failed to update profile");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/users", requireAuth, loadDbUser, requireDbUser, async (req, res) => {
  const user = req.dbUser!;
  if (user.role !== "SUPER_ADMIN" && user.role !== "LEGAL_ADMIN") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  try {
    const { emailAddress, firstName, lastName, role } = req.body as {
      emailAddress: string;
      firstName?: string;
      lastName?: string;
      role?: string;
    };
    if (!emailAddress?.trim()) {
      res.status(400).json({ error: "emailAddress is required" });
      return;
    }
    const invitation = await clerkClient.invitations.createInvitation({
      emailAddress: emailAddress.trim(),
      publicMetadata: { role: role ?? "USER", firstName, lastName },
    });
    res.status(201).json({ id: invitation.id, emailAddress, status: "invited" });
  } catch (err: unknown) {
    req.log.error(err, "Failed to invite user");
    const msg = err instanceof Error ? err.message : "Failed to invite user";
    res.status(422).json({ error: msg });
  }
});

router.get("/lawyers", requireAuth, loadDbUser, requireDbUser, async (req, res) => {
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

export default router;
