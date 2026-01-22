import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical, Edit, Trash2, Eye, Search, Plus, ChevronUp, ChevronDown, Ban, CheckCircle } from "lucide-react";
import { userApi } from "../../lib/api";
import type { User } from "../../types";
import Modal from "../../components/ui/modal/Modal";
import AddUserModal from "../../components/admin/AddUserModal";
import EditUserModal from "../../components/admin/EditUserModal";
import ViewUserModal from "../../components/admin/ViewUserModal";
import Toast, { type ToastType } from "../../components/ui/Toast";
import { useAuthStore } from "../../stores/authStore";
import { AxiosError } from "axios";
import Dropdown from "../../components/ui/Dropdown";

export default function UserManagementPage() {
  const currentUser = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: "asc" | "desc" | null }>({
    key: null,
    direction: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editFullName, setEditFullName] = useState<string>("");
  const [editRole, setEditRole] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [userToView, setUserToView] = useState<User | null>(null);
  const [isBanning, setIsBanning] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const getInitials = (name: string): string => {
    if (!name || name.trim() === "") return "??";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

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
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const getAvailableRoles = () => {
    if (!currentUser) return [];
    
    if (currentUser.role === "super_admin") {
      return [
        { value: "user", label: "User" },
        { value: "admin", label: "Admin" },
        { value: "super_admin", label: "Super Admin" },
      ];
    } else if (currentUser.role === "admin") {
      return [
        { value: "user", label: "User" },
        { value: "admin", label: "Admin" },
      ];
    }
    
    return [];
  };

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await userApi.getAll({ 
        page: 1,
        limit: 10000,
      });
      
      if (Array.isArray(data?.data)) {
        const normalizedUsers = data.data.map((user: User & { _id?: string }) => ({
          ...user,
          id: user.id || user._id?.toString() || user._id || "",
        })).filter((user): user is User => !!user.id);
        setUsers(normalizedUsers);
      } else {
        console.warn("Unexpected API response format:", data);
        setUsers([]);
      }
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to load users";
      setError(errorMessage);
      console.error("Error loading users:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage((prevPage) => {
      if ((debouncedSearch.trim() !== "" || roleFilter !== "all" || sortConfig.direction !== null) && prevPage !== 1) {
        return 1;
      }
      return prevPage;
    });
  }, [debouncedSearch, roleFilter, sortConfig.direction]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    let filtered = users;

    if (debouncedSearch.trim() !== "") {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter((user) => {
        const fullName = (user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "").toLowerCase();
        const email = (user.email || "").toLowerCase();

        return fullName.includes(searchLower) || email.includes(searchLower);
      });
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }

    // Default sort: super_admin on top, then by name (when sortConfig is null)
    // When user clicks sort: follow sortConfig (asc/desc/null cycle)
    if (sortConfig.direction === null || sortConfig.key === null) {
      // Default: super_admin on top, then sort by name A-Z with Vietnamese collation
      filtered = [...filtered].sort((a, b) => {
        // Super admin always on top
        if (a.role === "super_admin" && b.role !== "super_admin") return -1;
        if (a.role !== "super_admin" && b.role === "super_admin") return 1;
        
        // Then sort by name A-Z with Vietnamese collation
        const aName = (a.fullName || `${a.firstName || ""} ${a.lastName || ""}`.trim() || "");
        const bName = (b.fullName || `${b.firstName || ""} ${b.lastName || ""}`.trim() || "");
        return aName.localeCompare(bName, 'vi', { sensitivity: 'base' });
      });
    } else {
      // User clicked sort: follow sortConfig
      filtered = [...filtered].sort((a, b) => {
        // Vietnamese collation: Use localeCompare with 'vi' locale for proper Đ, Ă, Â sorting
        if (sortConfig.key === "name") {
          const aName = (a.fullName || `${a.firstName || ""} ${a.lastName || ""}`.trim() || "");
          const bName = (b.fullName || `${b.firstName || ""} ${b.lastName || ""}`.trim() || "");
          // Use localeCompare with Vietnamese locale for proper sorting
          return sortConfig.direction === "asc" 
            ? aName.localeCompare(bName, 'vi', { sensitivity: 'base' })
            : bName.localeCompare(aName, 'vi', { sensitivity: 'base' });
        }

        let aValue: string | number | Date;
        let bValue: string | number | Date;

        switch (sortConfig.key) {
          case "email":
            aValue = (a.email || "").toLowerCase();
            bValue = (b.email || "").toLowerCase();
            break;
          case "role":
            aValue = a.role.toLowerCase();
            bValue = b.role.toLowerCase();
            break;
          case "status": {
            const aIsActive = (a as { isActive?: boolean }).isActive !== false;
            const bIsActive = (b as { isActive?: boolean }).isActive !== false;
            aValue = aIsActive ? "active" : "inactive";
            bValue = bIsActive ? "active" : "inactive";
            break;
          }
          case "joinedDate":
            aValue = new Date(a.createdAt);
            bValue = new Date(b.createdAt);
            break;
          default:
            return 0;
        }

        if (aValue === null || aValue === undefined) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        if (bValue === null || bValue === undefined) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        
        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [users, debouncedSearch, roleFilter, sortConfig]);

  const filteredTotalUsers = filteredUsers.length;
  const filteredTotalPages = Math.ceil(filteredTotalUsers / limit);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * limit;
    const endIndex = startIndex + limit;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage, limit]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [currentPage]);

  useEffect(() => {
    if (debouncedSearch !== "" && currentPage !== 1) {
      setCurrentPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]); // Only depend on debouncedSearch - we intentionally check currentPage without including it


  const handleOpenDeleteModal = (user: User) => {
    // Self-deletion prevention: Block deletion of own account
    const userId = user.id || (user as unknown as { _id?: string })._id?.toString() || (user as unknown as { _id?: string })._id;
    const currentUserId = currentUser?.id || (currentUser as unknown as { _id?: string })?._id?.toString() || (currentUser as unknown as { _id?: string })?._id;
    
    if (currentUserId && userId && currentUserId === userId) {
      setToast({ message: "You cannot delete your own account. Please contact another administrator.", type: "error" });
      return;
    }
    
    if (currentUser?.role === "admin" && user.role === "super_admin") {
      setToast({ message: "You don't have permission to delete Super Admin users. Contact a Super Admin.", type: "error" });
      return;
    }
    
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };


  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    const fullName = userToDelete.fullName || `${userToDelete.firstName || ""} ${userToDelete.lastName || ""}`.trim() || "User";
    const userId = userToDelete.id || (userToDelete as unknown as { _id?: string })._id;
    
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
    setIsDeleting(false);

    if (!userId || typeof userId !== "string" || userId.trim() === "") {
      setToast({ message: "Invalid user ID. Cannot delete user.", type: "error" });
      loadUsers();
      return;
    }

    const mongoIdPattern = /^[0-9a-fA-F]{24}$/;
    if (!mongoIdPattern.test(userId.trim())) {
      setToast({ message: "Invalid user ID format. Please refresh the page and try again.", type: "error" });
      loadUsers();
      return;
    }

    setUsers((prev) => prev.filter((u) => {
      const uId = u.id || (u as unknown as { _id?: string })._id?.toString() || (u as unknown as { _id?: string })._id;
      return uId !== userId;
    }));
    
    const remainingUsers = filteredUsers.filter((u) => {
      const uId = u.id || (u as unknown as { _id?: string })._id?.toString() || (u as unknown as { _id?: string })._id;
      return uId !== userId;
    });
    
    if (remainingUsers.length === 0 && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }

    try {
      await userApi.delete(userId);
      setToast({ message: `${fullName} has been deleted successfully.`, type: "success" });
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      const errorMessage = error?.response?.data?.message || "Failed to delete user. Please try again.";
      loadUsers();
      setToast({ message: errorMessage, type: "error" });
    }
  };

  const handleOpenEditModal = (user: User) => {
    if (currentUser?.role === "admin" && user.role === "super_admin") {
      setToast({ message: "You don't have permission to edit Super Admin users. Contact a Super Admin.", type: "error" });
      return;
    }
    
    setSelectedUser(user);
    const fullName = user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim();
    setEditFullName(fullName);
    setEditRole(user.role);
    setIsEditModalOpen(true);
  };

  const handleOpenViewModal = (user: User) => {
    setUserToView(user);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setUserToView(null);
  };

  const handleBanUser = async (user: User) => {
    const userId = user.id || (user as unknown as { _id?: string })._id?.toString() || (user as unknown as { _id?: string })._id;
    if (!userId) {
      setToast({ message: "Invalid user ID.", type: "error" });
      return;
    }

    // Prevent banning own account
    const currentUserId = currentUser?.id || (currentUser as unknown as { _id?: string })?._id?.toString() || (currentUser as unknown as { _id?: string })?._id;
    if (currentUserId && userId && currentUserId === userId) {
      setToast({ message: "You cannot ban your own account.", type: "error" });
      return;
    }

    // Prevent regular admins from banning super_admin users
    if (currentUser?.role === "admin" && user.role === "super_admin") {
      setToast({ message: "You don't have permission to ban Super Admin users. Contact a Super Admin.", type: "error" });
      return;
    }

    setIsBanning(true);
    setOpenDropdownId(null);

    setUsers((prev) =>
      prev.map((u) => {
        const uId = u.id || (u as unknown as { _id?: string })._id?.toString() || (u as unknown as { _id?: string })._id;
        if (uId === userId) {
          return { ...u, isActive: false };
        }
        return u;
      })
    );

    try {
      await userApi.updateUser(userId, { isActive: false });
      setToast({ message: `${user.fullName || user.email} has been banned successfully.`, type: "success" });
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      const errorMessage = error?.response?.data?.message || "Failed to ban user. Please try again.";
      
      setUsers((prev) =>
        prev.map((u) => {
          const uId = u.id || (u as unknown as { _id?: string })._id?.toString() || (u as unknown as { _id?: string })._id;
          if (uId === userId) {
            return { ...u, isActive: true };
          }
          return u;
        })
      );
      
      setToast({ message: errorMessage, type: "error" });
    } finally {
      setIsBanning(false);
    }
  };

  const handleActivateUser = async (user: User) => {
    const userId = user.id || (user as unknown as { _id?: string })._id?.toString() || (user as unknown as { _id?: string })._id;
    if (!userId) {
      setToast({ message: "Invalid user ID.", type: "error" });
      return;
    }

    setIsBanning(true);
    setOpenDropdownId(null);

    setUsers((prev) =>
      prev.map((u) => {
        const uId = u.id || (u as unknown as { _id?: string })._id?.toString() || (u as unknown as { _id?: string })._id;
        if (uId === userId) {
          return { ...u, isActive: true };
        }
        return u;
      })
    );

    try {
      await userApi.updateUser(userId, { isActive: true });
      setToast({ message: `${user.fullName || user.email} has been activated successfully.`, type: "success" });
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      const errorMessage = error?.response?.data?.message || "Failed to activate user. Please try again.";
      
      setUsers((prev) =>
        prev.map((u) => {
          const uId = u.id || (u as unknown as { _id?: string })._id?.toString() || (u as unknown as { _id?: string })._id;
          if (uId === userId) {
            return { ...u, isActive: false };
          }
          return u;
        })
      );
      
      setToast({ message: errorMessage, type: "error" });
    } finally {
      setIsBanning(false);
    }
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
      
      const currentUserId = currentUser?.id || (currentUser as unknown as { _id?: string })?._id?.toString() || (currentUser as unknown as { _id?: string })?._id;
      const isSelfUpdate = currentUserId && selectedId && currentUserId === selectedId;
      const roleChanged = currentUser?.role !== newRole;
      
      setUsers((prev) =>
        prev.map((u) => {
          const uId = u.id || (u as unknown as { _id?: string })._id?.toString() || (u as unknown as { _id?: string })._id || "";
          const selectedId = selectedUser.id || (selectedUser as unknown as { _id?: string })._id?.toString() || (selectedUser as unknown as { _id?: string })._id || "";
          if (uId && selectedId && uId === selectedId) {
            const nameParts = editFullName.trim().split(" ");
            const firstName = nameParts[0] || "";
            const lastName = nameParts.slice(1).join(" ") || "";
            return {
              ...u,
              id: uId,
              fullName: editFullName.trim(),
              firstName,
              lastName,
              role: newRole,
            };
          }
          return u;
        })
      );
      
      if (isSelfUpdate && roleChanged) {
        setToast({ 
          message: "Your role has been updated. Please log in again to continue.", 
          type: "info" 
        });
        handleCloseEditModal();
        
        setTimeout(() => {
          logout();
          navigate("/login");
        }, 1500);
        return;
      }
      
      setToast({ message: "User updated successfully", type: "success" });
      handleCloseEditModal();
      loadUsers();
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
      
      await userApi.create({
        email: formData.email,
        fullName,
        password: formData.password,
        role: formData.role,
        avatar: null,
        isEmailVerified: true,
      });
      
      setToast({ message: "User created successfully! Account is active and ready to use.", type: "success" });
      setIsAddModalOpen(false);
      loadUsers();
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      const errorMessage = error?.response?.data?.message || "Failed to create user. Please check all fields and try again.";
      setToast({ message: errorMessage, type: "error" });
    } finally {
      setIsCreating(false);
    }
  };

  // Handle page change
  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

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
  }, []);

  // Sortable Header Component
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

  const getRoleBadge = (role: string) => {
    const baseClasses =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border";

    const roleStyles: Record<string, string> = {
      super_admin:
        "bg-purple-50 text-purple-700 border-purple-100",
      admin:
        "bg-purple-50 text-purple-700 border-purple-100",
      user:
        "bg-blue-50 text-blue-700 border-blue-100",
      staff:
        "bg-blue-50 text-blue-700 border-blue-100",
    };

    const labels: Record<string, string> = {
      super_admin: "Super Admin",
      admin: "Admin",
      user: "User",
      staff: "Staff",
    };

    const style =
      roleStyles[role] || roleStyles.user;
    const label =
      labels[role] || role;

    return (
      <span className={`${baseClasses} ${style}`}>
        {label}
      </span>
    );
  };

  const getStatusBadge = (isActive: boolean = true) => {
    const baseClasses =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border";

    if (isActive) {
      return (
        <span className={`${baseClasses} bg-green-50 text-green-700 border-green-100`}>
          Active
        </span>
      );
    } else {
      return (
        <span className={`${baseClasses} bg-red-50 text-red-700 border-red-100`}>
          Inactive
        </span>
      );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <div className="p-6">
      {/* Error Banner */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <p className="font-medium">Error loading users</p>
          <p className="text-sm mt-1">{error}</p>
          <button onClick={() => loadUsers()} className="mt-3 text-sm underline hover:no-underline">
            Try again
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md border border-gray-200 flex flex-col h-[calc(100vh-140px)]">
        <div className="p-5 pb-4 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900">User List</h2>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 pl-9 pr-4 w-[300px] text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoComplete="off"
              />
            </div>

            {/* Role Filter */}
            <Dropdown
              selectedValue={roleFilter}
              onChange={(value) => setRoleFilter(value)}
              options={[
                { value: "all", label: "All Roles" },
                { value: "user", label: "User" },
                { value: "admin", label: "Admin" },
                { value: "super_admin", label: "Super Admin" },
              ]}
              placeholder="All Roles"
              className="h-9 text-sm"
            />

            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-2 py-1 hover:text-indigo-700 transition-colors group"
            >
              {/* Plus Icon - Slightly larger */}
              <Plus className="w-5 h-5 text-indigo-600 group-hover:text-indigo-700" strokeWidth={2.5} />
              
              {/* Text - Single Line, Medium Weight */}
              <span className="text-indigo-600 font-semibold whitespace-nowrap group-hover:text-indigo-700 text-sm">
                Add User
              </span>
            </button>
          </div>
        </div>

        <div ref={scrollContainerRef} className="flex-1 overflow-auto px-3 min-h-0 custom-scrollbar">
          <table className="table-fixed w-full border-separate border-spacing-0">
            <thead className="sticky top-0 z-20 bg-gray-100">
              <tr>
                <SortableHeader label="Name" sortKey="name" width="w-[250px]" isFirst={true} />
                <SortableHeader label="Email" sortKey="email" width="w-[300px]" />
                <SortableHeader label="Role" sortKey="role" width="w-[120px]" />
                <SortableHeader label="Status" sortKey="status" width="w-[120px]" />
                <SortableHeader label="Joined Date" sortKey="joinedDate" width="w-[150px]" />
                <th className="w-[80px] px-3 py-3 text-left text-xs font-bold text-gray-700 capitalize tracking-normal bg-gray-100 last:rounded-r-lg">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-3 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                      <p className="text-gray-600 text-sm">Loading users...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-12 text-center text-gray-500">
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
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <p className="font-medium">No users found</p>
                    <p className="text-sm mt-1">Try adjusting your search criteria</p>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => {
                  const canEdit = !(currentUser?.role === "admin" && user.role === "super_admin");
                  const fullName = user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "N/A";
                  const userId = user.id || (user as unknown as { _id?: string })._id?.toString() || (user as unknown as { _id?: string })._id;
                  const currentUserId = currentUser?.id || (currentUser as unknown as { _id?: string })?._id?.toString() || (currentUser as unknown as { _id?: string })?._id;
                  const isCurrentUser = currentUserId && userId && currentUserId === userId;
                  const initials = getInitials(fullName);
                  const avatarColor = getAvatarColor(fullName);
                  const isDropdownOpen = openDropdownId === userId;

                  return (
                    <tr key={userId} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      {/* Name Column */}
                      <td className="px-3 py-3 whitespace-nowrap text-left border-b border-gray-200">
                        <div className="flex items-center gap-3 truncate">
                          <div className="flex-shrink-0">
                            {user.avatar ? (
                              <img className="h-8 w-8 rounded-full shadow-sm" src={user.avatar} alt={fullName} />
                            ) : (
                              <div className={`h-8 w-8 rounded-full ${avatarColor} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                                {initials}
                              </div>
                            )}
                          </div>
                          <span className="text-sm text-gray-900 truncate">{fullName}</span>
                        </div>
                      </td>

                      <td className="px-3 py-3 whitespace-nowrap text-left border-b border-gray-200">
                        <span className="text-sm text-gray-600 truncate">{user.email}</span>
                      </td>

                      {/* Role Column */}
                      <td className="px-3 py-3 whitespace-nowrap text-left border-b border-gray-200">
                        {getRoleBadge(user.role)}
                      </td>

                      <td className="px-3 py-3 whitespace-nowrap text-left border-b border-gray-200">
                        {getStatusBadge(user.isActive !== false)}
                      </td>

                      {/* Joined Date Column */}
                      <td className="px-3 py-3 whitespace-nowrap text-left border-b border-gray-200">
                        <span className="text-sm text-gray-500 truncate">{formatDate(user.createdAt)}</span>
                      </td>

                      <td className="px-3 py-3 whitespace-nowrap text-left border-b border-gray-200">
                        {canEdit ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenViewModal(user)}
                              className="text-gray-500 hover:text-gray-700 transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" strokeWidth={1.5} />
                            </button>
                            <div className="relative" ref={isDropdownOpen ? dropdownRef : null}>
                              <button
                                onClick={() => setOpenDropdownId(isDropdownOpen ? null : (userId || null))}
                                className="text-gray-500 hover:text-gray-700 transition-colors"
                                title="More Actions"
                              >
                                <MoreVertical className="w-4 h-4" strokeWidth={1.5} />
                              </button>
                              
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
                                  {/* Unban User - Show if user is banned (isActive === false) */}
                                  {user.isActive === false && (
                                    <button
                                      onClick={() => {
                                        handleActivateUser(user);
                                      }}
                                      disabled={isBanning}
                                      className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                      Unban User
                                    </button>
                                  )}
                                  
                                  {user.isActive !== false && !isCurrentUser && (
                                    <button
                                      onClick={() => {
                                        handleBanUser(user);
                                      }}
                                      disabled={isBanning}
                                      className="w-full px-4 py-2 text-left text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      <Ban className="w-4 h-4" />
                                      Ban User
                                    </button>
                                  )}
                                  
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
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">No permission</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex-shrink-0 border-t border-gray-100 p-4 bg-white rounded-b-lg flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium">{(currentPage - 1) * limit + 1}</span> to{" "}
            <span className="font-medium">{Math.min(currentPage * limit, filteredTotalUsers)}</span> of{" "}
            <span className="font-medium">{filteredTotalUsers}</span> entries
          </div>
          
          {filteredTotalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1.5 rounded border text-sm font-medium transition ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Previous
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(filteredTotalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (filteredTotalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= filteredTotalPages - 2) {
                    pageNum = filteredTotalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-8 h-8 rounded border text-sm font-medium transition ${
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
              
              <button
                onClick={() => handlePageChange(Math.min(filteredTotalPages, currentPage + 1))}
                disabled={currentPage === filteredTotalPages}
                className={`px-3 py-1.5 rounded border text-sm font-medium transition ${
                  currentPage === filteredTotalPages
                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* View User Modal */}
      {isViewModalOpen && userToView && (
        <ViewUserModal
          user={userToView}
          onClose={handleCloseViewModal}
          getInitials={getInitials}
          getAvatarColor={getAvatarColor}
          getRoleBadge={getRoleBadge}
          getStatusBadge={getStatusBadge}
          formatDate={formatDate}
        />
      )}

      {isEditModalOpen && selectedUser && (
        <EditUserModal
          user={selectedUser}
          fullName={editFullName}
          role={editRole}
          onClose={handleCloseEditModal}
          onSubmit={handleUpdateUser}
          onFullNameChange={setEditFullName}
          onRoleChange={setEditRole}
          isUpdating={isUpdating}
          availableRoles={getAvailableRoles()}
          currentUserRole={currentUser?.role}
        />
      )}

      {isAddModalOpen && <AddUserModal onClose={() => setIsAddModalOpen(false)} onSubmit={handleAddUser} isCreating={isCreating} currentUserRole={currentUser?.role} />}

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

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={5000}
        />
      )}
    </div>
  );
}
