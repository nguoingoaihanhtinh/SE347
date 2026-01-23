// src/pages/ProjectsPage.tsx
import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useProjectStore } from "../stores/projectStore";
import { useAuthStore } from "../stores/authStore";
import CreateProjectModal from "../components/modals/CreateProjectModal";
import { Button } from "../components/ui/Button";

type FilterType = "all" | "my" | "public";

export default function ProjectsPage() {
  const { projects, fetchProjects, isLoading, error } = useProjectStore();
  const { user } = useAuthStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    fetchProjects().catch((error) => {
      console.error("Failed to fetch projects:", error);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    // Refresh projects list after modal closes (project might have been created)
    fetchProjects();
  };

  // Filter projects based on selected filter
  const filteredProjects = useMemo(() => {
    if (!user) return projects;

    switch (filter) {
      case "my":
        // Show only projects where user is owner
        return projects.filter((p) => p.ownerId === user.id);
      case "public":
        // Show only public projects
        return projects.filter((p) => p.access === "public");
      case "all":
      default:
        return projects;
    }
  }, [projects, filter, user]);

  // Get user role in project
  const getUserRole = (project: typeof projects[0]): "Owner" | "Member" | "Public" => {
    if (!user) return "Public";
    if (project.ownerId === user.id) return "Owner";
    if (project.access === "public") return "Public";
    return "Member";
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">All Projects</h1>
            <p className="text-sm text-slate-600 mt-1">Quản lý và tạo mới dự án của bạn</p>
          </div>
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
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">All Projects</h1>
          <p className="text-sm text-slate-600 mt-1">Quản lý và tạo mới dự án của bạn</p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          variant="primary"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Project
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            filter === "all"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          All ({projects.length})
        </button>
        <button
          onClick={() => setFilter("my")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            filter === "my"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          My Projects ({projects.filter((p) => p.ownerId === user?.id).length})
        </button>
        <button
          onClick={() => setFilter("public")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            filter === "public"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Public ({projects.filter((p) => p.access === "public").length})
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-red-800">Error loading projects</p>
              <p className="text-xs text-red-600 mt-1">{error}</p>
            </div>
            <button
              onClick={() => fetchProjects()}
              className="ml-auto text-xs text-red-600 hover:text-red-800 underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      {!error && filteredProjects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            />
          </svg>
          <h3 className="mt-4 text-sm font-medium text-slate-900">No projects yet</h3>
          <p className="mt-2 text-sm text-slate-500">
            Get started by creating your first project.
          </p>
          <div className="mt-6">
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              variant="primary"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Project
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProjects.map((project) => {
            const userRole = getUserRole(project);
            return (
            <div key={project.id} className="block group">
              <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-200 h-full flex flex-col">
                <Link to={`/projects/${project.id}/board`} className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                          {project.name}
                        </h3>
                        {userRole === "Owner" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 flex-shrink-0">
                            Owner
                          </span>
                        )}
                        {userRole === "Member" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 flex-shrink-0">
                            Member
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 font-mono">{project.key}</p>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 ml-2 flex-shrink-0">
                      {project.type === "scrum" ? "Scrum" : "Kanban"}
                    </span>
                  </div>
                  {project.description && (
                    <p className="text-sm text-slate-600 mt-3 line-clamp-2 mb-4">{project.description}</p>
                  )}
                </Link>
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                    <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                    <span className={`px-2 py-0.5 rounded-full ${
                      project.access === "public" 
                        ? "bg-green-100 text-green-700" 
                        : "bg-slate-100 text-slate-700"
                    }`}>
                      {project.access === "public" ? "Public" : "Private"}
                    </span>
                  </div>
                  {/* Quick Actions */}
                  <div className="flex gap-2">
                    <Link
                      to={`/projects/${project.id}/board`}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                      </svg>
                      Board
                    </Link>
                    <Link
                      to={`/projects/${project.id}/backlog`}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Backlog
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
