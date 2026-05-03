/**
 * Seed script — inserts demo data for development/testing.
 * Run: pnpm --filter @workspace/db run seed
 *
 * Safe to run multiple times: uses ON CONFLICT DO NOTHING.
 */
import { drizzle } from "drizzle-orm/node-postgres";
import { inArray } from "drizzle-orm";
import pg from "pg";
import {
  usersTable,
  casesTable,
  caseTimelineTable,
  auditLogsTable,
  hearingsTable,
  messagesTable,
} from "./schema/index";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

async function seed() {
  console.log("🌱 Seeding database...");

  const SEED_USER_IDS = [
    "a0000000-0000-0000-0000-000000000001",
    "a0000000-0000-0000-0000-000000000002",
    "a0000000-0000-0000-0000-000000000003",
    "a0000000-0000-0000-0000-000000000004",
  ];
  const SEED_CASE_IDS = [
    "b0000000-0000-0000-0000-000000000001",
    "b0000000-0000-0000-0000-000000000002",
    "b0000000-0000-0000-0000-000000000003",
    "b0000000-0000-0000-0000-000000000004",
  ];
  const SEED_HEARING_IDS = [
    "c0000000-0000-0000-0000-000000000001",
    "c0000000-0000-0000-0000-000000000002",
  ];

  const SEED_EMAILS = [
    "admin@ola.csc.gov.ph",
    "lawyer@ola.csc.gov.ph",
    "citizen1@example.com",
    "citizen2@example.com",
  ];

  // Find any existing users with these emails (may have different UUIDs from prior runs)
  const existingUsers = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(inArray(usersTable.email, SEED_EMAILS));
  const allUserIds = [
    ...new Set([...SEED_USER_IDS, ...existingUsers.map((u) => u.id)]),
  ];

  // Find any existing cases from those users
  const existingCases = await db
    .select({ id: casesTable.id })
    .from(casesTable)
    .where(inArray(casesTable.complainantId, allUserIds));
  const allCaseIds = [
    ...new Set([...SEED_CASE_IDS, ...existingCases.map((c) => c.id)]),
  ];

  await db.delete(auditLogsTable).where(inArray(auditLogsTable.actorId, allUserIds));
  await db.delete(messagesTable).where(inArray(messagesTable.caseId, allCaseIds));
  await db.delete(hearingsTable).where(inArray(hearingsTable.id, SEED_HEARING_IDS));
  await db.delete(caseTimelineTable).where(inArray(caseTimelineTable.caseId, allCaseIds));
  await db.delete(casesTable).where(inArray(casesTable.id, allCaseIds));
  await db.delete(usersTable).where(inArray(usersTable.id, allUserIds));

  console.log("  ✓ Cleared existing seed data");

  const now = new Date();
  const userId1 = "a0000000-0000-0000-0000-000000000001";
  const userId2 = "a0000000-0000-0000-0000-000000000002";
  const lawyerId1 = "a0000000-0000-0000-0000-000000000003";
  const adminId1 = "a0000000-0000-0000-0000-000000000004";

  await db
    .insert(usersTable)
    .values([
      {
        id: adminId1,
        clerkId: adminId1,
        email: "admin@ola.csc.gov.ph",
        firstName: "Maria",
        lastName: "Santos",
        role: "LEGAL_ADMIN",
        department: "Office of Legal Affairs",
        isActive: true,
      },
      {
        id: lawyerId1,
        clerkId: lawyerId1,
        email: "lawyer@ola.csc.gov.ph",
        firstName: "Atty. Juan",
        lastName: "dela Cruz",
        role: "LAWYER",
        department: "Office of Legal Affairs",
        isActive: true,
      },
      {
        id: userId1,
        clerkId: userId1,
        email: "citizen1@example.com",
        firstName: "Pedro",
        lastName: "Reyes",
        role: "USER",
        isActive: true,
      },
      {
        id: userId2,
        clerkId: userId2,
        email: "citizen2@example.com",
        firstName: "Ana",
        lastName: "Garcia",
        role: "USER",
        isActive: true,
      },
    ])
    .onConflictDoNothing();

  console.log("  ✓ Users seeded");

  const cases = [
    {
      id: "b0000000-0000-0000-0000-000000000001",
      caseNumber: `CSC-${now.getFullYear()}-10001`,
      title: "Dismissal from Service - Grave Misconduct",
      description:
        "Complaint for grave misconduct against a public official who allegedly accepted bribes in exchange for government contracts.",
      status: "UNDER_REVIEW" as const,
      priority: "HIGH" as const,
      category: "Administrative",
      complainantId: userId1,
      assignedLawyerId: lawyerId1,
      createdById: userId1,
    },
    {
      id: "b0000000-0000-0000-0000-000000000002",
      caseNumber: `CSC-${now.getFullYear()}-10002`,
      title: "Appeal - Forced Resignation",
      description:
        "Appeal against forced resignation order citing lack of due process and violation of security of tenure.",
      status: "FILED" as const,
      priority: "NORMAL" as const,
      category: "Appeal",
      complainantId: userId2,
      createdById: userId2,
    },
    {
      id: "b0000000-0000-0000-0000-000000000003",
      caseNumber: `CSC-${now.getFullYear()}-10003`,
      title: "Harassment in the Workplace - LGBTQ+ Discrimination",
      description:
        "Case involving alleged discrimination and workplace harassment based on sexual orientation by a direct supervisor.",
      status: "HEARING_SCHEDULED" as const,
      priority: "URGENT" as const,
      category: "Disciplinary",
      complainantId: userId1,
      assignedLawyerId: lawyerId1,
      createdById: userId1,
    },
    {
      id: "b0000000-0000-0000-0000-000000000004",
      caseNumber: `CSC-${now.getFullYear()}-10004`,
      title: "Unreasonable Denial of Leave Benefits",
      description:
        "Petition against agency head for denying maternity leave benefits contrary to CSC Memorandum Circular.",
      status: "RESOLVED" as const,
      priority: "NORMAL" as const,
      category: "Benefits",
      complainantId: userId2,
      assignedLawyerId: lawyerId1,
      createdById: userId2,
      resolution:
        "Leave benefit was granted in full after review. Agency directed to comply with CSC MC 41 s. 2015.",
      closedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const c of cases) {
    await db.insert(casesTable).values(c).onConflictDoNothing();
  }
  console.log("  ✓ Cases seeded");

  await db
    .insert(caseTimelineTable)
    .values([
      {
        caseId: "b0000000-0000-0000-0000-000000000001",
        actorId: userId1,
        action: "CASE_FILED",
        description: `Case ${cases[0].caseNumber} was filed`,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        caseId: "b0000000-0000-0000-0000-000000000001",
        actorId: adminId1,
        action: "STATUS_CHANGED",
        description: "Status changed to UNDER_REVIEW",
        metadata: { previousStatus: "FILED", newStatus: "UNDER_REVIEW" },
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        caseId: "b0000000-0000-0000-0000-000000000001",
        actorId: adminId1,
        action: "LAWYER_ASSIGNED",
        description: "Case assigned to lawyer",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        caseId: "b0000000-0000-0000-0000-000000000002",
        actorId: userId2,
        action: "CASE_FILED",
        description: `Case ${cases[1].caseNumber} was filed`,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        caseId: "b0000000-0000-0000-0000-000000000003",
        actorId: userId1,
        action: "CASE_FILED",
        description: `Case ${cases[2].caseNumber} was filed`,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        caseId: "b0000000-0000-0000-0000-000000000003",
        actorId: adminId1,
        action: "STATUS_CHANGED",
        description: "Status changed to HEARING_SCHEDULED",
        metadata: {
          previousStatus: "INVESTIGATION",
          newStatus: "HEARING_SCHEDULED",
        },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        caseId: "b0000000-0000-0000-0000-000000000004",
        actorId: userId2,
        action: "CASE_FILED",
        description: `Case ${cases[3].caseNumber} was filed`,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
      {
        caseId: "b0000000-0000-0000-0000-000000000004",
        actorId: lawyerId1,
        action: "STATUS_CHANGED",
        description: "Status changed to RESOLVED",
        metadata: { previousStatus: "INVESTIGATION", newStatus: "RESOLVED" },
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    ])
    .onConflictDoNothing();

  console.log("  ✓ Timelines seeded");

  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await db
    .insert(hearingsTable)
    .values([
      {
        id: "c0000000-0000-0000-0000-000000000001",
        caseId: "b0000000-0000-0000-0000-000000000003",
        title: "Preliminary Hearing - Harassment Case",
        description:
          "Initial hearing to determine the facts and gather initial statements.",
        scheduledAt: nextWeek,
        location: "CSC Regional Office IV-A, Conference Room B",
        isVirtual: false,
        status: "SCHEDULED",
        createdById: adminId1,
      },
      {
        id: "c0000000-0000-0000-0000-000000000002",
        caseId: "b0000000-0000-0000-0000-000000000001",
        title: "Formal Investigation Hearing",
        description: "Formal hearing for the presentation of evidence.",
        scheduledAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        location: "CSC Main Office, Hearing Room 1",
        isVirtual: false,
        status: "SCHEDULED",
        createdById: lawyerId1,
      },
    ])
    .onConflictDoNothing();

  console.log("  ✓ Hearings seeded");

  await db
    .insert(messagesTable)
    .values([
      {
        caseId: "b0000000-0000-0000-0000-000000000001",
        senderId: userId1,
        content:
          "Good morning. I would like to know the status of my complaint. It has been a week since I filed it.",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        caseId: "b0000000-0000-0000-0000-000000000001",
        senderId: lawyerId1,
        content:
          "Good day, Mr. Reyes. Your case is currently under review. We will schedule a preliminary hearing next week. Please prepare all relevant documents.",
        isRead: true,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      },
    ])
    .onConflictDoNothing();

  console.log("  ✓ Messages seeded");

  await db
    .insert(auditLogsTable)
    .values([
      {
        actorId: userId1,
        action: "CREATE",
        resource: "case",
        resourceId: "b0000000-0000-0000-0000-000000000001",
        details: { caseNumber: cases[0].caseNumber },
      },
      {
        actorId: adminId1,
        action: "UPDATE_STATUS",
        resource: "case",
        resourceId: "b0000000-0000-0000-0000-000000000001",
        details: { status: "UNDER_REVIEW" },
      },
    ])
    .onConflictDoNothing();

  console.log("  ✓ Audit logs seeded");
  console.log("\n✅ Seed complete.");
  await pool.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
