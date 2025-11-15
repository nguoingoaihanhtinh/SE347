// ActivityChange model
export interface ActivityChange {
  field?: string;
  oldValue?: string;
  newValue?: string;
}

// ActivityDomain model
export interface Activity {
  id?: string;
  projectId: string;
  issueId: string;
  userId?: string;
  userName?: string;
  actionType?: string;
  changes?: ActivityChange[];
  createdAt: Date;
  updatedAt: Date;
}

// ActivityAction constants
export const ActivityAction = {
  ISSUE_UPDATED: "ISSUE_UPDATED",
  ISSUE_CREATED: "ISSUE_CREATED",
} as const;
