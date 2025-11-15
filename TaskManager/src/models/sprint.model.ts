// SprintDomain model
export interface Sprint {
  id?: string;
  name: string;
  dateStarted: Date;
  dateEnded: Date;
  duration: number;
  goal: string;
  createdAt: Date;
  updatedAt: Date;
  projectId: string;
}
