import { createPortal } from "react-dom";
import { LuX } from "react-icons/lu";
import type { AdminProject } from "../../lib/api";

interface ViewProjectModalProps {
  project: AdminProject;
  onClose: () => void;
  getAccessBadge: (access: "public" | "private") => React.ReactNode;
  getTypeBadge: (type: "scrum" | "kanban") => React.ReactNode;
  formatDate: (dateString: string) => string;
  getInitials: (name: string) => string;
}

export default function ViewProjectModal({
  project,
  onClose,
  getAccessBadge,
  getTypeBadge,
  formatDate,
  getInitials,
}: ViewProjectModalProps) {
  const projectInitial = project.name ? project.name.charAt(0).toUpperCase() : "P";

  const truncatedDescription =
    project.description && project.description.length > 100
      ? `${project.description.substring(0, 100)}...`
      : project.description || "No description";

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div
      id="modal"
      onMouseDown={handleBackdropClick}
      className="fixed inset-0 bg-black/40 flex items-center justify-center"
      style={{ zIndex: 9999 }}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[480px] animate-fade-in">
        <div className="flex justify-between items-center px-5 pt-5 pb-3 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Project Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
          >
            <LuX className="w-5 h-5 cursor-pointer" />
          </button>
        </div>

        <div className="p-5">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-14 h-14 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold">
                {projectInitial}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
                {project.name}
              </h3>
              <p className="text-sm text-gray-500 mb-2 font-mono">{project.key}</p>
              <div className="flex items-center gap-2 flex-wrap">
                {getTypeBadge(project.type)}
                {getAccessBadge(project.access)}
              </div>
            </div>
          </div>

          <div className="my-4 border-t border-gray-100"></div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 uppercase mb-1">
                Owner
              </label>
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                  {getInitials(project.owner.fullName)}
                </div>
                <p className="text-sm font-medium text-gray-700 truncate">
                  {project.owner.fullName}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 uppercase mb-1">
                Members
              </label>
              <p className="text-sm font-medium text-gray-700">
                {project.memberCount} {project.memberCount === 1 ? "Member" : "Members"}
              </p>
            </div>

            {/* Created */}
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 uppercase mb-1">
                Created
              </label>
              <p className="text-sm font-medium text-gray-700">{formatDate(project.createdAt)}</p>
            </div>
          </div>

          {project.description && (
            <div className="mt-4">
              <label className="block text-xs text-gray-400 uppercase mb-1">
                Description
              </label>
              <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 border border-gray-100">
                {truncatedDescription}
              </div>
            </div>
          )}
        </div>

        <div className="px-5 pb-5 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 px-4 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
