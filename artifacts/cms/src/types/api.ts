export interface UserBasic {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
}

export interface UserItem {
  id: string;
  clerkId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role: string;
  phone?: string | null;
  department?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CaseItem {
  id: string;
  caseNumber: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  category?: string | null;
  assignedLawyerId?: string | null;
  complainantId?: string | null;
  dueDate?: string | null;
  closedAt?: string | null;
  resolution?: string | null;
  createdAt: string;
  updatedAt: string;
  complainant?: UserBasic | null;
  assignedLawyer?: UserBasic | null;
}

export interface HearingItem {
  id: string;
  caseId: string;
  title: string;
  description?: string | null;
  scheduledAt: string;
  location?: string | null;
  isVirtual: boolean;
  meetingUrl?: string | null;
  status: string;
  notes?: string | null;
  case?: { id: string; title: string; caseNumber: string } | null;
}

export interface NoteItem {
  id: string;
  caseId: string;
  content: string;
  isInternal: boolean;
  authorId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FileItem {
  id: string;
  caseId: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  category: string;
  description?: string | null;
  createdAt: string;
}

export interface MessageItem {
  id: string;
  caseId: string;
  senderId?: string | null;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender?: UserBasic | null;
}

export interface AuditLogItem {
  id: string;
  actorId?: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  details?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  actor?: UserBasic | null;
}

export interface TimelineItem {
  id: string;
  caseId: string;
  actorId?: string | null;
  action: string;
  description?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  body?: string | null;
  type: string;
  entityType?: string | null;
  entityId?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface PublicCaseResult {
  caseNumber: string;
  status: string;
  updatedAt: string;
}
