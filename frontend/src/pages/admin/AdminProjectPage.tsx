import { useEffect, useState, useCallback, useRef } from "react";
import { adminApi, projectApi } from "../../lib/api";
import type { AdminProject } from "../../lib/api";
import Toast, { type ToastType } from "../../components/ui/Toast";
import { MoreVertical, Search, ChevronUp, ChevronDown, Trash2, Eye } from "lucide-react";
import { AxiosError } from "axios";
import Dropdown from "../../components/ui/Dropdown";
import ViewProjectModal from "../../components/admin/ViewProjectModal";

export default function AdminProjectPage() {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [loading, setLoading] = useState(false); // Start with false for initial load
  const [error, setError] = useState<string | null>(null);

  // Server-side pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProjects, setTotalProjects] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [privacyFilter, setPrivacyFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Server-side sorting: Sort trên ALL data (không phải chỉ 10 items)
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: "asc" | "desc" | null }>({
    key: null,
    direction: null,
  });

  // UI states
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [projectToView, setProjectToView] = useState<AdminProject | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // HYBRID APPROACH: Server-side sorting/filtering trên all data
  // Initial load: Fast (page 1, no sort) → hiển thị ngay
  // Khi sort/find: Gọi API với sort/filter params → server sort/filter all data → show loading
  const loadProjects = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);

      const params: {
        page: number;
        limit: number;
        search?: string;
        type?: "scrum" | "kanban";
        sortBy?: string;
        sortOrder?: "asc" | "desc";
      } = {
        page: currentPage,
        limit,
      };

      // Add search if provided
      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }

      // Add type filter if not "all"
      if (typeFilter !== "all") {
        params.type = typeFilter as "scrum" | "kanban";
      }

      // Add sorting if user has selected sort (server-side sort trên all data)
      if (sortConfig.key && sortConfig.direction) {
        params.sortBy = sortConfig.key;
        params.sortOrder = sortConfig.direction;
      }

      const { data } = await adminApi.getProjects(params);

      if (Array.isArray(data?.data)) {
        setProjects(data.data);

        // Extract pagination info from API response
        if (data?.pagination) {
          setTotalProjects(data.pagination.total || 0);
          setTotalPages(data.pagination.total_pages || 1);
        }
      } else {
        console.warn("Unexpected API response format:", data);
        setProjects([]);
        setTotalProjects(0);
        setTotalPages(1);
      }
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to load projects";
      setError(errorMessage);
      console.error("Error loading projects:", err);
      setProjects([]);
      setTotalProjects(0);
      setTotalPages(1);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [currentPage, limit, debouncedSearch, typeFilter, sortConfig]);

  // Debounce search term: Update debouncedSearch after 400ms of no typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to page 1 when filters or sort change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, typeFilter, sortConfig.key, sortConfig.direction]);

  // Initial load: Fast
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  useEffect(() => {
    if (isInitialLoad) {
      // Initial load: Fast, không show loading spinner
      loadProjects(false).then(() => {
        setIsInitialLoad(false);
      }).catch(() => {
        // If initial load fails, still set isInitialLoad to false to prevent infinite loop
        setIsInitialLoad(false);
        setLoading(false);
      });
    } else {
      // Subsequent loads: Show loading spinner khi user sort/filter
      loadProjects(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadProjects]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    };

    if (openDropdownId) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdownId]);

  // Scroll to top when page changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [currentPage]);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  // Khi user click sort -> trigger API call với sort params -> server sort all data
  const handleSort = useCallback((key: string) => {
    setSortConfig((prev) => {
      if (prev.key !== key) {
        return { key, direction: "asc" };
      } else {
        if (prev.direction === "asc") {
          return { key, direction: "desc" };
        } else if (prev.direction === "desc") {
          return { key: null, direction: null };
        } else {
          return { key, direction: "asc" };
        }
      }
    });
    // Reset to page 1 when sort changes
    setCurrentPage(1);
  }, []);

  // Display projects directly from API (đã được server sort/filter)
  const displayedProjects = projects;

  const SortableHeader = ({
    label,
    sortKey,
    width,
    isFirst = false,
  }: {
    label: string;
    sortKey: string;
    width: string;
    isFirst?: boolean;
  }) => {
    const isActive = sortConfig.key === sortKey;
    const isAsc = isActive && sortConfig.direction === "asc";
    const isDesc = isActive && sortConfig.direction === "desc";

    return (
      <th
        className={`px-3 py-3 text-left text-xs font-bold text-gray-700 capitalize tracking-normal bg-gray-100 cursor-pointer select-none ${width} ${
          isFirst ? "first:rounded-l-lg" : ""
        }`}
        onClick={() => handleSort(sortKey)}
      >
        <div className="flex items-center gap-1">
          <span>{label}</span>
          <div className="flex items-center gap-0.5">
            <ChevronUp
              className={`w-3 h-3 ${
                isAsc ? "text-gray-900" : "text-gray-400"
              }`}
            />
            <ChevronDown
              className={`w-3 h-3 ${
                isDesc ? "text-gray-900" : "text-gray-400"
              }`}
            />
          </div>
        </div>
      </th>
    );
  };

  const getAccessBadge = (access: "public" | "private") => {
    return access === "public" ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
        Public
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
        Private
      </span>
    );
  };

  const getTypeBadge = (type: "scrum" | "kanban") => {
    return type === "scrum" ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
        Scrum
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
        Kanban
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Get initials for avatar (fallback if avatar URL not available)
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Render avatar with fallback to initials
  const renderOwnerAvatar = (owner: AdminProject["owner"]) => {
    // Check if owner has avatar (if API adds it in future)
    // Type assertion needed as AdminProject interface doesn't include avatar yet
    const ownerWithAvatar = owner as AdminProject["owner"] & { avatar?: string | null };
    const hasAvatar = ownerWithAvatar?.avatar;
    
    if (hasAvatar) {
      return (
        <img
          src={hasAvatar}
          alt={owner.fullName}
          className="h-8 w-8 rounded-full object-cover"
        />
      );
    }
    
    // Fallback to initials
    return (
      <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
        {getInitials(owner.fullName)}
      </div>
    );
  };

  const privacyOptions = [
    { value: "all", label: "All Privacy" },
    { value: "public", label: "Public" },
    { value: "private", label: "Private" },
  ];

  const typeOptions = [
    { value: "all", label: "All Types" },
    { value: "scrum", label: "Scrum" },
    { value: "kanban", label: "Kanban" },
  ];

  // Handle type filter change - triggers API call
  const handleTypeFilterChange = useCallback((value: string) => {
    setTypeFilter(value);
    setCurrentPage(1); // Reset to first page when filter changes
  }, []);

  // Calculate pagination display based on server-side results
  const startEntry = totalProjects === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endEntry = Math.min(currentPage * limit, totalProjects);

  const handleOpenViewModal = (project: AdminProject) => {
    setProjectToView(project);
    setIsViewModalOpen(true);
    setOpenDropdownId(null);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setProjectToView(null);
  };

  const handleDeleteProject = async (project: AdminProject) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete project "${project.name}"? This action cannot be undone.`
    );

    if (!confirmed) {
      setOpenDropdownId(null);
      return;
    }

    // Store project info
    const projectName = project.name;
    const projectId = project.id;

    // Close dropdown
    setOpenDropdownId(null);

    try {
      await projectApi.delete(projectId);
      setToast({ message: `Project "${projectName}" has been deleted successfully.`, type: "success" });
      
      // Reload projects after deletion
      // If current page becomes empty, go to previous page
      if (projects.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        loadProjects();
      }
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      const errorMessage = error?.response?.data?.message || "Failed to delete project. Please try again.";
      setToast({ message: errorMessage, type: "error" });
      // Reload to refresh the list
      loadProjects();
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 h-[calc(100vh-120px)] flex flex-col">
          <div className="p-5 pb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Project List</h2>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-9 pl-9 pr-4 w-64 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoComplete="off"
                />
                {loading && debouncedSearch && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                  </div>
                )}
              </div>

              {/* Privacy Filter */}
              <div className="w-40">
                <Dropdown
                  options={privacyOptions}
                  selectedValue={privacyFilter}
                  onChange={setPrivacyFilter}
                  placeholder="Privacy"
                  className="h-9 text-sm"
                />
              </div>

              <div className="w-40">
                <Dropdown
                  options={typeOptions}
                  selectedValue={typeFilter}
                  onChange={handleTypeFilterChange}
                  placeholder="Type"
                  className="h-9 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mx-5 mt-5 bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              <p className="font-medium">Error loading projects</p>
              <p className="text-sm mt-1">{error}</p>
              <button
                onClick={() => loadProjects()}
                className="mt-3 text-sm underline hover:no-underline"
              >
                Try again
              </button>
            </div>
          )}

          <div ref={scrollContainerRef} className="flex-1 overflow-auto px-3 min-h-0 custom-scrollbar">
            <table className="w-full table-fixed border-separate border-spacing-0">
              <thead className="sticky top-0 z-20 bg-gray-100">
                <tr>
                  <SortableHeader label="Name" sortKey="name" width="w-[300px]" isFirst={true} />
                  <SortableHeader label="Key" sortKey="key" width="w-[100px]" />
                  <SortableHeader label="Owner" sortKey="owner" width="w-[250px]" />
                  <SortableHeader label="Type" sortKey="type" width="w-[120px]" />
                  <SortableHeader label="Privacy" sortKey="privacy" width="w-[120px]" />
                  <SortableHeader label="Created At" sortKey="createdAt" width="w-[150px]" />
                  <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 capitalize tracking-normal bg-gray-100 last:rounded-r-lg w-[80px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                        <p className="text-gray-600 text-sm">Loading projects...</p>
                      </div>
                    </td>
                  </tr>
                ) : displayedProjects.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-12 text-center text-gray-500">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400 mb-3"
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
                  displayedProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-3 text-left border-b border-gray-200 whitespace-nowrap">
                        <div className="overflow-hidden">
                          <div className="text-sm font-medium text-gray-900 truncate">{project.name}</div>
                          {project.description && (
                            <div className="text-xs text-gray-500 truncate">{project.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-left border-b border-gray-200 whitespace-nowrap">
                        <span className="text-sm text-gray-900 font-mono truncate block">{project.key}</span>
                      </td>
                      <td className="px-3 py-3 text-left border-b border-gray-200 whitespace-nowrap">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex-shrink-0">
                            {renderOwnerAvatar(project.owner)}
                          </div>
                          <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
                            <div className="text-sm font-medium text-gray-900 truncate">{project.owner.fullName}</div>
                            <div className="text-xs text-gray-500 truncate">{project.owner.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-left border-b border-gray-200 whitespace-nowrap">
                        <div className="truncate">
                          {getTypeBadge(project.type)}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-left border-b border-gray-200 whitespace-nowrap">
                        <div className="truncate">
                          {getAccessBadge(project.access)}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-left text-sm text-gray-500 border-b border-gray-200 whitespace-nowrap">
                        <span className="truncate block">{formatDate(project.createdAt)}</span>
                      </td>
                      <td className="px-3 py-3 text-left border-b border-gray-200 whitespace-nowrap">
                        <div className="relative" ref={openDropdownId === project.id ? dropdownRef : null}>
                          <button
                            onClick={() => setOpenDropdownId(openDropdownId === project.id ? null : project.id)}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                            title="More Actions"
                          >
                            <MoreVertical className="w-4 h-4" strokeWidth={1.5} />
                          </button>

                          {openDropdownId === project.id && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50 py-1">
                              <button
                                onClick={() => handleOpenViewModal(project)}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                                View Details
                              </button>
                              <button
                                onClick={() => {
                                  handleDeleteProject(project);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete Project
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex-shrink-0 border-t border-gray-100 p-4 bg-white rounded-b-lg flex items-center justify-between">
              {totalProjects > 0 ? (
                <div className="text-sm text-gray-500">
                  Showing <span className="font-medium text-gray-700">{startEntry}</span> to{" "}
                  <span className="font-medium text-gray-700">{endEntry}</span> of{" "}
                  <span className="font-medium text-gray-700">{totalProjects}</span> entries
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  No entries to display
                </div>
              )}

              {totalProjects > 0 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1 || totalPages <= 1}
                    className={`px-3 py-1.5 text-sm font-medium border rounded transition ${
                      currentPage === 1 || totalPages <= 1
                        ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    Previous
                  </button>

                  {totalPages > 1 && (
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
                            className={`w-9 h-9 text-sm font-medium border rounded transition ${
                              currentPage === pageNum
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages || totalPages <= 1}
                    className={`px-3 py-1.5 text-sm font-medium border rounded transition ${
                      currentPage === totalPages || totalPages <= 1
                        ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
          </div>
        </div>

        {isViewModalOpen && projectToView && (
          <ViewProjectModal
            project={projectToView}
            onClose={handleCloseViewModal}
            getAccessBadge={getAccessBadge}
            getTypeBadge={getTypeBadge}
            formatDate={formatDate}
            getInitials={getInitials}
          />
        )}

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
            duration={5000}
          />
        )}
      </div>
    </div>
  );
}
