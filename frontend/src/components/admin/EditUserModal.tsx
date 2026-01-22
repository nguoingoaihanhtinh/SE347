import Modal from "../ui/modal/Modal";

interface EditUserModalProps {
  user: {
    id?: string;
    email: string;
    fullName?: string;
    firstName?: string;
    lastName?: string;
    role: "user" | "admin" | "super_admin";
  };
  fullName: string;
  role: string;
  onClose: () => void;
  onSubmit: () => void;
  onFullNameChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  isUpdating: boolean;
  availableRoles: { value: string; label: string }[];
  currentUserRole?: "user" | "admin" | "super_admin";
}

export default function EditUserModal({
  user,
  fullName,
  role,
  onClose,
  onSubmit,
  onFullNameChange,
  onRoleChange,
  isUpdating,
  availableRoles,
  currentUserRole,
}: EditUserModalProps) {
  const isSubmitDisabled =
    !fullName.trim() ||
    !role ||
    (fullName.trim() === (user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim()) &&
      role === user.role);

  return (
    <Modal
      title="Edit User"
      buttonContent={isUpdating ? "Updating..." : "Update"}
      onClose={onClose}
      onSubmit={onSubmit}
      isLoadingButton={isUpdating}
      isSubmitDisabled={isSubmitDisabled}
      className="max-w-[500px]"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Email
            </label>
            <p className="text-sm text-gray-900 bg-gray-50 h-9 px-3 flex items-center rounded-lg border border-gray-200">
              {user.email}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label htmlFor="editFullName" className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="editFullName"
              value={fullName}
              onChange={(e) => onFullNameChange(e.target.value)}
              className="w-full h-9 px-3 text-sm text-gray-900 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 outline-none placeholder:text-sm placeholder:text-gray-400"
              placeholder="Enter full name"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label htmlFor="editRole" className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              id="editRole"
              value={role}
              onChange={(e) => onRoleChange(e.target.value)}
              className="w-full h-9 px-3 text-sm text-gray-900 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 outline-none"
            >
              {availableRoles.map((roleOption) => (
                <option key={roleOption.value} value={roleOption.value}>
                  {roleOption.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {currentUserRole === "admin" && (
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
  );
}
