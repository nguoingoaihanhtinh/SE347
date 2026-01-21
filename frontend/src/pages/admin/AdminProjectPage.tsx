import { useEffect, useState, useCallback } from "react";
import { adminApi } from "../../lib/api";
import type { AdminProject } from "../../lib/api";
// import { Button } from "../../components/ui/Button";
import Toast, { type ToastType } from "../../components/ui/Toast";
import { Eye, Trash2 } from "lucide-react";
import { AxiosError } from "axios";

export default function AdminProjectPage() {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search State
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProjects, setTotalProjects] = useState(0);
  const limit = 10;

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Stable loadProjects function wrapped in useCallback
  const loadProjects = useCallback(
    async (page: number, search: string) => {
      try {
        setLoading(true);
        setError(null);

        const { data } = await adminApi.getProjects({
          search: search || undefined,
          page,
          limit,
        });

        if (Array.isArray(data?.data)) {
          setProjects(data.data);

          // Extract pagination info
          if (data?.pagination) {
            setTotalPages(data.pagination.total_pages || 1);
            setTotalProjects(data.pagination.total || 0);
          }
        } else {
          console.warn("Unexpected API response format:", data);
          setProjects([]);
        }
      } catch (err) {
        const error = err as AxiosError<{ message?: string }>;
        const errorMessage = error?.response?.data?.message || error?.message || "Failed to load projects";
        setError(errorMessage);
        console.error("Error loading projects:", err);
      } finally {
        setLoading(false);
      }
    },
    [limit],
  );

  // Debounce search term: Update debouncedSearch after 400ms of no typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to page 1 when search changes
  useEffect(() => {
    if (debouncedSearch !== "" && currentPage !== 1) {
      setCurrentPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Load projects when page or debouncedSearch changes
  useEffect(() => {
    loadProjects(currentPage, debouncedSearch);
  }, [currentPage, debouncedSearch, loadProjects]);

  // Handle page change
  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const getAccessBadge = (access: "public" | "private") => {
    return access === "public" ? (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600">
        Public
      </span>
    ) : (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600">
        Private
      </span>
    );
  };

  const getTypeBadge = (type: "scrum" | "kanban") => {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
        {type === "scrum" ? "Scrum" : "Kanban"}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header - Flexbox Row: Title Left, Search/Actions Right */}
        <div className="flex justify-between items-end mb-6">
          {/* Left: Page Title - Strict Left Align */}
          <div className="flex flex-col items-start text-left">
            <h2 className="text-2xl font-bold text-gray-800">Project Management</h2>
            <p className="text-slate-600 mt-1">View and manage all system projects</p>
          </div>

          {/* Right: Search Input */}
          <div className="flex items-center gap-3">
            {/* Minimalist Underline Search Bar */}
            <div className="relative w-64">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by project name or key..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-4 py-2 bg-transparent border-0 border-b border-slate-300 rounded-none focus:outline-none focus:ring-0 focus:border-slate-800 transition-colors"
                autoComplete="off"
              />
              {loading && debouncedSearch && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-400"></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            <p className="font-medium">Error loading projects</p>
            <p className="text-sm mt-1">{error}</p>
            <button
              onClick={() => loadProjects(currentPage, debouncedSearch)}
              className="mt-3 text-sm underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Projects Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Project Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Key
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Access
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Members
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                        <p className="text-slate-600 text-sm">Loading projects...</p>
                      </div>
                    </td>
                  </tr>
                ) : projects.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      <svg
                        className="mx-auto h-12 w-12 text-slate-400 mb-3"
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
                      <p className="font-medium">No projects found</p>
                      <p className="text-sm mt-1">Try adjusting your search criteria</p>
                    </td>
                  </tr>
                ) : (
                  projects.map((project, index) => (
                    <tr
                      key={project.id}
                      className={`${index % 2 === 0 ? "bg-white" : "bg-gray-100"} hover:bg-indigo-50 transition`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-bold text-slate-900">{project.name}</div>
                            {project.description && (
                              <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">{project.description}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        <div className="flex items-center gap-2">
                          {getTypeBadge(project.type)}
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600">
                            {project.key}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        <div className="text-sm font-medium text-slate-900">{project.owner.fullName}</div>
                        <div className="text-xs text-slate-500">{project.owner.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left">{getAccessBadge(project.access)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        <div className="text-sm text-slate-900">
                          {project.memberCount} {project.memberCount === 1 ? "user" : "users"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left text-sm text-slate-500">
                        {formatDate(project.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => {
                            // Navigate to project board
                            window.location.href = `/projects/${project.id}/board`;
                          }}
                          className="inline-flex items-center text-blue-600 hover:text-blue-900"
                          title="View Project"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setToast({ message: "Delete project functionality coming soon", type: "info" });
                          }}
                          className="inline-flex items-center text-red-600 hover:text-red-900"
                          title="Delete Project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer - Pagination */}
          {projects.length > 0 && (
            <div className="bg-slate-50/50 px-6 py-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  Showing <span className="font-medium">{(currentPage - 1) * limit + 1}</span> to{" "}
                  <span className="font-medium">{Math.min(currentPage * limit, totalProjects)}</span> of{" "}
                  <span className="font-medium">{totalProjects}</span> project{totalProjects !== 1 ? "s" : ""}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-lg border text-sm font-medium transition ${
                        currentPage === 1
                          ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                          : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      Previous
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                              currentPage === pageNum
                                ? "bg-blue-600 text-white"
                                : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded-lg border text-sm font-medium transition ${
                        currentPage === totalPages
                          ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                          : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Toast Notification */}
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} duration={5000} />}
      </div>
    </div>
  );
}
