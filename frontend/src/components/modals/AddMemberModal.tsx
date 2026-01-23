// src/components/modals/AddMemberModal.tsx
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { users } from "../../apis/user";
import { projects } from "../../apis/project";
import Modal from "../ui/modal/Modal";
import { extractErrorMessage } from "../../types/api";
import { Search, UserPlus, Loader2 } from "lucide-react";
import { useProjectStore } from "../../stores/projectStore";
import { useAuthStore } from "../../stores/authStore";
import type { IProjectMember } from "../../types/projectMember";

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onSuccess?: () => void;
}

interface SearchUser {
  id: string;
  email: string;
  fullName: string;
  avatar: string | null;
}

const AddMemberModal = ({ isOpen, onClose, projectId, onSuccess }: AddMemberModalProps) => {
  const { currentProject } = useProjectStore();
  const { user: currentUser } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState<string | null>(null);
  const [projectMembers, setProjectMembers] = useState<IProjectMember[]>([]);

  // Load project members when modal opens
  useEffect(() => {
    if (isOpen && projectId) {
      const loadMembers = async () => {
        try {
          const response = await projects.getMembers(projectId);
          if (response.data.success) {
            const membersData = Array.isArray(response.data.data) ? response.data.data : [];
            setProjectMembers(membersData);
          }
        } catch (error) {
          console.error("Failed to load members:", error);
          setProjectMembers([]);
        }
      };
      loadMembers();
    }
  }, [isOpen, projectId]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setSearchResults([]);
      setIsSearching(false);
      setIsAdding(null);
      setProjectMembers([]);
    }
  }, [isOpen]);

  // Debounced search - only search when modal is open
  useEffect(() => {
    if (!isOpen || !projectId) {
      return;
    }

    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await users.search(searchQuery);
        if (response.data.success) {
          setSearchResults(response.data.data || []);
        }
      } catch (error: any) {
        // Don't let search errors redirect to login
        console.error("Error searching users:", error);
        setSearchResults([]);
        if (error?.response?.status !== 401 && error?.response?.status !== 403) {
          toast.error("Failed to search users");
        }
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, isOpen, projectId]);

  const handleAddMember = useCallback(
    async (userId: string) => {
      setIsAdding(userId);
      try {
        // Send invitation instead of direct add
        await projects.addMember(projectId, { userId });
        toast.success("Invitation sent successfully!");
        setSearchQuery("");
        setSearchResults([]);
        onClose();
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 100);
        }
      } catch (error) {
        const errorMessage = extractErrorMessage(error);
        toast.error(errorMessage || "Failed to send invitation");
      } finally {
        setIsAdding(null);
      }
    },
    [projectId, onClose, onSuccess]
  );

  // Don't render modal if not open
  if (!isOpen || !projectId) return null;

  return (
    <Modal
      onClose={onClose}
      title="Add Member"
      hideFooter={true}
    >
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Enter email to search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
            </div>
          )}
        </div>

        {/* Search Results */}
        {searchQuery.trim() && (
          <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
            {isSearching ? (
              <div className="p-4 text-center text-gray-500">Searching...</div>
            ) : searchResults.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No users found</div>
            ) : (
              <div className="divide-y divide-gray-200">
                {searchResults.map((user) => {
                  const isOwner = currentProject?.ownerId === user.id;
                  const isMember = projectMembers.some((m) => m.userId === user.id);
                  const isCurrentUser = currentUser?.id === user.id;
                  const isAlreadyMember = isOwner || isMember || isCurrentUser;

                  return (
                    <div
                      key={user.id}
                      className="p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.fullName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-sm">
                              {user.fullName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{user.fullName}</p>
                          <p className="text-sm text-gray-500 truncate">{user.email}</p>
                          {isAlreadyMember && (
                            <p className="text-sm text-red-600 mt-1">User is already a member of this project.</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddMember(user.id)}
                        disabled={isAdding === user.id || isAlreadyMember}
                        className={`ml-4 px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                          isAlreadyMember
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        }`}
                      >
                        {isAdding === user.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4" />
                            Invite
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!searchQuery.trim() && (
          <div className="text-center py-8 text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Start typing an email address to search for users</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AddMemberModal;
