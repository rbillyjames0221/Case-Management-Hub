import {
  pgTable,
  text,
  timestamp,
  uuid,
  pgEnum,
  boolean,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "SUPER_ADMIN",
  "LEGAL_ADMIN",
  "LAWYER",
  "STAFF",
  "USER",
]);

export const caseStatusEnum = pgEnum("case_status", [
  "FILED",
  "UNDER_REVIEW",
  "INVESTIGATION",
  "HEARING_SCHEDULED",
  "RESOLVED",
  "ARCHIVED",
]);

export const fileCategoryEnum = pgEnum("file_category", [
  "PLEADING",
  "EVIDENCE",
  "CORRESPONDENCE",
  "ORDER",
  "DECISION",
  "OTHER",
]);

export const casePriorityEnum = pgEnum("case_priority", [
  "LOW",
  "NORMAL",
  "HIGH",
  "URGENT",
]);

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: userRoleEnum("role").notNull().default("USER"),
  phone: text("phone"),
  department: text("department"),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const casesTable = pgTable("cases", {
  id: uuid("id").primaryKey().defaultRandom(),
  caseNumber: text("case_number").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  status: caseStatusEnum("status").notNull().default("FILED"),
  priority: casePriorityEnum("priority").notNull().default("NORMAL"),
  category: text("category"),
  complainantId: text("complainant_id").references(() => usersTable.id),
  assignedLawyerId: text("assigned_lawyer_id").references(
    () => usersTable.id,
  ),
  createdById: text("created_by_id").references(() => usersTable.id),
  resolution: text("resolution"),
  dueDate: timestamp("due_date"),
  closedAt: timestamp("closed_at"),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const caseFilesTable = pgTable("case_files", {
  id: uuid("id").primaryKey().defaultRandom(),
  caseId: uuid("case_id")
    .notNull()
    .references(() => casesTable.id, { onDelete: "cascade" }),
  uploadedById: text("uploaded_by_id").references(() => usersTable.id),
  fileName: text("file_name").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  fileSize: integer("file_size").notNull(),
  storagePath: text("storage_path").notNull(),
  category: fileCategoryEnum("category").notNull().default("OTHER"),
  description: text("description"),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const caseNotesTable = pgTable("case_notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  caseId: uuid("case_id")
    .notNull()
    .references(() => casesTable.id, { onDelete: "cascade" }),
  authorId: text("author_id").references(() => usersTable.id),
  content: text("content").notNull(),
  isInternal: boolean("is_internal").notNull().default(false),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const caseTimelineTable = pgTable("case_timeline", {
  id: uuid("id").primaryKey().defaultRandom(),
  caseId: uuid("case_id")
    .notNull()
    .references(() => casesTable.id, { onDelete: "cascade" }),
  actorId: text("actor_id").references(() => usersTable.id),
  action: text("action").notNull(),
  description: text("description"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const hearingsTable = pgTable("hearings", {
  id: uuid("id").primaryKey().defaultRandom(),
  caseId: uuid("case_id")
    .notNull()
    .references(() => casesTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  scheduledAt: timestamp("scheduled_at").notNull(),
  location: text("location"),
  isVirtual: boolean("is_virtual").notNull().default(false),
  meetingUrl: text("meeting_url"),
  status: text("status").notNull().default("SCHEDULED"),
  notes: text("notes"),
  createdById: text("created_by_id").references(() => usersTable.id),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const messagesTable = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  caseId: uuid("case_id")
    .notNull()
    .references(() => casesTable.id, { onDelete: "cascade" }),
  senderId: text("sender_id").references(() => usersTable.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const auditLogsTable = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  actorId: text("actor_id").references(() => usersTable.id),
  action: text("action").notNull(),
  resource: text("resource").notNull(),
  resourceId: text("resource_id"),
  details: jsonb("details"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type User = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;

export type Case = typeof casesTable.$inferSelect;
export type InsertCase = typeof casesTable.$inferInsert;

export type CaseFile = typeof caseFilesTable.$inferSelect;
export type InsertCaseFile = typeof caseFilesTable.$inferInsert;

export type CaseNote = typeof caseNotesTable.$inferSelect;
export type InsertCaseNote = typeof caseNotesTable.$inferInsert;

export type CaseTimeline = typeof caseTimelineTable.$inferSelect;
export type InsertCaseTimeline = typeof caseTimelineTable.$inferInsert;

export type Hearing = typeof hearingsTable.$inferSelect;
export type InsertHearing = typeof hearingsTable.$inferInsert;

export type Message = typeof messagesTable.$inferSelect;
export type InsertMessage = typeof messagesTable.$inferInsert;

export const notificationsTable = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  body: text("body"),
  type: text("type").notNull().default("GENERAL"),
  entityType: text("entity_type"),
  entityId: text("entity_id"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type AuditLog = typeof auditLogsTable.$inferSelect;
export type InsertAuditLog = typeof auditLogsTable.$inferInsert;

export type Notification = typeof notificationsTable.$inferSelect;
export type InsertNotification = typeof notificationsTable.$inferInsert;
