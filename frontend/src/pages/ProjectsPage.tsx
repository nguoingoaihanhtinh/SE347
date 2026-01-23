// src/pages/ProjectsPage.tsx
import { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import { useProjectStore } from "../stores/projectStore";
import { useAuthStore } from "../stores/authStore";
import { projects } from "../apis/project";
import CreateProjectModal from "../components/modals/CreateProjectModal";
import ProjectCard from "../components/projects/ProjectCard";
import { Button } from "../components/ui/Button";
import { Bell, Search, Loader2, Check, X } from "lucide-react";
import { extractErrorMessage } from "../types/api";
import type { ProjectMember } from "../types/projectMember";
import type { IProject } from "../types/project";

type FilterType = "all" | "my" | "public";

export default function ProjectsPage() {
  const { projects: projectList, fetchProjects, isLoading, error } = useProjectStore();
  const { user } = useAuthStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchKey, setSearchKey] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<{ name: string; ownerName: string; key: string } | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [invitations, setInvitations] = useState<ProjectMember[]>([]);
  const [isLoadingInvitations, setIsLoadingInvitations] = useState(false);

  const loadInvitations = async () => {
    if (!user) return;
    setIsLoadingInvitations(true);
    try {
      const response = await projects.getPendingInvitations();
      if (response.data.success && Array.isArray(response.data.data)) {
        // Map backend response to frontend type, ensuring all required fields are present
        const mappedInvitations: ProjectMember[] = response.data.data.map((inv) => ({
          id: inv.id || inv.projectId + "_" + inv.userId,
          projectId: inv.projectId,
          userId: inv.userId,
          teamIds: inv.teamIds || [],
          role: inv.role,
          isPending: inv.isPending ?? (inv.status !== "active"),
          status: inv.status,
          createdAt: typeof inv.createdAt === "string" ? inv.createdAt : new Date(inv.createdAt).toISOString(),
          updatedAt: typeof inv.updatedAt === "string" ? inv.updatedAt : new Date(inv.updatedAt).toISOString(),
          user: inv.user
            ? {
                _id: inv.user._id || inv.user.id || inv.userId,
                email: inv.user.email || "",
                firstName: inv.user.firstName || "",
                lastName: inv.user.lastName || "",
                avatar: inv.user.avatar || undefined,
              }
            : undefined,
          project: inv.project,
        }));
        setInvitations(mappedInvitations);
      }
    } catch (error) {
      console.error("Failed to load invitations:", error);
      // Don't show error toast here to avoid spamming user on page load
    } finally {
      setIsLoadingInvitations(false);
    }
  };

  const handleSearchProject = async () => {
    if (!searchKey.trim()) return;
    setIsSearching(true);
    try {
      const response = await projects.searchByKey(searchKey.trim().toUpperCase());
      if (response.data.success) {
        setSearchResult(response.data.data);
        setIsSearchModalOpen(true);
      }
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } };
      if (err?.response?.status === 404) {
        toast.error("Project not found");
      } else {
        const errorMessage = extractErrorMessage(error);
        toast.error(errorMessage || "Failed to search project");
      }
    } finally {
      setIsSearching(false);
    }
  };

  // Check if user is already a member of the searched project
  const isAlreadyMemberOfSearchedProject = useMemo(() => {
    if (!searchResult || !user || !Array.isArray(projectList)) return false;
    // Check if project exists in user's project list (means they're a member)
    return projectList.some((p) => p.key === searchResult.key);
  }, [searchResult, user, projectList]);

  const handleRequestToJoin = async (projectKey: string) => {
    try {
      await projects.requestToJoin(projectKey);
      toast.success("Join request sent successfully!");
      setIsSearchModalOpen(false);
      setSearchKey("");
      setSearchResult(null);
      await fetchProjects();
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      toast.error(errorMessage || "Failed to send join request");
    }
  };

  const handleAcceptInvitation = async (projectId: string, userId: string) => {
    try {
      await projects.updateMemberStatus(projectId, userId, "active");
      toast.success("Invitation accepted!");
      await loadInvitations();
      await fetchProjects();
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      toast.error(errorMessage || "Failed to accept invitation");
    }
  };

  const handleDeclineInvitation = async (projectId: string, userId: string) => {
    try {
      await projects.removeMember(projectId, userId);
      toast.success("Invitation declined");
      await loadInvitations();
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      toast.error(errorMessage || "Failed to decline invitation");
    }
  };

  useEffect(() => {
    fetchProjects().catch((error) => {
      console.error("Failed to fetch projects:", error);
    });
    if (user) {
      loadInvitations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    // Refresh projects list after modal closes (project might have been created)
    fetchProjects();
  };

  // Filter projects based on selected filter
  const filteredProjects = useMemo(() => {
    if (!user || !Array.isArray(projectList)) return [];

    // Sort priority for "All":
    // 1) owner, 2) member, 3) public (not involved)
    const sorted = [...projectList].sort((a, b) => {
      const rank = (p: typeof a) => {
        if (p.relationship === "owner") return 0;
        if (p.relationship === "member") return 1;
        return 2;
      };
      const ra = rank(a);
      const rb = rank(b);
      if (ra !== rb) return ra - rb;
      // newest first as tie-breaker
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    switch (filter) {
      case "my":
        return sorted.filter((p) => p.relationship === "owner" || p.ownerId === user.id);
      case "public":
        return sorted.filter((p) => p.access === "public");
      case "all":
      default:
        return sorted;
    }
  }, [projectList, filter, user]);

  // Get user role in project
  const getUserRole = (project: any): "Owner" | "Member" | "Public" => {
    if (!user) return "Public";
    if (project.relationship === "owner" || project.ownerId === user.id) return "Owner";
    if (project.relationship === "member") return "Member";
    if (project.access === "public") return "Public";
    return "Public";
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
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Filter Tabs and Create Project Button - Same Row */}
      <div className="flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              filter === "all"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            All ({Array.isArray(projectList) ? projectList.length : 0})
          </button>
          <button
            onClick={() => setFilter("my")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              filter === "my"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            My Projects ({Array.isArray(projectList) ? projectList.filter((p) => p.relationship === "owner" || p.ownerId === user?.id).length : 0})
          </button>
          <button
            onClick={() => setFilter("public")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              filter === "public"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Public ({Array.isArray(projectList) ? projectList.filter((p: any) => p.access === "public").length : 0})
          </button>
        </div>

        {/* Right side: Search, Notifications, Create Project */}
        <div className="flex items-center gap-3">
          {/* Search Private Project */}
          <div className="relative">
            <Search className="absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by key..."
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearchProject();
                }
              }}
              className="pl-7 pr-8 py-1.5 text-sm bg-transparent border-0 border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 transition-colors w-40"
            />
            {isSearching ? (
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
                <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
              </div>
            ) : searchKey ? (
              <button
                onClick={() => {
                  setSearchKey("");
                  setSearchResult(null);
                }}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 transition-colors"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            ) : null}
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              {invitations.length > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {invitations.length}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900">Project Invitations</h3>
                </div>
                {isLoadingInvitations ? (
                  <div className="p-4 text-center">
                    <Loader2 className="w-5 h-5 text-gray-400 animate-spin mx-auto" />
                  </div>
                ) : invitations.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">No pending invitations</div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {invitations.map((invitation) => (
                      <div key={invitation.id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {invitation.project?.name || "Unknown Project"}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {invitation.project?.key && `Key: ${invitation.project.key} • `}Invited you to join
                            </p>
                          </div>
                          <div className="flex items-center gap-2 ml-2">
                            <button
                              onClick={() => {
                                if (invitation.projectId) {
                                  handleAcceptInvitation(invitation.projectId, invitation.userId);
                                }
                              }}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (invitation.projectId) {
                                  handleDeclineInvitation(invitation.projectId, invitation.userId);
                                }
                              }}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Create Project Button */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="group flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors focus:outline-none focus-visible:outline-none"
          >
            <svg className="w-5 h-5 text-indigo-600 group-hover:text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-indigo-600 font-semibold whitespace-nowrap group-hover:text-indigo-700 text-sm">
              New Project
            </span>
          </button>
        </div>
      </div>

      {/* Search Result Modal */}
      {isSearchModalOpen && searchResult && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setIsSearchModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Private Project Found</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Project Name</p>
                <p className="text-base font-medium text-gray-900">{searchResult.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Owner</p>
                <p className="text-base font-medium text-gray-900">{searchResult.ownerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Key</p>
                <p className="text-base font-mono text-gray-900">{searchResult.key}</p>
              </div>
              {isAlreadyMemberOfSearchedProject && (
                <div className="pt-2">
                  <p className="text-sm text-red-600">You are already a member of this project.</p>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsSearchModalOpen(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRequestToJoin(searchResult.key)}
                  disabled={isAlreadyMemberOfSearchedProject}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isAlreadyMemberOfSearchedProject
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "text-white bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  Request to Join
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


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

      {/* Click outside to close notification dropdown */}
      {isNotificationOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsNotificationOpen(false)}
        />
      )}

      {/* Projects Grid */}
      {!error && Array.isArray(filteredProjects) && filteredProjects.length === 0 ? (
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
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.isArray(filteredProjects) &&
              filteredProjects.map((project: IProject) => {
                const userRole = getUserRole(project);
                return (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    userRole={userRole}
                    onUpdate={() => {
                      // Optional: refresh projects list if needed
                      fetchProjects().catch(console.error);
                    }}
                  />
                );
              })}
          </div>
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
