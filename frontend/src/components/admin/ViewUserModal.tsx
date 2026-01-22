import Modal from "../ui/modal/Modal";
import type { User } from "../../types";

interface ViewUserModalProps {
  user: User;
  onClose: () => void;
  getInitials: (name: string) => string;
  getAvatarColor: (name: string) => string;
  getRoleBadge: (role: string) => React.ReactNode;
  getStatusBadge: (isActive: boolean) => React.ReactNode;
  formatDate: (dateString: string) => string;
}

export default function ViewUserModal({
  user,
  onClose,
  getInitials,
  getAvatarColor,
  getRoleBadge,
  getStatusBadge,
  formatDate,
}: ViewUserModalProps) {
  const fullName =
    user.fullName ||
    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
    "N/A";

  return (
    <Modal
      title="User Details"
      buttonContent="Close"
      onClose={onClose}
      onSubmit={onClose}
      isLoadingButton={false}
      isSubmitDisabled={false}
      className="w-full max-w-[400px]"
    >
      <div className="space-y-4">
        <div className="flex flex-col items-center pb-4">
          <div className="flex-shrink-0 mb-3">
            {user.avatar ? (
              <img
                className="w-20 h-20 rounded-full shadow-sm"
                src={user.avatar}
                alt={fullName}
              />
            ) : (
              <div
                className={`w-20 h-20 rounded-full ${getAvatarColor(
                  fullName
                )} flex items-center justify-center text-white text-2xl font-bold shadow-sm`}
              >
                {getInitials(fullName)}
              </div>
            )}
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            {fullName}
          </h3>
          <p className="text-sm text-gray-500 mb-2">{user.email}</p>
          <div>{getRoleBadge(user.role)}</div>
        </div>

        <div className="border-t border-gray-200"></div>

        <div className="grid grid-cols-2 gap-y-3">
          <div>
            <label className="block text-xs text-gray-400 uppercase mb-1">
              Status
            </label>
            <div className="text-sm font-medium text-gray-700">
              {getStatusBadge(user.isActive !== false)}
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 uppercase mb-1">
              Joined
            </label>
            <p className="text-sm font-medium text-gray-700">{formatDate(user.createdAt)}</p>
          </div>

          {user.updatedAt && (
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 uppercase mb-1">
                Last Updated
              </label>
              <p className="text-sm font-medium text-gray-700">{formatDate(user.updatedAt)}</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
