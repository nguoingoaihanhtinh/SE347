// src/enums/index.ts

export enum ProjectRole {
  OWNER = "owner",
  ADMIN = "admin",
  PM = "pm",
  MEMBER = "member",
}

export enum ProjectType {
  SCRUM = "scrum",
  KANBAN = "kanban",
}

export enum ProjectAccess {
  PUBLIC = "public",
  PRIVATE = "private",
}

export enum IssueType {
  TASK = "task",
  STORY = "story",
  BUG = "bug",
  EPIC = "epic",
}

export enum IssuePriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export enum ActivityAction {
  PROJECT_CREATED = "PROJECT_CREATED",
  PROJECT_UPDATED = "PROJECT_UPDATED",
  SPRINT_CREATED = "SPRINT_CREATED",
  SPRINT_UPDATED = "SPRINT_UPDATED",
  SPRINT_DELETED = "SPRINT_DELETED",
  ISSUE_CREATED = "ISSUE_CREATED",
  ISSUE_UPDATED = "ISSUE_UPDATED",
  ISSUE_DELETED = "ISSUE_DELETED",
  ISSUE_MOVED = "ISSUE_MOVED",
  COLUMN_CREATED = "COLUMN_CREATED",
  COLUMN_UPDATED = "COLUMN_UPDATED",
  COLUMN_DELETED = "COLUMN_DELETED",
  COLUMN_REORDERED = "COLUMN_REORDERED",
  MEMBER_INVITED = "MEMBER_INVITED",
  MEMBER_JOINED = "MEMBER_JOINED",
  MEMBER_LEFT = "MEMBER_LEFT",
  MEMBER_REMOVED = "MEMBER_REMOVED",
  MEMBER_ROLE_UPDATED = "MEMBER_ROLE_UPDATED",
}
