// src/pages/ProjectMembersPage.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { projects } from "../apis/project";
import { useProjectStore } from "../stores/projectStore";
import { useAuthStore } from "../stores/authStore";
import { extractErrorMessage } from "../types/api";
import AddMemberModal from "../components/modals/AddMemberModal";
import { UserPlus, Loader2, Check, X, Bell, XCircle } from "lucide-react";
import type { IProjectMember } from "../types/projectMember";

type TabType = "active" | "pending";

export default function ProjectMembersPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { currentProject } = useProjectStore();
  const { user } = useAuthStore();
  const [members, setMembers] = useState<IProjectMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [readRequestIds, setReadRequestIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<TabType>("active");

  const isOwner = currentProject?.ownerId === user?.id;
  const isAdmin = members.find((m) => m.userId === user?.id)?.role === "admin" || isOwner;

  // Separate members by status
  const activeMembers = members.filter((m) => m.status === "active" || (!m.status && !m.isPending));
  const pendingInvites = members.filter((m) => m.status === "pending_invite");
  const pendingRequests = members.filter((m) => m.status === "pending_request");
  const allPending = [...pendingInvites, ...pendingRequests];

  const loadMembers = async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const response = await projects.getMembers(projectId);
      if (response.data.success) {
        const membersData = Array.isArray(response.data.data) ? response.data.data : [];
        setMembers(membersData);
      }
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } };
      const status = err?.response?.status;
      if (status === 401) {
        console.warn("401 Unauthorized - User not authenticated");
        toast.error("Please log in to view project members");
        setMembers([]);
      } else if (status === 403) {
        console.warn("403 Forbidden - User doesn't have permission");
        toast.error("You don't have permission to view members of this project");
        setMembers([]);
      } else {
        const errorMessage = extractErrorMessage(error);
        toast.error(errorMessage || "Failed to load members");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      loadMembers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // Auto-refresh pending requests every 30 seconds if user is admin/owner
  useEffect(() => {
    if (!projectId || !isAdmin) return;

    const interval = setInterval(() => {
      loadMembers();
    }, 30000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, isAdmin]);

  const handleRemoveMember = async (userId: string) => {
    if (!projectId) return;
    
    const member = members.find((m) => m.userId === userId);
    if (member?.role === "owner") {
      toast.error("Cannot remove the project owner");
      return;
    }

    const isPendingRequest = member?.status === "pending_request";
    if (!isPendingRequest && !window.confirm("Are you sure you want to remove this member?")) {
      return;
    }

    setRemovingUserId(userId);
    if (member?.id) {
      setReadRequestIds((prev) => new Set(prev).add(member.id!));
    }
    try {
      await projects.removeMember(projectId, userId);
      toast.success(isPendingRequest ? "Request rejected" : "Member removed successfully");
      await loadMembers();
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      toast.error(errorMessage || "Failed to remove member");
    } finally {
      setRemovingUserId(null);
    }
  };

  const handleUpdateStatus = async (userId: string, newStatus: "active" | "pending_invite" | "pending_request") => {
    if (!projectId) return;

    setUpdatingUserId(userId);
    const member = members.find((m) => m.userId === userId);
    if (member?.id) {
      setReadRequestIds((prev) => new Set(prev).add(member.id!));
    }
    try {
      await projects.updateMemberStatus(projectId, userId, newStatus);
      toast.success(newStatus === "active" ? "Member accepted successfully" : "Status updated");
      await loadMembers();
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      toast.error(errorMessage || "Failed to update status");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-purple-100 text-purple-800";
      case "admin":
        return "bg-blue-100 text-blue-800";
      case "member":
        return "bg-green-100 text-green-800";
      case "viewer":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderUserCell = (member: IProjectMember) => {
    if (member.user) {
      return (
        <>
          {member.user.avatar ? (
            <img
              src={member.user.avatar}
              alt={member.user.fullName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-medium text-sm">
                {member.user.fullName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-900">{member.user.fullName}</p>
            <p className="text-sm text-gray-500">{member.user.email}</p>
          </div>
        </>
      );
    }
    return (
      <>
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
          <span className="text-gray-400 text-sm">?</span>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Unknown User</p>
          <p className="text-sm text-gray-400">{member.userId}</p>
        </div>
      </>
    );
  };

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto px-6 py-6">
      {/* Toolbar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("active")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "active"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Active Members ({activeMembers.length})
            </button>
            {isAdmin && allPending.length > 0 && (
              <button
                onClick={() => setActiveTab("pending")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors relative ${
                  activeTab === "pending"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Pending ({allPending.length})
                {pendingRequests.filter((r) => !readRequestIds.has(r.id || "")).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {pendingRequests.filter((r) => !readRequestIds.has(r.id || "")).length}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Right side: Bell + Add Member Button */}
        {isOwner && (
          <div className="flex items-center gap-3">
            {/* Notification Bell for Pending Requests */}
            {allPending.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {pendingRequests.filter((r) => !readRequestIds.has(r.id || "")).length > 0 && (
                    <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {pendingRequests.filter((r) => !readRequestIds.has(r.id || "")).length}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {isNotificationOpen && (
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900">Join Requests</h3>
                      <div className="flex items-center gap-2">
                        {pendingRequests.length > 0 && (
                          <button
                            onClick={() => {
                              const allIds = new Set(pendingRequests.map((r) => r.id || ""));
                              setReadRequestIds(allIds);
                            }}
                            className="text-xs text-gray-600 hover:text-gray-900"
                          >
                            Mark all read
                          </button>
                        )}
                        <button
                          onClick={() => setIsNotificationOpen(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {pendingRequests.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500">No pending requests</div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {pendingRequests.map((request) => {
                          const isRead = readRequestIds.has(request.id || "");
                          return (
                            <div
                              key={request.id}
                              className={`p-4 hover:bg-gray-50 transition-colors ${!isRead ? "bg-blue-50" : ""}`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  {request.user ? (
                                    <>
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                        {request.user.fullName}
                                      </p>
                                      <p className="text-xs text-gray-500 mt-1">{request.user.email}</p>
                                    </>
                                  ) : (
                                    <p className="text-sm font-medium text-gray-500">Unknown User</p>
                                  )}
                                  <p className="text-xs text-gray-400 mt-1">Requested to join</p>
                                </div>
                                <div className="flex items-center gap-2 ml-2">
                                  <button
                                    onClick={() => {
                                      handleUpdateStatus(request.userId, "active");
                                      setReadRequestIds((prev) => new Set(prev).add(request.id || ""));
                                    }}
                                    disabled={updatingUserId === request.userId}
                                    className={`p-1.5 rounded transition-colors disabled:opacity-50 ${
                                      !isRead
                                        ? "text-green-600 hover:bg-green-50"
                                        : "text-green-500 hover:bg-green-50"
                                    }`}
                                  >
                                    {updatingUserId === request.userId ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Check className="w-4 h-4" />
                                    )}
                                    <span className="sr-only">Accept</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleRemoveMember(request.userId);
                                      setReadRequestIds((prev) => new Set(prev).add(request.id || ""));
                                    }}
                                    disabled={removingUserId === request.userId || updatingUserId === request.userId}
                                    className={`p-1.5 rounded transition-colors disabled:opacity-50 ${
                                      !isRead
                                        ? "text-red-600 hover:bg-red-50"
                                        : "text-red-500 hover:bg-red-50"
                                    }`}
                                  >
                                    {removingUserId === request.userId ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <X className="w-4 h-4" />
                                    )}
                                  </button>
                                  <button
                                    onClick={() => {
                                      setReadRequestIds((prev) => {
                                        const newSet = new Set(prev);
                                        newSet.add(request.id || "");
                                        return newSet;
                                      });
                                    }}
                                    className="p-1 text-gray-400 hover:text-gray-600"
                                    title="Mark as read"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {pendingRequests.length > 0 && (
                      <div className="p-3 border-t border-gray-200">
                        <button
                          onClick={async () => {
                            const allIds = new Set(pendingRequests.map((r) => r.id || ""));
                            setReadRequestIds(allIds);
                            for (const request of pendingRequests) {
                              await handleRemoveMember(request.userId);
                            }
                          }}
                          className="w-full text-xs text-red-600 hover:text-red-800 hover:bg-red-50 py-2 rounded transition-colors"
                        >
                          Clear all requests
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Add Member Button */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Add Member
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 text-xs font-semibold uppercase text-gray-500 border-b">
                User
              </th>
              <th className="py-3 px-4 text-xs font-semibold uppercase text-gray-500 border-b" style={{ width: "150px" }}>
                {activeTab === "active" ? "Role" : "Type"}
              </th>
              <th className="py-3 px-4 text-xs font-semibold uppercase text-gray-500 border-b text-right" style={{ width: "100px" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {activeTab === "active" ? (
              // Active Members Tab
              activeMembers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-12 px-4 text-center">
                    <UserPlus className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <h3 className="text-sm font-medium text-gray-900 mb-1">No active members</h3>
                    <p className="text-sm text-gray-500">Get started by adding your first team member.</p>
                  </td>
                </tr>
              ) : (
                activeMembers.map((member) => {
                  const canRemove = isOwner && member.role !== "owner" && member.userId !== user?.id;
                  return (
                    <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 border-b border-gray-100 align-middle">
                        <div className="flex items-center gap-3">
                          {renderUserCell(member)}
                        </div>
                      </td>
                      <td className="py-3 px-4 border-b border-gray-100 align-middle" style={{ width: "150px" }}>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
                            member.role
                          )}`}
                        >
                          {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4 border-b border-gray-100 align-middle text-right" style={{ width: "100px" }}>
                        {canRemove ? (
                          <button
                            onClick={() => handleRemoveMember(member.userId)}
                            disabled={removingUserId === member.userId}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {removingUserId === member.userId ? (
                              <>
                                <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                                Removing...
                              </>
                            ) : (
                              "Remove"
                            )}
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )
            ) : (
              // Pending Tab
              allPending.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-12 px-4 text-center">
                    <p className="text-sm text-gray-500">No pending invitations or requests</p>
                  </td>
                </tr>
              ) : (
                <>
                  {/* Pending Invites */}
                  {pendingInvites.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 border-b border-gray-100 align-middle">
                        <div className="flex items-center gap-3">
                          {renderUserCell(member)}
                        </div>
                      </td>
                      <td className="py-3 px-4 border-b border-gray-100 align-middle" style={{ width: "150px" }}>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Invited
                        </span>
                      </td>
                      <td className="py-3 px-4 border-b border-gray-100 align-middle text-right" style={{ width: "100px" }}>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 italic">Waiting for user to accept...</span>
                          <button
                            onClick={() => handleRemoveMember(member.userId)}
                            disabled={updatingUserId === member.userId || removingUserId === member.userId}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Cancel invitation"
                          >
                            {removingUserId === member.userId ? (
                              <>
                                <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                                Canceling...
                              </>
                            ) : (
                              "Cancel"
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {/* Pending Requests */}
                  {pendingRequests.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 border-b border-gray-100 align-middle">
                        <div className="flex items-center gap-3">
                          {renderUserCell(member)}
                        </div>
                      </td>
                      <td className="py-3 px-4 border-b border-gray-100 align-middle" style={{ width: "150px" }}>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Requested
                        </span>
                      </td>
                      <td className="py-3 px-4 border-b border-gray-100 align-middle text-right" style={{ width: "100px" }}>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateStatus(member.userId, "active")}
                            disabled={updatingUserId === member.userId}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {updatingUserId === member.userId ? (
                              <>
                                <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                                Accepting...
                              </>
                            ) : (
                              "Accept"
                            )}
                          </button>
                          <button
                            onClick={() => handleRemoveMember(member.userId)}
                            disabled={updatingUserId === member.userId || removingUserId === member.userId}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {removingUserId === member.userId ? (
                              <>
                                <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                                Rejecting...
                              </>
                            ) : (
                              "Reject"
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </>
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Click outside to close notification dropdown */}
      {isNotificationOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsNotificationOpen(false)}
        />
      )}

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        projectId={projectId || ""}
        onSuccess={loadMembers}
      />
    </div>
  );
}
