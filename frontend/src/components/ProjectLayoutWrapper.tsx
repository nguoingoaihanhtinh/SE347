// src/components/ProjectLayoutWrapper.tsx
import { useEffect } from "react";
import { useParams, Outlet } from "react-router-dom";
import { useProjectStore } from "../stores/projectStore";
import ProjectLayout from "../layouts/ProjectLayout";

export default function ProjectLayoutWrapper() {
  const { projectId } = useParams<{ projectId: string }>();
  const { currentProject, fetchProject } = useProjectStore();

  useEffect(() => {
    if (projectId) {
      fetchProject(projectId);
    }
  }, [projectId]);

  if (!currentProject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ProjectLayout
      projectName={currentProject.name}
      projectCode={currentProject.key}
      breadcrumb={[{ label: "Projects", path: "/projects" }, { label: currentProject.name }]}
    >
      <Outlet />
    </ProjectLayout>
  );
}
