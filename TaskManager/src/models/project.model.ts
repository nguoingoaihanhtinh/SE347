// ProjectDomain model
export interface Project {
  id?: string;
  name: string;
  key: string;
  access: "public" | "private";
  type: "scrum" | "kanban";
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectColumn {
  id?: string;
  name: string;
  description?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
  projectId: string;
  issueIds: string[];
  issues?: any[];
  order: number;
}

export interface ProjectMember {
  id?: string;
  projectId: string;
  teamIds: string[];
  userId: string;
  role: any;
  isPending: boolean;
  createdAt: Date;
  updatedAt: Date;
  user?: any;
  project?: any;
}
