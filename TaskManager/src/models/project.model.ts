// ProjectDomain model
export interface Project {
  id?: string;
  name: string;
  key: string;
  access: "public" | "private"; // replace with enum if you have one
  type: "scrum" | "kanban"; // replace with enum if you have one
  ownerId: string; // references User.id
  createdAt: Date;
  updatedAt: Date;
}

// ProjectColumnDomain model
export interface ProjectColumn {
  id?: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  projectId: string;
  issueIds: string[];
  issues?: any[]; // Replace 'any' with Issue[] if imported
  order: number;
}

// ProjectMemberDomain model (for reference)
export interface ProjectMember {
  id?: string;
  projectId: string;
  teamIds: string[];
  userId: string;
  role: any; // Replace 'any' with TeamMemberRole enum/type if defined
  isPending: boolean;
  createdAt: Date;
  updatedAt: Date;
  user?: any; // Replace 'any' with User if imported
  project?: any; // Replace 'any' with Project if imported
}
