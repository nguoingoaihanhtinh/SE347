// IssueDomain model
export interface Issue {
  id?: string;
  title: string;
  projectId: string;
  sprintId?: string;
  creatorId?: string;
  teamId?: string;
  assigneeId?: string;
  parentId: string;
  reporterId: string;
  type?: any; // Replace 'any' with IssueType enum/type if defined
  columnId: string;
  column?: any; // Replace 'any' with ProjectColumn type if defined
  priority?: any; // Replace 'any' with IssuePriority enum/type if defined
  summary: string;
  description: string;
  storyPoint: number;
  attachments: string[];
  createdAt: Date;
  completedAt: Date;
  updatedAt: Date;
  dueDateFrom: Date;
  dueDateTo: Date;
  key: string;
}
