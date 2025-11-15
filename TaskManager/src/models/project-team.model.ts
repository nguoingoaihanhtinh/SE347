// ProjectTeamDomain model
export interface ProjectTeam {
  id?: string;
  projectId: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  permissionKeys: string[];
  memberIds: string[];
}

// PermissionDomain model
export interface Permission {
  id?: string;
  label: string;
  description: string;
  resource: string;
  action: string;
  key: string;
}
