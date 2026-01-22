// src/pages/ProjectsPage.tsx
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useProjectStore } from "../stores/projectStore";

export default function ProjectsPage() {
  const { projects, fetchProjects, isLoading } = useProjectStore();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Projects</h1>
          <p className="text-sm text-slate-600">Quản lý và tạo mới dự án</p>
        </div>
        <div className="rounded-lg border border-gray-200 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4 h-32 bg-white"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Projects</h1>
          <p className="text-sm text-slate-600">Quản lý và tạo mới dự án</p>
        </div>
        {/* Optional: Add "Create Project" button later */}
      </div>

      {projects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 p-6 text-sm text-slate-500">
          Chưa có danh sách project. Hãy bắt đầu bằng việc tạo một project mới.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {projects.map((project) => (
            <Link key={project.id} to={`/projects/${project.id}/board`} className="block">
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-slate-900 truncate">{project.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{project.key}</p>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {project.type === "scrum" ? "Scrum" : "Kanban"}
                  </span>
                </div>
                {project.description && (
                  <p className="text-sm text-slate-600 mt-2 line-clamp-2">{project.description}</p>
                )}
                <div className="mt-3 flex items-center text-xs text-slate-500">
                  <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
