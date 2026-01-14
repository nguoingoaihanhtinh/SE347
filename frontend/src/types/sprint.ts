export interface ISprint {
  id: string;
  name: string;
  dateStarted: string;
  dateEnded: string;
  duration: number;
  goal: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSprintParams {
  name: string;
  goal: string;
  dateStarted: string;
  dateEnded: string;
  projectId: string;
}

export interface UpdateSprintParams {
  name?: string;
  goal?: string;
  dateStarted?: string;
  dateEnded?: string;
}
