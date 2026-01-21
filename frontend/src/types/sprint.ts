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

export function createDefaultSprint(projectId: string): CreateSprintParams {
  const today = new Date().toISOString().split("T")[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  return {
    name: "New Sprint",
    goal: "Complete planned tasks",
    dateStarted: today,
    dateEnded: nextWeek,
    projectId,
  };
}
