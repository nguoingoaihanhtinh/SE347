export type ActivityAction =
  | "PROJECT_CREATED"
  | "PROJECT_UPDATED"
  | "PROJECT_DELETED"
  | "ISSUE_CREATED"
  | "ISSUE_UPDATED"
  | "ISSUE_DELETED"
  | "ISSUE_MOVED"
  | "SPRINT_CREATED"
  | "SPRINT_UPDATED"
  | "SPRINT_DELETED"
  | "COLUMN_CREATED"
  | "COLUMN_UPDATED"
  | "COLUMN_DELETED"
  | "COLUMN_REORDERED"
  | "MEMBER_INVITED"
  | "MEMBER_JOINED"
  | "MEMBER_LEFT"
  | "MEMBER_REMOVED"
  | "MEMBER_ROLE_UPDATED";

export interface IActivityChange {
  field?: string;
  old_value?: string;
  new_value?: string;
}

export interface IActivity {
  id: string;
  project_id: string;
  issue_id: string;
  user_id: string | null;
  user_name: string | null;
  action_type: ActivityAction;
  changes: IActivityChange[];
  created_at: string;
  updated_at: string;
}
