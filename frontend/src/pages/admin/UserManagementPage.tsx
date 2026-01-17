import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, MoreVertical, Edit, Trash2 } from "lucide-react";
import { userApi } from "../../lib/api";
import type { User } from "../../types";
import Modal from "../../components/ui/modal/Modal";
import AddUserModal from "../../components/admin/AddUserModal";
import Toast, { type ToastType } from "../../components/ui/Toast";
import { useAuthStore } from "../../stores/authStore";
import { AxiosError } from "axios";

export default function UserManagementPage() {
  const currentUser = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search State
  const [searchTerm, setSearchTerm] = useState(""); // Immediate input value
  const [debouncedSearch, setDebouncedSearch] = useState(""); // Debounced value for API calls
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const limit = 10;
  
  // Edit User Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editFullName, setEditFullName] = useState<string>("");
  const [editRole, setEditRole] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Add User Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Delete Confirmation Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Dropdown Menu State (for actions menu)
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
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

  // Helper: Get user initials from name
  const getInitials = (name: string): string => {
    if (!name || name.trim() === "") return "??";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Helper: Get consistent color for user based on name hash
  const getAvatarColor = (name: string): string => {
    const colors = [
      "bg-blue-500",
      "bg-indigo-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-red-500",
      "bg-orange-500",
      "bg-amber-500",
      "bg-green-500",
      "bg-teal-500",
      "bg-cyan-500",
    ];
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  // Get available roles based on current user's role
  const getAvailableRoles = () => {
    if (!currentUser) return [];
    
    if (currentUser.role === "super_admin") {
      // Super admin can assign any role
      return [
        { value: "user", label: "User" },
        { value: "admin", label: "Admin" },
        { value: "super_admin", label: "Super Admin" },
      ];
    } else if (currentUser.role === "admin") {
      // Regular admin can only assign user or admin
      return [
        { value: "user", label: "User" },
        { value: "admin", label: "Admin" },
      ];
    }
    
    // No permissions to edit roles
    return [];
  };

  // Stable loadUsers function wrapped in useCallback
  const loadUsers = useCallback(async (page: number, search: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await userApi.getAll({ 
        search: search || undefined,
        page,
        limit 
      });
      
      // Backend returns: { success: true, data: User[], pagination: {...} }
      // After axios destructuring, we get data.data = User[]
      // Backend may return _id instead of id, so we normalize it
      if (Array.isArray(data?.data)) {
        const normalizedUsers = data.data.map((user: User & { _id?: string }) => ({
          ...user,
          id: user.id || user._id?.toString() || user._id || "", // Support both id and _id, ensure string
        })).filter((user): user is User => !!user.id); // Filter out users without valid id
        setUsers(normalizedUsers);
        
        // Extract pagination info
        if (data?.pagination) {
          setTotalPages(data.pagination.total_pages || 1);
          setTotalUsers(data.pagination.total || 0);
        }
      } else {
        console.warn("Unexpected API response format:", data);
        setUsers([]);
      }
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to load users";
      setError(errorMessage);
      console.error("Error loading users:", err);
      console.error("Error details:", {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
      });
    } finally {
      setLoading(false);
    }
  }, [limit]);

  // Debounce search term: Update debouncedSearch after 400ms of no typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to page 1 when search changes (but not on initial mount)
  useEffect(() => {
    if (debouncedSearch !== "" && currentPage !== 1) {
      setCurrentPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]); // Only depend on debouncedSearch - we intentionally check currentPage without including it

  // Load users when page or debouncedSearch changes
  useEffect(() => {
    loadUsers(currentPage, debouncedSearch);
  }, [currentPage, debouncedSearch, loadUsers]);

  const handleOpenDeleteModal = (user: User) => {
    // Self-deletion prevention: Block deletion of own account
    const userId = user.id || (user as unknown as { _id?: string })._id?.toString() || (user as unknown as { _id?: string })._id;
    const currentUserId = currentUser?.id || (currentUser as unknown as { _id?: string })?._id?.toString() || (currentUser as unknown as { _id?: string })?._id;
    
    if (currentUserId && userId && currentUserId === userId) {
      setToast({ message: "You cannot delete your own account. Please contact another administrator.", type: "error" });
      return;
    }
    
    // Prevent regular admins from deleting super_admin users
    if (currentUser?.role === "admin" && user.role === "super_admin") {
      setToast({ message: "You don't have permission to delete Super Admin users. Contact a Super Admin.", type: "error" });
      return;
    }
    
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };


  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    // ===== OPTIMISTIC UI: CLOSE MODAL FIRST, BEFORE ANYTHING ELSE =====
    console.log("Closing Modal State NOW - Optimistic UI approach");
    
    // Store user info before closing modal (for toast message and updates)
    const fullName = userToDelete.fullName || `${userToDelete.firstName || ""} ${userToDelete.lastName || ""}`.trim() || "User";
    const userId = userToDelete.id || (userToDelete as unknown as { _id?: string })._id;
    
    // CLOSE MODAL IMMEDIATELY - Do NOT wait for API call
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
    setIsDeleting(false);

    // Validate user ID - ensure it's a string and not empty
    if (!userId || typeof userId !== "string" || userId.trim() === "") {
      setToast({ message: "Invalid user ID. Cannot delete user.", type: "error" });
      // Reload users to ensure consistency
      loadUsers(currentPage, debouncedSearch);
      return;
    }

    // Validate MongoDB ObjectId format (24 character hex string)
    const mongoIdPattern = /^[0-9a-fA-F]{24}$/;
    if (!mongoIdPattern.test(userId.trim())) {
      setToast({ message: "Invalid user ID format. Please refresh the page and try again.", type: "error" });
      // Reload users to ensure consistency
      loadUsers(currentPage, debouncedSearch);
      return;
    }

    // Optimistic UI: Update the UI immediately (before API call)
    // Remove user from list immediately
    setUsers((prev) => prev.filter((u) => {
      const uId = u.id || (u as unknown as { _id?: string })._id?.toString() || (u as unknown as { _id?: string })._id;
      return uId !== userId;
    }));
    
    // Update total users count
    setTotalUsers((prev) => Math.max(0, prev - 1));
    
    // If current page becomes empty and not page 1, go to previous page
    const remainingUsers = users.filter((u) => {
      const uId = u.id || (u as unknown as { _id?: string })._id?.toString() || (u as unknown as { _id?: string })._id;
      return uId !== userId;
    });
    
    if (remainingUsers.length === 0 && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }

    // Now call API in the background
    try {
      await userApi.delete(userId);
      
      // API succeeded - show success toast
      setToast({ message: `${fullName} has been deleted successfully.`, type: "success" });
    } catch (err) {
      // API failed - revert optimistic update and show error
      const error = err as AxiosError<{ message?: string }>;
      const errorMessage = error?.response?.data?.message || "Failed to delete user. Please try again.";
      
      // Reload users list to revert optimistic update
      loadUsers(currentPage, debouncedSearch);
      
      // Show error toast
      setToast({ message: errorMessage, type: "error" });
    }
  };

  const handleOpenEditModal = (user: User) => {
    // Prevent regular admins from editing super_admin users
    if (currentUser?.role === "admin" && user.role === "super_admin") {
      setToast({ message: "You don't have permission to edit Super Admin users. Contact a Super Admin.", type: "error" });
      return;
    }
    
    setSelectedUser(user);
    // Set initial values: use fullName if available, otherwise combine firstName + lastName
    const fullName = user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim();
    setEditFullName(fullName);
    setEditRole(user.role);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
    setEditFullName("");
    setEditRole("");
  };

  const handleUpdateUser = async () => {
    if (!selectedUser || !editFullName.trim() || !editRole) return;

    try {
      setIsUpdating(true);
      
      // Update both fullName and role
      // Ensure we have a valid ID (support both id and _id)
      const selectedId = selectedUser.id || (selectedUser as unknown as { _id?: string })._id?.toString() || (selectedUser as unknown as { _id?: string })._id;
      if (!selectedId) {
        setToast({ message: "Invalid user ID. Cannot update user.", type: "error" });
        return;
      }
      
      const newRole = editRole as "user" | "admin" | "super_admin";
      await userApi.updateUser(selectedId, {
        fullName: editFullName.trim(),
        role: newRole,
      });
      
      // Check if this is self-demotion (admin changed their own role)
      const currentUserId = currentUser?.id || (currentUser as unknown as { _id?: string })?._id?.toString() || (currentUser as unknown as { _id?: string })?._id;
      const isSelfUpdate = currentUserId && selectedId && currentUserId === selectedId;
      const roleChanged = currentUser?.role !== newRole;
      
      // Optimistic update: Update user in list immediately
      setUsers((prev) =>
        prev.map((u) => {
          const uId = u.id || (u as unknown as { _id?: string })._id?.toString() || (u as unknown as { _id?: string })._id || "";
          const selectedId = selectedUser.id || (selectedUser as unknown as { _id?: string })._id?.toString() || (selectedUser as unknown as { _id?: string })._id || "";
          if (uId && selectedId && uId === selectedId) {
            // Split fullName back to firstName and lastName for display
            const nameParts = editFullName.trim().split(" ");
            const firstName = nameParts[0] || "";
            const lastName = nameParts.slice(1).join(" ") || "";
            return {
              ...u,
              id: uId, // Ensure id is set (guaranteed to be string due to check above)
              fullName: editFullName.trim(),
              firstName,
              lastName,
              role: newRole,
            };
          }
          return u;
        })
      );
      
      // Handle self-demotion: Force logout if admin changed their own role
      if (isSelfUpdate && roleChanged) {
        setToast({ 
          message: "Your role has been updated. Please log in again to continue.", 
          type: "info" 
        });
        handleCloseEditModal();
        
        // Wait a moment for toast to show, then logout and redirect
        setTimeout(() => {
          logout();
          navigate("/login");
        }, 1500);
        return;
      }
      
      setToast({ message: "User updated successfully", type: "success" });
      handleCloseEditModal();
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      setToast({ message: error?.response?.data?.message || "Failed to update user", type: "error" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddUser = async (formData: { 
    firstName: string; 
    lastName: string; 
    email: string; 
    password: string; 
    role: "user" | "admin" | "super_admin";
  }) => {
    try {
      setIsCreating(true);
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      
      console.log("Creating user with data:", { email: formData.email, fullName, role: formData.role });
      
      // Admin-created users should be active immediately (no OTP verification required)
      await userApi.create({
        email: formData.email,
        fullName,
        password: formData.password,
        role: formData.role,
        avatar: null,
        isEmailVerified: true, // ✅ Bypass OTP verification for admin-created users
      });
      
      setToast({ message: "User created successfully! Account is active and ready to use.", type: "success" });
      setIsAddModalOpen(false);
      
      // Reload users list to get updated count
      loadUsers(currentPage, debouncedSearch);
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      const errorMessage = error?.response?.data?.message || "Failed to create user. Please check all fields and try again.";
      console.error("Error creating user:", error);
      setToast({ message: errorMessage, type: "error" });
      // CRITICAL: Do NOT close modal on error - let user see the error and fix it
    } finally {
      setIsCreating(false);
    }
  };

  // Handle page change
  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const getRoleBadge = (role: string) => {
    const badges = {
      super_admin: "bg-purple-50 text-purple-600",
      admin: "bg-green-50 text-green-600",
      user: "bg-blue-50 text-blue-600",
    };
    const labels = {
      super_admin: "Super Admin",
      admin: "Admin",
      user: "User",
    };
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
          badges[role as keyof typeof badges] || badges.user
        }`}
      >
        {labels[role as keyof typeof labels] || role}
      </span>
    );
  };

  const getStatusBadge = (isActive: boolean = true) => {
    return isActive ? (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600">
        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600">
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-1.5"></span>
        Inactive
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header - Flexbox Row: Title Left, Search/Actions Right */}
        <div className="flex justify-between items-end mb-6">
          {/* Left: Page Title - Strict Left Align */}
          <div className="flex flex-col items-start text-left">
            <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
            <p className="text-slate-600 mt-1">Manage system users, roles, and permissions</p>
          </div>
          
          {/* Right: Search Input & Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Minimalist Underline Search Bar */}
            <div className="relative w-64">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by name or email..."
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
            
            {/* Add User Button - Icon Only with Gradient */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white transition-all shadow-sm hover:shadow-md"
              title="Add User"
            >
              <UserPlus className="w-5 h-5" />
            </button>
          </div>
        </div>

      {/* Error Banner (if error exists) */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <p className="font-medium">Error loading users</p>
          <p className="text-sm mt-1">{error}</p>
          <button onClick={() => loadUsers(currentPage, debouncedSearch)} className="mt-3 text-sm underline hover:no-underline">
            Try again
          </button>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                      <p className="text-slate-600 text-sm">Loading users...</p>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
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
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <p className="font-medium">No users found</p>
                    <p className="text-sm mt-1">Try adjusting your search criteria</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  // Check if current user can edit this user
                  const canEdit = !(currentUser?.role === "admin" && user.role === "super_admin");
                  const fullName = user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "N/A";
                  // Ensure we have a valid ID (support both id and _id)
                  const userId = user.id || (user as unknown as { _id?: string })._id?.toString() || (user as unknown as { _id?: string })._id;
                  
                  // Self-deletion prevention: Check if this is the current logged-in user
                  const currentUserId = currentUser?.id || (currentUser as unknown as { _id?: string })?._id?.toString() || (currentUser as unknown as { _id?: string })?._id;
                  const isCurrentUser = currentUserId && userId && currentUserId === userId;
                  
                  // Get initials and color for avatar
                  const initials = getInitials(fullName);
                  const avatarColor = getAvatarColor(fullName);
                  const isDropdownOpen = openDropdownId === userId;

                  return (
                    <tr key={userId} className="border-b border-gray-100 hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {/* Smart Avatar */}
                          <div className="flex-shrink-0">
                            {user.avatar ? (
                              <img className="h-10 w-10 rounded-full shadow-sm" src={user.avatar} alt={fullName} />
                            ) : (
                              <div className={`h-10 w-10 rounded-full ${avatarColor} flex items-center justify-center text-white text-sm font-bold shadow-sm`}>
                                {initials}
                              </div>
                            )}
                          </div>
                          {/* Stacked User Info */}
                          <div className="flex flex-col justify-center items-start text-left h-10">
                            <h3 className="text-sm font-medium text-gray-900 leading-none">{fullName}</h3>
                            <p className="text-xs text-gray-500 leading-none mt-1">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        {getStatusBadge(true /* user.isActive - if field exists */)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {canEdit ? (
                          <div className="relative" ref={isDropdownOpen ? dropdownRef : null}>
                            <button
                              onClick={() => setOpenDropdownId(isDropdownOpen ? null : (userId || null))}
                              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Actions"
                            >
                              <MoreVertical className="w-5 h-5" />
                            </button>
                            
                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50 py-1">
                                <button
                                  onClick={() => {
                                    handleOpenEditModal(user);
                                    setOpenDropdownId(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit User
                                </button>
                                {/* Self-deletion prevention: Hide Delete option for current user */}
                                {!isCurrentUser && (
                                  <button
                                    onClick={() => {
                                      handleOpenDeleteModal(user);
                                      setOpenDropdownId(null);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete User
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">No permission</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer - Pagination */}
        {users.length > 0 && (
          <div className="bg-slate-50/50 px-6 py-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Showing <span className="font-medium">{(currentPage - 1) * limit + 1}</span> to{" "}
                <span className="font-medium">{Math.min(currentPage * limit, totalUsers)}</span> of{" "}
                <span className="font-medium">{totalUsers}</span> user{totalUsers !== 1 ? "s" : ""}
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
                      // Smart pagination: show first, last, and nearby pages
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

      {/* Edit User Modal */}
      {isEditModalOpen && selectedUser && (
        <Modal
          title="Edit User"
          buttonContent={isUpdating ? "Updating..." : "Update User"}
          onClose={handleCloseEditModal}
          onSubmit={handleUpdateUser}
          isLoadingButton={isUpdating}
          isSubmitDisabled={!editFullName.trim() || !editRole || (editFullName.trim() === (selectedUser.fullName || `${selectedUser.firstName || ""} ${selectedUser.lastName || ""}`.trim()) && editRole === selectedUser.role)}
        >
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-600 mb-2">
                Email: <span className="font-medium text-slate-900">{selectedUser.email}</span>
              </p>
            </div>

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                value={editFullName}
                onChange={(e) => setEditFullName(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter full name"
                required
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                id="role"
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {getAvailableRoles().map((roleOption) => (
                  <option key={roleOption.value} value={roleOption.value}>
                    {roleOption.label}
                  </option>
                ))}
              </select>
            </div>

            {currentUser?.role === "admin" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> As an Admin, you can only assign User or Admin roles. 
                  Contact a Super Admin to assign Super Admin privileges.
                </p>
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs text-amber-800">
                <strong>Warning:</strong> Changing user roles will affect their permissions across the system.
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* Add User Modal */}
      {isAddModalOpen && <AddUserModal onClose={() => setIsAddModalOpen(false)} onSubmit={handleAddUser} isCreating={isCreating} currentUserRole={currentUser?.role} />}

      {/* Delete Confirmation Modal */}
      {/* Modal is strictly bound to isDeleteModalOpen state - will unmount when false */}
      {isDeleteModalOpen && userToDelete && (
        <Modal
          title="Delete User"
          buttonContent={isDeleting ? "Deleting..." : "Delete User"}
          onClose={() => {
            console.log("Modal onClose called directly");
            setIsDeleteModalOpen(false);
            setUserToDelete(null);
          }}
          onSubmit={handleDeleteUser}
          isLoadingButton={isDeleting}
          isSubmitDisabled={isDeleting}
          style={{
            textColor: "text-red-900",
            confirmButtonColor: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
          }}
        >
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="font-semibold text-red-900">Warning: This action cannot be undone</p>
                  <p className="text-sm text-red-700 mt-1">
                    You are about to permanently delete this user account. All associated data will be removed.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 space-y-2">
              <div>
                <span className="text-sm font-medium text-slate-600">User:</span>
                <span className="ml-2 text-sm text-slate-900 font-semibold">
                  {userToDelete.fullName || `${userToDelete.firstName || ""} ${userToDelete.lastName || ""}`.trim() || "Unknown"}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-600">Email:</span>
                <span className="ml-2 text-sm text-slate-900">{userToDelete.email}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-600">Role:</span>
                <span className="ml-2">{getRoleBadge(userToDelete.role)}</span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs text-amber-800">
                <strong>Note:</strong> This will permanently remove the user from the system. They will no longer be able to access their account or any associated projects.
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* Toast Notification */}
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
